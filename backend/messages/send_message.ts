import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { sendNotification } from "../notifications/send";
import { Message } from "./types";

interface SendMessageRequest {
  conversationId: number;
  content: string;
  messageType?: "text" | "image";
}

interface SendMessageResponse {
  message: Message;
}

export const sendMessage = api<SendMessageRequest, SendMessageResponse>(
  { method: "POST", path: "/messages/send", expose: true, auth: true },
  async (req): Promise<SendMessageResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    if (!req.content || req.content.trim().length === 0) {
      throw APIError.invalidArgument("Message content cannot be empty");
    }

    if (req.content.length > 5000) {
      throw APIError.invalidArgument("Message too long (max 5000 characters)");
    }

    // Verify user is part of conversation
    const conversation = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
    }>`
      SELECT id, client_id, freelancer_id FROM conversations
      WHERE id = ${req.conversationId}
        AND (client_id = ${userId} OR freelancer_id = ${userId})
    `;

    if (!conversation) {
      throw APIError.notFound("Conversation not found");
    }

    const messageType = req.messageType || "text";

    // Insert message
    const result = await db.queryRow<Message>`
      INSERT INTO messages (conversation_id, sender_id, content, message_type)
      VALUES (${req.conversationId}, ${userId}, ${req.content.trim()}, ${messageType})
      RETURNING id, conversation_id, sender_id, content, message_type, read_at, created_at
    `;

    // Update conversation
    const isClient = conversation.client_id === userId;
    const recipientId = isClient ? conversation.freelancer_id : conversation.client_id;

    if (isClient) {
      await db.exec`
        UPDATE conversations
        SET 
          last_message = ${req.content.substring(0, 100)},
          last_message_at = NOW(),
          freelancer_unread_count = freelancer_unread_count + 1,
          updated_at = NOW()
        WHERE id = ${req.conversationId}
      `;
    } else {
      await db.exec`
        UPDATE conversations
        SET 
          last_message = ${req.content.substring(0, 100)},
          last_message_at = NOW(),
          client_unread_count = client_unread_count + 1,
          updated_at = NOW()
        WHERE id = ${req.conversationId}
      `;
    }

    // Send notification to recipient
    const sender = await db.queryRow<{ name: string }>`
      SELECT first_name || ' ' || last_name as name FROM users WHERE id = ${userId}
    `;

    await sendNotification({
      userId: recipientId,
      type: "message_received",
      title: "New Message",
      message: `${sender?.name || "Someone"}: ${req.content.substring(0, 50)}${req.content.length > 50 ? "..." : ""}`,
      data: { conversationId: req.conversationId },
    });

    return {
      message: result!,
    };
  }
);

