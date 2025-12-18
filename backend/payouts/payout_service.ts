import { APIError } from "encore.dev/api";
import db from "../db";
import { createTransfer } from "./stripe_connect";
import { PayoutScheduleType } from "./types";

export async function calculatePayoutAmounts(serviceAmount: number) {
  const settings = await db.queryRow`
    SELECT platform_commission_percent, booking_fee_fixed 
    FROM payout_settings 
    WHERE id = 1
  `;
  
  const commissionPercent = settings?.platform_commission_percent || 15;
  const bookingFee = settings?.booking_fee_fixed || 0;
  
  const commissionAmount = (serviceAmount * commissionPercent) / 100;
  const payoutAmount = serviceAmount - commissionAmount - bookingFee;
  
  return {
    serviceAmount,
    commissionAmount,
    bookingFee,
    payoutAmount,
  };
}

export async function createPayoutRecord(
  freelancerId: string,
  bookingId: number,
  amounts: {
    serviceAmount: number;
    commissionAmount: number;
    bookingFee: number;
    payoutAmount: number;
  }
) {
  const existing = await db.queryRow`
    SELECT id FROM payouts WHERE booking_id = ${bookingId}
  `;
  
  if (existing) {
    throw APIError.alreadyExists("Payout already exists for this booking");
  }
  
  const schedule = await db.queryRow`
    SELECT schedule_type FROM payout_schedules WHERE freelancer_id = ${freelancerId}
  `;
  
  const scheduleType: PayoutScheduleType = schedule?.schedule_type || "weekly";
  
  let scheduledDate: Date | null = null;
  
  if (scheduleType === "per_transaction") {
    scheduledDate = new Date();
  } else if (scheduleType === "weekly") {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    scheduledDate = new Date(today.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
  } else if (scheduleType === "bi_weekly") {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
    scheduledDate = new Date(nextFriday.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  const result = await db.queryRow<{ id: number }>`
    INSERT INTO payouts (
      freelancer_id,
      booking_id,
      amount,
      service_amount,
      commission_amount,
      booking_fee,
      status,
      scheduled_date
    ) VALUES (
      ${freelancerId},
      ${bookingId},
      ${amounts.payoutAmount},
      ${amounts.serviceAmount},
      ${amounts.commissionAmount},
      ${amounts.bookingFee},
      ${scheduleType === "per_transaction" ? "scheduled" : "pending"},
      ${scheduledDate}
    )
    RETURNING id
  `;
  
  if (!result) {
    throw new Error("Failed to create payout record");
  }
  
  await createAuditLog(
    result.id,
    null,
    "payout_created",
    null,
    scheduleType === "per_transaction" ? "scheduled" : "pending",
    { scheduleType, scheduledDate }
  );
  
  return result.id;
}

export async function processPayoutNow(payoutId: number, actorId?: string) {
  const payout = await db.queryRow`
    SELECT 
      p.id,
      p.freelancer_id,
      p.amount,
      p.status,
      pa.stripe_account_id,
      pa.payouts_enabled,
      u.verified_freelancer
    FROM payouts p
    JOIN payout_accounts pa ON pa.freelancer_id = p.freelancer_id
    JOIN users u ON u.id = p.freelancer_id
    WHERE p.id = ${payoutId}
  `;
  
  if (!payout) {
    throw APIError.notFound("Payout not found");
  }
  
  if (!payout.verified_freelancer) {
    throw APIError.permissionDenied("Only verified freelancers can receive payouts");
  }
  
  if (!payout.payouts_enabled) {
    throw APIError.permissionDenied("Payout account is not enabled");
  }
  
  if (payout.status !== "pending" && payout.status !== "scheduled") {
    throw APIError.invalidArgument("Payout is not in a processable state");
  }
  
  const oldStatus = payout.status;
  
  await db.exec`
    UPDATE payouts 
    SET status = 'processing', updated_at = NOW() 
    WHERE id = ${payoutId}
  `;
  
  await createAuditLog(payoutId, actorId, "payout_processing", oldStatus, "processing", null);
  
  try {
    const transfer = await createTransfer(
      payout.stripe_account_id,
      payout.amount
    );
    
    await db.exec`
      UPDATE payouts 
      SET 
        status = 'paid',
        stripe_payout_id = ${transfer.id},
        processed_date = NOW(),
        updated_at = NOW()
      WHERE id = ${payoutId}
    `;
    
    await createAuditLog(
      payoutId,
      actorId,
      "payout_completed",
      "processing",
      "paid",
      { stripeTransferId: transfer.id }
    );
    
    return true;
  } catch (error: any) {
    await db.exec`
      UPDATE payouts 
      SET 
        status = 'failed',
        error_message = ${error.message},
        updated_at = NOW()
      WHERE id = ${payoutId}
    `;
    
    await createAuditLog(
      payoutId,
      actorId,
      "payout_failed",
      "processing",
      "failed",
      { error: error.message }
    );
    
    throw error;
  }
}

export async function createAuditLog(
  payoutId: number,
  actorId: string | null | undefined,
  action: string,
  oldStatus: string | null,
  newStatus: string | null,
  details: any
) {
  await db.exec`
    INSERT INTO payout_audit_logs (
      payout_id,
      actor_id,
      action,
      old_status,
      new_status,
      details
    ) VALUES (
      ${payoutId},
      ${actorId ?? null},
      ${action},
      ${oldStatus},
      ${newStatus},
      ${details ? JSON.stringify(details) : null}
    )
  `;
}
