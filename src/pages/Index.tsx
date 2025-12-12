import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { CategoryChips } from "@/components/marketplace/CategoryChips";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { categories, brands, products } from "@/data/mockData";
import { FilterState } from "@/types/product";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1500],
    rating: 0,
    brands: [],
    category: "all",
    deliveryOption: "all",
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      // Price filter
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && product.rating < filters.rating) {
        return false;
      }

      // Brand filter
      if (
        filters.brands.length > 0 &&
        !filters.brands.includes(product.brand)
      ) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, filters]);

  const handleFavoriteToggle = (productId: string) => {
    toast({
      title: "Updated favorites",
      description: "Product has been added to your favorites.",
    });
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        {/* Category Chips */}
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="flex gap-6 mt-4">
          {/* Filter Sidebar */}
          <FilterSidebar
            brands={brands}
            filters={filters}
            onFilterChange={setFilters}
            maxPrice={1500}
          />

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> products
              </p>
            </div>
            <ProductGrid
              products={filteredProducts}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
