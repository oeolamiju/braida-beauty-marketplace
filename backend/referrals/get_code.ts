import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface ReferralCode {
  code: string;
  rewardAmount: number;
  rewardType: string;
  totalReferrals: number;
  totalEarnings: number;
}

interface GetReferralCodeResponse {
  referralCode: ReferralCode;
  shareUrl: string;
}

function generateReferralCode(userId: string): string {
  const prefix = userId.substring(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BRAIDA-${prefix}${random}`;
}

export const getReferralCode = api(
  { method: "GET", path: "/referrals/code", expose: true, auth: true },
  async (): Promise<GetReferralCodeResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    // Check if user already has a referral code
    let referralCode = await db.queryRow<{
      code: string;
      reward_amount: number;
      reward_type: string;
      current_uses: number;
    }>`
      SELECT code, reward_amount, reward_type, current_uses
      FROM referral_codes
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!referralCode) {
      // Create new referral code
      const newCode = generateReferralCode(userId);
      referralCode = await db.queryRow<{
        code: string;
        reward_amount: number;
        reward_type: string;
        current_uses: number;
      }>`
        INSERT INTO referral_codes (user_id, code, reward_amount, reward_type)
        VALUES (${userId}, ${newCode}, 10.00, 'credit')
        RETURNING code, reward_amount, reward_type, current_uses
      `;
    }

    // Get total earnings from completed referrals
    const earnings = await db.queryRow<{ total: number }>`
      SELECT COALESCE(SUM(referrer_reward_amount), 0) as total
      FROM referrals
      WHERE referrer_id = ${userId} AND status = 'rewarded'
    `;

    return {
      referralCode: {
        code: referralCode!.code,
        rewardAmount: referralCode!.reward_amount,
        rewardType: referralCode!.reward_type,
        totalReferrals: referralCode!.current_uses,
        totalEarnings: earnings?.total || 0,
      },
      shareUrl: `https://braida.uk/auth/register?ref=${referralCode!.code}`,
    };
  }
);

