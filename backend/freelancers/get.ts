import { api } from "encore.dev/api";
import { z } from "zod";
import db from "../db";
import { validateSchema } from "../shared/validation";
import { ErrorHandler } from "../shared/errors";

const getFreelancerSchema = z.object({
  id: z.string().min(1, "Freelancer ID is required"),
});

interface GetFreelancerParams {
  id: string;
}

interface FreelancerProfile {
  userId: string;
  displayName: string;
  bio: string | null;
  profilePhotoUrl: string | null;
  locationArea: string;
  postcode: string;
  travelRadiusMiles: number;
  categories: string[];
  verificationStatus: string;
}

// Retrieves a specific freelancer profile
export const get = api<GetFreelancerParams, FreelancerProfile>(
  { expose: true, method: "GET", path: "/freelancers/:id" },
  async (params): Promise<FreelancerProfile> => {
    const { id } = validateSchema(getFreelancerSchema, params);

    const row = await db.queryRow<{
      user_id: string;
      display_name: string;
      bio: string | null;
      profile_photo_url: string | null;
      location_area: string;
      postcode: string;
      travel_radius_miles: number;
      categories: string;
      verification_status: string;
    }>`
      SELECT 
        user_id, display_name, bio, profile_photo_url,
        location_area, postcode, travel_radius_miles,
        categories, verification_status
      FROM freelancer_profiles
      WHERE user_id = ${id}
    `;

    if (!row) {
      ErrorHandler.notFound("Freelancer", id);
    }

    return {
      userId: row.user_id,
      displayName: row.display_name,
      bio: row.bio,
      profilePhotoUrl: row.profile_photo_url,
      locationArea: row.location_area,
      postcode: row.postcode,
      travelRadiusMiles: row.travel_radius_miles,
      categories: JSON.parse(row.categories),
      verificationStatus: row.verification_status,
    };
  }
);
