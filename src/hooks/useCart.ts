import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    description: string | null;
    retail_price: number;
    wholesale_price: number;
    image_url: string | null;
    gender: string;
  };
}

export function useCart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products (
          id,
          title,
          description,
          retail_price,
          wholesale_price,
          image_url,
          gender
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      const mappedData = (data || []).map(item => ({
        ...item,
        product: Array.isArray(item.product) ? item.product[0] : item.product
      })) as CartItem[];
      setCartItems(mappedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const sendAdminNotification = async (productTitle: string, quantity: number) => {
    try {
      const { error } = await supabase.functions.invoke('send-cart-notification', {
        body: {
          userId: user?.id || 'anonymous',
          productTitle,
          quantity,
        },
      });
      if (error) {
        console.error('Failed to send admin notification:', error);
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      });
      return false;
    }

    // Get product details for notification
    const { data: product } = await supabase
      .from('products')
      .select('title')
      .eq('id', productId)
      .single();

    const existingItem = cartItems.find(item => item.product_id === productId);

    if (existingItem) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update cart",
          variant: "destructive",
        });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity: 1 });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to cart",
          variant: "destructive",
        });
        return false;
      }
    }

    // Send notification to admin
    if (product?.title) {
      sendAdminNotification(product.title, 1);
    }

    toast({
      title: "Added to cart",
      description: "Item has been added to your cart",
    });
    
    await fetchCart();
    return true;
  };

  const removeOneFromCart = async (cartItemId: string) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    if (item.quantity > 1) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', cartItemId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update cart",
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
        return;
      }
    }

    await fetchCart();
    toast({
      title: "Cart updated",
      description: "Item quantity has been updated",
    });
  };

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
      return;
    }

    await fetchCart();
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.retail_price || 0) * item.quantity,
    0
  );

  return {
    cartItems,
    loading,
    addToCart,
    removeOneFromCart,
    removeFromCart,
    totalItems,
    totalPrice,
    refreshCart: fetchCart,
  };
}
