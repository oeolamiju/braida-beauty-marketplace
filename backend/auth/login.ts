import { api, APIError, Cookie } from "encore.dev/api";
import bcrypt from "bcryptjs";
import db from "../db";
import { generateToken } from "./auth";
import { RATE_LIMITS, applyRateLimit } from "../shared/rate_limiter";
import { logAuditEvent } from "../shared/audit_logger";

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  session: Cookie<"session">;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    role: string;           // Primary/active role (for backward compatibility)
    roles: string[];        // All roles user has
    activeRole: string;     // Currently active role
    isVerified: boolean;
    hasFreelancerProfile: boolean;
  };
}

export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    await applyRateLimit(req.emailOrPhone, RATE_LIMITS.login);
    const user = await db.queryRow<{
      id: string;
      first_name: string;
      last_name: string;
      email: string | null;
      phone: string | null;
      password_hash: string | null;
      role: string;
      roles: string[] | null;
      active_role: string | null;
      is_verified: boolean;
      status: string;
      has_freelancer_profile: boolean;
    }>`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.password_hash, 
        u.role, u.roles, u.active_role, u.is_verified, u.status,
        EXISTS(SELECT 1 FROM freelancer_profiles fp WHERE fp.user_id = u.id) as has_freelancer_profile
      FROM users u
      WHERE LOWER(u.email) = LOWER(${req.emailOrPhone}) OR u.phone = ${req.emailOrPhone}
    `;

    if (!user || !user.password_hash) {
      await logAuditEvent({
        eventType: "user_login_failed",
        details: { reason: "user_not_found", identifier: req.emailOrPhone },
      });
      throw APIError.notFound(
        "No account found with this email or phone. Please register to create an account."
      );
    }

    const isValidPassword = await bcrypt.compare(req.password, user.password_hash);
    if (!isValidPassword) {
      await logAuditEvent({
        eventType: "user_login_failed",
        userId: user.id,
        details: { reason: "invalid_password" },
      });
      throw APIError.unauthenticated("invalid credentials");
    }

    if (!user.is_verified) {
      throw APIError.permissionDenied("Please verify your account before signing in. Check your email for the verification link.");
    }

    if (user.status === "suspended") {
      throw APIError.permissionDenied("account suspended. Please contact support.");
    }

    // Parse roles - fallback to single role if roles array not yet populated
    const userRoles: string[] = user.roles || [user.role];
    const activeRole = user.active_role || user.role;

    const token = generateToken({
      userId: user.id,
      email: user.email || user.phone || "",
      role: activeRole,
      isVerified: user.is_verified,
    });

    // Log successful login
    await logAuditEvent({
      eventType: "user_login",
      userId: user.id,
      details: { role: activeRole, roles: userRoles },
    });

    // Update last login timestamp
    await db.exec`
      UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}
    `;

    return {
      token,
      session: {
        value: token,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: ".lp.dev",
      },
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: activeRole,
        roles: userRoles,
        activeRole: activeRole,
        isVerified: user.is_verified,
        hasFreelancerProfile: user.has_freelancer_profile,
      },
    };
  }
);
