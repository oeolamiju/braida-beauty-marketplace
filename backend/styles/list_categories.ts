import { api } from "encore.dev/api";
import db from "../db";

export interface Category {
  name: string;
  displayName: string;
  description: string;
  styleCount: number;
  imageUrl: string | null;
}

export interface ListCategoriesResponse {
  categories: Category[];
}

const categoryInfo: Record<string, { displayName: string; description: string }> = {
  hair: {
    displayName: "Hair Styling",
    description: "Braids, weaves, natural hair care, locs, and protective styles",
  },
  makeup: {
    displayName: "Makeup Artistry",
    description: "Bridal, special occasion, editorial, and everyday makeup",
  },
  gele: {
    displayName: "Gele & Head Wraps",
    description: "Traditional West African head wrapping for all occasions",
  },
  tailoring: {
    displayName: "Bespoke Tailoring",
    description: "Custom clothing, alterations, and traditional attire",
  },
  barbering: {
    displayName: "Barbering Services",
    description: "Fades, beard grooming, line-ups, and classic cuts",
  },
};

export const listCategories = api<void, ListCategoriesResponse>(
  { expose: true, method: "GET", path: "/styles/categories" },
  async () => {
    const results = await db.queryAll<{
      category: string;
      style_count: number;
      sample_image_url: string | null;
    }>`
      SELECT 
        category,
        COUNT(*) as style_count,
        MIN(reference_image_url) as sample_image_url
      FROM styles
      WHERE category IS NOT NULL AND is_active = true
      GROUP BY category
      ORDER BY category
    `;

    const categories: Category[] = results.map((row: any) => ({
      name: row.category,
      displayName: categoryInfo[row.category]?.displayName || row.category,
      description: categoryInfo[row.category]?.description || "",
      styleCount: Number(row.style_count),
      imageUrl: row.sample_image_url,
    }));

    return { categories };
  }
);
