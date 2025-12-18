import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "./auth";
import db from "../db";

export async function checkAccountStatus(userId: string): Promise<void> {
  const user = await db.queryRow<{
    account_status: string;
    suspension_reason: string | null;
    suspended_until: Date | null;
  }>`
    SELECT account_status, suspension_reason, suspended_until
    FROM users
    WHERE id = ${userId}
  `;

  if (!user) {
    throw APIError.unauthenticated("user not found");
  }

  if (user.account_status === "banned") {
    throw APIError.permissionDenied(
      `Your account has been banned. Reason: ${user.suspension_reason || "Violation of terms"}`
    );
  }

  if (user.account_status === "suspended") {
    if (user.suspended_until && new Date() > user.suspended_until) {
      await db.exec`
        UPDATE users
        SET account_status = 'active', suspended_until = NULL, suspension_reason = NULL
        WHERE id = ${userId}
      `;
      return;
    }

    const untilMsg = user.suspended_until
      ? ` until ${user.suspended_until.toISOString()}`
      : "";
    throw APIError.permissionDenied(
      `Your account is suspended${untilMsg}. Reason: ${user.suspension_reason || "Under review"}`
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
