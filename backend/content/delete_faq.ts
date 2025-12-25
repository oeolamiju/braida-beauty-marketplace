import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface DeleteFAQRequest {
  id: string;
}

interface DeleteFAQResponse {
  success: boolean;
}

export const deleteFAQ = api(
  { method: "DELETE", path: "/admin/content/faqs/:id", auth: true, expose: true },
  async ({ id }: DeleteFAQRequest): Promise<DeleteFAQResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    await db.exec`DELETE FROM faq_items WHERE id = ${id}`;

    return { success: true };
  }
);
