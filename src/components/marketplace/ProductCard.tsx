import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onFavoriteToggle?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

export const ProductCard = ({
  product,
  onFavoriteToggle,
  onAddToCart,
}: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.(product.id);
  };

  return (
    <article className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={product.image}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* Top Item Badge */}
        {product.isTopItem && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-warning text-warning-foreground text-xs font-semibold shadow-md">
            Top item
          </span>
        )}

        {/* Rating Badge (for featured items) */}
        {product.rating >= 4.5 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium">
            <span>{product.rating}/5</span>
            <Star className="h-3 w-3 fill-warning text-warning" />
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant={isFavorite ? "iconActive" : "icon"}
          size="iconSm"
          className={cn(
            "absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200",
            isFavorite && "opacity-100"
          )}
          onClick={handleFavoriteClick}
        >
          <Heart
            className={cn("h-4 w-4", isFavorite && "fill-current")}
          />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-3.5 w-3.5",
                star <= Math.round(product.rating)
                  ? "fill-warning text-warning"
                  : "fill-muted text-muted"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="price"
            size="sm"
            className="gap-2 rounded-full"
            onClick={() => onAddToCart?.(product.id)}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>${product.price.toFixed(2)}</span>
          </Button>
          
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
