import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';

const Products = () => {
  const { gender } = useParams<{ gender: string }>();
  const { products, loading } = useProducts(gender);
  const { addToCart } = useCart();

  const genderTitle = gender === 'men' ? 'Men' : 'Women';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4 animate-fade-in-up">
              {genderTitle}'s <span className="text-primary">Collection</span>
            </h1>
            <p className="font-elegant text-lg text-muted-foreground animate-fade-in-up animation-delay-100">
              {gender === 'men' 
                ? 'Bold fragrances for the modern gentleman'
                : 'Elegant scents for the sophisticated woman'
              }
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-muted-foreground mb-4">
                No products available yet
              </p>
              <p className="font-body text-muted-foreground">
                Check back soon for our latest collection
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} onAddToCart={addToCart} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Products;
