import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

function toProviderDate(raw: unknown): string | null {
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeErrors(status: any) {
  if (!Array.isArray(status?.errors) || status.errors.length === 0) return null;
  return status.errors.map((e: any) => ({
    code: e?.code ?? null,
    title: e?.title ?? null,
    message: e?.message ?? null,
    details: e?.error_data?.details ?? null,
  }));
}

const statusRank: Record<string, number> = {
  accepted: 0,
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 4,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expectedToken = Deno.env.get("SUMER_WEBHOOK_TOKEN")?.trim();
  const incoming = new URL(req.url);
  const receivedToken = incoming.searchParams.get("token");

  if (!expectedToken || !receivedToken || receivedToken !== expectedToken) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("SUMER webhook database configuration missing");
    return json({ error: "Webhook database is not configured" }, 500);
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const payload = await req.json();
    const summaries: Array<Record<string, unknown>> = [];
    let eventsStored = 0;
    let messageRowsUpdated = 0;

    for (const entry of (Array.isArray(payload?.entry) ? payload.entry : [])) {
      for (const change of (Array.isArray(entry?.changes) ? entry.changes : [])) {
        const value = change?.value ?? {};
        for (const status of (Array.isArray(value?.statuses) ? value.statuses : [])) {
          const messageId = String(status?.id ?? "").trim();
          const statusName = String(status?.status ?? "unknown").toLowerCase();
          const rawTimestamp = String(status?.timestamp ?? "");
          const providerTimestamp = toProviderDate(rawTimestamp);
          const errors = normalizeErrors(status);
          const recipientId = String(status?.recipient_id ?? "");

          const summary: Record<string, unknown> = {
            messageId,
            status: statusName,
            timestamp: rawTimestamp,
            errors,
          };
          summaries.push(summary);
          console.log("SUMER WhatsApp delivery status", summary);

          if (!messageId) {
            console.warn("SUMER webhook status missing message id; status was logged but not persisted");
            continue;
          }

          const eventKey = JSON.stringify([
            messageId,
            statusName,
            rawTimestamp,
            errors ?? [],
          ]);

          const { error: eventError } = await db
            .from("sumer_whatsapp_delivery_events")
            .upsert({
              event_key: eventKey,
              message_id: messageId,
              recipient_id: recipientId || null,
              status: statusName,
              provider_timestamp: providerTimestamp,
              errors,
            }, { onConflict: "event_key", ignoreDuplicates: true });

          if (eventError) {
            console.error("SUMER WhatsApp event persistence failed", {
              messageId,
              code: eventError.code ?? null,
              message: eventError.message,
            });
            throw eventError;
          }
          eventsStored++;

          const { data: currentMessage, error: lookupError } = await db
            .from("sumer_whatsapp_messages")
            .select("status,provider_timestamp")
            .eq("message_id", messageId)
            .maybeSingle();

          if (lookupError) {
            console.error("SUMER WhatsApp message lookup failed", {
              messageId,
              code: lookupError.code ?? null,
            });
            throw lookupError;
          }

          const currentTime = currentMessage?.provider_timestamp
            ? new Date(currentMessage.provider_timestamp).getTime()
            : 0;
          const eventTime = providerTimestamp ? new Date(providerTimestamp).getTime() : 0;
          const currentRank = statusRank[String(currentMessage?.status ?? "accepted")] ?? 0;
          const incomingRank = statusRank[statusName] ?? 0;
          const shouldUpdate = !currentMessage ||
            eventTime > currentTime ||
            incomingRank > currentRank;

          if (currentMessage && shouldUpdate) {
            const { error: updateError } = await db
              .from("sumer_whatsapp_messages")
              .update({
                status: statusName,
                provider_timestamp: providerTimestamp,
                last_error: errors,
                updated_at: new Date().toISOString(),
              })
              .eq("message_id", messageId);

            if (updateError) {
              console.error("SUMER WhatsApp message status update failed", {
                messageId,
                code: updateError.code ?? null,
              });
              throw updateError;
            }
            messageRowsUpdated++;
          }
        }
      }
    }

    if (summaries.length === 0) {
      console.log("SUMER WhatsApp webhook received event without message statuses", {
        object: String(payload?.object ?? ""),
      });
    }

    return json({
      ok: true,
      statusEventsReceived: summaries.length,
      statusEventsStored: eventsStored,
      messageRowsUpdated,
    });
  } catch (error) {
    console.error(
      "SUMER webhook parsing or persistence error",
      error instanceof Error ? error.message : "unknown error",
    );
    return json({ ok: false }, 500);
  }
});