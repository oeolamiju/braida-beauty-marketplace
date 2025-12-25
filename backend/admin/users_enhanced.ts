import { api } from "encore.dev/api";
import db from "../db";
import { requireAdminPermission } from "./rbac";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface UserListFilters {
  role?: "client" | "freelancer" | "admin";
  status?: "active" | "suspended" | "banned";
  kycStatus?: "unverified" | "pending" | "verified" | "rejected";
  search?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "name" | "email" | "last_login";
  sortOrder?: "asc" | "desc";
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  displayName: string | null;
  role: string;
  status: string;
  isVerified: boolean;
  kycStatus: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  bookingCount: number;
  totalSpentPence: number | null;
  totalEarnedPence: number | null;
  averageRating: number | null;
  city: string | null;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const listUsersEnhanced = api<UserListFilters, UserListResponse>(
  { method: "GET", path: "/admin/users/enhanced", expose: true, auth: true },
  async (req): Promise<UserListResponse> => {
    await requireAdminPermission("users", "view");

    const page = req.page || 1;
    const limit = Math.min(req.limit || 20, 100);
    const offset = (page - 1) * limit;
    const sortBy = req.sortBy || "created_at";
    const sortOrder = req.sortOrder || "desc";

    // Build dynamic query parts
    const conditions: string[] = ["1=1"];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(req.role.toUpperCase());
    }

    if (req.status) {
      conditions.push(`u.status = $${paramIndex++}`);
      params.push(req.status);
    }

    if (req.kycStatus && (req.role === "freelancer" || !req.role)) {
      conditions.push(`fp.verification_status = $${paramIndex++}`);
      params.push(req.kycStatus);
    }

    if (req.search) {
      conditions.push(`(
        u.name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex} OR 
        u.phone ILIKE $${paramIndex}
      )`);
      params.push(`%${req.search}%`);
      paramIndex++;
    }

    if (req.city) {
      conditions.push(`fp.city = $${paramIndex++}`);
      params.push(req.city);
    }

    const whereClause = conditions.join(" AND ");

    // Get total count
    const countResult = await db.rawQueryRow<{ count: number }>(
      `SELECT COUNT(DISTINCT u.id)::int as count
       FROM users u
       LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
       WHERE ${whereClause}`,
      ...params
    );

    const total = countResult?.count || 0;

    // Get users with aggregated data
    params.push(limit, offset);
    const usersGen = db.rawQuery<UserListItem>(
      `SELECT 
        u.id,
        u.email,
        u.name,
        u.display_name as "displayName",
        u.role,
        COALESCE(u.status, 'active') as status,
        u.is_verified as "isVerified",
        fp.verification_status as "kycStatus",
        u.created_at as "createdAt",
        u.last_login_at as "lastLoginAt",
        COALESCE(bc.booking_count, 0)::int as "bookingCount",
        cs.total_spent as "totalSpentPence",
        fe.total_earned as "totalEarnedPence",
        fr.avg_rating as "averageRating",
        fp.city
       FROM users u
       LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
       LEFT JOIN (
         SELECT client_id, COUNT(*) as booking_count
         FROM bookings
         GROUP BY client_id
       ) bc ON u.id = bc.client_id
       LEFT JOIN (
         SELECT client_id, SUM(total_price_pence) as total_spent
         FROM bookings WHERE status = 'completed'
         GROUP BY client_id
       ) cs ON u.id = cs.client_id
       LEFT JOIN (
         SELECT freelancer_id, SUM(total_price_pence) as total_earned
         FROM bookings WHERE status = 'completed'
         GROUP BY freelancer_id
       ) fe ON u.id = fe.freelancer_id
       LEFT JOIN (
         SELECT freelancer_id, AVG(rating)::numeric(3,2) as avg_rating
         FROM reviews WHERE is_removed = false
         GROUP BY freelancer_id
       ) fr ON u.id = fr.freelancer_id
       WHERE ${whereClause}
       ORDER BY u.${sortBy} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      ...params
    );

    const users: UserListItem[] = [];
    for await (const user of usersGen) {
      users.push(user);
    }

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
);

export interface UserDetailResponse {
  user: UserListItem;
  bookingHistory: {
    id: number;
    serviceTitle: string;
    status: string;
    totalPricePence: number;
    createdAt: string;
  }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export const getUserDetail = api(
  { method: "GET", path: "/admin/users/:userId/detail", expose: true, auth: true },
  async (req: { userId: string }): Promise<UserDetailResponse> => {
    await requireAdminPermission("users", "view");

    const user = await db.queryRow<UserListItem>`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.display_name as "displayName",
        u.role,
        COALESCE(u.status, 'active') as status,
        u.is_verified as "isVerified",
        fp.verification_status as "kycStatus",
        u.created_at as "createdAt",
        u.last_login_at as "lastLoginAt",
        fp.city
      FROM users u
      LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
      WHERE u.id = ${req.userId}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    // Get booking history
    const bookingsGen = db.query<{
      id: number;
      serviceTitle: string;
      status: string;
      totalPricePence: number;
      createdAt: Date;
    }>`
      SELECT 
        b.id,
        s.title as "serviceTitle",
        b.status,
        b.total_price_pence as "totalPricePence",
        b.created_at as "createdAt"
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.client_id = ${req.userId} OR b.stylist_id = ${req.userId}
      ORDER BY b.created_at DESC
      LIMIT 20
    `;

    const bookingHistory: any[] = [];
    for await (const booking of bookingsGen) {
      bookingHistory.push({
        ...booking,
        createdAt: booking.createdAt.toISOString(),
      });
    }

    // Get recent activity from audit log
    const activityGen = db.query<{
      action: string;
      created_at: Date;
    }>`
      SELECT action, created_at
      FROM booking_audit_log
      WHERE user_id = ${req.userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentActivity: any[] = [];
    for await (const activity of activityGen) {
      recentActivity.push({
        type: activity.action,
        description: formatActivityDescription(activity.action),
        timestamp: activity.created_at.toISOString(),
      });
    }

    return {
      user,
      bookingHistory,
      recentActivity,
    };
  }
);

function formatActivityDescription(action: string): string {
  const descriptions: Record<string, string> = {
    created: "Created a booking",
    accepted: "Accepted a booking",
    declined: "Declined a booking",
    cancelled: "Cancelled a booking",
    completed: "Completed a booking",
    reschedule_requested: "Requested to reschedule",
    rescheduled: "Rescheduled a booking",
  };
  return descriptions[action] || action;
}

// Suspend/unsuspend user
export const updateUserStatus = api(
  { method: "PUT", path: "/admin/users/:userId/status", expose: true, auth: true },
  async (req: { userId: string; status: "active" | "suspended" | "banned"; reason?: string }): Promise<{ success: boolean }> => {
    await requireAdminPermission("users", "suspend");
    const auth = getAuthData()!;

    await db.exec`
      UPDATE users 
      SET status = ${req.status}, updated_at = NOW()
      WHERE id = ${req.userId}
    `;

    // Log the action
    await db.exec`
      INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
      VALUES (
        ${auth.userID}, 
        ${req.status === 'active' ? 'unsuspend_user' : 'suspend_user'}, 
        'user', 
        ${req.userId}, 
        ${JSON.stringify({ status: req.status, reason: req.reason })}
      )
    `;

    return { success: true };
  }
);

