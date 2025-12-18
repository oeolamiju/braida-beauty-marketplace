import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { EarningsStats } from "./types";

export interface GetEarningsResponse {
  stats: EarningsStats;
}

export const getEarnings = api(
  { method: "GET", path: "/payouts/earnings", expose: true, auth: true },
  async (): Promise<GetEarningsResponse> => {
    const auth = getAuthData()!;
    
    const totalEarned = await db.queryRow`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payouts
      WHERE freelancer_id = ${auth.userID} AND status = 'paid'
    `;
    
    const pendingInEscrow = await db.queryRow`
      SELECT COALESCE(SUM(pe.amount), 0) as total
      FROM payment_escrow pe
      JOIN bookings b ON b.id = pe.booking_id
      WHERE b.freelancer_id = ${auth.userID} 
        AND pe.status = 'held'
        AND b.status = 'confirmed'
    `;
    
    const nextPayout = await db.queryRow`
      SELECT 
        COALESCE(SUM(amount), 0) as amount,
        MIN(scheduled_date) as date
      FROM payouts
      WHERE freelancer_id = ${auth.userID} 
        AND status IN ('pending', 'scheduled')
    `;
    
    const availableBalance = await db.queryRow`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payouts
      WHERE freelancer_id = ${auth.userID} 
        AND status = 'scheduled'
    `;
    
    return {
      stats: {
        totalEarned: parseFloat(totalEarned?.total || "0"),
        pendingInEscrow: parseFloat(pendingInEscrow?.total || "0"),
        nextPayoutAmount: parseFloat(nextPayout?.amount || "0"),
        nextPayoutDate: nextPayout?.date ? new Date(nextPayout.date) : undefined,
        availableBalance: parseFloat(availableBalance?.total || "0"),
      },
    };
  }
);
