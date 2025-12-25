import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { UpdateFAQSchema } from "./schemas";
import type { FAQItem } from "./types";

interface UpdateFAQRequest {
  id: string;
  category?: string;
  question?: string;
  answer?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface UpdateFAQResponse {
  faq: FAQItem;
}

export const updateFAQ = api(
  { method: "PATCH", path: "/admin/content/faqs/:id", auth: true, expose: true },
  async ({ id, ...updates }: UpdateFAQRequest): Promise<UpdateFAQResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    const validated = UpdateFAQSchema.parse(updates);

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (validated.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(validated.category);
    }

    if (validated.question !== undefined) {
      setClauses.push(`question = $${paramIndex++}`);
      values.push(validated.question);
    }

    if (validated.answer !== undefined) {
      setClauses.push(`answer = $${paramIndex++}`);
      values.push(validated.answer);
    }

    if (validated.displayOrder !== undefined) {
      setClauses.push(`display_order = $${paramIndex++}`);
      values.push(validated.displayOrder);
    }

    if (validated.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      values.push(validated.isActive);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    await db.rawExec(
      `UPDATE faq_items
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}`,
      ...values
    );

    const row = await db.queryRow<{
      id: string;
      category: string;
      question: string;
      answer: string;
      display_order: number;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT * FROM faq_items WHERE id = ${id}
    `;

    if (!row) {
      throw { code: "not_found", message: "FAQ not found" };
    }

    const faq: FAQItem = {
      id: row.id,
      category: row.category,
      question: row.question,
      answer: row.answer,
      displayOrder: row.display_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return { faq };
  }
);
