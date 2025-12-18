import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { Conversation } from "./types";

interface CreateConversationRequest {
  freelancerId: string;
  bookingId?: number;
  initialMessage?: string;
}

interface CreateConversationResponse {
  conversation: Conversation;
}

export const createConversation = api<CreateConversationRequest, CreateConversationResponse>(
  { method: "POST", path: "/messages/conversations", expose: true, auth: true },
  async (req): Promise<CreateConversationResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    // Verify freelancer exists
    const freelancer = await db.queryRow<{ id: string }>`
      SELECT id FROM users WHERE id = ${req.freelancerId} AND role = 'FREELANCER'
    `;

    if (!freelancer) {
      throw APIError.notFound("Freelancer not found");
    }

    // Check if conversation already exists
    const existing = await db.queryRow<Conversation>`
      SELECT id, booking_id, client_id, freelancer_id, last_message, last_message_at,
             client_unread_count, freelancer_unread_count, created_at, updated_at
      FROM conversations
      WHERE client_id = ${userId} AND freelancer_id = ${req.freelancerId}
      ${req.bookingId ? db.query`AND booking_id = ${req.bookingId}` : db.query`AND booking_id IS NULL`}
    `;

    if (existing) {
      return { conversation: existing };
    }

    // Create new conversation
    const result = await db.queryRow<Conversation>`
      INSERT INTO conversations (client_id, freelancer_id, booking_id)
      VALUES (${userId}, ${req.freelancerId}, ${req.bookingId || null})
      RETURNING id, booking_id, client_id, freelancer_id, last_message, last_message_at,
                client_unread_count, freelancer_unread_count, created_at, updated_at
    `;

    // If initial message provided, send it
    if (req.initialMessage && req.initialMessage.trim()) {
      await db.exec`
        INSERT INTO messages (conversation_id, sender_id, content, message_type)
        VALUES (${result!.id}, ${userId}, ${req.initialMessage.trim()}, 'text')
      `;

      await db.exec`
        UPDATE conversations
        SET 
          last_message = ${req.initialMessage.substring(0, 100)},
          last_message_at = NOW(),
          freelancer_unread_count = 1
        WHERE id = ${result!.id}
      `;
    }

    return {
      conversation: result!,
    };
  }
);

