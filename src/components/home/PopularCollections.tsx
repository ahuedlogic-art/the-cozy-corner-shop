import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";

interface PopularCollectionsProps {
  products: Product[];
}

interface CollectionData {
  name: string;
  image: string;
  owners: number;
  floorPrice: number;
  volume: number;
}

export const PopularCollections = ({ products }: PopularCollectionsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group products by brand to create collections
  const collections: CollectionData[] = [];
  const brandMap = new Map<string, Product[]>();

  products.forEach((p) => {
    const existing = brandMap.get(p.brand) || [];
    existing.push(p);
    brandMap.set(p.brand, existing);
  });

  brandMap.forEach((items, brand) => {
    const minPrice = Math.min(...items.map((i) => i.price));
    const totalVolume = items.reduce((sum, i) => sum + i.price, 0);
    collections.push({
      name: brand,
      image: items[0].image,
      owners: Math.floor(Math.random() * 5000) + 500,
      floorPrice: minPrice,
      volume: totalVolume,
    });
  });

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    }
  };

  if (collections.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold text-gradient uppercase tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Popular Collections
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full border-border h-8 w-8" onClick={() => scroll("left")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-border h-8 w-8" onClick={() => scroll("right")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2 snap-x snap-mandatory">
          {collections.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="snap-start"
            >
              <Link
                to={`/creator/${encodeURIComponent(col.name)}`}
                className="group flex-shrink-0 w-[300px] block rounded-2xl overflow-hidden bg-card border border-border hover:neon-border transition-all duration-300"
              >
                {/* Collection Image */}
                <div className="relative h-48 overflow-hidden">
                  <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>

                {/* Collection Info */}
                <div className="p-4 -mt-8 relative">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground text-lg truncate">{col.name}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{col.owners.toLocaleString()} owners</p>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Floor Price</p>
                      <p className="text-sm font-bold text-foreground">
                        {col.floorPrice.toFixed(2)} <span className="text-primary">Ξ</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">1D Volume</p>
                      <p className="text-sm font-bold text-foreground">
                        {col.volume.toFixed(2)} <span className="text-primary">Ξ</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
