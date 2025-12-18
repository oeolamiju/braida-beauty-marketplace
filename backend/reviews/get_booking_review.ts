import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Review } from "./types";

interface GetBookingReviewRequest {
  bookingId: number;
}

interface GetBookingReviewResponse {
  review: Review | null;
  canReview: boolean;
}

export const getBookingReview = api(
  { method: "GET", path: "/reviews/booking/:bookingId", expose: true, auth: true },
  async (req: GetBookingReviewRequest): Promise<GetBookingReviewResponse> => {
    const auth = getAuthData()!;

    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      status: string;
    }>`
      SELECT id, client_id, status
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      return { review: null, canReview: false };
    }

    const isClient = booking.client_id === auth.userID;
    const isCompleted = booking.status === "completed";
    
    const review = await db.queryRow<Review>`
      SELECT
        id,
        booking_id AS "bookingId",
        client_id AS "clientId",
        freelancer_id AS "freelancerId",
        rating,
        review_text AS "reviewText",
        photo_url AS "photoUrl",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        is_removed AS "isRemoved",
        removed_at AS "removedAt",
        removed_by AS "removedBy",
        removal_reason AS "removalReason"
      FROM reviews
      WHERE booking_id = ${req.bookingId}
    `;

    const canReview = isClient && isCompleted && !review;

    return { review, canReview };
  }
);
