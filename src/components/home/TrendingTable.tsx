import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";

interface TrendingTableProps {
  products: Product[];
}

interface CollectionRow {
  name: string;
  image: string;
  floorPrice: number;
  change1d: number;
  change7d: number;
  volume1d: number;
  volume7d: number;
  owners: number;
  supply: number;
}

export const TrendingTable = ({ products }: TrendingTableProps) => {
  const brandMap = new Map<string, Product[]>();
  products.forEach((p) => {
    const items = brandMap.get(p.brand) || [];
    items.push(p);
    brandMap.set(p.brand, items);
  });

  const rows: CollectionRow[] = [];
  brandMap.forEach((items, brand) => {
    const floorPrice = Math.min(...items.map((i) => i.price));
    rows.push({
      name: brand,
      image: items[0].image,
      floorPrice,
      change1d: parseFloat((Math.random() * 10 - 5).toFixed(2)),
      change7d: parseFloat((Math.random() * 20 - 10).toFixed(2)),
      volume1d: parseFloat((items.reduce((s, i) => s + i.price, 0) * 0.3).toFixed(2)),
      volume7d: parseFloat((items.reduce((s, i) => s + i.price, 0) * 2.1).toFixed(2)),
      owners: Math.floor(Math.random() * 5000) + 200,
      supply: items.length * Math.floor(Math.random() * 1000) + 500,
    });
  });

  if (rows.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="text-gradient">Trending</span>{" "}
          <span className="text-muted-foreground">Collections</span>
        </h2>

        <div className="rounded-2xl border border-border overflow-hidden bg-card/50">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border hidden lg:grid">
            <span>Collection</span>
            <span>Floor Price</span>
            <span>1D Change</span>
            <span>7D Change</span>
            <span>1D Volume</span>
            <span>7D Volume</span>
            <span>Owners</span>
            <span>Supply</span>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <motion.div
              key={row.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/creator/${encodeURIComponent(row.name)}`}
                className="grid grid-cols-[1fr_auto] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 items-center border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                {/* Collection */}
                <div className="flex items-center gap-3">
                  <img src={row.image} alt={row.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                  <span className="font-semibold text-foreground truncate text-sm">{row.name}</span>
                </div>

                {/* Floor Price */}
                <span className="text-sm font-medium text-foreground">
                  {row.floorPrice.toFixed(2)} <span className="text-primary">Ξ</span>
                </span>

                {/* 1D Change */}
                <span className={`text-sm font-medium hidden lg:block ${row.change1d >= 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                  {row.change1d >= 0 ? "+" : ""}{row.change1d}%
                </span>

                {/* 7D Change */}
                <span className={`text-sm font-medium hidden lg:block ${row.change7d >= 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                  {row.change7d >= 0 ? "+" : ""}{row.change7d}%
                </span>

                {/* 1D Volume */}
                <span className="text-sm text-muted-foreground hidden lg:block">
                  {row.volume1d} <span className="text-primary">Ξ</span>
                </span>

                {/* 7D Volume */}
                <span className="text-sm text-muted-foreground hidden lg:block">
                  {row.volume7d} <span className="text-primary">Ξ</span>
                </span>

                {/* Owners */}
                <span className="text-sm text-muted-foreground hidden lg:block">{row.owners.toLocaleString()}</span>

                {/* Supply */}
                <span className="text-sm text-muted-foreground hidden lg:block">{row.supply.toLocaleString()}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
