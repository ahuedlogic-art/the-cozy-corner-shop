import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Brand, FilterState } from "@/types/product";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  brands: Brand[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  maxPrice?: number;
}

export const FilterSidebar = ({
  brands,
  filters,
  onFilterChange,
  maxPrice = 1500,
}: FilterSidebarProps) => {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const displayedBrands = showAllBrands ? brands : brands.slice(0, 6);

  const handlePriceChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      priceRange: [value[0], value[1]] as [number, number],
    });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...filters,
      rating: rating === filters.rating ? 0 : rating,
    });
  };

  const handleBrandToggle = (brandName: string) => {
    const newBrands = filters.brands.includes(brandName)
      ? filters.brands.filter((b) => b !== brandName)
      : [...filters.brands, brandName];
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handleDeliveryChange = (option: 'standard' | 'pickup') => {
    onFilterChange({
      ...filters,
      deliveryOption: filters.deliveryOption === option ? 'all' : option,
    });
  };

  return (
    <aside className="w-64 shrink-0 space-y-6 p-4 bg-card rounded-2xl border border-border shadow-card sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto">
      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Price Range</h3>
          <button
            onClick={() =>
              onFilterChange({ ...filters, priceRange: [0, maxPrice] })
            }
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          The average price is ${Math.round(maxPrice / 2)}
        </p>
        
        <div className="relative pt-2">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              ${filters.priceRange[0]}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              ${filters.priceRange[1]}
            </span>
          </div>
          <Slider
            value={[filters.priceRange[0], filters.priceRange[1]]}
            min={0}
            max={maxPrice}
            step={10}
            onValueChange={handlePriceChange}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
        </div>
      </div>

      {/* Star Rating */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Star Rating</h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingChange(star)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors",
                  star <= filters.rating
                    ? "fill-warning text-warning"
                    : "fill-muted text-muted"
                )}
              />
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {filters.rating > 0 ? `${filters.rating} Stars & up` : "Any"}
          </span>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Brand</h3>
          <button
            onClick={() => onFilterChange({ ...filters, brands: [] })}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="space-y-2">
          {displayedBrands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.brands.includes(brand.name)}
                onCheckedChange={() => handleBrandToggle(brand.name)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
        {brands.length > 6 && (
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            {showAllBrands ? "Show Less" : "More Brands"}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showAllBrands && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {/* Delivery Options */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Delivery Options</h3>
        <div className="flex gap-2">
          <Button
            variant={filters.deliveryOption === 'standard' ? "default" : "outline"}
            size="sm"
            onClick={() => handleDeliveryChange('standard')}
            className="flex-1"
          >
            Standard
          </Button>
          <Button
            variant={filters.deliveryOption === 'pickup' ? "default" : "outline"}
            size="sm"
            onClick={() => handleDeliveryChange('pickup')}
            className="flex-1"
          >
            Pick Up
          </Button>
        </div>
      </div>
    </aside>
  );
};
