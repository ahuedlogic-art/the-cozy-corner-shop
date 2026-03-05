import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Star, ShoppingCart, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const CreatorProfile = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const decodedName = decodeURIComponent(name || "");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["creator-products", decodedName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`creator_name.eq.${decodedName},brand.eq.${decodedName}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!decodedName,
  });

  const totalVolume = products.reduce((sum, p) => sum + Number(p.price), 0);
  const avgRating = products.length
    ? products.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / products.length
    : 0;

  // Generate avatar from name
  const initials = decodedName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <main className="container -mt-20 relative z-10 pb-12">
        <Button variant="ghost" className="mb-4 gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Creator Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-10"
        >
          <div className="h-28 w-28 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-neon shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {decodedName}
              </h1>
              <Badge className="gradient-primary text-primary-foreground">Verified</Badge>
            </div>
            <p className="text-muted-foreground max-w-xl mb-4">
              Digital artist and NFT creator on the VOOPO marketplace. Explore their unique collection of digital collectibles.
            </p>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-gradient">{products.length}</p>
                <p className="text-xs text-muted-foreground">NFTs Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient">{totalVolume.toFixed(0)} ETH</p>
                <p className="text-xs text-muted-foreground">Total Volume</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient">{avgRating.toFixed(1)} ⭐</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* NFTs Grid */}
        <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Collection ({products.length})
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No NFTs found for this creator.</p>
            <Button className="mt-4" onClick={() => navigate("/")}>Browse Marketplace</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <CreatorNFTCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const CreatorNFTCard = ({ product, index }: { product: any; index: number }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isFav, setIsFav] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:neon-border transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.is_top_item && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold shadow-neon">
            🔥 Trending
          </span>
        )}
        <button
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-full bg-background/60 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all",
            isFav && "opacity-100"
          )}
          onClick={(e) => { e.stopPropagation(); setIsFav(!isFav); }}
        >
          <Heart className={cn("h-4 w-4 text-foreground", isFav && "fill-primary text-primary")} />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs text-primary font-medium uppercase tracking-wide">
          {product.collection_name || product.blockchain || "Ethereum"}
        </p>
        <h3 className="font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-3.5 w-3.5",
                star <= Math.round(Number(product.rating))
                  ? "fill-warning text-warning"
                  : "fill-muted text-muted"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.review_count})</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="price"
            size="sm"
            className="gap-2 rounded-full border-primary/30 hover:bg-primary/10"
            onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>${Number(product.price).toFixed(2)}</span>
          </Button>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">${Number(product.original_price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default CreatorProfile;
