import { api } from "encore.dev/api";
import { requireAdmin } from "./middleware";
import { UserDetailResponse } from "./types";
import db from "../db";

export interface GetUserRequest {
  userId: string;
}

export const getUser = api(
  { method: "GET", path: "/admin/users/:userId", expose: true },
  async ({ userId }: GetUserRequest): Promise<UserDetailResponse> => {
    await requireAdmin();

    const user = await db.queryRow<any>`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.suspended,
        u.suspension_reason,
        u.suspended_at,
        u.created_at,
        u.last_login_at,
        v.status as verification_status,
        COALESCE(bc.count, 0) as total_bookings_client,
        COALESCE(bf.count, 0) as total_bookings_freelancer,
        COALESCE(r.count, 0) as total_reports,
        COALESCE(d.count, 0) as total_disputes
      FROM users u
      LEFT JOIN verifications v ON u.id = v.user_id
      LEFT JOIN (SELECT client_id, COUNT(*) as count FROM bookings WHERE client_id = ${userId} GROUP BY client_id) bc ON u.id = bc.client_id
      LEFT JOIN (SELECT freelancer_id, COUNT(*) as count FROM bookings WHERE freelancer_id = ${userId} GROUP BY freelancer_id) bf ON u.id = bf.freelancer_id
      LEFT JOIN (SELECT reported_user_id, COUNT(*) as count FROM reports WHERE reported_user_id = ${userId} GROUP BY reported_user_id) r ON u.id = r.reported_user_id
      LEFT JOIN (SELECT user_id, COUNT(*) as count FROM (
                   SELECT b.client_id as user_id FROM disputes dp JOIN bookings b ON dp.booking_id = b.id WHERE b.client_id = ${userId}
                   UNION ALL
                   SELECT b.freelancer_id as user_id FROM disputes dp JOIN bookings b ON dp.booking_id = b.id WHERE b.freelancer_id = ${userId}
                 ) subq GROUP BY user_id) d ON u.id = d.user_id
      WHERE u.id = ${userId}
    `;

    if (!user) {
      throw new Error("User not found");
    }

    const userDetail = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      suspended: user.suspended,
      suspensionReason: user.suspension_reason || undefined,
      suspendedAt: user.suspended_at ? new Date(user.suspended_at) : undefined,
      createdAt: new Date(user.created_at),
      lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : undefined,
      verificationStatus: user.verification_status || undefined,
      totalBookingsAsClient: parseInt(user.total_bookings_client) || 0,
      totalBookingsAsFreelancer: parseInt(user.total_bookings_freelancer) || 0,
      totalReports: parseInt(user.total_reports) || 0,
      totalDisputes: parseInt(user.total_disputes) || 0,
    };

    const recentReports = await db.queryAll<any>`
      SELECT id, reason, status, created_at
      FROM reports
      WHERE reported_user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentDisputes = await db.queryAll<any>`
      SELECT DISTINCT dp.id, dp.reason, dp.status, dp.created_at
      FROM disputes dp
      JOIN bookings b ON dp.booking_id = b.id
      WHERE b.client_id = ${userId} OR b.freelancer_id = ${userId}
      ORDER BY dp.created_at DESC
      LIMIT 10
    `;

    const recentBookings = await db.queryAll<any>`
      SELECT id, status, scheduled_for, total_price, created_at
      FROM bookings
      WHERE client_id = ${userId} OR freelancer_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return {
      user: userDetail,
      recentReports,
      recentDisputes,
      recentBookings,
    };
  }
);
