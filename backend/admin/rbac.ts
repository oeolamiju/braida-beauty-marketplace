import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";

// Admin roles and permissions
export type AdminRole = "super_admin" | "admin" | "support_agent" | "content_moderator" | "finance";

export interface AdminPermissions {
  users: { view: boolean; edit: boolean; suspend: boolean };
  services: { view: boolean; edit: boolean; deactivate: boolean };
  bookings: { view: boolean; edit: boolean };
  verifications: { view: boolean; approve: boolean; reject: boolean };
  disputes: { view: boolean; resolve: boolean };
  reports: { view: boolean; action: boolean };
  reviews: { view: boolean; remove: boolean };
  settings: { view: boolean; edit: boolean };
  payouts: { view: boolean; process: boolean };
  analytics: { view: boolean };
}

// Role permission mappings
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    users: { view: true, edit: true, suspend: true },
    services: { view: true, edit: true, deactivate: true },
    bookings: { view: true, edit: true },
    verifications: { view: true, approve: true, reject: true },
    disputes: { view: true, resolve: true },
    reports: { view: true, action: true },
    reviews: { view: true, remove: true },
    settings: { view: true, edit: true },
    payouts: { view: true, process: true },
    analytics: { view: true },
  },
  admin: {
    users: { view: true, edit: true, suspend: true },
    services: { view: true, edit: true, deactivate: true },
    bookings: { view: true, edit: true },
    verifications: { view: true, approve: true, reject: true },
    disputes: { view: true, resolve: true },
    reports: { view: true, action: true },
    reviews: { view: true, remove: true },
    settings: { view: true, edit: false },
    payouts: { view: true, process: false },
    analytics: { view: true },
  },
  support_agent: {
    users: { view: true, edit: false, suspend: false },
    services: { view: true, edit: false, deactivate: false },
    bookings: { view: true, edit: false },
    verifications: { view: false, approve: false, reject: false },
    disputes: { view: true, resolve: false },
    reports: { view: true, action: false },
    reviews: { view: true, remove: false },
    settings: { view: false, edit: false },
    payouts: { view: false, process: false },
    analytics: { view: false },
  },
  content_moderator: {
    users: { view: true, edit: false, suspend: false },
    services: { view: true, edit: false, deactivate: true },
    bookings: { view: false, edit: false },
    verifications: { view: false, approve: false, reject: false },
    disputes: { view: false, resolve: false },
    reports: { view: true, action: true },
    reviews: { view: true, remove: true },
    settings: { view: false, edit: false },
    payouts: { view: false, process: false },
    analytics: { view: false },
  },
  finance: {
    users: { view: true, edit: false, suspend: false },
    services: { view: true, edit: false, deactivate: false },
    bookings: { view: true, edit: false },
    verifications: { view: false, approve: false, reject: false },
    disputes: { view: true, resolve: false },
    reports: { view: false, action: false },
    reviews: { view: false, remove: false },
    settings: { view: true, edit: false },
    payouts: { view: true, process: true },
    analytics: { view: true },
  },
};

// Check if user is admin with specific permission
export async function requireAdminPermission(
  module: keyof AdminPermissions,
  action: string
): Promise<AdminRole> {
  const auth = getAuthData();
  if (!auth) {
    throw APIError.unauthenticated("Authentication required");
  }

  const user = await db.queryRow<{ role: string; admin_role: AdminRole | null }>`
    SELECT role, admin_role FROM users WHERE id = ${auth.userID}
  `;

  if (!user || user.role !== "admin") {
    throw APIError.permissionDenied("Admin access required");
  }

  const adminRole = user.admin_role || "admin";
  const permissions = ROLE_PERMISSIONS[adminRole];

  if (!permissions) {
    throw APIError.permissionDenied("Invalid admin role");
  }

  const modulePermissions = permissions[module];
  if (!modulePermissions || !(modulePermissions as any)[action]) {
    throw APIError.permissionDenied(`No permission for ${module}.${action}`);
  }

  return adminRole;
}

// Get current admin's permissions
export const getMyPermissions = api(
  { method: "GET", path: "/admin/permissions", expose: true, auth: true },
  async (): Promise<{ role: AdminRole; permissions: AdminPermissions }> => {
    const auth = getAuthData()!;

    const user = await db.queryRow<{ role: string; admin_role: AdminRole | null }>`
      SELECT role, admin_role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const adminRole = user.admin_role || "admin";
    return {
      role: adminRole,
      permissions: ROLE_PERMISSIONS[adminRole],
    };
  }
);

// Update admin role (super_admin only)
export const updateAdminRole = api(
  { method: "PUT", path: "/admin/users/:userId/role", expose: true, auth: true },
  async (req: { userId: string; adminRole: AdminRole }): Promise<{ success: boolean }> => {
    await requireAdminPermission("settings", "edit");

    const auth = getAuthData()!;
    const currentUser = await db.queryRow<{ admin_role: AdminRole | null }>`
      SELECT admin_role FROM users WHERE id = ${auth.userID}
    `;

    if (currentUser?.admin_role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can change admin roles");
    }

    // Verify target user is an admin
    const targetUser = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${req.userId}
    `;

    if (!targetUser || targetUser.role !== "admin") {
      throw APIError.invalidArgument("Target user must be an admin");
    }

    await db.exec`
      UPDATE users SET admin_role = ${req.adminRole} WHERE id = ${req.userId}
    `;

    // Log the action
    await db.exec`
      INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
      VALUES (${auth.userID}, 'update_admin_role', 'user', ${req.userId}, ${JSON.stringify({ newRole: req.adminRole })})
    `;

    return { success: true };
  }
);

