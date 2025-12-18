import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface MarkReadRequest {
  notification_id: number;
}

export const markRead = api(
  { method: "POST", path: "/notifications/:notification_id/read", expose: true, auth: true },
  async ({ notification_id }: MarkReadRequest): Promise<void> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    await db.exec`
      UPDATE notifications
      SET read = true
      WHERE id = ${notification_id} AND user_id = ${userId}
    `;
  }
);
