import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import type { Notification, NotificationType } from "./types";

interface ListPaginatedRequest {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

interface NotificationWithLink extends Notification {
  link?: string;
}

interface ListPaginatedResponse {
  notifications: NotificationWithLink[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Generate link for notification based on type and data
function getNotificationLink(type: NotificationType, data?: Record<string, any>): string | undefined {
  if (!data) return undefined;

  switch (type) {
    case "new_booking_request":
    case "booking_confirmed":
    case "booking_cancelled":
    case "booking_declined":
    case "booking_expired":
    case "booking_reminder":
    case "booking_paid":
    case "booking_reschedule_requested":
    case "booking_rescheduled":
    case "service_auto_confirmed":
      return data.bookingId ? `/bookings/${data.bookingId}` : undefined;

    case "payment_confirmed":
    case "payment_failed":
    case "payment_released":
    case "booking_refunded":
      return data.bookingId ? `/bookings/${data.bookingId}` : undefined;

    case "message_received":
      return data.bookingId ? `/bookings/${data.bookingId}#messages` : undefined;

    case "review_reminder":
      return data.bookingId ? `/bookings/${data.bookingId}#review` : undefined;

    case "dispute_raised":
    case "dispute_needs_review":
    case "dispute_resolved":
      return data.disputeId ? `/disputes/${data.disputeId}` : undefined;

    default:
      return undefined;
  }
}

export const listPaginated = api(
  { method: "GET", path: "/notifications/paginated", expose: true, auth: true },
  async (req: ListPaginatedRequest): Promise<ListPaginatedResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    const page = req.page || 1;
    const limit = Math.min(req.limit || 20, 100);
    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions = `user_id = '${userId}'`;
    if (req.unreadOnly) {
      conditions += ` AND read = false`;
    }
    if (req.type) {
      conditions += ` AND type = '${req.type}'`;
    }

    let totalResult: { count: number } | null;
    if (req.unreadOnly) {
      totalResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count
        FROM notifications
        WHERE user_id = ${userId} AND read = false
      `;
    } else {
      totalResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count
        FROM notifications
        WHERE user_id = ${userId}
      `;
    }
    const total = totalResult?.count || 0;

    // Get unread count (always)
    const unreadResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int as count
      FROM notifications
      WHERE user_id = ${userId} AND read = false
    `;
    const unreadCount = unreadResult?.count || 0;

    // Get notifications
    const notifications: NotificationWithLink[] = [];
    const notificationsGen = req.unreadOnly
      ? db.query<Notification>`
          SELECT id, user_id, type, title, message, data, read, created_at
          FROM notifications
          WHERE user_id = ${userId} AND read = false
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      : db.query<Notification>`
          SELECT id, user_id, type, title, message, data, read, created_at
          FROM notifications
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

    for await (const row of notificationsGen) {
      notifications.push({
        ...row,
        link: getNotificationLink(row.type, row.data),
      });
    }

    const totalPages = Math.ceil(total / limit);

    return {
      notifications,
      unreadCount,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }
);

