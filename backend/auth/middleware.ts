import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "./auth";
import db from "../db";

export async function checkAccountStatus(userId: string): Promise<void> {
  const user = await db.queryRow<{
    status: string;
    suspended: boolean;
    suspension_reason: string | null;
    suspended_at: Date | null;
  }>`
    SELECT status, 
           COALESCE(suspended, false) as suspended,
           suspension_reason, 
           suspended_at
    FROM users
    WHERE id = ${userId}
  `;

  if (!user) {
    throw APIError.unauthenticated("session expired", new Error("user not found"));
  }

  // Check if account is suspended via the status enum
  if (user.status === "suspended") {
    throw APIError.permissionDenied(
      `Your account is suspended. Reason: ${user.suspension_reason || "Under review"}`
    );
  }

  // Also check the suspended boolean flag (from user_suspensions migration)
  if (user.suspended) {
    throw APIError.permissionDenied(
      `Your account is suspended. Reason: ${user.suspension_reason || "Under review"}`
    );
  }
}

export function requireRole(...allowedRoles: string[]): void {
  const auth = getAuthData() as AuthData | null;

  if (!auth) {
    throw APIError.unauthenticated("authentication required");
  }

  if (!allowedRoles.includes(auth.role)) {
    throw APIError.permissionDenied(
      `access denied. Required roles: ${allowedRoles.join(", ")}`
    );
  }
}

export function requireVerified(): void {
  const auth = getAuthData() as AuthData | null;

  if (!auth) {
    throw APIError.unauthenticated("authentication required");
  }

  if (!auth.isVerified) {
    throw APIError.permissionDenied(
      "account verification required. Please verify your account to access this feature."
    );
  }
}

export function requireClient(): void {
  requireRole("CLIENT");
}

export function requireFreelancer(): void {
  requireRole("FREELANCER");
}

export function requireAdmin(): void {
  requireRole("ADMIN");
}

export function requireVerifiedClient(): void {
  requireClient();
  requireVerified();
}

export function requireVerifiedFreelancer(): void {
  requireFreelancer();
  requireVerified();
}
