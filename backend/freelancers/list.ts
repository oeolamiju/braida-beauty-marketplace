import { api } from "encore.dev/api";
import db from "../db";

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

interface ListFreelancersResponse {
  freelancers: FreelancerProfile[];
}

// Lists all verified freelancers
export const list = api<void, ListFreelancersResponse>(
  { expose: true, method: "GET", path: "/freelancers" },
  async (): Promise<ListFreelancersResponse> => {
    const rows = await db.queryAll<{
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
      WHERE verification_status = 'verified'
      ORDER BY created_at DESC
    `;

    const freelancers = rows.map(row => ({
      userId: row.user_id,
      displayName: row.display_name,
      bio: row.bio,
      profilePhotoUrl: row.profile_photo_url,
      locationArea: row.location_area,
      postcode: row.postcode,
      travelRadiusMiles: row.travel_radius_miles,
      categories: JSON.parse(row.categories),
      verificationStatus: row.verification_status,
    }));

    return { freelancers };
  }
);
