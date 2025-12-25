import { api } from "encore.dev/api";
import { requireAdmin } from "./middleware";
import { ListUsersRequest, ListUsersResponse, UserListItem } from "./types";
import db from "../db";

export const listUsers = api(
  { method: "POST", path: "/admin/users/list", expose: true },
  async (req: ListUsersRequest): Promise<ListUsersResponse> => {
    await requireAdmin();

    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let countQuery = `SELECT COUNT(*) as count FROM users u WHERE 1=1`;
    let selectQuery = `
      SELECT 
        u.id,
        u.email,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.role,
        COALESCE(u.suspended, false) as suspended,
        u.suspension_reason,
        u.suspended_at,
        u.created_at,
        u.last_login_at,
        fp.verification_status as verification_status,
        COALESCE(bc.count, 0) as total_bookings_client,
        COALESCE(bf.count, 0) as total_bookings_freelancer,
        COALESCE(r.count, 0) as total_reports,
        COALESCE(d.count, 0) as total_disputes
      FROM users u
      LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
      LEFT JOIN (SELECT client_id, COUNT(*) as count FROM bookings GROUP BY client_id) bc ON u.id = bc.client_id
      LEFT JOIN (SELECT stylist_id, COUNT(*) as count FROM bookings GROUP BY stylist_id) bf ON u.id = bf.stylist_id
      LEFT JOIN (SELECT reported_user_id, COUNT(*) as count FROM reports GROUP BY reported_user_id) r ON u.id = r.reported_user_id
      LEFT JOIN (SELECT b.client_id as user_id, COUNT(DISTINCT dp.id) as count 
                 FROM disputes dp 
                 JOIN bookings b ON dp.booking_id = b.id 
                 GROUP BY b.client_id
                 UNION ALL
                 SELECT b.stylist_id as user_id, COUNT(DISTINCT dp.id) as count 
                 FROM disputes dp 
                 JOIN bookings b ON dp.booking_id = b.id 
                 GROUP BY b.stylist_id) d ON u.id = d.user_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (req.role) {
      countQuery += ` AND u.role = $${params.length + 1}`;
      selectQuery += ` AND u.role = $${params.length + 1}`;
      params.push(req.role);
    }

    if (req.suspended !== undefined) {
      countQuery += ` AND u.suspended = $${params.length + 1}`;
      selectQuery += ` AND u.suspended = $${params.length + 1}`;
      params.push(req.suspended);
    }

    if (req.search) {
      countQuery += ` AND (u.email ILIKE $${params.length + 1} OR u.full_name ILIKE $${params.length + 1})`;
      selectQuery += ` AND (u.email ILIKE $${params.length + 1} OR u.full_name ILIKE $${params.length + 1})`;
      params.push(`%${req.search}%`);
    }

    const countResult = await db.rawQueryAll(countQuery, ...params);
    const total = countResult[0]?.count || 0;

    selectQuery += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const usersResult = await db.rawQueryAll(selectQuery, ...params);

    const users: UserListItem[] = usersResult.map((row: any) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      suspended: row.suspended,
      suspensionReason: row.suspension_reason || undefined,
      suspendedAt: row.suspended_at ? new Date(row.suspended_at) : undefined,
      createdAt: new Date(row.created_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      verificationStatus: row.verification_status || undefined,
      totalBookingsAsClient: parseInt(row.total_bookings_client) || 0,
      totalBookingsAsFreelancer: parseInt(row.total_bookings_freelancer) || 0,
      totalReports: parseInt(row.total_reports) || 0,
      totalDisputes: parseInt(row.total_disputes) || 0,
    }));

    return { users, total };
  }
);
