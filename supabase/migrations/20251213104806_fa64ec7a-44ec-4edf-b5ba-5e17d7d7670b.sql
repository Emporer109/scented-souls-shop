-- Fix profiles table: require authentication for all operations
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Fix admin_fcm_tokens table: ensure only authenticated admins can access
DROP POLICY IF EXISTS "Admins can view their own tokens" ON public.admin_fcm_tokens;
DROP POLICY IF EXISTS "Admins can insert their own tokens" ON public.admin_fcm_tokens;
DROP POLICY IF EXISTS "Admins can delete their own tokens" ON public.admin_fcm_tokens;

CREATE POLICY "Admins can view their own tokens" 
ON public.admin_fcm_tokens 
FOR SELECT 
TO authenticated
USING ((auth.uid() = user_id) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert their own tokens" 
ON public.admin_fcm_tokens 
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid() = user_id) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete their own tokens" 
ON public.admin_fcm_tokens 
FOR DELETE 
TO authenticated
USING ((auth.uid() = user_id) AND has_role(auth.uid(), 'admin'::app_role));

-- Fix cart_items table: require authentication
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can add to their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete from their own cart" ON public.cart_items;

CREATE POLICY "Users can view their own cart" 
ON public.cart_items 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart" 
ON public.cart_items 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" 
ON public.cart_items 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart" 
ON public.cart_items 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Fix user_roles table: require authentication
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));