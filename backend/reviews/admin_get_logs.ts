import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import type { ModerationLog } from "./types";

interface GetLogsRequest {
  reviewId: number;
}

interface GetLogsResponse {
  logs: ModerationLog[];
}

export const adminGetLogs = api(
  { method: "GET", path: "/admin/reviews/:reviewId/logs", expose: true, auth: true },
  async (req: GetLogsRequest): Promise<GetLogsResponse> => {
    const auth = getAuthData()!;

    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const logs = await db.queryAll<ModerationLog>`
      SELECT
        l.id,
        l.review_id AS "reviewId",
        l.admin_id AS "adminId",
        l.action,
        l.reason,
        l.created_at AS "createdAt",
        u.name AS "adminName"
      FROM review_moderation_logs l
      JOIN users u ON l.admin_id = u.id
      WHERE l.review_id = ${req.reviewId}
      ORDER BY l.created_at DESC
    `;

    return { logs };
  }
);
