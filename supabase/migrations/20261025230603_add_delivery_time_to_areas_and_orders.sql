ALTER TABLE public.delivery_areas
  ADD COLUMN IF NOT EXISTS delivery_minutes integer NOT NULL DEFAULT 45;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_minutes integer NOT NULL DEFAULT 45;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'delivery_areas_delivery_minutes_check'
      AND conrelid = 'public.delivery_areas'::regclass
  ) THEN
    ALTER TABLE public.delivery_areas
      ADD CONSTRAINT delivery_areas_delivery_minutes_check
      CHECK (delivery_minutes BETWEEN 5 AND 360);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_delivery_minutes_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_minutes_check
      CHECK (delivery_minutes BETWEEN 5 AND 360);
  END IF;
END $$;
