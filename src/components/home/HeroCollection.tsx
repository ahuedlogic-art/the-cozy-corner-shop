import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import nftHero1 from "@/assets/nft-hero-1.jpg";

interface HeroCollectionProps {
  featuredProducts: Product[];
}

export const HeroCollection = ({ featuredProducts }: HeroCollectionProps) => {
  const topCollection = featuredProducts[0];

  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src={topCollection?.image || nftHero1}
          alt="Featured collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      <div className="container relative pt-32 pb-16 md:pt-44 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <h1
            className="text-5xl md:text-7xl font-bold leading-[1.1] mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {topCollection?.brand || "Cosmic Arts"}
          </h1>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
            BY {topCollection?.brand?.toUpperCase() || "VOOPO STUDIO"}
          </p>

          <div className="flex items-center gap-8 mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Floor Price</p>
              <p className="text-lg font-bold text-foreground">
                {topCollection ? topCollection.price.toFixed(2) : "0.77"}{" "}
                <span className="text-primary">Ξ</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">1D Volume</p>
              <p className="text-lg font-bold text-foreground">
                {topCollection ? (topCollection.price * 12).toFixed(2) : "8.35"}{" "}
                <span className="text-primary">Ξ</span>
              </p>
            </div>
          </div>

          <Link to={topCollection ? `/creator/${encodeURIComponent(topCollection.brand)}` : "#"}>
            <Button size="lg" className="gradient-primary rounded-full gap-2 shadow-neon uppercase tracking-wider text-sm font-semibold">
              View Collection
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
