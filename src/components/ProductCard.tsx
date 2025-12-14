import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="group glass-card rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-500 animate-fade-in-up">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-4xl text-muted-foreground/30">
              {product.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-xl text-foreground mb-2 line-clamp-1">
          {product.title}
        </h3>
        {product.description && (
          <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-display text-2xl text-primary">
            ₹{product.retail_price.toFixed(2)}
          </span>
          {product.wholesale_price !== null && (
            <span className="font-body text-sm text-muted-foreground line-through">
              ₹{product.wholesale_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          variant="gold"
          className="w-full"
          onClick={() => onAddToCart(product.id)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
