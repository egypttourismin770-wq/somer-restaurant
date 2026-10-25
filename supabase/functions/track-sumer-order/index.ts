import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function normalizePhone(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("SUMER tracking: required server configuration is missing");
    return json({ ok: false, error: "تعذر تشغيل متابعة الطلب حاليًا." }, 500);
  }

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return json({ ok: false, error: "بيانات الطلب غير صالحة." }, 400);
  }

  const orderNumber = String(input.orderNumber ?? "").trim().replace(/^#/, "");
  const suppliedPhone = normalizePhone(input.phone);
  if (!/^\d{1,18}$/.test(orderNumber) || suppliedPhone.length < 8 || suppliedPhone.length > 20) {
    return json({ ok: false, error: "رقم الأوردر أو الموبايل غير صالح." }, 400);
  }

  try {
    const db = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: order, error: orderError } = await db
      .from("orders")
      .select(
        "id,order_number,phone,order_status,created_at,preparation_started_at,preparation_deadline_at,preparation_completed_at,preparation_minutes,payment_method,payment_status,payment_reference,payment_confirmed_at",
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderError) {
      console.error("SUMER tracking order lookup failed", { code: orderError.code ?? null });
      return json({ ok: false, error: "تعذر جلب حالة الطلب حاليًا." }, 500);
    }

    // Do not disclose whether an order number exists unless the phone also matches.
    if (!order || normalizePhone(order.phone) !== suppliedPhone) {
      return json(
        { ok: false, error: "مش لاقيين طلب مطابق للبيانات دي." },
        404,
      );
    }

    const { data: items, error: itemsError } = await db
      .from("order_items")
      .select("id,product_name,quantity")
      .eq("order_id", order.id)
      .order("id", { ascending: true });

    if (itemsError) {
      console.error("SUMER tracking items lookup failed", { code: itemsError.code ?? null });
      return json({ ok: false, error: "تعذر جلب تفاصيل الأصناف حاليًا." }, 500);
    }

    return json({
      ok: true,
      order: {
        orderNumber: String(order.order_number),
        status: String(order.order_status || "new"),
        createdAt: order.created_at,
        preparationStartedAt: order.preparation_started_at,
        preparationDeadlineAt: order.preparation_deadline_at,
        preparationCompletedAt: order.preparation_completed_at,
        preparationMinutes: Number(order.preparation_minutes) || 30,
        paymentMethod: String(order.payment_method || "cash"),
        paymentStatus: String(order.payment_status || "review"),
        paymentReference: String(order.payment_reference || ""),
        paymentConfirmedAt: order.payment_confirmed_at,
        items: (items || []).map((item) => ({
          id: String(item.id),
          name: String(item.product_name || "صنف"),
          quantity: Number(item.quantity) || 1,
        })),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("SUMER tracking request failed", {
      error: error instanceof Error ? error.message : "unknown error",
    });
    return json({ ok: false, error: "تعذر جلب حالة الطلب حاليًا." }, 500);
  }
});
