import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ShoppingCart, ArrowLeft, Globe, Layers, Hash, Percent, User, FolderOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { motion } from "framer-motion";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      await addToCart(product.id);
    }
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 text-center py-16">
          <h1 className="text-2xl font-bold text-foreground mb-4">NFT not found</h1>
          <Button onClick={() => navigate("/")}>Back to Marketplace</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* NFT Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden neon-border">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.is_top_item && (
                <Badge className="absolute top-4 left-4 gradient-primary text-primary-foreground shadow-neon">
                  🔥 Trending
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-4 right-4 rounded-full bg-background/50 backdrop-blur",
                  isFavorite && "text-primary"
                )}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
              </Button>
            </div>
          </motion.div>

          {/* NFT Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Collection & Creator */}
            <div>
              {product.collection_name && (
                <p className="text-sm text-primary font-medium mb-1">{product.collection_name}</p>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                {product.creator_name && (
                  <Link
                    to={`/creator/${encodeURIComponent(product.creator_name)}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {product.creator_name.charAt(0)}
                    </div>
                    <span>by <span className="text-foreground font-medium">{product.creator_name}</span></span>
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= Math.round(Number(product.rating))
                          ? "fill-warning text-warning"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({product.review_count} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Price</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {Number(product.price).toFixed(2)} ETH
                </span>
                {product.original_price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {Number(product.original_price).toFixed(2)} ETH
                    </span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                      {Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Quantity & Buy */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-border rounded-xl bg-background">
                  <Button variant="ghost" size="icon" className="rounded-l-xl" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" className="rounded-r-xl" onClick={() => setQuantity(quantity + 1)}>+</Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 gap-2 rounded-xl gradient-primary shadow-neon text-primary-foreground"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.in_stock ? `Buy Now — ${(Number(product.price) * quantity).toFixed(2)} ETH` : "Sold Out"}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available for this NFT."}
              </p>
            </div>

            {/* Blockchain Details */}
            <div>
              <h3 className="font-semibold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Blockchain Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailCard icon={<Globe className="h-4 w-4 text-primary" />} label="Blockchain" value={product.blockchain || "Ethereum"} />
                <DetailCard icon={<Layers className="h-4 w-4 text-primary" />} label="Token Standard" value={product.token_standard || "ERC-721"} />
                <DetailCard icon={<Hash className="h-4 w-4 text-primary" />} label="Token ID" value={product.token_id || "—"} />
                <DetailCard icon={<Percent className="h-4 w-4 text-primary" />} label="Royalty" value={`${product.royalty_percentage || 0}%`} />
                <DetailCard icon={<User className="h-4 w-4 text-primary" />} label="Creator" value={product.creator_name || product.brand} />
                <DetailCard icon={<FolderOpen className="h-4 w-4 text-primary" />} label="Collection" value={product.collection_name || "—"} />
              </div>
            </div>

            {/* Supply */}
            <div className="flex items-center gap-6 px-4 py-3 rounded-xl border border-border bg-card/30">
              <div>
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="font-bold text-foreground">{product.stock_quantity}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-bold text-foreground capitalize">{product.category}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={cn("font-bold", product.in_stock ? "text-green-400" : "text-destructive")}>
                  {product.in_stock ? "Listed" : "Sold Out"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-12 pt-8 border-t border-border">
          <ProductReviews productId={product.id} />
        </div>
      </main>
    </div>
  );
};

const DetailCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
    {icon}
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground text-sm">{value}</p>
    </div>
  </div>
);

export default ProductDetail;
