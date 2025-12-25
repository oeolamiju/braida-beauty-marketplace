import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { CreateContentPageSchema } from "./schemas";
import type { ContentPage } from "./types";

interface CreatePageRequest {
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  category: string;
  isPublished?: boolean;
}

interface CreatePageResponse {
  page: ContentPage;
}

export const createPage = api(
  { method: "POST", path: "/admin/content/pages", auth: true, expose: true },
  async (req: CreatePageRequest): Promise<CreatePageResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    const validated = CreateContentPageSchema.parse(req);

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
      INSERT INTO content_pages 
        (slug, title, content, meta_description, category, is_published, last_edited_by, published_at)
      VALUES (${validated.slug}, ${validated.title}, ${validated.content}, ${validated.metaDescription || null}, ${validated.category}, ${validated.isPublished || false}, ${auth.userID}, ${validated.isPublished ? new Date() : null})
      RETURNING *
    `;

    if (!row) {
      throw { code: "internal", message: "Failed to create page" };
    }

    await db.exec`
      INSERT INTO content_versions (page_id, version, title, content, edited_by)
      VALUES (${row.id}, ${row.version}, ${row.title}, ${row.content}, ${auth.userID})
    `;

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
