import { api, Header } from "encore.dev/api";
import { requireAdmin, logAdminAction } from "./middleware";
import { UnsuspendUserRequest } from "./types";
import db from "../db";

export const unsuspendUser = api(
  { method: "POST", path: "/admin/users/:userId/unsuspend", expose: true },
  async (req: UnsuspendUserRequest, ip?: Header<"x-forwarded-for">): Promise<void> => {
    await requireAdmin();

    const { userId } = req;

    await db.exec`
      UPDATE users
      SET suspended = false,
          suspension_reason = NULL,
          suspended_at = NULL,
          suspended_by = NULL
      WHERE id = ${userId}
    `;

    await logAdminAction("USER_UNSUSPENDED", "USER", userId, {}, ip);
  }
);
