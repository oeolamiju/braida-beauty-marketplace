import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface ToggleFavoriteRequest {
  freelancerId: string;
}

interface ToggleFavoriteResponse {
  isFavorite: boolean;
  message: string;
}

export const toggleFavoriteFreelancer = api<ToggleFavoriteRequest, ToggleFavoriteResponse>(
  { method: "POST", path: "/favorites/freelancers/toggle", expose: true, auth: true },
  async (req): Promise<ToggleFavoriteResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    // Check if freelancer exists
    const freelancer = await db.queryRow<{ id: string }>`
      SELECT id FROM users WHERE id = ${req.freelancerId} AND role = 'FREELANCER'
    `;

    if (!freelancer) {
      throw APIError.notFound("Freelancer not found");
    }

    // Check if already favorited
    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM favorite_freelancers
      WHERE client_id = ${userId} AND freelancer_id = ${req.freelancerId}
    `;

    if (existing) {
      // Remove from favorites
      await db.exec`
        DELETE FROM favorite_freelancers
        WHERE client_id = ${userId} AND freelancer_id = ${req.freelancerId}
      `;
      return {
        isFavorite: false,
        message: "Removed from favorites",
      };
    } else {
      // Add to favorites
      await db.exec`
        INSERT INTO favorite_freelancers (client_id, freelancer_id)
        VALUES (${userId}, ${req.freelancerId})
      `;
      return {
        isFavorite: true,
        message: "Added to favorites",
      };
    }
  }
);

