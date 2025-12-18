import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { DisputeStatus } from "./types";

export interface DisputeListItem {
  id: string;
  booking_id: string;
  category: string;
  status: DisputeStatus;
  raised_by_name: string;
  client_name: string;
  freelancer_name: string;
  service_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdminListDisputesRequest {
  status?: DisputeStatus;
  limit?: number;
  offset?: number;
}

export interface AdminListDisputesResponse {
  disputes: DisputeListItem[];
  total: number;
}

export const adminList = api(
  { method: "GET", path: "/admin/disputes", auth: true, expose: true },
  async (req: AdminListDisputesRequest): Promise<AdminListDisputesResponse> => {
    const auth = getAuthData()!;

    const userRole = await db.rawQueryRow<{ role: string }>(
      `SELECT role FROM users WHERE id = $1`,
      auth.userID
    );

    if (userRole?.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereClause = "";
    const params: any[] = [];

    if (req.status) {
      whereClause = "WHERE d.status = $1";
      params.push(req.status);
    }

    const countResult = await db.rawQueryRow<{ count: number }>(
      `SELECT COUNT(*) as count FROM disputes d ${whereClause}`,
      ...params
    );

    params.push(limit, offset);
    const limitOffsetIndex = params.length - 1;

    const disputesGen = db.rawQuery<DisputeListItem>(
      `SELECT 
        d.id,
        d.booking_id,
        d.category,
        d.status,
        d.created_at,
        d.updated_at,
        u.name as raised_by_name,
        c.name as client_name,
        f.name as freelancer_name,
        s.name as service_name
       FROM disputes d
       JOIN users u ON d.raised_by = u.id
       JOIN bookings b ON d.booking_id = b.id
       JOIN users c ON b.client_id = c.id
       JOIN users f ON b.freelancer_id = f.id
       JOIN services s ON b.service_id = s.id
       ${whereClause}
       ORDER BY d.created_at DESC
       LIMIT $${limitOffsetIndex} OFFSET $${limitOffsetIndex + 1}`,
      ...params
    );
    const disputes: DisputeListItem[] = [];
    for await (const dispute of disputesGen) {
      disputes.push(dispute);
    }

    return {
      disputes,
      total: countResult?.count || 0,
    };
  }
);
