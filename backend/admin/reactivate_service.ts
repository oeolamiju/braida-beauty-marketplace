import { api, Header } from "encore.dev/api";
import { requireAdmin, logAdminAction } from "./middleware";
import { ReactivateServiceRequest } from "./types";
import db from "../db";

export const reactivateService = api(
  { method: "POST", path: "/admin/services/:serviceId/reactivate", expose: true, auth: true },
  async (req: ReactivateServiceRequest, ip?: Header<"x-forwarded-for">): Promise<void> => {
    await requireAdmin();

    const { serviceId } = req;

    await db.exec`
      UPDATE services
      SET active = true,
          deactivation_reason = NULL,
          deactivated_at = NULL,
          deactivated_by = NULL
      WHERE id = ${serviceId}
    `;

    await logAdminAction("SERVICE_REACTIVATED", "SERVICE", serviceId, {}, ip);
  }
);
