import { api, APIError } from "encore.dev/api";
import db from "../db";
import { generateToken } from "./auth";
import { checkRateLimit } from "../shared/rate_limiter";

export interface VerifyRequest {
  token: string;
}

export interface VerifyResponse {
  message: string;
  authToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    role: string;
    isVerified: boolean;
  };
}

export const verify = api<VerifyRequest, VerifyResponse>(
  { expose: true, method: "POST", path: "/auth/verify" },
  async (req) => {
    await checkRateLimit(req.token, "auth_verify");
    const tokenRecord = await db.queryRow<{
      id: number;
      user_id: string;
      expires_at: Date;
      used_at: Date | null;
    }>`
      SELECT id, user_id, expires_at, used_at
      FROM verification_tokens
      WHERE token = ${req.token}
    `;

    if (!tokenRecord) {
      throw APIError.notFound("invalid verification token");
    }

    if (tokenRecord.used_at) {
      throw APIError.invalidArgument("verification token already used");
    }

    if (new Date() > tokenRecord.expires_at) {
      throw APIError.invalidArgument("verification token expired");
    }

    const user = await db.queryRow<{
      id: string;
      first_name: string;
      last_name: string;
      email: string | null;
      role: string;
      is_verified: boolean;
    }>`
      SELECT id, first_name, last_name, email, role, is_verified
      FROM users
      WHERE id = ${tokenRecord.user_id}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    if (user.is_verified) {
      throw APIError.invalidArgument("account already verified");
    }

    await db.exec`
      UPDATE users
      SET is_verified = true
      WHERE id = ${tokenRecord.user_id}
    `;

    await db.exec`
      UPDATE verification_tokens
      SET used_at = NOW()
      WHERE id = ${tokenRecord.id}
    `;

    const authToken = generateToken({
      userId: user.id,
      email: user.email || "",
      role: user.role,
      isVerified: true,
    });

    return {
      message: "Account verified successfully",
      authToken,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    };
  }
);
