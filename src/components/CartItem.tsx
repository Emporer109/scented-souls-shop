import { Button } from '@/components/ui/button';
import { Minus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/hooks/useCart';

interface CartItemProps {
  item: CartItemType;
  onRemoveOne: (cartItemId: string) => void;
  onRemoveAll: (cartItemId: string) => void;
}

export function CartItemCard({ item, onRemoveOne, onRemoveAll }: CartItemProps) {
  return (
    <div className="glass-card rounded-lg p-4 flex gap-4 animate-fade-in">
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-secondary">
        {item.product?.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-2xl text-muted-foreground/30">
              {item.product?.title?.charAt(0) || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg text-foreground truncate">
          {item.product?.title || 'Unknown Product'}
        </h3>
        <p className="font-body text-sm text-muted-foreground capitalize">
          {item.product?.gender}
        </p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-lg text-primary">
            ${(item.product?.retail_price || 0).toFixed(2)}
          </span>
          <span className="font-body text-sm text-muted-foreground">
            × {item.quantity}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRemoveOne(item.id)}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveAll(item.id)}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Subtotal */}
      <div className="flex items-center">
        <span className="font-display text-xl text-foreground">
          ${((item.product?.retail_price || 0) * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
