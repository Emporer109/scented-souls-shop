-- Restrict reviews SELECT to authenticated users only (hide user_id mapping from public)
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- Drop ambiguous reviews_public view (replaced by RPC)
DROP VIEW IF EXISTS public.reviews_public;

-- Public-safe RPC to fetch reviews for a product without exposing user_id
CREATE OR REPLACE FUNCTION public.get_product_reviews(p_product_id uuid)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  reviewer_name text,
  is_own boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.product_id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.full_name, 'Anonymous') AS reviewer_name,
    (auth.uid() IS NOT NULL AND r.user_id = auth.uid()) AS is_own
  FROM public.reviews r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE r.product_id = p_product_id
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_product_reviews(uuid) TO anon, authenticated;