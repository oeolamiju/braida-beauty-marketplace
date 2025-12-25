import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "./auth";
import db from "../db";

export async function checkAccountStatus(userId: string): Promise<void> {
  // Query only the basic status column that always exists
  const user = await db.queryRow<{
    status: string;
  }>`
    SELECT status
    FROM users
    WHERE id = ${userId}
  `;

  if (!user) {
    throw APIError.unauthenticated("session expired", new Error("user not found"));
  }

  // Check if account is suspended via the status enum
  if (user.status === "suspended") {
    throw APIError.permissionDenied("Your account is suspended. Please contact support.");
  }
}

export function requireRole(...allowedRoles: string[]): void {
  const auth = getAuthData() as AuthData | null;

  if (!auth) {
    throw APIError.unauthenticated("authentication required");
  }

  const allowedRolesUpper = allowedRoles.map(r => r.toUpperCase());
  const hasRole = auth.roles?.some(r => allowedRolesUpper.includes(r?.toUpperCase())) ?? allowedRolesUpper.includes(auth.role?.toUpperCase());
  
  if (!hasRole) {
    throw APIError.permissionDenied(
      `access denied. Required roles: ${allowedRoles.join(", ")}`
    );
  }
}

export function requireActiveRole(...allowedRoles: string[]): void {
  const auth = getAuthData() as AuthData | null;

  if (!auth) {
    throw APIError.unauthenticated("authentication required");
  }

  const activeRole = auth.activeRole || auth.role;
  const allowedRolesUpper = allowedRoles.map(r => r.toUpperCase());
  if (!allowedRolesUpper.includes(activeRole?.toUpperCase())) {
    throw APIError.permissionDenied(
      `access denied. This action requires active role: ${allowedRoles.join(" or ")}. Current active role: ${activeRole}`
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
