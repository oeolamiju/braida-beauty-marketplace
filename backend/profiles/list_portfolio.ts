import { api } from "encore.dev/api";
import db from "../db";

export interface PortfolioItem {
  id: number;
  freelancerId: string;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  createdAt: Date;
}

export interface ListPortfolioResponse {
  items: PortfolioItem[];
}

export const listPortfolio = api(
  { method: "GET", path: "/profiles/:userId/portfolio", expose: true, auth: false },
  async ({ userId }: { userId: string }): Promise<ListPortfolioResponse> => {
    const rows = await db.queryAll`
      SELECT id, freelancer_id, image_url, caption, display_order, created_at
      FROM freelancer_portfolio
      WHERE freelancer_id = ${userId}
      ORDER BY display_order ASC
    `;

    const items = rows.map((row: any) => ({
      id: row.id,
      freelancerId: row.freelancer_id,
      imageUrl: row.image_url,
      caption: row.caption,
      displayOrder: row.display_order,
      createdAt: row.created_at,
    }));

    return { items };
  }
);
