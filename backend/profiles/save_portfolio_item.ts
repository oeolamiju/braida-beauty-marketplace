import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { portfolioImages } from "./storage";

export interface SavePortfolioItemRequest {
  imageId: string;
  caption?: string;
}

export interface PortfolioItem {
  id: number;
  freelancerId: string;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  createdAt: Date;
}

export const savePortfolioItem = api(
  { method: "POST", path: "/profiles/portfolio", expose: true, auth: true },
  async (req: SavePortfolioItemRequest): Promise<PortfolioItem> => {
    const auth = getAuthData()!;

    const userRows = await db.queryAll`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (userRows.length === 0) {
      throw APIError.notFound("User not found");
    }

    if (userRows[0].role !== "FREELANCER") {
      throw APIError.permissionDenied("Only freelancers can manage portfolio");
    }

    const imageUrl = portfolioImages.publicUrl(req.imageId);

    const maxOrderRows = await db.queryAll`
      SELECT COALESCE(MAX(display_order), -1) as max_order 
      FROM freelancer_portfolio 
      WHERE freelancer_id = ${auth.userID}
    `;
    const nextOrder = maxOrderRows[0].max_order + 1;

    const rows = await db.queryAll`
      INSERT INTO freelancer_portfolio (freelancer_id, image_url, caption, display_order)
      VALUES (${auth.userID}, ${imageUrl}, ${req.caption || null}, ${nextOrder})
      RETURNING id, freelancer_id, image_url, caption, display_order, created_at
    `;

    const row = rows[0];
    return {
      id: row.id,
      freelancerId: row.freelancer_id,
      imageUrl: row.image_url,
      caption: row.caption,
      displayOrder: row.display_order,
      createdAt: row.created_at,
    };
  }
);
