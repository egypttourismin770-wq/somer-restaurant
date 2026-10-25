ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_order_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_order_status_check
  CHECK (
    order_status = ANY (
      ARRAY[
        'new'::text,
        'confirmed'::text,
        'preparing'::text,
        'ready'::text,
        'out_for_delivery'::text,
        'delivered'::text,
        'cancelled'::text
      ]
    )
  );

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
  ELSIF NEW.order_status IN ('ready', 'out_for_delivery', 'delivered')
     AND OLD.order_status IS DISTINCT FROM NEW.order_status
     AND NEW.preparation_completed_at IS NULL THEN
    NEW.preparation_completed_at := pg_catalog.now();
  END IF;
  RETURN NEW;
END;
$function$;
