import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import type { RemoveReviewRequest } from "./types";

interface RemoveReviewResponse {
  success: boolean;
}

export const adminRemove = api(
  { method: "POST", path: "/admin/reviews/:reviewId/remove", expose: true, auth: true },
  async (req: RemoveReviewRequest): Promise<RemoveReviewResponse> => {
    const auth = getAuthData()!;

    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    if (!req.reason || req.reason.trim().length === 0) {
      throw APIError.invalidArgument("Removal reason is required");
    }

    const review = await db.queryRow<{ id: number; is_removed: boolean }>`
      SELECT id, is_removed FROM reviews WHERE id = ${req.reviewId}
    `;

    if (!review) {
      throw APIError.notFound("Review not found");
    }

    if (review.is_removed) {
      throw APIError.invalidArgument("Review is already removed");
    }

    await db.exec`
      UPDATE reviews
      SET
        is_removed = true,
        removed_at = NOW(),
        removed_by = ${auth.userID},
        removal_reason = ${req.reason}
      WHERE id = ${req.reviewId}
    `;

    await db.exec`
      INSERT INTO review_moderation_logs (review_id, admin_id, action, reason)
      VALUES (${req.reviewId}, ${auth.userID}, 'removed', ${req.reason})
    `;

    return { success: true };
  }
);
