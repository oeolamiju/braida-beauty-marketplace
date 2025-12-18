import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DeletePortfolioItemRequest {
  itemId: number;
}

export interface DeletePortfolioItemResponse {
  success: boolean;
}

export const deletePortfolioItem = api(
  { method: "DELETE", path: "/profiles/portfolio/:itemId", expose: true, auth: true },
  async ({ itemId }: DeletePortfolioItemRequest): Promise<DeletePortfolioItemResponse> => {
    const auth = getAuthData()!;

    const itemRows = await db.queryAll`
      SELECT freelancer_id FROM freelancer_portfolio WHERE id = ${itemId}
    `;

    if (itemRows.length === 0) {
      throw APIError.notFound("Portfolio item not found");
    }

    if (itemRows[0].freelancer_id !== auth.userID) {
      const userRows = await db.queryAll`
        SELECT role FROM users WHERE id = ${auth.userID}
      `;

      if (userRows.length === 0 || userRows[0].role !== "ADMIN") {
        throw APIError.permissionDenied("You can only delete your own portfolio items");
      }
    }

    await db.exec`DELETE FROM freelancer_portfolio WHERE id = ${itemId}`;

    return { success: true };
  }
);
