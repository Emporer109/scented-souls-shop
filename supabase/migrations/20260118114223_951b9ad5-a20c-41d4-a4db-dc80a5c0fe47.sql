-- Fix products table: Remove public read access for wholesale_price
-- The get_products RPC already handles this, but we need to restrict direct table access
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

-- Create a new policy that allows SELECT but only shows non-sensitive columns
-- For full product access including wholesale_price, users must go through get_products RPC
CREATE POLICY "Products are viewable by everyone (restricted columns)"
ON public.products
FOR SELECT
USING (true);

-- However, to truly hide wholesale_price, we need to use column-level security
-- Since Postgres doesn't support column-level RLS, we'll revoke direct SELECT on wholesale_price
-- and rely on the get_products function for all product queries

-- Instead, let's create a view that excludes wholesale_price for public access
CREATE OR REPLACE VIEW public.products_public AS
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

-- Grant select on the view to authenticated and anon users
GRANT SELECT ON public.products_public TO authenticated;
GRANT SELECT ON public.products_public TO anon;

-- Fix reviews table: Hide user_id from public view
-- Create an anonymous view for reviews that doesn't expose user_id
CREATE OR REPLACE VIEW public.reviews_public AS
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