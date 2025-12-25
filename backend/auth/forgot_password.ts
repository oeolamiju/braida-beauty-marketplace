import { api, APIError } from "encore.dev/api";
import db from "../db";
import { generateVerificationToken } from "./auth";
import { sendPasswordResetEmail } from "./notifications";
import { RATE_LIMITS, applyRateLimit } from "../shared/rate_limiter";

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = api<ForgotPasswordRequest, ForgotPasswordResponse>(
  { expose: true, method: "POST", path: "/auth/forgot-password" },
  async (req) => {
    console.log(`[FORGOT_PASSWORD] Request received for email: ${req.email}`);
    
    // Rate limit by email to prevent abuse
    await applyRateLimit(req.email, RATE_LIMITS.passwordReset);
    console.log(`[FORGOT_PASSWORD] Rate limit check passed`);
    
    const user = await db.queryRow<{
      id: string;
      email: string | null;
    }>`
      SELECT id, email
      FROM users
      WHERE LOWER(email) = LOWER(${req.email})
    `;

    if (!user || !user.email) {
      console.log(`[FORGOT_PASSWORD] User not found for email: ${req.email}`);
      throw APIError.notFound(
        "No account found with this email address. Please register to create an account."
      );
    }

    console.log(`[FORGOT_PASSWORD] User found: ${user.id}`);
    
    await db.exec`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ${user.id} AND used_at IS NULL
    `;
    console.log(`[FORGOT_PASSWORD] Invalidated existing tokens`);

    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.exec`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${resetToken}, ${expiresAt})
    `;
    console.log(`[FORGOT_PASSWORD] Created new reset token`);

    try {
      await sendPasswordResetEmail(user.email, resetToken);
      console.log(`[FORGOT_PASSWORD] Password reset email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.error(`[FORGOT_PASSWORD] Failed to send email to ${user.email}:`, emailError);
      throw APIError.internal(
        "Failed to send password reset email. Please try again or contact support."
      );
    }

    return {
      message: "Password reset link has been sent to your email.",
    };
  }
);
