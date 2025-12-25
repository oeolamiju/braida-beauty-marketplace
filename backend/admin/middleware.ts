import { APIError, Header } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export async function requireAdmin(): Promise<void> {
  const auth = getAuthData();
  if (!auth) {
    throw APIError.unauthenticated("Authentication required");
  }

  const roleUpper = auth.role?.toUpperCase();
  const activeRoleUpper = auth.activeRole?.toUpperCase();
  
  if (roleUpper !== "ADMIN" && activeRoleUpper !== "ADMIN") {
    throw APIError.permissionDenied("Admin access required");
  }
}

export async function logAdminAction(
  actionType: string,
  targetType: string,
  targetId: string,
  details?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  const auth = getAuthData();
  if (!auth) return;

  const db = (await import("../db")).default;
  
  await db.exec`
    INSERT INTO admin_action_logs (admin_id, action_type, target_type, target_id, details, ip_address)
    VALUES (${auth.userID}, ${actionType}, ${targetType}, ${targetId}, ${details ? JSON.stringify(details) : null}, ${ipAddress})
  `;
}
