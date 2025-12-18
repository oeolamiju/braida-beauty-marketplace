import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface FreelancerProfile {
  userId: string;
  displayName: string;
  bio: string | null;
  profilePhotoUrl: string | null;
  locationArea: string;
  postcode: string;
  travelRadiusMiles: number;
  categories: string[];
  styleIds: number[];
  verificationStatus: string;
  avgRating: number | null;
  totalReviews: number;
  defaultStudioFeePence: number;
  defaultMobileFeePence: number;
  createdAt: Date;
}

export const getProfile = api(
  { method: "GET", path: "/profiles/:userId", expose: true, auth: false },
  async ({ userId }: { userId: string }): Promise<FreelancerProfile> => {
    const rows = await db.queryAll`
      SELECT 
        fp.user_id,
        fp.display_name,
        fp.bio,
        fp.profile_photo_url,
        fp.location_area,
        fp.postcode,
        fp.travel_radius_miles,
        fp.categories,
        fp.verification_status,
        fp.default_studio_fee_pence,
        fp.default_mobile_fee_pence,
        fp.created_at,
        COALESCE(AVG(r.rating), NULL) as avg_rating,
        COUNT(r.id) as total_reviews
      FROM freelancer_profiles fp
      LEFT JOIN reviews r ON r.freelancer_id = fp.user_id
      WHERE fp.user_id = ${userId}
      GROUP BY fp.user_id, fp.display_name, fp.bio, fp.profile_photo_url, 
               fp.location_area, fp.postcode, fp.travel_radius_miles, 
               fp.categories, fp.verification_status, fp.default_studio_fee_pence,
               fp.default_mobile_fee_pence, fp.created_at
    `;

    if (rows.length === 0) {
      const user = await db.queryRow<{ first_name: string; last_name: string; role: string }>`
        SELECT first_name, last_name, role FROM users WHERE id = ${userId}
      `;

      if (!user) {
        throw APIError.notFound("User not found");
      }

      if (user.role !== "FREELANCER") {
        throw APIError.invalidArgument("User is not a freelancer");
      }

      await db.exec`
        INSERT INTO freelancer_profiles (
          user_id, display_name, location_area, postcode, travel_radius_miles, categories
        )
        VALUES (
          ${userId}, 
          ${user.first_name + ' ' + user.last_name}, 
          '', 
          '', 
          10, 
          ARRAY[]::text[]
        )
      `;

      const newRows = await db.queryAll`
        SELECT 
          fp.user_id,
          fp.display_name,
          fp.bio,
          fp.profile_photo_url,
          fp.location_area,
          fp.postcode,
          fp.travel_radius_miles,
          fp.categories,
          fp.verification_status,
          fp.default_studio_fee_pence,
          fp.default_mobile_fee_pence,
          fp.created_at,
          NULL as avg_rating,
          0 as total_reviews
        FROM freelancer_profiles fp
        WHERE fp.user_id = ${userId}
      `;

      if (newRows.length === 0) {
        throw APIError.internal("Failed to create profile");
      }

      const row = newRows[0];
      return {
        userId: row.user_id,
        displayName: row.display_name,
        bio: row.bio,
        profilePhotoUrl: row.profile_photo_url,
        locationArea: row.location_area,
        postcode: row.postcode,
        travelRadiusMiles: row.travel_radius_miles,
        categories: row.categories || [],
        styleIds: [],
        verificationStatus: row.verification_status,
        avgRating: null,
        totalReviews: 0,
        defaultStudioFeePence: row.default_studio_fee_pence || 0,
        defaultMobileFeePence: row.default_mobile_fee_pence || 0,
        createdAt: row.created_at,
      };
    }

    const styleRows = await db.queryAll`
      SELECT style_id FROM freelancer_styles
      WHERE freelancer_id = ${userId}
    `;

    const row = rows[0];
    return {
      userId: row.user_id,
      displayName: row.display_name,
      bio: row.bio,
      profilePhotoUrl: row.profile_photo_url,
      locationArea: row.location_area,
      postcode: row.postcode,
      travelRadiusMiles: row.travel_radius_miles,
      categories: row.categories || [],
      styleIds: styleRows.map(r => r.style_id),
      verificationStatus: row.verification_status,
      avgRating: row.avg_rating ? parseFloat(row.avg_rating) : null,
      totalReviews: parseInt(row.total_reviews),
      defaultStudioFeePence: row.default_studio_fee_pence || 0,
      defaultMobileFeePence: row.default_mobile_fee_pence || 0,
      createdAt: row.created_at,
    };
  }
);
