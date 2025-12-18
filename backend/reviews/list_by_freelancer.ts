import { api } from "encore.dev/api";
import db from "../db";
import type { ListReviewsResponse, Review, ReviewStats } from "./types";

interface ListByFreelancerRequest {
  freelancerId: number;
  limit?: number;
  offset?: number;
}

export const listByFreelancer = api(
  { method: "GET", path: "/reviews/freelancer/:freelancerId", expose: true },
  async (req: ListByFreelancerRequest): Promise<ListReviewsResponse> => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    const reviews = await db.queryAll<Review>`
      SELECT
        r.id,
        r.booking_id AS "bookingId",
        r.client_id AS "clientId",
        r.freelancer_id AS "freelancerId",
        r.rating,
        r.review_text AS "reviewText",
        r.photo_url AS "photoUrl",
        r.created_at AS "createdAt",
        r.updated_at AS "updatedAt",
        r.is_removed AS "isRemoved",
        r.removed_at AS "removedAt",
        r.removed_by AS "removedBy",
        r.removal_reason AS "removalReason",
        u.name AS "clientName",
        u.photo_url AS "clientPhotoUrl"
      FROM reviews r
      JOIN users u ON r.client_id = u.id
      WHERE r.freelancer_id = ${req.freelancerId}
        AND r.is_removed = false
      ORDER BY r.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const statsRow = await db.queryRow<{
      averageRating: number;
      totalReviews: number;
      rating1: number;
      rating2: number;
      rating3: number;
      rating4: number;
      rating5: number;
    }>`
      SELECT
        COALESCE(AVG(rating), 0) AS "averageRating",
        COUNT(*) AS "totalReviews",
        COUNT(*) FILTER (WHERE rating = 1) AS rating1,
        COUNT(*) FILTER (WHERE rating = 2) AS rating2,
        COUNT(*) FILTER (WHERE rating = 3) AS rating3,
        COUNT(*) FILTER (WHERE rating = 4) AS rating4,
        COUNT(*) FILTER (WHERE rating = 5) AS rating5
      FROM reviews
      WHERE freelancer_id = ${req.freelancerId}
        AND is_removed = false
    `;

    const ratingDistribution: { [key: number]: number } = {
      1: statsRow?.rating1 || 0,
      2: statsRow?.rating2 || 0,
      3: statsRow?.rating3 || 0,
      4: statsRow?.rating4 || 0,
      5: statsRow?.rating5 || 0,
    };

    const stats: ReviewStats = {
      averageRating: statsRow?.averageRating || 0,
      totalReviews: statsRow?.totalReviews || 0,
      ratingDistribution,
    };

    return { reviews, stats };
  }
);
