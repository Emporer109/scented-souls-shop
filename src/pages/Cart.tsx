import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { CartItemCard } from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, loading, totalPrice, removeOneFromCart, removeFromCart, refreshCart } = useCart();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    setCheckoutLoading(true);
    try {
      const checkoutPayload = {
        userId: user.id,
        cartItems: cartItems.map(item => ({
          productTitle: item.product?.title || 'Unknown Product',
          quantity: item.quantity,
          price: (item.product?.retail_price || 0) * item.quantity,
        })),
        totalPrice,
      };

      // Send admin notification
      const { error: adminError } = await supabase.functions.invoke('checkout-notification', {
        body: checkoutPayload,
      });

      if (adminError) throw adminError;

      // Get user profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .maybeSingle();

      // Send user notification
      if (profile?.email) {
        await supabase.functions.invoke('user-checkout-notification', {
          body: {
            userEmail: profile.email,
            userName: profile.full_name || 'Valued Customer',
            cartItems: checkoutPayload.cartItems,
            totalPrice,
          },
        });
      }

      toast({
        title: "Checkout Completed!",
        description: "Your order has been placed. Check your email for confirmation!",
      });

      // Refresh cart to show it's empty
      refreshCart();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4 animate-fade-in-up">
              Your <span className="text-primary">Cart</span>
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <p className="font-display text-2xl text-muted-foreground mb-4">
                Your cart is empty
              </p>
              <p className="font-body text-muted-foreground mb-8">
                Discover our exclusive fragrance collection
              </p>
              <Link to="/select-gender">
                <Button variant="gold">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemoveOne={removeOneFromCart}
                    onRemoveAll={removeFromCart}
                  />
                ))}
              </div>

              {/* Summary */}
              <div className="glass-card rounded-lg p-6 mt-8 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display text-xl text-foreground">Total</span>
                  <span className="font-display text-3xl text-primary">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
                <Button 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="font-body text-sm text-muted-foreground text-center mt-4">
                  Secure checkout with SSL encryption
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;
