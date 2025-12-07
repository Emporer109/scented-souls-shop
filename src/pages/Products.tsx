import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Products = () => {
  const { gender } = useParams<{ gender: string }>();
  const { products, loading } = useProducts(gender);
  const { addToCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Calculate max price from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.ceil(Math.max(...products.map(p => p.retail_price)));
  }, [products]);

  // Filter products based on search and price
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesPrice = product.retail_price >= priceRange[0] && product.retail_price <= priceRange[1];
      return matchesSearch && matchesPrice;
    });
  }, [products, searchQuery, priceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, maxPrice]);
  };

  const hasActiveFilters = searchQuery !== '' || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const genderTitle = gender === 'men' ? 'Men' : 'Women';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
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

          {/* Search and Filters */}
          <div className="mb-8 space-y-4 animate-fade-in-up animation-delay-200">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="glass-card p-6 rounded-lg animate-fade-in-up">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="font-body text-sm text-foreground">Price Range</label>
                      <span className="font-body text-sm text-muted-foreground">
                        ${priceRange[0]} - ${priceRange[1]}
                      </span>
                    </div>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={0}
                      max={maxPrice}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results count */}
            {!loading && (
              <p className="font-body text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-muted-foreground mb-4">
                {products.length === 0 ? 'No products available yet' : 'No products match your filters'}
              </p>
              <p className="font-body text-muted-foreground">
                {products.length === 0 
                  ? 'Check back soon for our latest collection'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
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
