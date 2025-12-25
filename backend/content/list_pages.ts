import { api } from "encore.dev/api";
import db from "../db";
import type { ContentPage } from "./types";

interface ListPagesRequest {
  category?: string;
  publishedOnly?: boolean;
}

interface ListPagesResponse {
  pages: ContentPage[];
}

export const listPages = api(
  { method: "GET", path: "/content/pages", expose: true },
  async ({ category, publishedOnly = true }: ListPagesRequest): Promise<ListPagesResponse> => {
    let rows: Array<{
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
    }>;

    if (category && publishedOnly) {
      rows = await db.queryAll`
        SELECT id, slug, title, content, meta_description, category, 
          is_published, version, created_at, updated_at, published_at, last_edited_by
        FROM content_pages
        WHERE category = ${category} AND is_published = true
        ORDER BY updated_at DESC
      `;
    } else if (category) {
      rows = await db.queryAll`
        SELECT id, slug, title, content, meta_description, category, 
          is_published, version, created_at, updated_at, published_at, last_edited_by
        FROM content_pages
        WHERE category = ${category}
        ORDER BY updated_at DESC
      `;
    } else if (publishedOnly) {
      rows = await db.queryAll`
        SELECT id, slug, title, content, meta_description, category, 
          is_published, version, created_at, updated_at, published_at, last_edited_by
        FROM content_pages
        WHERE is_published = true
        ORDER BY updated_at DESC
      `;
    } else {
      rows = await db.queryAll`
        SELECT id, slug, title, content, meta_description, category, 
          is_published, version, created_at, updated_at, published_at, last_edited_by
        FROM content_pages
        ORDER BY updated_at DESC
      `;
    }

    const pages: ContentPage[] = rows.map(row => ({
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
    }));

    return { pages };
  }
);
