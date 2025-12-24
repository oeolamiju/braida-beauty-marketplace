import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "./auth";
import db from "../db";
import { generateToken } from "./auth";
import { logAuditEvent } from "../shared/audit_logger";

export interface SwitchRoleRequest {
  targetRole: "CLIENT" | "FREELANCER";
}

export interface SwitchRoleResponse {
  token: string;
  activeRole: string;
  roles: string[];
}

export const switchRole = api<SwitchRoleRequest, SwitchRoleResponse>(
  { auth: true, expose: true, method: "POST", path: "/auth/switch-role" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const user = await db.queryRow<{
      email: string;
      roles: string[];
      active_role: string;
      is_verified: boolean;
      status: string;
    }>`
      SELECT email, roles, active_role, is_verified, status
      FROM users
      WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    if (user.status === 'suspended') {
      throw APIError.permissionDenied("account is suspended");
    }

    const roles = user.roles || [];
    if (!roles.includes(req.targetRole)) {
      throw APIError.permissionDenied(
        `you do not have the ${req.targetRole} role. Available roles: ${roles.join(', ')}`
      );
    }

    await db.exec`
      UPDATE users
      SET active_role = ${req.targetRole}
      WHERE id = ${auth.userID}
    `;

    await db.exec`
      INSERT INTO role_changes (user_id, from_role, to_role, changed_by)
      VALUES (${auth.userID}, ${user.active_role}, ${req.targetRole}, ${auth.userID})
    `;

    await logAuditEvent({
      eventType: "user_login",
      userId: auth.userID,
      targetType: "user",
      targetId: auth.userID,
      details: {
        action: "role_switched",
        from: user.active_role,
        to: req.targetRole,
      },
    });

    const newToken = generateToken({
      userId: auth.userID,
      email: user.email,
      roles: roles,
      activeRole: req.targetRole,
      isVerified: user.is_verified,
    });

    return {
      token: newToken,
      activeRole: req.targetRole,
      roles: roles,
    };
  }
);
