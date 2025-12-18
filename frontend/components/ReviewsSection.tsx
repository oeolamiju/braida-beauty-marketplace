import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import backend from "@/lib/backend";

interface Review {
  id: number;
  rating: number;
  reviewText?: string;
  photoUrl?: string;
  createdAt: string;
  clientName?: string;
  clientPhotoUrl?: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

interface ReviewsSectionProps {
  freelancerId: number;
}

export function ReviewsSection({ freelancerId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [freelancerId]);

  async function loadReviews() {
    try {
      const data = await backend.reviews.listByFreelancer({ freelancerId });
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-32" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <p className="text-muted-foreground text-center py-8">No reviews yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Reviews</h2>

      <div className="grid md:grid-cols-[200px_1fr] gap-8 mb-8">
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-5 ${
                  star <= Math.round(stats.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{rating}</span>
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-t pt-6 first:border-0 first:pt-0">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {review.clientPhotoUrl ? (
                  <img
                    src={review.clientPhotoUrl}
                    alt={review.clientName}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="font-medium">{review.clientName || "Anonymous"}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {review.reviewText && (
                  <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
                    {review.reviewText}
                  </p>
                )}
                {review.photoUrl && (
                  <img
                    src={review.photoUrl}
                    alt="Review"
                    className="rounded-lg max-w-md w-full h-auto"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
