import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { secret } from "encore.dev/config";

// VAPID keys for web push
const vapidPublicKey = secret("VapidPublicKey");
const vapidPrivateKey = secret("VapidPrivateKey");

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
  { method: "POST", path: "/notifications/push/subscribe", expose: true, auth: true },
  async (req): Promise<SubscribeResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    // Check if subscription already exists
    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM push_subscriptions
      WHERE user_id = ${userId} AND endpoint = ${req.subscription.endpoint}
    `;

    if (existing) {
      // Update existing subscription
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

    // Create new subscription
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
  { method: "POST", path: "/notifications/push/unsubscribe", expose: true, auth: true },
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

export const getVapidPublicKey = api(
  { method: "GET", path: "/notifications/push/vapid-key", expose: true },
  async (): Promise<{ publicKey: string }> => {
    return { publicKey: vapidPublicKey() || "" };
  }
);

// Function to send push notification (used internally)
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  // Get user's push subscriptions
  const subscriptions = db.query<{
    endpoint: string;
    p256dh_key: string;
    auth_key: string;
  }>`
    SELECT endpoint, p256dh_key, auth_key
    FROM push_subscriptions
    WHERE user_id = ${userId}
  `;

  const webPush = await import("web-push");
  
  const vapidDetails = {
    subject: "mailto:support@braida.uk",
    publicKey: vapidPublicKey() || "",
    privateKey: vapidPrivateKey() || "",
  };

  for await (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        },
        JSON.stringify({
          title,
          body,
          data,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
        }),
        { vapidDetails }
      );
    } catch (error: any) {
      console.error("Push notification failed:", error);
      
      // Remove invalid subscriptions
      if (error.statusCode === 404 || error.statusCode === 410) {
        await db.exec`
          DELETE FROM push_subscriptions
          WHERE endpoint = ${sub.endpoint}
        `;
      }
    }
  }
}

