-- 1. Products: enforce column-level security so wholesale_price is never exposed via direct table reads.
-- The get_products() SECURITY DEFINER RPC continues to return wholesale_price to admins only.
REVOKE SELECT ON public.products FROM anon;
REVOKE SELECT ON public.products FROM authenticated;

GRANT SELECT (id, title, description, gender, retail_price, image_url, created_at, updated_at)
  ON public.products TO anon;
GRANT SELECT (id, title, description, gender, retail_price, image_url, created_at, updated_at)
  ON public.products TO authenticated;

-- 2. Harden user_roles UPDATE policy with an explicit WITH CHECK to prevent any privilege escalation on update.
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));