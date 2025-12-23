import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { subscribe } from "./events";
import { Notification } from "./types";

export const stream = api.streamOut<Notification>(
  { path: "/notifications/stream", expose: true, auth: true },
  async (stream) => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    const unsubscribe = subscribe(userId, async (event) => {
      try {
        const notification: Notification = {
          id: 0,
          user_id: event.userId,
          type: event.type,
          title: event.title,
          message: event.message,
          data: event.data,
          read: false,
          created_at: new Date(),
        };
        
        await stream.send(notification);
      } catch (err) {
        console.error('Error sending notification:', err);
        unsubscribe();
      }
    });

    return new Promise(() => {});
  }
);
