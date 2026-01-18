-- Fix SECURITY DEFINER views by explicitly setting them to SECURITY INVOKER
-- Drop and recreate views with proper security settings

DROP VIEW IF EXISTS public.products_public;
DROP VIEW IF EXISTS public.reviews_public;

-- Recreate products_public view with SECURITY INVOKER (default, but explicit)
CREATE VIEW public.products_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  description,
  gender,
  retail_price,
  image_url,
  created_at,
  updated_at
FROM public.products;

-- Grant select on the view
GRANT SELECT ON public.products_public TO authenticated;
GRANT SELECT ON public.products_public TO anon;

-- Recreate reviews_public view with SECURITY INVOKER
CREATE VIEW public.reviews_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  product_id,
  rating,
  comment,
  created_at,
  updated_at
FROM public.reviews;

-- Grant select on the view
GRANT SELECT ON public.reviews_public TO authenticated;
GRANT SELECT ON public.reviews_public TO anon;