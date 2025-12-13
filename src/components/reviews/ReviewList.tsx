import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface ReviewListProps {
  productId: string;
}

export const ReviewList = ({ productId }: ReviewListProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      // First get reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("id, rating, title, content, created_at, user_id")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;
      
      // Then get profiles for the user_ids
      const userIds = reviewsData?.map(r => r.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      // Combine the data
      const profileMap = new Map(profilesData?.map(p => [p.user_id, p.full_name]) || []);
      
      return reviewsData?.map(review => ({
        ...review,
        profiles: { full_name: profileMap.get(review.user_id) || null }
      })) as Review[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-muted/50 space-y-3">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 rounded-xl bg-muted/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= review.rating
                        ? "fill-warning text-warning"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="font-medium text-foreground">
                {review.profiles?.full_name || "Anonymous"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(new Date(review.created_at), "MMM d, yyyy")}
            </span>
          </div>
          
          {review.title && (
            <h4 className="font-semibold text-foreground">{review.title}</h4>
          )}
          
          {review.content && (
            <p className="text-muted-foreground">{review.content}</p>
          )}
        </div>
      ))}
    </div>
  );
};
