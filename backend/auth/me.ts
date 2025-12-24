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
  role: string;           // Primary/active role (for backward compatibility)
  roles: string[];        // All roles user has
  activeRole: string;     // Currently active role
  isVerified: boolean;
  status: string;
  hasFreelancerProfile: boolean;
  freelancerOnboardingStatus: string | null;
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
      roles: string[] | null;
      active_role: string | null;
      is_verified: boolean;
      status: string;
      has_freelancer_profile: boolean;
      freelancer_onboarding_status: string | null;
    }>`
      SELECT 
        u.first_name, u.last_name, u.email, u.phone, u.role, 
        u.roles, u.active_role, u.is_verified, u.status,
        COALESCE(fp.onboarding_status::TEXT, 'not_started') as freelancer_onboarding_status,
        EXISTS(SELECT 1 FROM freelancer_profiles fp2 WHERE fp2.user_id = u.id) as has_freelancer_profile
      FROM users u
      LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id
      WHERE u.id = ${auth.userID}
    `;

    if (!user) {
      console.error("[ME] User not found for ID:", auth.userID);
      throw new Error("User not found");
    }

    // Parse roles - fallback to single role if roles array not yet populated
    const userRoles: string[] = user.roles || [user.role];
    const activeRole = user.active_role || user.role;

    console.log("[ME] User found:", { firstName: user.first_name, roles: userRoles, activeRole });

    return {
      id: auth.userID,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: activeRole,
      roles: userRoles,
      activeRole: activeRole,
      isVerified: user.is_verified,
      status: user.status,
      hasFreelancerProfile: user.has_freelancer_profile,
      freelancerOnboardingStatus: user.freelancer_onboarding_status,
    };
  }
);
