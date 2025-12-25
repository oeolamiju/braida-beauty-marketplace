import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "./auth";
import db from "../db";
import { generateToken } from "./auth";
import { logAuditEvent } from "../shared/audit_logger";

export interface BecomeFreelancerRequest {
  displayName: string;
  bio?: string;
  locationArea: string;
  postcode: string;
  travelRadiusMiles: number;
  categories: string[];
}

export interface BecomeFreelancerResponse {
  success: boolean;
  message: string;
  token: string;
  roles: string[];
  activeRole: string;
}

export const becomeFreelancer = api<BecomeFreelancerRequest, BecomeFreelancerResponse>(
  { auth: true, expose: true, method: "POST", path: "/auth/become-freelancer" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const user = await db.queryRow<{
      email: string;
      first_name: string;
      last_name: string;
      roles: string[];
      active_role: string;
      is_verified: boolean;
      status: string;
    }>`
      SELECT email, first_name, last_name, roles, active_role, is_verified, status
      FROM users
      WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    if (user.status === 'suspended') {
      throw APIError.permissionDenied("account is suspended");
    }

    const currentRoles = user.roles || [];
    if (currentRoles.includes('FREELANCER')) {
      throw APIError.alreadyExists("you are already a freelancer");
    }

    if (!req.displayName.trim()) {
      throw APIError.invalidArgument("display name is required");
    }

    if (!req.locationArea.trim() || !req.postcode.trim()) {
      throw APIError.invalidArgument("location area and postcode are required");
    }

    if (req.travelRadiusMiles < 0 || req.travelRadiusMiles > 100) {
      throw APIError.invalidArgument("travel radius must be between 0 and 100 miles");
    }

    if (!req.categories || req.categories.length === 0) {
      throw APIError.invalidArgument("at least one category is required");
    }

    const existingProfile = await db.queryRow<{ user_id: string }>`
      SELECT user_id FROM freelancer_profiles WHERE user_id = ${auth.userID}
    `;

    if (existingProfile) {
      await db.exec`
        UPDATE freelancer_profiles
        SET 
          display_name = ${req.displayName},
          bio = ${req.bio || ''},
          location_area = ${req.locationArea},
          postcode = ${req.postcode},
          travel_radius_miles = ${req.travelRadiusMiles},
          categories = ${JSON.stringify(req.categories)}::jsonb,
          onboarding_status = 'in_progress',
          updated_at = NOW()
        WHERE user_id = ${auth.userID}
      `;
    } else {
      await db.exec`
        INSERT INTO freelancer_profiles (
          user_id, display_name, bio, location_area, postcode, 
          travel_radius_miles, categories, onboarding_status
        )
        VALUES (
          ${auth.userID}, 
          ${req.displayName}, 
          ${req.bio || ''}, 
          ${req.locationArea}, 
          ${req.postcode},
          ${req.travelRadiusMiles}, 
          ${JSON.stringify(req.categories)}::jsonb,
          'in_progress'
        )
      `;
    }

    const newRoles = [...currentRoles, 'FREELANCER'];
    await db.exec`
      UPDATE users
      SET 
        roles = ${newRoles}::TEXT[]
      WHERE id = ${auth.userID}
    `;

    await logAuditEvent({
      eventType: "user_registered",
      userId: auth.userID,
      targetType: "user",
      targetId: auth.userID,
      details: {
        action: "become_freelancer",
        displayName: req.displayName,
        categories: req.categories,
      },
    });

    const newToken = generateToken({
      userId: auth.userID,
      email: user.email,
      roles: newRoles,
      activeRole: user.active_role,
      isVerified: user.is_verified,
    });

    return {
      success: true,
      message: "Freelancer profile created! Your profile will be reviewed by our admin team. You'll be able to switch to freelancer mode once your profile is verified.",
      token: newToken,
      roles: newRoles,
      activeRole: user.active_role,
    };
  }
);
