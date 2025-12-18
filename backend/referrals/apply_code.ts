import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface ApplyReferralCodeRequest {
  code: string;
}

interface ApplyReferralCodeResponse {
  success: boolean;
  message: string;
  rewardAmount: number;
}

export const applyReferralCode = api<ApplyReferralCodeRequest, ApplyReferralCodeResponse>(
  { method: "POST", path: "/referrals/apply", expose: true, auth: true },
  async (req): Promise<ApplyReferralCodeResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    // Check if user already used a referral code
    const existingReferral = await db.queryRow<{ id: number }>`
      SELECT id FROM referrals WHERE referee_id = ${userId}
    `;

    if (existingReferral) {
      throw APIError.alreadyExists("You have already used a referral code");
    }

    // Find the referral code
    const referralCode = await db.queryRow<{
      id: number;
      user_id: string;
      reward_amount: number;
      max_uses: number | null;
      current_uses: number;
      expires_at: Date | null;
      is_active: boolean;
    }>`
      SELECT id, user_id, reward_amount, max_uses, current_uses, expires_at, is_active
      FROM referral_codes
      WHERE code = ${req.code.toUpperCase()}
    `;

    if (!referralCode) {
      throw APIError.notFound("Invalid referral code");
    }

    if (!referralCode.is_active) {
      throw APIError.failedPrecondition("This referral code is no longer active");
    }

    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      throw APIError.failedPrecondition("This referral code has expired");
    }

    if (referralCode.max_uses && referralCode.current_uses >= referralCode.max_uses) {
      throw APIError.failedPrecondition("This referral code has reached its usage limit");
    }

    if (referralCode.user_id === userId) {
      throw APIError.invalidArgument("You cannot use your own referral code");
    }

    // Create referral record
    await db.exec`
      INSERT INTO referrals (referrer_id, referee_id, referral_code_id, referee_reward_amount)
      VALUES (${referralCode.user_id}, ${userId}, ${referralCode.id}, ${referralCode.reward_amount})
    `;

    // Update referral code usage
    await db.exec`
      UPDATE referral_codes
      SET current_uses = current_uses + 1
      WHERE id = ${referralCode.id}
    `;

    // Add credit to new user
    await db.exec`
      INSERT INTO user_credits (user_id, amount, type, description)
      VALUES (${userId}, ${referralCode.reward_amount}, 'referral_reward', 'Welcome bonus from referral')
    `;

    return {
      success: true,
      message: `Referral code applied! You've received £${referralCode.reward_amount.toFixed(2)} credit`,
      rewardAmount: referralCode.reward_amount,
    };
  }
);

