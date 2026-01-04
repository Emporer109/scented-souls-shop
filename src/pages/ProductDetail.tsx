import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ProductReviews } from '@/components/ProductReviews';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useProducts';
import { ShoppingCart, ArrowLeft, Loader2, Star } from 'lucide-react';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      const { data, error } = await supabase.rpc('get_products', { p_gender: null });
      
      if (!error && data) {
        const found = data.find((p: Product) => p.id === productId);
        setProduct(found || null);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchReviewStats = async () => {
      if (!productId) return;
      
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);
      
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
        setReviewCount(data.length);
      }
    };

    fetchReviewStats();
  }, [productId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Product Not Found</h1>
            <p className="font-body text-muted-foreground mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/select-gender">
              <Button variant="gold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <Link 
            to={`/products/${product.gender}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-body">Back to Collection</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image with Zoom */}
            <div 
              className="relative aspect-square overflow-hidden rounded-xl glass-card cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{
                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="font-display text-8xl text-muted-foreground/30">
                    {product.title.charAt(0)}
                  </span>
                </div>
              )}
              {isZoomed && (
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="font-body text-xs text-muted-foreground">Move to zoom</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <div className="animate-fade-in-up">
                <span className="inline-block font-body text-sm text-primary uppercase tracking-wider mb-2">
                  {product.gender === 'men' ? "Men's Fragrance" : "Women's Fragrance"}
                </span>
                
                <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                  {product.title}
                </h1>

                {/* Rating Display */}
                {averageRating !== null && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(averageRating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-body text-sm text-muted-foreground">
                      {averageRating.toFixed(1)} ({reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="font-display text-4xl text-primary">
                    ₹{product.retail_price.toFixed(2)}
                  </span>
                  {product.wholesale_price !== null && (
                    <span className="font-body text-xl text-muted-foreground line-through">
                      ₹{product.wholesale_price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="font-display text-lg text-foreground mb-3">Description</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {product.description || 'A luxurious fragrance crafted with the finest ingredients to provide a long-lasting and captivating scent experience.'}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-8 space-y-3">
                  <h3 className="font-display text-lg text-foreground">Features</h3>
                  <ul className="space-y-2">
                    {['Long-lasting fragrance', 'Premium quality ingredients', 'Elegant packaging', 'Perfect for all occasions'].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 font-body text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full md:w-auto"
                  onClick={handleAddToCart}
                  disabled={!user}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                {!user && (
                  <p className="font-body text-sm text-muted-foreground mt-3">
                    <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to add items to your cart
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <ProductReviews productId={productId!} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;