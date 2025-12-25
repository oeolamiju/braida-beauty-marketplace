import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface DeletePageRequest {
  id: string;
}

interface DeletePageResponse {
  success: boolean;
}

export const deletePage = api(
  { method: "DELETE", path: "/admin/content/pages/:id", auth: true, expose: true },
  async ({ id }: DeletePageRequest): Promise<DeletePageResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    await db.exec`DELETE FROM content_pages WHERE id = ${id}`;

    return { success: true };
  }
);
