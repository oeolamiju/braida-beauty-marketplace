export interface Review {
  id: number;
  bookingId: number;
  clientId: string;
  freelancerId: string;
  rating: number;
  reviewText?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  isRemoved: boolean;
  removedAt?: string;
  removedBy?: string;
  removalReason?: string;
  clientName?: string;
  clientPhotoUrl?: string;
}

export interface RatingDistribution {
  [key: number]: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export interface CreateReviewRequest {
  bookingId: number;
  rating: number;
  reviewText?: string;
}

export interface ListReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
}

export interface RemoveReviewRequest {
  reviewId: number;
  reason: string;
}

export interface ModerationLog {
  id: number;
  reviewId: number;
  adminId: string;
  action: string;
  reason?: string;
  createdAt: string;
  adminName?: string;
}
