-- Create a secure function to get products with conditional wholesale_price access
CREATE OR REPLACE FUNCTION public.get_products(p_gender text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  gender text,
  retail_price numeric,
  wholesale_price numeric,
  image_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.gender,
    p.retail_price,
    CASE WHEN public.has_role(auth.uid(), 'admin'::app_role) 
      THEN p.wholesale_price 
      ELSE NULL 
    END as wholesale_price,
    p.image_url,
    p.created_at,
    p.updated_at
  FROM public.products p
  WHERE (p_gender IS NULL OR p.gender = p_gender)
  ORDER BY p.created_at DESC;
END;
$$;