import { api, Header } from "encore.dev/api";
import { requireAdmin, logAdminAction } from "./middleware";
import { SuspendUserRequest } from "./types";
import db from "../db";

export const suspendUser = api(
  { method: "POST", path: "/admin/users/:userId/suspend", expose: true },
  async (req: SuspendUserRequest, ip?: Header<"x-forwarded-for">): Promise<void> => {
    await requireAdmin();

    const { userId, reason } = req;

    await db.exec`
      UPDATE users
      SET suspended = true, 
          suspension_reason = ${reason},
          suspended_at = NOW(),
          suspended_by = (SELECT user_id FROM sessions WHERE token = current_setting('encore.auth.token', true))
      WHERE id = ${userId}
    `;

    await logAdminAction("USER_SUSPENDED", "USER", userId, { reason }, ip);
  }
);
