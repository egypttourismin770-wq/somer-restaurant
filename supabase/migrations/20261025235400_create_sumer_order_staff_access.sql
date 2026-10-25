CREATE TABLE IF NOT EXISTS public.order_staff_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_staff_users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.order_staff_users FROM anon, authenticated;
GRANT ALL ON TABLE public.order_staff_users TO service_role;

DROP POLICY IF EXISTS "admins manage order staff access" ON public.order_staff_users;
CREATE POLICY "admins manage order staff access"
  ON public.order_staff_users
  FOR ALL
  TO authenticated
  USING ((SELECT private.is_sumer_admin()))
  WITH CHECK ((SELECT private.is_sumer_admin()));
