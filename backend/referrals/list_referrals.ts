import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface Referral {
  id: number;
  refereeName: string;
  status: string;
  rewardAmount: number | null;
  completedAt: Date | null;
  createdAt: Date;
}

interface ListReferralsResponse {
  referrals: Referral[];
  totalCount: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export const listReferrals = api(
  { method: "GET", path: "/referrals/list", expose: true, auth: true },
  async (): Promise<ListReferralsResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    const referrals: Referral[] = [];

    for await (const row of db.query<{
      id: number;
      referee_name: string;
      status: string;
      referrer_reward_amount: number | null;
      completed_at: Date | null;
      created_at: Date;
    }>`
      SELECT 
        r.id,
        u.first_name || ' ' || LEFT(u.last_name, 1) || '.' as referee_name,
        r.status,
        r.referrer_reward_amount,
        r.completed_at,
        r.created_at
      FROM referrals r
      JOIN users u ON r.referee_id = u.id
      WHERE r.referrer_id = ${userId}
      ORDER BY r.created_at DESC
    `) {
      referrals.push({
        id: row.id,
        refereeName: row.referee_name,
        status: row.status,
        rewardAmount: row.referrer_reward_amount,
        completedAt: row.completed_at,
        createdAt: row.created_at,
      });
    }

    // Calculate totals
    const stats = await db.queryRow<{
      total_earnings: number;
      pending_earnings: number;
    }>`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'rewarded' THEN referrer_reward_amount ELSE 0 END), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN referrer_reward_amount ELSE 0 END), 0) as pending_earnings
      FROM referrals
      WHERE referrer_id = ${userId}
    `;

    return {
      referrals,
      totalCount: referrals.length,
      totalEarnings: stats?.total_earnings || 0,
      pendingEarnings: stats?.pending_earnings || 0,
    };
  }
);

