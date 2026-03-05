import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onFavoriteToggle?: (productId: string) => void;
}

export const ProductCard = ({ product, onFavoriteToggle }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <article
      className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:neon-border transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!isImageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
        <img
          src={product.image}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />

        {product.isTopItem && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold shadow-neon">
            🔥 Trending
          </span>
        )}

        <Button
          variant={isFavorite ? "iconActive" : "icon"}
          size="iconSm"
          className={cn(
            "absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200",
            isFavorite && "opacity-100"
          )}
          onClick={handleFavoriteClick}
          aria-label="Add to favorites"
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">{product.brand}</p>
          <h3 className="font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

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
          <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="price"
            size="sm"
            className="gap-2 rounded-full border-primary/30 hover:bg-primary/10"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>${product.price.toFixed(2)}</span>
          </Button>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </article>
  );
};
