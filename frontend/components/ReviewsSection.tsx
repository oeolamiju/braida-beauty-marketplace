import { useEffect, useState, useRef } from "react";
import { Star, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import backend from "@/lib/backend";

interface Review {
  id: number;
  rating: number;
  reviewText?: string;
  photoUrl?: string;
  createdAt: string;
  clientName?: string;
  clientPhotoUrl?: string;
  serviceTitle?: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

interface ReviewsSectionProps {
  freelancerId: number | string;
  darkMode?: boolean;
  variant?: "default" | "carousel";
}

export function ReviewsSection({ freelancerId, darkMode = false, variant = "carousel" }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReviews();
  }, [freelancerId]);

  async function loadReviews() {
    try {
      const id = typeof freelancerId === "string" ? parseInt(freelancerId) : freelancerId;
      if (isNaN(id)) {
        // If it's a string UUID, use it directly
        const data = await backend.reviews.listByFreelancer({ freelancerId: freelancerId as unknown as number });
        setReviews(data.reviews);
        setStats(data.stats);
      } else {
        const data = await backend.reviews.listByFreelancer({ freelancerId: id });
        setReviews(data.reviews);
        setStats(data.stats);
      }
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

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  const bgClass = darkMode ? "bg-[#2a2a2a] border-[#3a3a3a]" : "bg-white border-gray-200";
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const mutedClass = darkMode ? "text-gray-400" : "text-muted-foreground";

  if (loading) {
    return (
      <Card className={`p-6 ${bgClass}`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-6 rounded w-32 ${darkMode ? "bg-[#3a3a3a]" : "bg-muted"}`} />
          <div className={`h-20 rounded ${darkMode ? "bg-[#3a3a3a]" : "bg-muted"}`} />
        </div>
      </Card>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card className={`p-6 ${bgClass}`}>
        <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Reviews</h2>
        <p className={`text-center py-8 ${mutedClass}`}>No reviews yet</p>
      </Card>
    );
  }

  // Carousel variant (like the mockup)
  if (variant === "carousel") {
    return (
      <div className="relative">
        {/* Navigation Arrows */}
        <div className="absolute -right-4 top-0 flex gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full p-2 ${darkMode ? "border-[#3a3a3a] bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]" : ""}`}
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full p-2 ${darkMode ? "border-[#3a3a3a] bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]" : ""}`}
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Reviews Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reviews.map((review) => (
            <Card
              key={review.id}
              className={`flex-shrink-0 w-[350px] p-5 snap-start ${bgClass}`}
            >
              {/* Header with avatar and rating */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                    darkMode ? "bg-[#3a3a3a]" : "bg-gray-100"
                  }`}>
                    {review.clientPhotoUrl ? (
                      <img
                        src={review.clientPhotoUrl}
                        alt={review.clientName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={`text-sm font-bold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {(review.clientName || "A").charAt(0).toUpperCase()}
                        {(review.clientName || "Anonymous").split(" ")[1]?.charAt(0).toUpperCase() || ""}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${textClass}`}>
                      {review.clientName || "Anonymous"}
                    </p>
                    <p className={`text-xs ${mutedClass}`}>
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-orange-400 text-orange-400"
                          : darkMode ? "text-gray-600" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review text */}
              {review.reviewText && (
                <p className={`text-sm leading-relaxed line-clamp-4 mb-3 ${mutedClass}`}>
                  "{review.reviewText}"
                </p>
              )}

              {/* Service tag */}
              {review.serviceTitle && (
                <div className="flex items-center gap-2 mt-auto">
                  <span className={`text-xs ${mutedClass}`}>Service:</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${darkMode ? "border-[#3a3a3a] text-gray-300" : ""}`}
                  >
                    {review.serviceTitle}
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Default variant with stats
  return (
    <Card className={`p-6 ${bgClass}`}>
      <h2 className={`text-xl font-semibold mb-6 ${textClass}`}>Reviews</h2>

      <div className="grid md:grid-cols-[200px_1fr] gap-8 mb-8">
        <div className="text-center md:text-left">
          <div className={`text-5xl font-bold mb-2 ${textClass}`}>
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-5 ${
                  star <= Math.round(stats.averageRating)
                    ? "fill-orange-400 text-orange-400"
                    : darkMode ? "text-gray-600" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className={`text-sm ${mutedClass}`}>
            {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className={`text-sm ${textClass}`}>{rating}</span>
                  <Star className="size-3 fill-orange-400 text-orange-400" />
                </div>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? "bg-[#3a3a3a]" : "bg-muted"}`}>
                  <div
                    className="h-full bg-orange-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={`text-sm w-8 text-right ${mutedClass}`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className={`border-t pt-6 first:border-0 first:pt-0 ${darkMode ? "border-[#3a3a3a]" : ""}`}>
            <div className="flex items-start gap-4">
              <div className={`size-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${
                darkMode ? "bg-[#3a3a3a]" : "bg-muted"
              }`}>
                {review.clientPhotoUrl ? (
                  <img
                    src={review.clientPhotoUrl}
                    alt={review.clientName}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className={`size-5 ${mutedClass}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className={`font-medium ${textClass}`}>{review.clientName || "Anonymous"}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-4 ${
                              star <= review.rating
                                ? "fill-orange-400 text-orange-400"
                                : darkMode ? "text-gray-600" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-sm ${mutedClass}`}>
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {review.reviewText && (
                  <p className={`text-sm whitespace-pre-wrap mb-3 ${darkMode ? "text-gray-300" : "text-foreground"}`}>
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
