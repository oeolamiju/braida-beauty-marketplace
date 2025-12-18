import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Loader2, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";
import TopNav from "@/components/navigation/TopNav";
import { ReviewModal } from "@/components/ReviewModal";
import type { FreelancerProfile } from "~backend/profiles/get_profile";

type Review = BackendReview & {
  serviceName?: string;
};

import type { ReviewStats, Review as BackendReview } from "~backend/reviews/types";

export default function FreelancerReviewsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [profileData, reviewsData] = await Promise.all([
        backend.profiles.getProfile({ userId }),
        backend.reviews.listByFreelancer({ freelancerId: parseInt(userId) }),
      ]);

      setProfile(profileData);
      setReviews(reviewsData.reviews);
      setStats(reviewsData.stats);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (date: string) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

    if (diffWeeks === 0) {
      return "This week";
    } else if (diffWeeks === 1) {
      return "1 week ago";
    } else if (diffWeeks < 4) {
      return `${diffWeeks} weeks ago`;
    } else if (diffWeeks < 8) {
      return "1 month ago";
    } else {
      return reviewDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Reviews Not Found</h2>
          <p className="text-muted-foreground">
            The reviews you're looking for don't exist.
          </p>
        </Card>
      </div>
    );
  }

  const getRatingLabel = (rating: number) => {
    if (rating === 5) return "Excellent";
    if (rating === 4) return "Good";
    if (rating === 3) return "Average";
    if (rating === 2) return "Poor";
    return "Very Poor";
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate(`/freelancers/${userId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-background shadow"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ratings & Reviews</h1>
              <p className="text-muted-foreground mt-1">
                Share your experience with {profile.displayName} to help the community find
                trusted professionals.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {profile.profilePhotoUrl ? (
                  <img
                    src={profile.profilePhotoUrl}
                    alt={profile.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xl font-bold text-muted-foreground">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">{profile.displayName}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.categories.join(" • ")}
                  </div>
                </div>
              </div>

              {profile.verificationStatus === "verified" && (
                <Badge variant="default" className="mb-4 w-full justify-center">
                  Verified Stylist
                </Badge>
              )}

              <div className="text-center py-4 border-t">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="h-12 w-12 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-5xl font-bold mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
                </p>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingDistribution[rating] || 0;
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2 text-sm">
                        <span className="w-4 text-right">{rating}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-8 text-right">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {profile.totalReviews > 0 && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold text-sm">Community Favorite</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This stylist is in the top 5% for customer satisfaction in {profile.locationArea}.
                  </p>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold">Rate your recent experience</h2>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="outline"
                      size="sm"
                      className="p-2"
                      onClick={() => {
                        setReviewModalOpen(true);
                      }}
                    >
                      <Star className="h-5 w-5" />
                    </Button>
                  ))}
                  <span className="text-sm text-muted-foreground self-center ml-2">
                    {getRatingLabel(4)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="outline" size="sm">
                  Box Braids
                </Button>
                <Button variant="default" size="sm">
                  Knotless Braids
                </Button>
                <Button variant="outline" size="sm">
                  Silk Press
                </Button>
                <Button variant="outline" size="sm">
                  Twists
                </Button>
              </div>
            </Card>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Reviews</h2>
              <select
                className="px-3 py-2 border rounded-md bg-background text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "rating")}
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>

            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {review.clientPhotoUrl ? (
                        <img
                          src={review.clientPhotoUrl}
                          alt={review.clientName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {review.clientName?.charAt(0).toUpperCase() || "A"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="font-semibold">{review.clientName || "Anonymous"}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="p-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {review.serviceName && (
                          <Badge variant="secondary" className="text-xs">
                            {review.serviceName}
                          </Badge>
                        )}
                      </div>

                      {review.reviewText && (
                        <p className="text-sm text-foreground mb-3 leading-relaxed">
                          {review.reviewText}
                        </p>
                      )}

                      {review.photoUrl && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <img
                            src={review.photoUrl}
                            alt="Review"
                            className="rounded-lg w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="hover:text-foreground transition-colors">
                          Helpful (12)
                        </button>
                        <button className="hover:text-foreground transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {reviews.length > 5 && (
              <div className="text-center mt-6">
                <Button variant="outline">Load more reviews</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {reviewModalOpen && selectedBookingId && (
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBookingId(null);
          }}
          bookingId={selectedBookingId}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
