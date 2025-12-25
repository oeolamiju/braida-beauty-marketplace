import { api } from "encore.dev/api";
import db from "../db";
import type { ContentPage } from "./types";

interface GetPageRequest {
  slug: string;
}

interface GetPageResponse {
  page: ContentPage;
}

export const getPage = api(
  { method: "GET", path: "/content/pages/:slug", expose: true },
  async ({ slug }: GetPageRequest): Promise<GetPageResponse> => {
    const row = await db.queryRow<{
      id: string;
      slug: string;
      title: string;
      content: string;
      meta_description: string | null;
      category: string;
      is_published: boolean;
      version: number;
      created_at: Date;
      updated_at: Date;
      published_at: Date | null;
      last_edited_by: string | null;
    }>`
      SELECT 
        id, slug, title, content, meta_description, category, 
        is_published, version, created_at, updated_at, 
        published_at, last_edited_by
      FROM content_pages
      WHERE slug = ${slug}
    `;

    if (!row) {
      throw { code: "not_found", message: "Content page not found" };
    }

    const page: ContentPage = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      content: row.content,
      metaDescription: row.meta_description || undefined,
      category: row.category,
      isPublished: row.is_published,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at || undefined,
      lastEditedBy: row.last_edited_by || undefined,
    };

    return { page };
  }
);
