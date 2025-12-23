export type NotificationType = 
  | "new_booking_request"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_declined"
  | "booking_expired"
  | "booking_reminder"
  | "booking_reschedule_requested"
  | "booking_rescheduled"
  | "booking_reschedule_rejected"
  | "message_received"
  | "booking_paid"
  | "payment_confirmed"
  | "payment_failed"
  | "payment_released"
  | "booking_refunded"
  | "service_auto_confirmed"
  | "review_reminder"
  | "dispute_raised"
  | "dispute_needs_review"
  | "dispute_resolved"
  | "emergency_alert";

export interface Notification {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: Date;
}

export interface NotificationPreferences {
  user_id: string;
  new_booking_request: boolean;
  booking_confirmed: boolean;
  booking_cancelled: boolean;
  booking_declined: boolean;
  booking_expired: boolean;
  booking_reminder: boolean;
  message_received: boolean;
  booking_paid: boolean;
  payment_confirmed: boolean;
  payment_failed: boolean;
  payment_released: boolean;
  booking_refunded: boolean;
  service_auto_confirmed: boolean;
  booking_reschedule_requested: boolean;
  booking_rescheduled: boolean;
  booking_reschedule_rejected: boolean;
  review_reminder: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  email_marketing: boolean;
  email_product_updates: boolean;
  updated_at: Date;
}

export const CRITICAL_NOTIFICATION_TYPES: NotificationType[] = [
  "payment_failed",
  "payment_confirmed",
  "booking_paid",
  "payment_released",
  "booking_refunded"
];
