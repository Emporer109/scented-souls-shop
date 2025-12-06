import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  title: string;
  description: string | null;
  gender: string;
  retail_price: number;
  wholesale_price: number;
  image_url: string | null;
  created_at: string;
}

export function useProducts(gender?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    
    // Use secure RPC function that only exposes wholesale_price to admins
    const { data, error } = await supabase.rpc('get_products', { 
      p_gender: gender || null 
    });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [gender]);

  return { products, loading, refreshProducts: fetchProducts };
}
