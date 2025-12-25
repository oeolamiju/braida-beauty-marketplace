import { api } from "encore.dev/api";
import db from "../db";
import type { FAQItem } from "./types";

interface ListFAQsRequest {
  category?: string;
  activeOnly?: boolean;
}

interface ListFAQsResponse {
  faqs: FAQItem[];
}

export const listFAQs = api(
  { method: "GET", path: "/content/faqs", expose: true },
  async ({ category, activeOnly = true }: ListFAQsRequest): Promise<ListFAQsResponse> => {
    let rows: Array<{
      id: string;
      category: string;
      question: string;
      answer: string;
      display_order: number;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>;

    if (category && activeOnly) {
      rows = await db.queryAll`
        SELECT id, category, question, answer, display_order, is_active, created_at, updated_at
        FROM faq_items
        WHERE category = ${category} AND is_active = true
        ORDER BY display_order ASC, created_at ASC
      `;
    } else if (category) {
      rows = await db.queryAll`
        SELECT id, category, question, answer, display_order, is_active, created_at, updated_at
        FROM faq_items
        WHERE category = ${category}
        ORDER BY display_order ASC, created_at ASC
      `;
    } else if (activeOnly) {
      rows = await db.queryAll`
        SELECT id, category, question, answer, display_order, is_active, created_at, updated_at
        FROM faq_items
        WHERE is_active = true
        ORDER BY display_order ASC, created_at ASC
      `;
    } else {
      rows = await db.queryAll`
        SELECT id, category, question, answer, display_order, is_active, created_at, updated_at
        FROM faq_items
        ORDER BY display_order ASC, created_at ASC
      `;
    }

    const faqs: FAQItem[] = rows.map(row => ({
      id: row.id,
      category: row.category,
      question: row.question,
      answer: row.answer,
      displayOrder: row.display_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { faqs };
  }
);
