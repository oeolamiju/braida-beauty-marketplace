import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { Payout, PayoutAuditLog } from "./types";
import { requireAdmin } from "../admin/middleware";

export interface AdminGetPayoutResponse {
  payout: Payout;
  auditLogs: PayoutAuditLog[];
  freelancerName: string;
  freelancerEmail: string;
}

export const adminGetPayout = api(
  { method: "GET", path: "/admin/payouts/:id", expose: true, auth: true },
  async ({ id }: { id: number }): Promise<AdminGetPayoutResponse> => {
    await requireAdmin();
    const auth = getAuthData()!;
    
    const payout = await db.queryRow`
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
      WHERE p.id = ${id}
    `;
    
    if (!payout) {
      throw APIError.notFound("Payout not found");
    }
    
    const logs = await db.queryAll<{
      id: number;
      payout_id: number;
      actor_id: number | null;
      action: string;
      old_status: string | null;
      new_status: string | null;
      details: any;
      ip_address: string | null;
      user_agent: string | null;
      created_at: Date;
    }>`
      SELECT 
        id,
        payout_id,
        actor_id,
        action,
        old_status,
        new_status,
        details,
        ip_address,
        user_agent,
        created_at
      FROM payout_audit_logs
      WHERE payout_id = ${id}
      ORDER BY created_at DESC
    `;
    
    const auditLogs: PayoutAuditLog[] = logs.map((log: any) => ({
      id: log.id,
      payoutId: log.payout_id,
      actorId: log.actor_id,
      action: log.action,
      oldStatus: log.old_status,
      newStatus: log.new_status,
      details: log.details,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: new Date(log.created_at),
    }));
    
    return {
      payout: {
        id: payout.id,
        freelancerId: payout.freelancer_id,
        bookingId: payout.booking_id,
        stripePayoutId: payout.stripe_payout_id,
        amount: parseFloat(payout.amount),
        serviceAmount: parseFloat(payout.service_amount),
        commissionAmount: parseFloat(payout.commission_amount),
        bookingFee: parseFloat(payout.booking_fee),
        status: payout.status,
        scheduledDate: payout.scheduled_date ? new Date(payout.scheduled_date) : undefined,
        processedDate: payout.processed_date ? new Date(payout.processed_date) : undefined,
        errorMessage: payout.error_message,
        adminNotes: payout.admin_notes,
        createdAt: new Date(payout.created_at),
        updatedAt: new Date(payout.updated_at),
      },
      auditLogs,
      freelancerName: payout.freelancer_name,
      freelancerEmail: payout.freelancer_email,
    };
  }
);
