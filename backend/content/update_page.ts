import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { UpdateContentPageSchema } from "./schemas";
import type { ContentPage } from "./types";

interface UpdatePageRequest {
  id: string;
  title?: string;
  content?: string;
  metaDescription?: string;
  category?: string;
  isPublished?: boolean;
}

interface UpdatePageResponse {
  page: ContentPage;
}

export const updatePage = api(
  { method: "PATCH", path: "/admin/content/pages/:id", auth: true, expose: true },
  async ({ id, ...updates }: UpdatePageRequest): Promise<UpdatePageResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    const validated = UpdateContentPageSchema.parse(updates);

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (validated.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(validated.title);
    }

    if (validated.content !== undefined) {
      setClauses.push(`content = $${paramIndex++}`);
      values.push(validated.content);
    }

    if (validated.metaDescription !== undefined) {
      setClauses.push(`meta_description = $${paramIndex++}`);
      values.push(validated.metaDescription);
    }

    if (validated.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(validated.category);
    }

    if (validated.isPublished !== undefined) {
      setClauses.push(`is_published = $${paramIndex++}`);
      values.push(validated.isPublished);
      
      if (validated.isPublished) {
        setClauses.push(`published_at = NOW()`);
      }
    }

    setClauses.push(`version = version + 1`);
    setClauses.push(`updated_at = NOW()`);
    setClauses.push(`last_edited_by = $${paramIndex++}`);
    values.push(auth.userID);

    values.push(id);

    await db.rawExec(
      `UPDATE content_pages
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}`,
      ...values
    );

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
      SELECT * FROM content_pages WHERE id = ${id}
    `;

    if (!row) {
      throw { code: "not_found", message: "Content page not found" };
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
