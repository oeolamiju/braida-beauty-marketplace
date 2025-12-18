import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import type { Review } from "./types";

interface AdminListAllRequest {
  includeRemoved?: boolean;
  limit?: number;
  offset?: number;
}

interface AdminListAllResponse {
  reviews: Review[];
  total: number;
}

export const adminListAll = api(
  { method: "GET", path: "/admin/reviews", expose: true, auth: true },
  async (req: AdminListAllRequest): Promise<AdminListAllResponse> => {
    const auth = getAuthData()!;

    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let reviews: Review[];
    let countResult: { count: number } | null;

    if (req.includeRemoved) {
      reviews = await db.queryAll<Review>`
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
        ORDER BY r.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      countResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count
        FROM reviews
      `;
    } else {
      reviews = await db.queryAll<Review>`
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
        WHERE r.is_removed = false
        ORDER BY r.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      countResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count
        FROM reviews
        WHERE is_removed = false
      `;
    }

    return {
      reviews,
      total: countResult?.count || 0,
    };
  }
);
