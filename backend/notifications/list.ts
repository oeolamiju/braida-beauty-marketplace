import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { Notification } from "./types";

interface ListNotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export const list = api(
  { method: "GET", path: "/notifications", expose: true, auth: true },
  async (): Promise<ListNotificationsResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    const notifications: Notification[] = [];
    for await (const row of db.query<Notification>`
      SELECT id, user_id, type, title, message, data, read, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `) {
      notifications.push(row);
    }

    const unreadResult: { count: number }[] = [];
    for await (const row of db.query<{ count: number }>`
      SELECT COUNT(*)::int as count
      FROM notifications
      WHERE user_id = ${userId} AND read = false
    `) {
      unreadResult.push(row);
    }

    return {
      notifications,
      unread_count: unreadResult[0]?.count || 0,
    };
  }
);
