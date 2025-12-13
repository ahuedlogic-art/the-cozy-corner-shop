import { ReviewList } from "./ReviewList";
import { ReviewForm } from "./ReviewForm";

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">Customer Reviews</h3>
      <ReviewForm productId={productId} />
      <ReviewList productId={productId} />
    </div>
  );
};
