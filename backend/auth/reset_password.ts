import { api, APIError } from "encore.dev/api";
import bcrypt from "bcryptjs";
import db from "../db";
import { RATE_LIMITS, checkRateLimit } from "../shared/rate_limiter";

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/;

export const resetPassword = api<ResetPasswordRequest, ResetPasswordResponse>(
  { expose: true, method: "POST", path: "/auth/reset-password" },
  async (req) => {
    console.log(`[RESET_PASSWORD] Token received: "${req.token}" (length: ${req.token.length})`);
    
    await checkRateLimit(req.token, RATE_LIMITS.passwordReset);
    if (req.newPassword.length < PASSWORD_MIN_LENGTH) {
      throw APIError.invalidArgument(
        `password must be at least ${PASSWORD_MIN_LENGTH} characters`
      );
    }

    if (!PASSWORD_REGEX.test(req.newPassword)) {
      throw APIError.invalidArgument(
        "password must contain uppercase, lowercase, number, and special character"
      );
    }

    const tokenRecord = await db.queryRow<{
      id: number;
      user_id: string;
      expires_at: Date;
      used_at: Date | null;
    }>`
      SELECT id, user_id, expires_at, used_at
      FROM password_reset_tokens
      WHERE token = ${req.token}
    `;

    if (!tokenRecord) {
      console.log(`[RESET_PASSWORD] No token found in database for: "${req.token}"`);
      throw APIError.notFound("invalid reset token");
    }

    if (tokenRecord.used_at) {
      throw APIError.invalidArgument("reset token already used");
    }

    if (new Date() > tokenRecord.expires_at) {
      throw APIError.invalidArgument("reset token expired");
    }

    const passwordHash = await bcrypt.hash(req.newPassword, 10);

    await db.exec`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE id = ${tokenRecord.user_id}
    `;

    await db.exec`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ${tokenRecord.id}
    `;

    return {
      message: "Password reset successfully. You can now login with your new password.",
    };
  }
);
