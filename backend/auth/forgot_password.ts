import { api, APIError } from "encore.dev/api";
import db from "../db";
import { generateVerificationToken } from "./auth";
import { sendPasswordResetEmail } from "./notifications";
import { checkRateLimit } from "../shared/rate_limiter";

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = api<ForgotPasswordRequest, ForgotPasswordResponse>(
  { expose: true, method: "POST", path: "/auth/forgot-password" },
  async (req) => {
    await checkRateLimit(req.email, "auth_forgot_password");
    const user = await db.queryRow<{
      id: string;
      email: string | null;
    }>`
      SELECT id, email
      FROM users
      WHERE email = ${req.email}
    `;

    if (!user || !user.email) {
      return {
        message: "If an account exists with this email, a password reset link has been sent.",
      };
    }

    await db.exec`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ${user.id} AND used_at IS NULL
    `;

    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.exec`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${resetToken}, ${expiresAt})
    `;

    await sendPasswordResetEmail(user.email, resetToken);

    return {
      message: "If an account exists with this email, a password reset link has been sent.",
    };
  }
);
