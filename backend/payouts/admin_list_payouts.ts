import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { Payout } from "./types";

export interface AdminListPayoutsRequest {
  page?: number;
  limit?: number;
  status?: string;
  freelancerId?: number;
}

export interface PayoutWithFreelancer extends Payout {
  freelancerName: string;
  freelancerEmail: string;
}

export interface AdminListPayoutsResponse {
  payouts: PayoutWithFreelancer[];
  total: number;
}

export const adminListPayouts = api(
  { method: "GET", path: "/admin/payouts", expose: true, auth: true },
  async (req: AdminListPayoutsRequest): Promise<AdminListPayoutsResponse> => {
    const auth = getAuthData()!;
    
    const user = await db.queryRow`
      SELECT user_type FROM users WHERE id = ${auth.userID}
    `;
    
    if (!user || user.user_type !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }
    
    const page = req.page || 1;
    const limit = req.limit || 50;
    const offset = (page - 1) * limit;
    
    let countResult;
    let rows;
    
    if (req.status && req.freelancerId) {
      countResult = await db.queryRow`
        SELECT COUNT(*) as total
        FROM payouts p
        WHERE p.status = ${req.status} AND p.freelancer_id = ${req.freelancerId}
      `;
      
      rows = await db.queryAll`
        SELECT 
          p.id,
          p.freelancer_id,
          p.booking_id,
          p.stripe_payout_id,
          p.amount,
          p.service_amount,
          p.commission_amount,
          p.booking_fee,
          p.status,
          p.scheduled_date,
          p.processed_date,
          p.error_message,
          p.admin_notes,
          p.created_at,
          p.updated_at,
          u.name as freelancer_name,
          u.email as freelancer_email
        FROM payouts p
        JOIN users u ON u.id = p.freelancer_id
        WHERE p.status = ${req.status} AND p.freelancer_id = ${req.freelancerId}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.status) {
      countResult = await db.queryRow`
        SELECT COUNT(*) as total
        FROM payouts p
        WHERE p.status = ${req.status}
      `;
      
      rows = await db.queryAll`
        SELECT 
          p.id,
          p.freelancer_id,
          p.booking_id,
          p.stripe_payout_id,
          p.amount,
          p.service_amount,
          p.commission_amount,
          p.booking_fee,
          p.status,
          p.scheduled_date,
          p.processed_date,
          p.error_message,
          p.admin_notes,
          p.created_at,
          p.updated_at,
          u.name as freelancer_name,
          u.email as freelancer_email
        FROM payouts p
        JOIN users u ON u.id = p.freelancer_id
        WHERE p.status = ${req.status}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.freelancerId) {
      countResult = await db.queryRow`
        SELECT COUNT(*) as total
        FROM payouts p
        WHERE p.freelancer_id = ${req.freelancerId}
      `;
      
      rows = await db.queryAll`
        SELECT 
          p.id,
          p.freelancer_id,
          p.booking_id,
          p.stripe_payout_id,
          p.amount,
          p.service_amount,
          p.commission_amount,
          p.booking_fee,
          p.status,
          p.scheduled_date,
          p.processed_date,
          p.error_message,
          p.admin_notes,
          p.created_at,
          p.updated_at,
          u.name as freelancer_name,
          u.email as freelancer_email
        FROM payouts p
        JOIN users u ON u.id = p.freelancer_id
        WHERE p.freelancer_id = ${req.freelancerId}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      countResult = await db.queryRow`
        SELECT COUNT(*) as total
        FROM payouts p
      `;
      
      rows = await db.queryAll`
        SELECT 
          p.id,
          p.freelancer_id,
          p.booking_id,
          p.stripe_payout_id,
          p.amount,
          p.service_amount,
          p.commission_amount,
          p.booking_fee,
          p.status,
          p.scheduled_date,
          p.processed_date,
          p.error_message,
          p.admin_notes,
          p.created_at,
          p.updated_at,
          u.name as freelancer_name,
          u.email as freelancer_email
        FROM payouts p
        JOIN users u ON u.id = p.freelancer_id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    const payouts: PayoutWithFreelancer[] = rows.map((row: any) => ({
      id: row.id,
      freelancerId: row.freelancer_id,
      bookingId: row.booking_id,
      stripePayoutId: row.stripe_payout_id,
      amount: parseFloat(row.amount),
      serviceAmount: parseFloat(row.service_amount),
      commissionAmount: parseFloat(row.commission_amount),
      bookingFee: parseFloat(row.booking_fee),
      status: row.status,
      scheduledDate: row.scheduled_date ? new Date(row.scheduled_date) : undefined,
      processedDate: row.processed_date ? new Date(row.processed_date) : undefined,
      errorMessage: row.error_message,
      adminNotes: row.admin_notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      freelancerName: row.freelancer_name,
      freelancerEmail: row.freelancer_email,
    }));
    
    return {
      payouts,
      total: parseInt(countResult?.total || "0"),
    };
  }
);
