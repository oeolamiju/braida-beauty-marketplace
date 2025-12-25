import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { CreateFAQSchema } from "./schemas";
import type { FAQItem } from "./types";

interface CreateFAQRequest {
  category: string;
  question: string;
  answer: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface CreateFAQResponse {
  faq: FAQItem;
}

export const createFAQ = api(
  { method: "POST", path: "/admin/content/faqs", auth: true, expose: true },
  async (req: CreateFAQRequest): Promise<CreateFAQResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    const validated = CreateFAQSchema.parse(req);

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
      INSERT INTO faq_items (category, question, answer, display_order, is_active)
      VALUES (${validated.category}, ${validated.question}, ${validated.answer}, ${validated.displayOrder || 0}, ${validated.isActive !== undefined ? validated.isActive : true})
      RETURNING *
    `;

    if (!row) {
      throw { code: "internal", message: "Failed to create FAQ" };
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
