import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { Payout, PayoutHistory } from "./types";

export interface GetPayoutHistoryRequest {
  page?: number;
  limit?: number;
  status?: string;
}

export interface GetPayoutHistoryResponse {
  history: PayoutHistory;
}

export const getHistory = api(
  { method: "GET", path: "/payouts/history", expose: true, auth: true },
  async (req: GetPayoutHistoryRequest): Promise<GetPayoutHistoryResponse> => {
    const auth = getAuthData()!;
    const page = req.page || 1;
    const limit = req.limit || 20;
    const offset = (page - 1) * limit;
    
    let countResult;
    let rows;
    
    if (req.status) {
      countResult = await db.queryRow`
        SELECT COUNT(*) as total
        FROM payouts
        WHERE freelancer_id = ${auth.userID} AND status = ${req.status}
      `;
      
      rows = await db.queryAll`
        SELECT 
          id,
          freelancer_id,
          booking_id,
          stripe_payout_id,
          amount,
          service_amount,
          commission_amount,
          booking_fee,
          status,
          scheduled_date,
          processed_date,
          error_message,
          admin_notes,
          created_at,
          updated_at
        FROM payouts
        WHERE freelancer_id = ${auth.userID} AND status = ${req.status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      countResult = await db.queryRow`
        SELECT COUNT(*) as total
        FROM payouts
        WHERE freelancer_id = ${auth.userID}
      `;
      
      rows = await db.queryAll`
        SELECT 
          id,
          freelancer_id,
          booking_id,
          stripe_payout_id,
          amount,
          service_amount,
          commission_amount,
          booking_fee,
          status,
          scheduled_date,
          processed_date,
          error_message,
          admin_notes,
          created_at,
          updated_at
        FROM payouts
        WHERE freelancer_id = ${auth.userID}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    
    const payouts: Payout[] = rows.map((row: any) => ({
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
    }));
    
    return {
      history: {
        payouts,
        total: parseInt(countResult?.total || "0"),
      },
    };
  }
);
