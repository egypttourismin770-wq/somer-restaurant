-- Adds private/admin-readable WhatsApp message tracking and starts a new order's preparation timer immediately.
CREATE TABLE IF NOT EXISTS public.sumer_whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL UNIQUE,
  order_id uuid NULL REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number bigint NULL,
  recipient text NOT NULL DEFAULT '',
  message_type text NOT NULL,
  status text NOT NULL DEFAULT 'accepted',
  provider_timestamp timestamptz NULL,
  last_error jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sumer_whatsapp_messages_order_id_idx
  ON public.sumer_whatsapp_messages(order_id);
CREATE INDEX IF NOT EXISTS sumer_whatsapp_messages_created_at_idx
  ON public.sumer_whatsapp_messages(created_at DESC);

ALTER TABLE public.sumer_whatsapp_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.sumer_whatsapp_messages FROM anon, authenticated;
GRANT SELECT ON TABLE public.sumer_whatsapp_messages TO authenticated;
GRANT ALL ON TABLE public.sumer_whatsapp_messages TO service_role;
DROP POLICY IF EXISTS "admins can read sumer whatsapp messages" ON public.sumer_whatsapp_messages;
CREATE POLICY "admins can read sumer whatsapp messages"
  ON public.sumer_whatsapp_messages
  FOR SELECT TO authenticated
  USING ((SELECT private.is_sumer_admin()));

CREATE TABLE IF NOT EXISTS public.sumer_whatsapp_delivery_events (
  event_key text PRIMARY KEY,
  message_id text NOT NULL,
  recipient_id text NULL,
  status text NOT NULL,
  provider_timestamp timestamptz NULL,
  errors jsonb NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sumer_whatsapp_delivery_events_message_id_idx
  ON public.sumer_whatsapp_delivery_events(message_id);
CREATE INDEX IF NOT EXISTS sumer_whatsapp_delivery_events_received_at_idx
  ON public.sumer_whatsapp_delivery_events(received_at DESC);

ALTER TABLE public.sumer_whatsapp_delivery_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.sumer_whatsapp_delivery_events FROM anon, authenticated;
GRANT SELECT ON TABLE public.sumer_whatsapp_delivery_events TO authenticated;
GRANT ALL ON TABLE public.sumer_whatsapp_delivery_events TO service_role;
DROP POLICY IF EXISTS "admins can read sumer whatsapp delivery events" ON public.sumer_whatsapp_delivery_events;
CREATE POLICY "admins can read sumer whatsapp delivery events"
  ON public.sumer_whatsapp_delivery_events
  FOR SELECT TO authenticated
  USING ((SELECT private.is_sumer_admin()));

CREATE OR REPLACE FUNCTION public.sumer_set_preparation_timing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.order_status IN ('new', 'preparing') THEN
      NEW.preparation_started_at := COALESCE(NEW.preparation_started_at, NEW.created_at, pg_catalog.now());
      NEW.preparation_deadline_at := COALESCE(
        NEW.preparation_deadline_at,
        NEW.preparation_started_at + pg_catalog.make_interval(mins => COALESCE(NEW.preparation_minutes, 30))
      );
      NEW.preparation_completed_at := NULL;
      NEW.delay_notified_at := NULL;
    END IF;
  ELSIF NEW.order_status = 'preparing'
     AND OLD.order_status IS DISTINCT FROM NEW.order_status THEN
    IF OLD.order_status IN ('cancelled', 'out_for_delivery', 'delivered') THEN
      NEW.preparation_started_at := pg_catalog.now();
      NEW.preparation_deadline_at := pg_catalog.now()
        + pg_catalog.make_interval(mins => COALESCE(NEW.preparation_minutes, 30));
      NEW.preparation_completed_at := NULL;
      NEW.delay_notified_at := NULL;
    ELSE
      NEW.preparation_started_at := COALESCE(NEW.preparation_started_at, pg_catalog.now());
      NEW.preparation_deadline_at := COALESCE(
        NEW.preparation_deadline_at,
        NEW.preparation_started_at + pg_catalog.make_interval(mins => COALESCE(NEW.preparation_minutes, 30))
      );
    END IF;
  ELSIF NEW.order_status IN ('out_for_delivery', 'delivered')
     AND OLD.order_status IS DISTINCT FROM NEW.order_status
     AND NEW.preparation_completed_at IS NULL THEN
    NEW.preparation_completed_at := pg_catalog.now();
  END IF;
  RETURN NEW;
END;
$function$;
