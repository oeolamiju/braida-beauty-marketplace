import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface ClearReadResponse {
  deletedCount: number;
}

export const clearRead = api(
  { method: "DELETE", path: "/notifications/read", expose: true, auth: true },
  async (): Promise<ClearReadResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    // Get count before deleting
    const countResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int as count
      FROM notifications
      WHERE user_id = ${userId} AND read = true
    `;

    // Delete all read notifications
    await db.exec`
      DELETE FROM notifications
      WHERE user_id = ${userId} AND read = true
    `;

    return {
      deletedCount: countResult?.count || 0,
    };
  }
);

