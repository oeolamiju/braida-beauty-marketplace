import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

export const markAllRead = api(
  { method: "POST", path: "/notifications/mark-all-read", expose: true, auth: true },
  async (): Promise<void> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    await db.exec`
      UPDATE notifications
      SET read = true
      WHERE user_id = ${userId} AND read = false
    `;
  }
);
