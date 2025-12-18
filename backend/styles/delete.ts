import { api, APIError } from "encore.dev/api";
import db from "../db";
import { requireAdmin } from "../auth/middleware";

interface DeleteStyleRequest {
  id: number;
}

interface DeleteStyleResponse {
  success: boolean;
}

export const remove = api<DeleteStyleRequest, DeleteStyleResponse>(
  { expose: true, method: "DELETE", path: "/admin/styles/:id", auth: true },
  async (req: DeleteStyleRequest): Promise<DeleteStyleResponse> => {
    requireAdmin();

    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM styles WHERE id = ${req.id}
    `;

    if (!existing) {
      throw APIError.notFound("style not found");
    }

    const servicesCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM service_styles WHERE style_id = ${req.id}
    `;

    if (servicesCount && servicesCount.count > 0) {
      throw APIError.failedPrecondition(
        `cannot delete style. It is currently used by ${servicesCount.count} service(s). Please remove the style from all services first.`
      );
    }

    await db.exec`DELETE FROM styles WHERE id = ${req.id}`;

    return { success: true };
  }
);
