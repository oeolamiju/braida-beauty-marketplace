import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import type { CreateReviewRequest, Review } from "./types";
import { trackEvent } from "../analytics/track";

export const create = api(
  { method: "POST", path: "/reviews", expose: true, auth: true },
  async (req: CreateReviewRequest): Promise<Review> => {
    const auth = getAuthData()!;

    if (req.rating < 1 || req.rating > 5) {
      throw APIError.invalidArgument("Rating must be between 1 and 5");
    }

    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
      status: string;
    }>`
      SELECT id, client_id, freelancer_id, status
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (booking.client_id !== auth.userID) {
      throw APIError.permissionDenied("You can only review your own bookings");
    }

    if (booking.status !== "completed") {
      throw APIError.invalidArgument("You can only review completed bookings");
    }

    const existingReview = await db.queryRow<{ id: number }>`
      SELECT id FROM reviews WHERE booking_id = ${req.bookingId}
    `;

    if (existingReview) {
      throw APIError.alreadyExists("You have already reviewed this booking");
    }

    const review = await db.queryRow<Review>`
      INSERT INTO reviews (
        booking_id,
        client_id,
        freelancer_id,
        rating,
        review_text
      ) VALUES (
        ${req.bookingId},
        ${auth.userID},
        ${booking.freelancer_id},
        ${req.rating},
        ${req.reviewText || null}
      )
      RETURNING
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
    `;

    if (!review) {
      throw new Error("Failed to create review");
    }

    await trackEvent(auth.userID, "review_submitted", {
      bookingId: req.bookingId,
      rating: req.rating,
    });

    return review;
  }
);
