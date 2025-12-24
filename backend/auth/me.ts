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
  roles: string[];
  activeRole: string;
  isVerified: boolean;
  status: string;
}

export const me = api<void, UserInfo>(
  { auth: true, expose: true, method: "GET", path: "/auth/me" },
  async () => {
    console.log("[ME] Endpoint called");
    const auth = getAuthData()! as AuthData;
    console.log("[ME] Auth data:", { userID: auth.userID, role: auth.role });

    const user = await db.queryRow<{
      first_name: string;
      last_name: string;
      email: string | null;
      phone: string | null;
      role: string;
      roles: string[];
      active_role: string;
      is_verified: boolean;
      status: string;
    }>`
      SELECT first_name, last_name, email, phone, role, roles, active_role, is_verified, status
      FROM users
      WHERE id = ${auth.userID}
    `;

    if (!user) {
      console.error("[ME] User not found for ID:", auth.userID);
      throw new Error("User not found");
    }

    console.log("[ME] User found:", { firstName: user.first_name, role: user.role });

    return {
      id: auth.userID,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.active_role,
      roles: user.roles || [user.role],
      activeRole: user.active_role,
      isVerified: user.is_verified,
      status: user.status,
    };
  }
);
