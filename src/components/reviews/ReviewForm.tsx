import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewFormProps {
  productId: string;
}

export const ReviewForm = ({ productId }: ReviewFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Check if user has purchased the product
  const { data: hasPurchased, isLoading: checkingPurchase } = useQuery({
    queryKey: ["hasPurchased", productId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("status", "completed")
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!user,
  });

  // Check if user already reviewed
  const { data: existingReview } = useQuery({
    queryKey: ["userReview", productId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (rating === 0) throw new Error("Please select a rating");

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        product_id: productId,
        rating,
        title: title.trim() || null,
        content: content.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["userReview", productId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      setRating(0);
      setTitle("");
      setContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to leave a review.
        </AlertDescription>
      </Alert>
    );
  }

  if (checkingPurchase) {
    return null;
  }

  if (!hasPurchased) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You can only review products you have purchased.
        </AlertDescription>
      </Alert>
    );
  }

  if (existingReview) {
    return (
      <Alert className="bg-success/10 border-success/20">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertDescription className="text-success">
          You have already reviewed this product.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitReview.mutate();
      }}
      className="space-y-4 p-4 rounded-xl bg-muted/50"
    >
      <h4 className="font-semibold text-foreground">Write a Review</h4>
      
      {/* Rating Stars */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  star <= (hoveredRating || rating)
                    ? "fill-warning text-warning"
                    : "fill-muted text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Title (optional)</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your review"
          maxLength={100}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Review (optional)</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          maxLength={1000}
        />
      </div>

      <Button type="submit" disabled={rating === 0 || submitReview.isPending}>
        {submitReview.isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};
