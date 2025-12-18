import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { trackEvent } from "../analytics/track";

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  profilePhotoUrl?: string;
  locationArea?: string;
  postcode?: string;
  travelRadiusMiles?: number;
  categories?: string[];
  styleIds?: number[];
  defaultStudioFeePence?: number;
  defaultMobileFeePence?: number;
}

export interface UpdateProfileResponse {
  success: boolean;
}

export const updateProfile = api(
  { method: "PUT", path: "/profiles/me", expose: true, auth: true },
  async (req: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const auth = getAuthData()!;

    const userRows = await db.queryAll`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (userRows.length === 0) {
      throw APIError.notFound("User not found");
    }

    if (userRows[0].role !== "FREELANCER") {
      throw APIError.permissionDenied("Only freelancers can update profiles");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.displayName !== undefined) {
      updates.push(`display_name = $${paramIndex++}`);
      values.push(req.displayName);
    }

    if (req.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(req.bio);
    }

    if (req.profilePhotoUrl !== undefined) {
      updates.push(`profile_photo_url = $${paramIndex++}`);
      values.push(req.profilePhotoUrl);
    }

    if (req.locationArea !== undefined) {
      updates.push(`location_area = $${paramIndex++}`);
      values.push(req.locationArea);
    }

    if (req.postcode !== undefined) {
      updates.push(`postcode = $${paramIndex++}`);
      values.push(req.postcode);
    }

    if (req.travelRadiusMiles !== undefined) {
      updates.push(`travel_radius_miles = $${paramIndex++}`);
      values.push(req.travelRadiusMiles);
    }

    if (req.categories !== undefined) {
      updates.push(`categories = $${paramIndex++}`);
      values.push(JSON.stringify(req.categories));
    }

    if (req.defaultStudioFeePence !== undefined) {
      updates.push(`default_studio_fee_pence = $${paramIndex++}`);
      values.push(req.defaultStudioFeePence);
    }

    if (req.defaultMobileFeePence !== undefined) {
      updates.push(`default_mobile_fee_pence = $${paramIndex++}`);
      values.push(req.defaultMobileFeePence);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(auth.userID);

      await db.rawExec(
        `UPDATE freelancer_profiles 
         SET ${updates.join(", ")}
         WHERE user_id = $${paramIndex}`,
        ...values
      );
    }

    if (req.styleIds !== undefined) {
      await db.rawExec(
        `DELETE FROM freelancer_styles WHERE freelancer_id = $1`,
        auth.userID
      );

      if (req.styleIds.length > 0) {
        const styleValues = req.styleIds
          .map((styleId, idx) => `($1, $${idx + 2})`)
          .join(", ");
        await db.rawExec(
          `INSERT INTO freelancer_styles (freelancer_id, style_id) VALUES ${styleValues}`,
          auth.userID,
          ...req.styleIds
        );
      }
    }

    const hasEssentialFields = req.displayName || req.bio || req.locationArea;
    if (hasEssentialFields) {
      await trackEvent(auth.userID, "profile_completed", {});
    }

    return { success: true };
  }
);
