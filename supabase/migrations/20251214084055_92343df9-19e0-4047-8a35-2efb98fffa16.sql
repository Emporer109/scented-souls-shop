-- Allow admins to view all profiles for user management
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile or admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert new roles (for promoting users)
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));