import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import nftHero1 from "@/assets/nft-hero-1.jpg";

const SLIDE_DURATION = 6000;

interface HeroCollectionProps {
  featuredProducts: Product[];
}

export const HeroCollection = ({ featuredProducts }: HeroCollectionProps) => {
  const slides = featuredProducts.slice(0, 3);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTime = useRef(Date.now());

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
    startTime.current = Date.now();
    setProgress(0);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    startTime.current = Date.now();
    setProgress(0);
  }, [slides.length]);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    startTime.current = Date.now();
    setProgress(0);
  }, []);

  // Progress bar + auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        next();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [next, slides.length, current]);

  if (slides.length === 0) return null;

  const active = slides[current];

  return (
    <section className="relative overflow-hidden h-[520px] md:h-[600px]">
      {/* Background slides with blur */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={active?.image || nftHero1}
            alt={active?.name || "Featured collection"}
            className="w-full h-full object-cover blur-[2px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20 backdrop-blur-[6px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
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

        {/* Navigation + Progress */}
        {slides.length > 1 && (
          <div className="absolute bottom-16 md:bottom-20 right-6 md:right-12 flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-border/50 bg-background/30 backdrop-blur-md h-9 w-9 hover:bg-background/50"
                onClick={prev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Progress bars per slide */}
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="relative h-1 w-10 rounded-full bg-muted-foreground/20 overflow-hidden"
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary transition-none"
                      style={{
                        width:
                          i === current
                            ? `${progress * 100}%`
                            : i < current
                            ? "100%"
                            : "0%",
                      }}
                    />
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-border/50 bg-background/30 backdrop-blur-md h-9 w-9 hover:bg-background/50"
                onClick={next}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
