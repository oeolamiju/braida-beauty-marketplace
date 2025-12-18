import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { Message } from "./types";

interface GetMessagesRequest {
  conversationId: number;
  before?: number; // Message ID for pagination
  limit?: number;
}

interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

export const getMessages = api<GetMessagesRequest, GetMessagesResponse>(
  { method: "GET", path: "/messages/conversations/:conversationId", expose: true, auth: true },
  async (req): Promise<GetMessagesResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;
    const limit = Math.min(req.limit || 50, 100);

    // Verify user is part of conversation
    const conversation = await db.queryRow<{ id: number }>`
      SELECT id FROM conversations
      WHERE id = ${req.conversationId}
        AND (client_id = ${userId} OR freelancer_id = ${userId})
    `;

    if (!conversation) {
      throw APIError.notFound("Conversation not found");
    }

    const messages: Message[] = [];
    let query;

    if (req.before) {
      query = db.query<Message>`
        SELECT id, conversation_id, sender_id, content, message_type, read_at, created_at
        FROM messages
        WHERE conversation_id = ${req.conversationId}
          AND id < ${req.before}
        ORDER BY created_at DESC
        LIMIT ${limit + 1}
      `;
    } else {
      query = db.query<Message>`
        SELECT id, conversation_id, sender_id, content, message_type, read_at, created_at
        FROM messages
        WHERE conversation_id = ${req.conversationId}
        ORDER BY created_at DESC
        LIMIT ${limit + 1}
      `;
    }

    for await (const row of query) {
      messages.push(row);
    }

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop();
    }

    // Mark messages as read
    await db.exec`
      UPDATE messages
      SET read_at = NOW()
      WHERE conversation_id = ${req.conversationId}
        AND sender_id != ${userId}
        AND read_at IS NULL
    `;

    // Update unread count
    const isClient = await db.queryRow<{ is_client: boolean }>`
      SELECT client_id = ${userId} as is_client
      FROM conversations
      WHERE id = ${req.conversationId}
    `;

    if (isClient?.is_client) {
      await db.exec`
        UPDATE conversations
        SET client_unread_count = 0
        WHERE id = ${req.conversationId}
      `;
    } else {
      await db.exec`
        UPDATE conversations
        SET freelancer_unread_count = 0
        WHERE id = ${req.conversationId}
      `;
    }

    return {
      messages: messages.reverse(),
      hasMore,
    };
  }
);

