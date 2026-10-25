import { createClient } from "npm:@supabase/supabase-js@2";

const WEBHOOK_BASE_URL = "https://lvemooxazqhjpfqnnuzg.supabase.co/functions/v1/sumer-whatsapp-webhook";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function parseResponse(response: Response) {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return { responseText: raw.slice(0, 300) };
  }
}

function summarizeProviderError(payload: any): string | null {
  if (typeof payload === "string") return payload.slice(0, 300);
  const error = payload?.error;
  if (typeof error === "string") return error.slice(0, 300);
  if (error && typeof error === "object") {
    const msg = error.message ?? error.details ?? error.title ?? error.code;
    if (msg != null) return String(msg).slice(0, 300);
    return JSON.stringify(error).slice(0, 300);
  }
  if (Array.isArray(payload?.errors)) return JSON.stringify(payload.errors).slice(0, 300);
  const direct = payload?.message ?? payload?.details ?? payload?.title ?? payload?.code ?? payload?.responseText ?? payload?.detail;
  if (direct != null) return String(direct).slice(0, 300);
  if (payload && Object.keys(payload).length) return JSON.stringify(payload).slice(0, 300);
  return null;
}


async function recordTestMessage(db: any, messageId: string | null, recipient: string, messageType: string) {
  if (!db || !messageId) return false;
  const { error } = await db.from("sumer_whatsapp_messages").insert({
    message_id: messageId,
    order_id: null,
    order_number: null,
    recipient,
    message_type: messageType,
    status: "accepted",
  });
  if (error && error.code !== "23505") {
    console.error("SUMER test message database logging failed", {
      messageType,
      code: error.code ?? null,
      message: error.message,
    });
    return false;
  }

  const { data: events, error: eventsError } = await db
    .from("sumer_whatsapp_delivery_events")
    .select("status,provider_timestamp,errors")
    .eq("message_id", messageId)
    .order("provider_timestamp", { ascending: false, nullsFirst: false })
    .limit(1);
  if (eventsError) {
    console.warn("SUMER test delivery events lookup failed", { code: eventsError.code ?? null });
  } else if (events?.length) {
    const latest = events[0];
    const { error: updateError } = await db.from("sumer_whatsapp_messages")
      .update({
        status: latest.status,
        provider_timestamp: latest.provider_timestamp,
        last_error: latest.errors,
        updated_at: new Date().toISOString(),
      })
      .eq("message_id", messageId);
    if (updateError) console.warn("SUMER test status sync failed", { code: updateError.code ?? null });
  }
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("D360_API_KEY")?.trim();
  const recipient = Deno.env.get("D360_RECIPIENT_PHONE")?.trim();
  const webhookToken = Deno.env.get("SUMER_WEBHOOK_TOKEN")?.trim();
  const missing = [
    !apiKey ? "D360_API_KEY" : null,
    !recipient ? "D360_RECIPIENT_PHONE" : null,
    !webhookToken ? "SUMER_WEBHOOK_TOKEN" : null,
  ].filter(Boolean);
  if (missing.length) return json({ ok: false, error: "Missing required secrets", missing }, 500);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const db = supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

  const webhookUrl = `${WEBHOOK_BASE_URL}?token=${encodeURIComponent(webhookToken!)}`;

  try {
    const configResponse = await fetch("https://waba-sandbox.360dialog.io/v1/configs/webhook", {
      method: "POST",
      headers: { "D360-API-KEY": apiKey!, "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const configPayload = await parseResponse(configResponse);

    if (!configResponse.ok) {
      return json({
        ok: false,
        webhookConfigured: false,
        webhookStatus: configResponse.status,
        webhookError: summarizeProviderError(configPayload),
      });
    }

    const webhookTestResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object: "sumer_test", entry: [] }),
    });
    const webhookTestPayload = await parseResponse(webhookTestResponse);
    const webhookTestAccepted = webhookTestResponse.ok && webhookTestPayload?.ok === true;

    const pizzaImageUrl = "https://images.unsplash.com/photo-1671106681075-5a7233268cbd?fit=crop&w=800&q=85&fm=jpg";
    const imageResponse = await fetch("https://waba-sandbox.360dialog.io/v1/messages", {
      method: "POST",
      headers: { "D360-API-KEY": apiKey!, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient!,
        type: "image",
        image: { link: pizzaImageUrl, caption: "🍕 اختبار صورة البيتزا من منيو سومر" },
      }),
    });
    const imagePayload = await parseResponse(imageResponse);
    const imageAccepted = imageResponse.ok && Array.isArray(imagePayload?.messages) && imagePayload.messages.length > 0;

    const imageMessageId = imagePayload?.messages?.[0]?.id ? String(imagePayload.messages[0].id) : null;
    const imageDatabaseSaved = imageAccepted
      ? await recordTestMessage(db, imageMessageId, recipient!, "test_image")
      : false;

    const textResponse = await fetch("https://waba-sandbox.360dialog.io/v1/messages", {
      method: "POST",
      headers: { "D360-API-KEY": apiKey!, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient!,
        type: "text",
        text: { body: "✅ اختبار سومر: صورة البيتزا أُرسلت أولًا، وهذه رسالة تأكيد للاختبار." },
      }),
    });
    const textPayload = await parseResponse(textResponse);
    const textAccepted = textResponse.ok && Array.isArray(textPayload?.messages) && textPayload.messages.length > 0;

    const textMessageId = textPayload?.messages?.[0]?.id ? String(textPayload.messages[0].id) : null;
    const textDatabaseSaved = textAccepted
      ? await recordTestMessage(db, textMessageId, recipient!, "test_text")
      : false;

    return json({
      ok: webhookTestAccepted && imageAccepted && textAccepted,
      webhookConfigured: true,
      webhookTestAccepted,
      webhookTestStatus: webhookTestResponse.status,
      imageAccepted,
      imageStatus: imageResponse.status,
      imageError: imageAccepted ? null : summarizeProviderError(imagePayload),
      imageMessageId,
      imageDatabaseSaved,
      textAccepted,
      textStatus: textResponse.status,
      textError: textAccepted ? null : summarizeProviderError(textPayload),
      textMessageId,
      textDatabaseSaved,
      databaseConfigured: Boolean(db),
      note: "Test WhatsApp message IDs are saved to sumer_whatsapp_messages; delivery callbacks are saved by sumer-whatsapp-webhook.",
    });
  } catch (error) {
    console.error("SUMER diagnostic test error", error instanceof Error ? error.message : "unknown error");
    return json({ ok: false, error: "Diagnostic request failed" }, 502);
  }
});