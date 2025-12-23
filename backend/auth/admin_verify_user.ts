import { api, APIError } from "encore.dev/api";
import db from "../db";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "./auth";

export interface AdminVerifyUserRequest {
  userId: string;
}

export interface AdminVerifyUserResponse {
  message: string;
  user: {
    id: string;
    email: string | null;
    firstName: string;
    lastName: string;
    isVerified: boolean;
  };
}

export const adminVerifyUser = api<AdminVerifyUserRequest, AdminVerifyUserResponse>(
  { expose: true, method: "POST", path: "/auth/admin/verify-user", auth: true },
  async (req) => {
    const authData = getAuthData() as AuthData | null;
    
    if (!authData) {
      throw APIError.unauthenticated("authentication required");
    }
    
    if (authData.role !== "ADMIN") {
      throw APIError.permissionDenied("admin access required");
    }

    const user = await db.queryRow<{
      id: string;
      email: string | null;
      first_name: string;
      last_name: string;
      is_verified: boolean;
    }>`
      SELECT id, email, first_name, last_name, is_verified
      FROM users
      WHERE id = ${req.userId}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    if (user.is_verified) {
      return {
        message: "User is already verified",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isVerified: true,
        },
      };
    }

    await db.exec`
      UPDATE users
      SET is_verified = true
      WHERE id = ${req.userId}
    `;

    await db.exec`
      UPDATE verification_tokens
      SET used_at = NOW()
      WHERE user_id = ${req.userId} AND used_at IS NULL
    `;

    console.log(`[ADMIN] User ${user.email} manually verified by admin ${authData.userID}`);

    return {
      message: "User verified successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: true,
      },
    };
  }
);
