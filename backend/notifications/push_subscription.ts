import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface SubscribeRequest {
  subscription: PushSubscription;
  userAgent?: string;
}

interface SubscribeResponse {
  success: boolean;
  subscriptionId: number;
}

export const subscribePush = api<SubscribeRequest, SubscribeResponse>(
  { method: "POST", path: "/notifications/push/subscribe", expose: false, auth: true },
  async (req): Promise<SubscribeResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM push_subscriptions
      WHERE user_id = ${userId} AND endpoint = ${req.subscription.endpoint}
    `;

    if (existing) {
      await db.exec`
        UPDATE push_subscriptions
        SET 
          p256dh_key = ${req.subscription.keys.p256dh},
          auth_key = ${req.subscription.keys.auth},
          user_agent = ${req.userAgent || null},
          updated_at = NOW()
        WHERE id = ${existing.id}
      `;
      return { success: true, subscriptionId: existing.id };
    }

    const result = await db.queryRow<{ id: number }>`
      INSERT INTO push_subscriptions (
        user_id, endpoint, p256dh_key, auth_key, user_agent
      ) VALUES (
        ${userId}, ${req.subscription.endpoint}, 
        ${req.subscription.keys.p256dh}, ${req.subscription.keys.auth},
        ${req.userAgent || null}
      )
      RETURNING id
    `;

    return { success: true, subscriptionId: result!.id };
  }
);

export const unsubscribePush = api(
  { method: "POST", path: "/notifications/push/unsubscribe", expose: false, auth: true },
  async (req: { endpoint: string }): Promise<{ success: boolean }> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    await db.exec`
      DELETE FROM push_subscriptions
      WHERE user_id = ${userId} AND endpoint = ${req.endpoint}
    `;

    return { success: true };
  }
);

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  console.log("Push notifications disabled - would send:", { userId, title, body, data });
}

