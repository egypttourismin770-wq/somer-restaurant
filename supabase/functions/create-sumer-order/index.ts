import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });



async function parseWhatsAppProviderResponse(response: Response) {
  const raw = await response.text();
  try { return raw ? JSON.parse(raw) : {}; }
  catch { return { responseText: raw.slice(0, 300) }; }
}

async function recordSumerWhatsAppMessage(
  db: any,
  details: {
    messageId: string | null;
    orderId: string;
    orderNumber: number;
    recipient: string;
    messageType: string;
  },
) {
  if (!details.messageId) {
    console.warn("SUMER WhatsApp accepted response had no message id", {
      orderNumber: details.orderNumber,
      messageType: details.messageType,
    });
    return;
  }
  try {
    const { error } = await db.from("sumer_whatsapp_messages").insert({
      message_id: details.messageId,
      order_id: details.orderId,
      order_number: details.orderNumber,
      recipient: details.recipient,
      message_type: details.messageType,
      status: "accepted",
    });
    if (error && error.code !== "23505") {
      console.error("SUMER WhatsApp message DB write failed", {
        orderNumber: details.orderNumber,
        messageType: details.messageType,
        code: error.code ?? null,
        message: error.message,
      });
      return;
    }

    // A webhook can arrive before this row is inserted. Reconcile a callback already stored.
    const { data: events, error: eventsError } = await db
      .from("sumer_whatsapp_delivery_events")
      .select("status,provider_timestamp,errors")
      .eq("message_id", details.messageId)
      .order("provider_timestamp", { ascending: false, nullsFirst: false })
      .limit(1);
    if (eventsError) {
      console.warn("SUMER WhatsApp event reconciliation lookup failed", {
        orderNumber: details.orderNumber,
        code: eventsError.code ?? null,
      });
    } else if (events?.length) {
      const latest = events[0];
      const { error: updateError } = await db.from("sumer_whatsapp_messages")
        .update({
          status: latest.status,
          provider_timestamp: latest.provider_timestamp,
          last_error: latest.errors,
          updated_at: new Date().toISOString(),
        })
        .eq("message_id", details.messageId);
      if (updateError) {
        console.warn("SUMER WhatsApp event reconciliation write failed", {
          orderNumber: details.orderNumber,
          code: updateError.code ?? null,
        });
      }
    }
  } catch (error) {
    // A WhatsApp logging issue must not roll back an already accepted restaurant order.
    console.error("SUMER WhatsApp DB logging exception", {
      orderNumber: details.orderNumber,
      messageType: details.messageType,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
}

async function notifyWhatsAppForSumerOrder(args: {
  db: any;
  orderId: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  backupPhone: string;
  areaName: string;
  deliveryMinutes: number;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  paymentMethod: string;
  paymentDestination: string;
  paymentReference: string;
  paymentProofUrl: string;
  notes: string;
  itemRows: Array<{ product_name: string; quantity: number; line_total: number; image_url?: string | null }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
}): Promise<string> {
  const apiKey = Deno.env.get("D360_API_KEY")?.trim();
  const recipient = Deno.env.get("D360_RECIPIENT_PHONE")?.trim();
  if (!apiKey || !recipient) {
    console.error("WhatsApp notification not configured.");
    return "not_configured";
  }

  let imageCount = 0;
  let imageFailures = 0;

  // Send product photos first so they appear before the order summary in WhatsApp.
  for (const item of args.itemRows) {
    let imageUrl = String(item.image_url ?? "").trim();
    if (!imageUrl) {
      imageFailures++;
      console.warn("Missing product image URL", { orderNumber: args.orderNumber, productName: item.product_name });
      continue;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
      // Unsplash auto=format can return WebP, which the WhatsApp sandbox rejects.
      // Force JPEG for Unsplash photo URLs used in WhatsApp image messages.
      if (parsedUrl.hostname === "images.unsplash.com") {
        parsedUrl.searchParams.delete("auto");
        parsedUrl.searchParams.set("fm", "jpg");
        imageUrl = parsedUrl.toString();
      }
    } catch {
      imageFailures++;
      console.warn("Invalid product image URL", { orderNumber: args.orderNumber, productName: item.product_name });
      continue;
    }
    if (parsedUrl.protocol !== "https:") {
      imageFailures++;
      console.warn("Skipping non-HTTPS product image", { orderNumber: args.orderNumber, productName: item.product_name });
      continue;
    }

    try {
      const imageResponse = await fetch("https://waba-sandbox.360dialog.io/v1/messages", {
        method: "POST",
        headers: {
          "D360-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "image",
          image: {
            link: imageUrl,
            caption: "🍽️ صورة الصنف في طلب سومر #" + args.orderNumber +
              "\nالصنف: " + item.product_name +
              "\nالكمية: " + item.quantity +
              "\nقيمة الصنف: " + item.line_total.toFixed(2) + " جنيه",
          },
        }),
      });

      const imagePayload = await parseWhatsAppProviderResponse(imageResponse);
      if (!imageResponse.ok) {
        console.error("SUMER product photo send failed", {
          orderNumber: args.orderNumber,
          productName: item.product_name,
          status: imageResponse.status,
          response: JSON.stringify(imagePayload).slice(0, 500),
        });
        imageFailures++;
      } else {
        imageCount++;
        const messageId = imagePayload?.messages?.[0]?.id
          ? String(imagePayload.messages[0].id)
          : null;
        await recordSumerWhatsAppMessage(args.db, {
          messageId,
          orderId: args.orderId,
          orderNumber: args.orderNumber,
          recipient,
          messageType: "order_item_image",
        });
        console.log("SUMER product photo accepted", {
          orderNumber: args.orderNumber,
          productName: item.product_name,
          hasMessageId: Boolean(messageId),
        });
      }
    } catch (error) {
      console.error("SUMER product photo request error", {
        orderNumber: args.orderNumber,
        productName: item.product_name,
        error: error instanceof Error ? error.message : "unknown error",
      });
      imageFailures++;
    }
  }

  if (args.paymentProofUrl) {
    try {
      const receiptResponse = await fetch("https://waba-sandbox.360dialog.io/v1/messages", {
        method: "POST",
        headers: {
          "D360-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "image",
          image: {
            link: args.paymentProofUrl,
            caption: "🧾 إيصال الدفع للطلب #" + args.orderNumber +
              "\nالعميل: " + args.customerName +
              "\nطريقة الدفع: " + (args.paymentMethod === "vodafone_cash" ? "فودافون كاش" : "إنستاباي") +
              "\nرقم مرجع التحويل: " + (args.paymentReference || "لم يُدخل في الطلب"),
          },
        }),
      });
      const receiptPayload = await parseWhatsAppProviderResponse(receiptResponse);
      if (!receiptResponse.ok) {
        console.error("SUMER payment receipt WhatsApp send failed", {
          orderNumber: args.orderNumber,
          status: receiptResponse.status,
          response: JSON.stringify(receiptPayload).slice(0, 400),
        });
        imageFailures++;
      } else {
        imageCount++;
        const messageId = receiptPayload?.messages?.[0]?.id
          ? String(receiptPayload.messages[0].id)
          : null;
        await recordSumerWhatsAppMessage(args.db, {
          messageId,
          orderId: args.orderId,
          orderNumber: args.orderNumber,
          recipient,
          messageType: "payment_receipt",
        });
      }
    } catch (error) {
      console.error("SUMER payment receipt WhatsApp request failed", {
        orderNumber: args.orderNumber,
        error: error instanceof Error ? error.message : "unknown error",
      });
      imageFailures++;
    }
  }

  const paymentLabel = args.paymentMethod === "cash"
    ? "الدفع عند الاستلام (كاش)"
    : args.paymentMethod === "vodafone_cash"
      ? "فودافون كاش (يحتاج مراجعة الدفع)"
      : args.paymentMethod === "instapay"
        ? "إنستا باي (يحتاج مراجعة الدفع)"
        : args.paymentMethod;

  const address = [
    args.areaName ? "المنطقة: " + args.areaName : "",
    args.street ? "الشارع: " + args.street : "",
    args.building ? "العمارة: " + args.building : "",
    args.floor ? "الدور: " + args.floor : "",
    args.apartment ? "الشقة: " + args.apartment : "",
  ].filter(Boolean).join("\n");

  const lines = [
    "🍽️ طلب جديد من مطعم سومر",
    "رقم الطلب: #" + args.orderNumber,
    "",
    "👤 بيانات العميل",
    "الاسم: " + args.customerName,
    "رقم الهاتف: " + args.phone,
    args.backupPhone ? "رقم بديل: " + args.backupPhone : "",
    "",
    "📍 عنوان التوصيل",
    address,
    "",
    "🛒 تفاصيل الطلب",
    ...args.itemRows.map(item =>
      "• " + item.product_name + " × " + item.quantity + " — " + item.line_total.toFixed(2) + " جنيه"
    ),
    "",
    "إجمالي الأصناف قبل التوصيل: " + args.subtotal.toFixed(2) + " جنيه",
    "رسوم التوصيل: " + args.deliveryFee.toFixed(2) + " جنيه",
    "الوقت المتوقع للتوصيل: " + args.deliveryMinutes + " دقيقة",
    "الإجمالي النهائي شامل التوصيل: " + args.total.toFixed(2) + " جنيه",
    "طريقة الدفع: " + paymentLabel,
    args.paymentDestination ? "بيانات التحويل: " + args.paymentDestination : "",
    args.paymentMethod !== "cash" ? "رقم مرجع التحويل: " + (args.paymentReference || "لم يُدخل في الطلب") : "",
    args.paymentMethod !== "cash" ? "حالة الدفع: الإيصال مرفق للمراجعة — لم يتم تأكيد الدفع تلقائيًا" : "",
    args.notes ? "ملاحظات العميل: " + args.notes : "",
  ].filter(line => line !== "").join("\n").slice(0, 3900);

  try {
    const response = await fetch("https://waba-sandbox.360dialog.io/v1/messages", {
      method: "POST",
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: { body: lines },
      }),
    });

    const summaryPayload = await parseWhatsAppProviderResponse(response);
    if (!response.ok) {
      console.error("SUMER WhatsApp order summary failed", {
        status: response.status,
        response: JSON.stringify(summaryPayload).slice(0, 500),
        orderNumber: args.orderNumber,
      });
      return "images_sent_summary_failed";
    }
    const summaryMessageId = summaryPayload?.messages?.[0]?.id
      ? String(summaryPayload.messages[0].id)
      : null;
    await recordSumerWhatsAppMessage(args.db, {
      messageId: summaryMessageId,
      orderId: args.orderId,
      orderNumber: args.orderNumber,
      recipient,
      messageType: "order_summary",
    });
  } catch (error) {
    console.error("SUMER WhatsApp order summary request failed", {
      orderNumber: args.orderNumber,
      error: error instanceof Error ? error.message : "unknown error",
    });
    return "images_sent_summary_failed";
  }

  if (imageFailures > 0) {
    return imageCount > 0 ? "summary_sent_some_images_failed" : "summary_sent_images_failed";
  }
  return imageCount > 0 ? "summary_sent_images_sent" : "summary_sent_no_images";
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return json({ error: "Server configuration missing" }, 500);

    const db = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let body: any;
    let paymentProof: File | null = null;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.toLowerCase().includes("multipart/form-data")) {
      const form = await req.formData();
      const orderJson = form.get("order");
      if (typeof orderJson !== "string") return json({ error: "Missing order details." }, 400);
      try {
        body = JSON.parse(orderJson);
      } catch {
        return json({ error: "Invalid order details." }, 400);
      }
      const proof = form.get("paymentProof");
      if (proof instanceof File && proof.size > 0) paymentProof = proof;
    } else {
      body = await req.json();
    }

    const customer = body.customer ?? {};
    const rawItems = Array.isArray(body.items) ? body.items : [];

    const name = String(customer.name ?? "").trim().slice(0, 120);
    const phone = String(customer.phone ?? "").trim().slice(0, 40);
    const backupPhone = String(customer.backupPhone ?? "").trim().slice(0, 40);
    const street = String(customer.streetAddress ?? "").trim().slice(0, 250);
    const building = String(customer.building ?? "").trim().slice(0, 80);
    const floor = String(customer.floor ?? "").trim().slice(0, 40);
    const apartment = String(customer.apartment ?? "").trim().slice(0, 40);
    const notes = String(customer.notes ?? "").trim().slice(0, 1000);
    const areaId = String(customer.areaId ?? "");
    const paymentMethod = String(customer.paymentMethod ?? "");
    const paymentReference = String(customer.paymentReference ?? "").trim().slice(0, 120);

    if (paymentMethod !== "cash") {
      if (!paymentProof) return json({ error: "A payment receipt image is required." }, 400);
      const allowedProofTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
      if (!allowedProofTypes.has(paymentProof.type) || paymentProof.size > 2 * 1024 * 1024) {
        return json({ error: "Receipt must be JPG, PNG, WEBP, or AVIF and no larger than 2 MB." }, 400);
      }
    }

    if (!name || !phone || !street || rawItems.length < 1 || rawItems.length > 30) {
      return json({ error: "Please provide customer details and 1-30 order items." }, 400);
    }
    if (!["cash", "vodafone_cash", "instapay"].includes(paymentMethod)) {
      return json({ error: "Invalid payment method." }, 400);
    }

    const quantities = new Map<string, number>();
    for (const item of rawItems) {
      const id = String(item.productId ?? "");
      const qty = Number(item.quantity);
      if (!id || !Number.isInteger(qty) || qty < 1 || qty > 50) {
        return json({ error: "Invalid product or quantity." }, 400);
      }
      quantities.set(id, (quantities.get(id) ?? 0) + qty);
    }
    if ([...quantities.values()].some(q => q > 50)) {
      return json({ error: "Quantity limit exceeded." }, 400);
    }

    const productIds = [...quantities.keys()];
    const { data: products, error: productError } = await db
      .from("products")
      .select("id,name,price,image_url,active")
      .in("id", productIds)
      .eq("active", true);
    if (productError) throw productError;
    if (!products || products.length !== productIds.length) {
      return json({ error: "One or more products are unavailable. Refresh the menu." }, 400);
    }

    const { data: area, error: areaError } = await db
      .from("delivery_areas")
      .select("id,name,fee,delivery_minutes,active")
      .eq("id", areaId)
      .eq("active", true)
      .maybeSingle();
    if (areaError) throw areaError;
    if (!area) return json({ error: "Please select a valid delivery area." }, 400);

    const productMap = new Map(products.map((p: any) => [p.id, p]));
    const itemRows = productIds.map(id => {
      const p: any = productMap.get(id);
      const quantity = quantities.get(id)!;
      const unitPrice = Number(p.price);
      return {
        product_id: p.id,
        product_name: p.name,
        image_url: String(p.image_url ?? "").trim(),
        unit_price: unitPrice,
        quantity,
        line_total: Math.round(unitPrice * quantity * 100) / 100,
      };
    });
    const subtotal = Math.round(itemRows.reduce((sum, item) => sum + item.line_total, 0) * 100) / 100;
    const deliveryFee = Number(area.fee);
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;

    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        customer_name: name,
        phone,
        backup_phone: backupPhone,
        area_id: area.id,
        area_name: area.name,
        street_address: street,
        building,
        floor,
        apartment,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cash" ? "pending" : "review",
        payment_reference: paymentReference,
        order_status: "new",
        subtotal,
        delivery_fee: deliveryFee,
        delivery_minutes: Math.min(360, Math.max(5, Number(area.delivery_minutes) || 45)),
        total,
        notes,
      })
      .select("id,order_number,total,delivery_minutes")
      .single();
    if (orderError) throw orderError;

    let paymentProofPath: string | null = null;
    if (paymentMethod !== "cash" && paymentProof) {
      const extensionByType: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
      };
      paymentProofPath = String(order.order_number) + "/" + crypto.randomUUID() + "." + extensionByType[paymentProof.type];
      const { error: uploadError } = await db.storage
        .from("sumer-payment-proofs")
        .upload(paymentProofPath, paymentProof, {
          contentType: paymentProof.type,
          upsert: false,
        });

      if (uploadError) {
        await db.from("orders").delete().eq("id", order.id);
        throw uploadError;
      }

      const { error: proofPathError } = await db
        .from("orders")
        .update({ payment_proof_path: paymentProofPath })
        .eq("id", order.id);

      if (proofPathError) {
        await db.storage.from("sumer-payment-proofs").remove([paymentProofPath]);
        await db.from("orders").delete().eq("id", order.id);
        throw proofPathError;
      }
    }

    const rows = itemRows.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
      order_id: order.id,
    }));
    const { error: itemsError } = await db.from("order_items").insert(rows);
    if (itemsError) {
      if (paymentProofPath) await db.storage.from("sumer-payment-proofs").remove([paymentProofPath]);
      await db.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    const { data: restaurantSettings, error: settingsError } = await db
      .from("restaurant_settings")
      .select("vodafone_cash_number,instapay_handle")
      .eq("id", true)
      .maybeSingle();
    if (settingsError) {
      console.warn("SUMER restaurant payment settings could not be loaded for WhatsApp", {
        orderNumber: order.order_number,
      });
    }

    let paymentProofUrl = "";
    if (paymentProofPath) {
      const { data: signedProof, error: signedProofError } = await db.storage
        .from("sumer-payment-proofs")
        .createSignedUrl(paymentProofPath, 3600);
      if (signedProofError) {
        console.warn("SUMER payment proof signed URL could not be created for WhatsApp", {
          orderNumber: order.order_number,
        });
      } else {
        paymentProofUrl = signedProof?.signedUrl || "";
      }
    }

    const paymentDestination = paymentMethod === "vodafone_cash"
      ? String(restaurantSettings?.vodafone_cash_number ?? "").trim()
      : paymentMethod === "instapay"
        ? String(restaurantSettings?.instapay_handle ?? "").trim()
        : "";

    const whatsappNotification = await notifyWhatsAppForSumerOrder({
      db,
      orderId: String(order.id),
      orderNumber: Number(order.order_number),
      customerName: name,
      phone,
      backupPhone,
      areaName: String(area.name),
      deliveryMinutes: Number(area.delivery_minutes) || 45,
      street,
      building,
      floor,
      apartment,
      paymentMethod,
      paymentDestination,
      paymentReference,
      paymentProofUrl,
      notes,
      itemRows,
      subtotal,
      deliveryFee,
      total,
    });
    return json({
      ok: true,
      orderNumber: order.order_number,
      total: order.total,
      deliveryMinutes: Number(order.delivery_minutes) || Number(area.delivery_minutes) || 45,
      whatsappNotification,
    });
  } catch (error) {
    console.error("create-sumer-order error:", error);
    return json({ error: "Unable to submit order right now. Please try again." }, 500);
  }
});