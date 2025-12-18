import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "./auth";
import db from "../db";

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  isVerified: boolean;
  status: string;
}

export const me = api<void, UserInfo>(
  { auth: true, expose: true, method: "GET", path: "/auth/me" },
  async () => {
    const auth = getAuthData()! as AuthData;

    const user = await db.queryRow<{
      first_name: string;
      last_name: string;
      email: string | null;
      phone: string | null;
      role: string;
      is_verified: boolean;
      status: string;
    }>`
      SELECT first_name, last_name, email, phone, role, is_verified, status
      FROM users
      WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: auth.userID,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.is_verified,
      status: user.status,
    };
  }
);
