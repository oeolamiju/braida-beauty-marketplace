import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";

interface RestoreReviewRequest {
  reviewId: number;
}

interface RestoreReviewResponse {
  success: boolean;
}

export const adminRestore = api(
  { method: "POST", path: "/admin/reviews/:reviewId/restore", expose: true, auth: true },
  async (req: RestoreReviewRequest): Promise<RestoreReviewResponse> => {
    const auth = getAuthData()!;

    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const review = await db.queryRow<{ id: number; is_removed: boolean }>`
      SELECT id, is_removed FROM reviews WHERE id = ${req.reviewId}
    `;

    if (!review) {
      throw APIError.notFound("Review not found");
    }

    if (!review.is_removed) {
      throw APIError.invalidArgument("Review is not removed");
    }

    await db.exec`
      UPDATE reviews
      SET
        is_removed = false,
        removed_at = NULL,
        removed_by = NULL,
        removal_reason = NULL
      WHERE id = ${req.reviewId}
    `;

    await db.exec`
      INSERT INTO review_moderation_logs (review_id, admin_id, action, reason)
      VALUES (${req.reviewId}, ${auth.userID}, 'restored', NULL)
    `;

    return { success: true };
  }
);
