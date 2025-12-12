import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onFavoriteToggle?: (productId: string) => void;
}

export const ProductGrid = ({
  products,
  onFavoriteToggle,
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="animate-fade-in-up"
        >
          <ProductCard
            product={product}
            onFavoriteToggle={onFavoriteToggle}
          />
        </div>
      ))}
    </div>
  );
};
