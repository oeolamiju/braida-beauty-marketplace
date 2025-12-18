import { api, APIError } from "encore.dev/api";
import db from "../db";
import { generateVerificationToken } from "./auth";
import { sendVerificationEmail, sendVerificationSMS } from "./notifications";

export interface ResendVerificationRequest {
  emailOrPhone: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export const resendVerification = api<ResendVerificationRequest, ResendVerificationResponse>(
  { expose: true, method: "POST", path: "/auth/resend-verification" },
  async (req) => {
    try {
      const user = await db.queryRow<{
        id: string;
        email: string | null;
        phone: string | null;
        is_verified: boolean;
      }>`
        SELECT id, email, phone, is_verified
        FROM users
        WHERE email = ${req.emailOrPhone} OR phone = ${req.emailOrPhone}
      `;

      if (!user) {
        throw APIError.notFound("account not found");
      }

      if (user.is_verified) {
        throw APIError.invalidArgument("account already verified");
      }

      await db.exec`
        UPDATE verification_tokens
        SET used_at = NOW()
        WHERE user_id = ${user.id} AND used_at IS NULL
      `;

      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.exec`
        INSERT INTO verification_tokens (user_id, token, type, expires_at)
        VALUES (${user.id}, ${verificationToken}, ${user.email ? 'email' : 'sms'}, ${expiresAt})
      `;

      if (user.email) {
        await sendVerificationEmail(user.email, verificationToken);
      } else if (user.phone) {
        await sendVerificationSMS(user.phone, verificationToken);
      }

      return {
        message: user.email
          ? "Verification email sent. Please check your inbox."
          : "Verification code sent. Please check your phone.",
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error("Resend verification error:", error);
      throw APIError.internal("failed to resend verification", error as Error);
    }
  }
);
