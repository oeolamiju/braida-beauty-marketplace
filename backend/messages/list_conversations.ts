import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { ConversationWithDetails } from "./types";

interface ListConversationsResponse {
  conversations: ConversationWithDetails[];
  total: number;
}

export const listConversations = api(
  { method: "GET", path: "/messages/conversations", expose: true, auth: true },
  async (): Promise<ListConversationsResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;
    const userRole = auth.role;

    const conversations: ConversationWithDetails[] = [];

    // Get conversations for current user
    for await (const row of db.query<{
      id: number;
      booking_id: number | null;
      client_id: string;
      freelancer_id: string;
      last_message: string | null;
      last_message_at: Date | null;
      client_unread_count: number;
      freelancer_unread_count: number;
      created_at: Date;
      updated_at: Date;
      other_user_name: string;
      other_user_photo: string | null;
      booking_service_title: string | null;
      booking_date: Date | null;
    }>`
      SELECT 
        c.id,
        c.booking_id,
        c.client_id,
        c.freelancer_id,
        c.last_message,
        c.last_message_at,
        c.client_unread_count,
        c.freelancer_unread_count,
        c.created_at,
        c.updated_at,
        CASE 
          WHEN c.client_id = ${userId} THEN fu.first_name || ' ' || fu.last_name
          ELSE cu.first_name || ' ' || cu.last_name
        END as other_user_name,
        CASE 
          WHEN c.client_id = ${userId} THEN fp.profile_photo
          ELSE NULL
        END as other_user_photo,
        s.title as booking_service_title,
        b.scheduled_start as booking_date
      FROM conversations c
      LEFT JOIN users cu ON c.client_id = cu.id
      LEFT JOIN users fu ON c.freelancer_id = fu.id
      LEFT JOIN freelancer_profiles fp ON c.freelancer_id = fp.user_id
      LEFT JOIN bookings b ON c.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE c.client_id = ${userId} OR c.freelancer_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT 50
    `) {
      conversations.push(row);
    }

    return {
      conversations,
      total: conversations.length,
    };
  }
);

