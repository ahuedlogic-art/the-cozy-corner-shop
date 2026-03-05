import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { CategoryChips } from "@/components/marketplace/CategoryChips";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { HeroCollection } from "@/components/home/HeroCollection";
import { PopularCollections } from "@/components/home/PopularCollections";
import { MarketplaceStats } from "@/components/home/MarketplaceStats";
import { TrendingTable } from "@/components/home/TrendingTable";
import { categories } from "@/data/mockData";
import { FilterState } from "@/types/product";
import { toast } from "@/hooks/use-toast";
import { useProducts, useBrands } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1500],
    rating: 0,
    brands: [],
    category: "all",
    deliveryOption: "all",
  });

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
      if (filters.rating > 0 && product.rating < filters.rating) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
      return true;
    });
  }, [selectedCategory, filters, products]);

  const handleFavoriteToggle = (productId: string) => {
    toast({ title: "Updated favorites", description: "NFT has been added to your favorites." });
  };

  const isLoading = productsLoading || brandsLoading;
  const featuredProducts = products.filter((p) => p.isTopItem).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero - Featured Collection */}
      {isLoading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <HeroCollection featuredProducts={featuredProducts.length > 0 ? featuredProducts : products.slice(0, 1)} />
      )}

      {/* Popular Collections Carousel */}
      {!isLoading && <PopularCollections products={products} />}

      {/* Stats Section */}
      <MarketplaceStats totalNFTs={products.length} />

      {/* Trending Table */}
      {!isLoading && <TrendingTable products={products} />}

      {/* Marketplace */}
      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Explore NFTs
          </h2>
          <p className="text-muted-foreground mb-4">Discover the latest digital collectibles</p>

          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <div className="flex gap-6 mt-4">
            <FilterSidebar
              brands={brands}
              filters={filters}
              onFilterChange={setFilters}
              maxPrice={1500}
            />

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <>
                      Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> NFTs
                    </>
                  )}
                </p>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : (
                <ProductGrid
                  products={filteredProducts}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
