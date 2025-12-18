import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface FavoriteFreelancer {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  specialties: string[];
  averageRating: number;
  totalReviews: number;
  city: string | null;
  favoritedAt: Date;
}

interface ListFavoriteFreelancersResponse {
  freelancers: FavoriteFreelancer[];
  total: number;
}

export const listFavoriteFreelancers = api(
  { method: "GET", path: "/favorites/freelancers", expose: true, auth: true },
  async (): Promise<ListFavoriteFreelancersResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    const freelancers: FavoriteFreelancer[] = [];

    for await (const row of db.query<{
      id: string;
      first_name: string;
      last_name: string;
      profile_photo: string | null;
      specialties: string[] | null;
      average_rating: number | null;
      total_reviews: number;
      city: string | null;
      favorited_at: Date;
    }>`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        fp.profile_photo,
        fp.specialties,
        fp.average_rating,
        fp.total_reviews,
        fp.city,
        ff.created_at as favorited_at
      FROM favorite_freelancers ff
      JOIN users u ON ff.freelancer_id = u.id
      LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
      WHERE ff.client_id = ${userId}
      ORDER BY ff.created_at DESC
    `) {
      freelancers.push({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        profilePhoto: row.profile_photo,
        specialties: row.specialties || [],
        averageRating: row.average_rating || 0,
        totalReviews: row.total_reviews,
        city: row.city,
        favoritedAt: row.favorited_at,
      });
    }

    return {
      freelancers,
      total: freelancers.length,
    };
  }
);

