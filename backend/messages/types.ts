export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  message_type: "text" | "image" | "system";
  read_at: Date | null;
  created_at: Date;
}

export interface Conversation {
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
}

export interface ConversationWithDetails extends Conversation {
  other_user_name: string;
  other_user_photo: string | null;
  booking_service_title: string | null;
  booking_date: Date | null;
}

