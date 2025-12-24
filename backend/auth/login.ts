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
    role: string;
    roles: string[];
    activeRole: string;
    isVerified: boolean;
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
      roles: string[];
      active_role: string;
      is_verified: boolean;
      status: string;
    }>`
      SELECT id, first_name, last_name, email, phone, password_hash, role, roles, active_role, is_verified, status
      FROM users
      WHERE LOWER(email) = LOWER(${req.emailOrPhone}) OR phone = ${req.emailOrPhone}
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

    const roles = user.roles || [user.role];
    const activeRole = user.active_role || user.role;

    const token = generateToken({
      userId: user.id,
      email: user.email || user.phone || "",
      roles: roles,
      activeRole: activeRole,
      isVerified: user.is_verified,
    });

    // Log successful login
    await logAuditEvent({
      eventType: "user_login",
      userId: user.id,
      details: { role: user.role },
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
        roles: roles,
        activeRole: activeRole,
        isVerified: user.is_verified,
      },
    };
  }
);
