import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
});

const ORDER_STATUSES = new Set([
  "new",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

function normaliseEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const authorization = req.headers.get("Authorization") || "";
  const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!supabaseUrl || !serviceKey || !accessToken) {
    return json({ ok: false, error: "يلزم تسجيل الدخول أولًا." }, 401);
  }

  const db = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // Validate the caller's access token instead of trusting client-supplied user IDs.
    const { data: authData, error: authError } = await db.auth.getUser(accessToken);
    const user = authData?.user;
    if (authError || !user) return json({ ok: false, error: "جلسة الدخول غير صالحة. سجّل الدخول مرة أخرى." }, 401);

    const { data: adminRow, error: adminLookupError } = await db
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (adminLookupError) throw adminLookupError;

    const isAdmin = Boolean(adminRow);
    let isOrderStaff = false;
    if (!isAdmin) {
      const { data: staffRow, error: staffLookupError } = await db
        .from("order_staff_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (staffLookupError) throw staffLookupError;
      isOrderStaff = Boolean(staffRow);
    }

    if (!isAdmin && !isOrderStaff) {
      return json({ ok: false, error: "الحساب ده مش مصرح له بدخول لوحة الأوردرات." }, 403);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "الطلب المرسل غير صالح." }, 400);
    }
    const action = String(body.action ?? "list_orders");

    if (action === "create_staff") {
      if (!isAdmin) return json({ ok: false, error: "إضافة الموظفين متاحة لمدير الموقع فقط." }, 403);
      const email = normaliseEmail(body.email);
      const password = String(body.password ?? "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ ok: false, error: "اكتب بريدًا إلكترونيًا صحيحًا للموظف." }, 400);
      }
      if (password.length < 8 || password.length > 128) {
        return json({ ok: false, error: "كلمة مرور الموظف لازم تكون من 8 إلى 128 حرفًا." }, 400);
      }

      const { data: createdUser, error: createUserError } = await db.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createUserError || !createdUser?.user) {
        const message = createUserError?.message?.toLowerCase() || "";
        if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
          return json({ ok: false, error: "البريد الإلكتروني ده مستخدم بالفعل. استخدم بريدًا آخر." }, 409);
        }
        console.error("SUMER staff account creation failed", { message: createUserError?.message || "unknown" });
        return json({ ok: false, error: "تعذر إنشاء حساب الموظف. راجع إعدادات Auth وحاول مرة أخرى." }, 500);
      }

      const { error: grantError } = await db.from("order_staff_users").insert({
        user_id: createdUser.user.id,
        created_by: user.id,
      });
      if (grantError) {
        await db.auth.admin.deleteUser(createdUser.user.id);
        console.error("SUMER staff access grant failed", { code: grantError.code || null });
        return json({ ok: false, error: "تم إنشاء الحساب، لكن تعذر منحه صلاحية لوحة الأوردرات." }, 500);
      }

      return json({
        ok: true,
        staffUser: {
          userId: createdUser.user.id,
          email: createdUser.user.email || email,
          createdAt: createdUser.user.created_at || new Date().toISOString(),
        },
      });
    }

    if (action === "list_staff") {
      if (!isAdmin) return json({ ok: false, error: "عرض حسابات الموظفين متاح لمدير الموقع فقط." }, 403);
      const { data: staffRows, error: listError } = await db
        .from("order_staff_users")
        .select("user_id,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (listError) throw listError;

      const staffUsers = [];
      for (const row of staffRows || []) {
        const { data: userData } = await db.auth.admin.getUserById(row.user_id);
        staffUsers.push({
          userId: row.user_id,
          email: userData?.user?.email || "حساب بدون بريد ظاهر",
          createdAt: row.created_at,
        });
      }
      return json({ ok: true, staffUsers });
    }

    if (action === "remove_staff") {
      if (!isAdmin) return json({ ok: false, error: "إدارة صلاحيات الموظفين متاحة لمدير الموقع فقط." }, 403);
      const userId = String(body.userId ?? "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(userId)) return json({ ok: false, error: "معرّف الموظف غير صالح." }, 400);
      const { error: deleteAccessError } = await db
        .from("order_staff_users")
        .delete()
        .eq("user_id", userId);
      if (deleteAccessError) throw deleteAccessError;
      // Keep the Auth account, but remove its permission to use this dashboard.
      return json({ ok: true });
    }

    if (action === "update_status") {
      const orderNumber = Number(body.orderNumber);
      const status = String(body.status ?? "");
      if (!Number.isSafeInteger(orderNumber) || orderNumber < 1 || !ORDER_STATUSES.has(status)) {
        return json({ ok: false, error: "رقم الأوردر أو الحالة غير صالح." }, 400);
      }

      const { data: updated, error: updateError } = await db
        .from("orders")
        .update({ order_status: status })
        .eq("order_number", orderNumber)
        .select("order_number,order_status")
        .maybeSingle();
      if (updateError) throw updateError;
      if (!updated) return json({ ok: false, error: "مش لاقيين الأوردر المطلوب." }, 404);
      return json({ ok: true, orderNumber: String(updated.order_number), status: updated.order_status });
    }

    if (action !== "list_orders") return json({ ok: false, error: "الإجراء المطلوب غير معروف." }, 400);

    const { data: orderRows, error: ordersError } = await db
      .from("orders")
      .select("id,order_number,customer_name,phone,backup_phone,area_name,street_address,building,floor,apartment,order_status,subtotal,delivery_fee,total,notes,created_at,preparation_started_at,preparation_deadline_at,preparation_completed_at,preparation_minutes,delivery_minutes")
      .order("created_at", { ascending: false })
      .limit(200);
    if (ordersError) throw ordersError;

    const rows = orderRows || [];
    const orderIds = rows.map((row: any) => row.id);
    let itemRows: any[] = [];
    if (orderIds.length) {
      const { data: items, error: itemsError } = await db
        .from("order_items")
        .select("id,order_id,product_name,quantity,line_total")
        .in("order_id", orderIds);
      if (itemsError) throw itemsError;
      itemRows = items || [];
    }

    const itemsByOrder = new Map<string, any[]>();
    for (const item of itemRows) {
      const key = String(item.order_id);
      if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
      itemsByOrder.get(key)!.push({
        id: String(item.id),
        name: String(item.product_name || "صنف"),
        quantity: Number(item.quantity) || 1,
        lineTotal: Number(item.line_total) || 0,
      });
    }

    const orders = rows.map((row: any) => ({
      orderNumber: String(row.order_number),
      customerName: String(row.customer_name || ""),
      phone: String(row.phone || ""),
      backupPhone: String(row.backup_phone || ""),
      areaName: String(row.area_name || ""),
      streetAddress: String(row.street_address || ""),
      building: String(row.building || ""),
      floor: String(row.floor || ""),
      apartment: String(row.apartment || ""),
      status: String(row.order_status || "new"),
      subtotal: Number(row.subtotal) || 0,
      deliveryFee: Number(row.delivery_fee) || 0,
      total: Number(row.total) || 0,
      notes: String(row.notes || ""),
      createdAt: row.created_at,
      preparationStartedAt: row.preparation_started_at,
      preparationDeadlineAt: row.preparation_deadline_at,
      preparationCompletedAt: row.preparation_completed_at,
      preparationMinutes: Number(row.preparation_minutes) || 30,
      deliveryMinutes: Number(row.delivery_minutes) || 45,
      items: itemsByOrder.get(String(row.id)) || [],
    }));

    return json({ ok: true, orders, role: isAdmin ? "admin" : "staff", updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("SUMER orders dashboard error:", error instanceof Error ? error.message : "unknown error");
    return json({ ok: false, error: "تعذر تنفيذ العملية حاليًا. راجع الاتصال أو الصلاحيات." }, 500);
  }
});
