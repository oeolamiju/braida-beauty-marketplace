import { api, APIError, Cookie } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { generateToken } from "./auth";
import { logAuditEvent } from "../shared/audit_logger";
import type { AuthData } from "./auth";

// ============================================
// Role Switching Endpoint
// ============================================

export interface SwitchRoleRequest {
  targetRole: "CLIENT" | "FREELANCER";
}

export interface SwitchRoleResponse {
  success: boolean;
  token: string;
  session: Cookie<"session">;
  activeRole: string;
  message: string;
}

export const switchRole = api<SwitchRoleRequest, SwitchRoleResponse>(
  { auth: true, expose: true, method: "POST", path: "/auth/switch-role" },
  async (req) => {
    const auth = getAuthData()! as AuthData;
    
    // Fetch user's roles
    const user = await db.queryRow<{
      id: string;
      email: string | null;
      phone: string | null;
      roles: string[] | null;
      role: string;
      is_verified: boolean;
    }>`
      SELECT id, email, phone, roles, role, is_verified
      FROM users
      WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    const userRoles: string[] = user.roles || [user.role];

    // Check if user has the target role
    if (!userRoles.includes(req.targetRole)) {
      if (req.targetRole === "FREELANCER") {
        throw APIError.permissionDenied(
          "You don't have a freelancer account yet. Complete the freelancer onboarding to offer services."
        );
      }
      throw APIError.permissionDenied(`You don't have the ${req.targetRole} role.`);
    }

    // Update active role in database
    await db.exec`
      UPDATE users 
      SET active_role = ${req.targetRole}
      WHERE id = ${auth.userID}
    `;

    // Generate new token with updated role
    const newToken = generateToken({
      userId: user.id,
      email: user.email || user.phone || "",
      role: req.targetRole,
      isVerified: user.is_verified,
    });

    // Log the role switch
    await logAuditEvent({
      eventType: "user_role_switched",
      userId: auth.userID,
      details: { 
        previousRole: auth.role,
        newRole: req.targetRole 
      },
    });

    return {
      success: true,
      token: newToken,
      session: {
        value: newToken,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
      activeRole: req.targetRole,
      message: `Switched to ${req.targetRole.toLowerCase()} mode`,
    };
  }
);

// ============================================
// Freelancer Upgrade/Onboarding Endpoint
// ============================================

export interface StartFreelancerOnboardingRequest {
  displayName: string;
  locationArea: string;
  postcode: string;
  travelRadiusMiles?: number;
  categories: string[];
  bio?: string;
}

export interface StartFreelancerOnboardingResponse {
  success: boolean;
  message: string;
  profileId: string;
  roles: string[];
  activeRole: string;
  token: string;
  session: Cookie<"session">;
}

export const startFreelancerOnboarding = api<StartFreelancerOnboardingRequest, StartFreelancerOnboardingResponse>(
  { auth: true, expose: true, method: "POST", path: "/auth/become-freelancer" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    // Validate required fields
    if (!req.displayName?.trim()) {
      throw APIError.invalidArgument("Display name is required");
    }
    if (!req.locationArea?.trim()) {
      throw APIError.invalidArgument("Location area is required");
    }
    if (!req.postcode?.trim()) {
      throw APIError.invalidArgument("Postcode is required");
    }
    if (!req.categories || req.categories.length === 0) {
      throw APIError.invalidArgument("At least one service category is required");
    }

    // Check if user already has freelancer profile
    const existingProfile = await db.queryRow<{ user_id: string }>`
      SELECT user_id FROM freelancer_profiles WHERE user_id = ${auth.userID}
    `;

    if (existingProfile) {
      throw APIError.alreadyExists("You already have a freelancer profile");
    }

    // Get user info
    const user = await db.queryRow<{
      id: string;
      email: string | null;
      phone: string | null;
      roles: string[] | null;
      role: string;
      is_verified: boolean;
    }>`
      SELECT id, email, phone, roles, role, is_verified
      FROM users
      WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    // Create freelancer profile
    await db.exec`
      INSERT INTO freelancer_profiles (
        user_id, display_name, bio, location_area, postcode, 
        travel_radius_miles, categories, verification_status
      )
      VALUES (
        ${auth.userID}, 
        ${req.displayName.trim()}, 
        ${req.bio?.trim() || null},
        ${req.locationArea.trim()}, 
        ${req.postcode.trim().toUpperCase()}, 
        ${req.travelRadiusMiles || 10}, 
        ${JSON.stringify(req.categories)}::jsonb,
        'unverified'
      )
    `;

    // Update user roles to include FREELANCER
    const currentRoles: string[] = user.roles || [user.role];
    const newRoles = currentRoles.includes("FREELANCER") 
      ? currentRoles 
      : [...currentRoles, "FREELANCER"];

    await db.exec`
      UPDATE users 
      SET 
        roles = ${JSON.stringify(newRoles)}::jsonb,
        active_role = 'FREELANCER',
        freelancer_onboarding_status = 'completed',
        freelancer_onboarding_completed_at = NOW()
      WHERE id = ${auth.userID}
    `;

    // Generate new token with FREELANCER role
    const newToken = generateToken({
      userId: user.id,
      email: user.email || user.phone || "",
      role: "FREELANCER",
      isVerified: user.is_verified,
    });

    // Log the freelancer upgrade
    await logAuditEvent({
      eventType: "user_became_freelancer",
      userId: auth.userID,
      details: { 
        displayName: req.displayName,
        categories: req.categories,
        postcode: req.postcode 
      },
    });

    return {
      success: true,
      message: "Congratulations! Your freelancer profile has been created. You can now list services and accept bookings.",
      profileId: auth.userID,
      roles: newRoles,
      activeRole: "FREELANCER",
      token: newToken,
      session: {
        value: newToken,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
    };
  }
);

// ============================================
// Get User Roles Endpoint
// ============================================

export interface GetRolesResponse {
  roles: string[];
  activeRole: string;
  canBecomeFreelancer: boolean;
  hasFreelancerProfile: boolean;
  freelancerOnboardingStatus: string | null;
}

export const getRoles = api<void, GetRolesResponse>(
  { auth: true, expose: true, method: "GET", path: "/auth/roles" },
  async () => {
    const auth = getAuthData()! as AuthData;

    const user = await db.queryRow<{
      roles: string[] | null;
      role: string;
      active_role: string | null;
      has_freelancer_profile: boolean;
      freelancer_onboarding_status: string | null;
    }>`
      SELECT 
        u.roles, u.role, u.active_role, u.freelancer_onboarding_status,
        EXISTS(SELECT 1 FROM freelancer_profiles fp WHERE fp.user_id = u.id) as has_freelancer_profile
      FROM users u
      WHERE u.id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    const userRoles: string[] = user.roles || [user.role];
    const activeRole = user.active_role || user.role;

    return {
      roles: userRoles,
      activeRole,
      canBecomeFreelancer: !userRoles.includes("FREELANCER"),
      hasFreelancerProfile: user.has_freelancer_profile,
      freelancerOnboardingStatus: user.freelancer_onboarding_status,
    };
  }
);

