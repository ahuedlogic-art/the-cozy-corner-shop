import { motion } from "framer-motion";

interface MarketplaceStatsProps {
  totalNFTs: number;
}

export const MarketplaceStats = ({ totalNFTs }: MarketplaceStatsProps) => {
  const stats = [
    { value: "10X", label: "Faster Sweeping" },
    { value: "0%", label: "Marketplace Fees" },
    { value: `${totalNFTs}+`, label: "Total NFTs" },
    { value: "10K+", label: "Total Users" },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-glow opacity-40" />

      <div className="container relative text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-gradient uppercase tracking-wider mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          The Fastest NFT Marketplace
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg max-w-xl mx-auto mb-12"
        >
          Ditch slow. Execute trades faster and discover extraordinary digital collectibles on VOOPO.
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-bold text-gradient mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
