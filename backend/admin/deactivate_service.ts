import { api, Header } from "encore.dev/api";
import { requireAdmin, logAdminAction } from "./middleware";
import { DeactivateServiceRequest } from "./types";
import db from "../db";
import { getAuthData } from "~encore/auth";

export const deactivateService = api(
  { method: "POST", path: "/admin/services/:serviceId/deactivate", expose: true, auth: true },
  async (req: DeactivateServiceRequest, ip?: Header<"x-forwarded-for">): Promise<void> => {
    await requireAdmin();

    const auth = getAuthData();
    const { serviceId, reason } = req;

    await db.exec`
      UPDATE services
      SET active = false,
          deactivation_reason = ${reason},
          deactivated_at = NOW(),
          deactivated_by = ${auth!.userID}
      WHERE id = ${serviceId}
    `;

    await logAdminAction("SERVICE_DEACTIVATED", "SERVICE", serviceId, { reason }, ip);
  }
);
