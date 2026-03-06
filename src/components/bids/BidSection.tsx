import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Gavel, TrendingUp, Clock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BidSectionProps {
  productId: string;
  currentPrice: number;
}

export const BidSection = ({ productId, currentPrice }: BidSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const { data: bids = [] } = useQuery({
    queryKey: ["bids", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("product_id", productId)
        .eq("status", "active")
        .order("amount", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription
  useQuery({
    queryKey: ["bids-realtime", productId],
    queryFn: () => {
      const channel = supabase
        .channel(`bids-${productId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "bids", filter: `product_id=eq.${productId}` }, () => {
          queryClient.invalidateQueries({ queryKey: ["bids", productId] });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
    staleTime: Infinity,
  });

  const highestBid = bids[0]?.amount ? Number(bids[0].amount) : 0;
  const totalBids = bids.length;

  const placeBid = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error("Must be signed in");
      const { error } = await supabase.from("bids").insert({
        user_id: user.id,
        product_id: productId,
        amount,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bids", productId] });
      setBidAmount("");
      toast({ title: "Bid placed! 🎉", description: `Your bid of ${bidAmount} ETH has been placed.` });
    },
    onError: (err: any) => {
      toast({ title: "Bid failed", description: err.message, variant: "destructive" });
    },
  });

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid bid", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }
    if (amount <= highestBid) {
      toast({ title: "Bid too low", description: `Your bid must be higher than the current highest bid of ${highestBid.toFixed(4)} ETH.`, variant: "destructive" });
      return;
    }
    placeBid.mutate(amount);
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2 font-['Space_Grotesk']">
          <Gavel className="h-5 w-5 text-primary" />
          Place a Bid
        </h3>
        <span className="text-xs text-muted-foreground">{totalBids} bid{totalBids !== 1 ? "s" : ""}</span>
      </div>

      {/* Bid Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Highest Bid
          </p>
          <p className="text-lg font-bold text-primary font-['Space_Grotesk']">
            {highestBid > 0 ? `${highestBid.toFixed(4)} ETH` : "No bids yet"}
          </p>
        </div>
        <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Auction Ends
          </p>
          <p className="text-lg font-bold text-foreground font-['Space_Grotesk']">18h 17m</p>
        </div>
      </div>

      {/* Bid Input */}
      {user ? (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              type="number"
              step="0.0001"
              min="0"
              placeholder={highestBid > 0 ? `Min ${(highestBid + 0.0001).toFixed(4)}` : "Enter bid in ETH"}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bg-background/50 border-border pr-14 font-['Space_Grotesk']"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">ETH</span>
          </div>
          <Button
            onClick={handlePlaceBid}
            disabled={placeBid.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-['Space_Grotesk'] shadow-[0_0_15px_hsl(270_80%_60%/0.3)] px-6"
          >
            <Gavel className="h-4 w-4 mr-2" />
            {placeBid.isPending ? "Bidding..." : "Place Bid"}
          </Button>
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm text-muted-foreground mb-2">Sign in to place a bid</p>
          <Button variant="outline" asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      )}

      {/* Bid History Toggle */}
      {bids.length > 0 && (
        <>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium font-['Space_Grotesk'] w-full text-left"
          >
            {showHistory ? "Hide" : "View"} Bid History ({bids.length})
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {bids.slice(0, 10).map((bid, i) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                        i === 0
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted/20 border border-border/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium font-['Space_Grotesk']">
                            {bid.user_id.slice(0, 6)}...{bid.user_id.slice(-4)}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(bid.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold font-['Space_Grotesk'] ${i === 0 ? "text-primary" : "text-foreground"}`}>
                          {Number(bid.amount).toFixed(4)} ETH
                        </p>
                        {i === 0 && <span className="text-xs text-primary">Highest</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
