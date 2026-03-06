import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import nftHero1 from "@/assets/nft-hero-1.jpg";

interface HeroCollectionProps {
  featuredProducts: Product[];
}

export const HeroCollection = ({ featuredProducts }: HeroCollectionProps) => {
  const slides = featuredProducts.slice(0, 3);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  const active = slides[current];

  return (
    <section className="relative overflow-hidden h-[520px] md:h-[600px]">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={active?.image || nftHero1}
            alt={active?.name || "Featured collection"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container relative h-full flex flex-col justify-end pb-16 md:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              🔥 Trending Collection
            </p>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {active?.brand || "Cosmic Arts"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-1">
              {active?.name}
            </p>

            <div className="flex items-center gap-8 mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Floor Price</p>
                <p className="text-lg font-bold text-foreground">
                  {active ? active.price.toFixed(2) : "0.77"}{" "}
                  <span className="text-primary">Ξ</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">1D Volume</p>
                <p className="text-lg font-bold text-foreground">
                  {active ? (active.price * 12).toFixed(2) : "8.35"}{" "}
                  <span className="text-primary">Ξ</span>
                </p>
              </div>
            </div>

            <Link to={active ? `/creator/${encodeURIComponent(active.brand)}` : "#"}>
              <Button size="lg" className="gradient-primary rounded-full gap-2 shadow-neon uppercase tracking-wider text-sm font-semibold">
                View Collection
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {slides.length > 1 && (
          <div className="absolute bottom-16 md:bottom-20 right-6 md:right-12 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border/50 bg-background/30 backdrop-blur-sm h-9 w-9 hover:bg-background/50"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border/50 bg-background/30 backdrop-blur-sm h-9 w-9 hover:bg-background/50"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
