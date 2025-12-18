import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface CheckFavoriteRequest {
  freelancerId: string;
}

interface CheckFavoriteResponse {
  isFavorite: boolean;
}

export const checkFavorite = api<CheckFavoriteRequest, CheckFavoriteResponse>(
  { method: "GET", path: "/favorites/freelancers/:freelancerId/check", expose: true, auth: true },
  async (req): Promise<CheckFavoriteResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM favorite_freelancers
      WHERE client_id = ${userId} AND freelancer_id = ${req.freelancerId}
    `;

    return {
      isFavorite: !!existing,
    };
  }
);

