import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CategoryChips } from "@/components/marketplace/CategoryChips";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { categories } from "@/data/mockData";
import { FilterState } from "@/types/product";
import { toast } from "@/hooks/use-toast";
import { useProducts, useBrands } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

  // Get top 3 items for the hero featured section
  const featuredNFTs = products.filter(p => p.isTopItem).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] gradient-glow opacity-50" />
        
        <div className="container relative py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                The Future of Digital Art
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Discover & Collect{" "}
                <span className="text-gradient">Extraordinary</span>{" "}
                NFTs
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Dive into the world of digital collectibles. Buy, sell, and trade unique NFTs from creators worldwide on the VOOPO marketplace.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gradient-primary rounded-full gap-2 shadow-neon">
                  Explore Collection
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="rounded-full border-border hover:border-primary">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12">
                <div>
                  <p className="text-3xl font-bold text-gradient">{products.length}+</p>
                  <p className="text-sm text-muted-foreground">NFTs Listed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gradient">50+</p>
                  <p className="text-sm text-muted-foreground">Artists</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gradient">10K+</p>
                  <p className="text-sm text-muted-foreground">Collectors</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Featured NFTs */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                {/* Main featured card */}
                <div className="relative rounded-3xl overflow-hidden neon-border">
                  {featuredNFTs[0] ? (
                    <img
                      src={featuredNFTs[0].image}
                      alt={featuredNFTs[0].name}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-6xl">🎨</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/90 to-transparent">
                    <p className="text-lg font-bold">{featuredNFTs[0]?.name || "Featured NFT"}</p>
                    <p className="text-primary font-semibold">{featuredNFTs[0] ? `${featuredNFTs[0].price} ETH` : "Coming Soon"}</p>
                  </div>
                </div>

                {/* Floating smaller cards */}
                {featuredNFTs[1] && (
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute -right-6 top-8 w-28 h-28 rounded-2xl overflow-hidden neon-border shadow-lg"
                  >
                    <img src={featuredNFTs[1].image} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                )}
                {featuredNFTs[2] && (
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute -left-6 bottom-16 w-24 h-24 rounded-2xl overflow-hidden neon-border shadow-lg"
                  >
                    <img src={featuredNFTs[2].image} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-y border-border bg-card/50">
        <div className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Verified Authenticity</p>
                <p className="text-xs text-muted-foreground">Every NFT verified on blockchain</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Market Analytics</p>
                <p className="text-xs text-muted-foreground">Real-time price tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Instant Transactions</p>
                <p className="text-xs text-muted-foreground">Low gas fees & fast settlement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
