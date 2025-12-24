import { api, APIError } from "encore.dev/api";
import bcrypt from "bcryptjs";
import db from "../db";
import { RATE_LIMITS, applyRateLimit } from "../shared/rate_limiter";
import { trackEvent } from "../analytics/track";
import { sendVerificationEmail } from "./notifications";

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
  role?: "CLIENT" | "FREELANCER";
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/;

export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    // Rate limit registration by email or phone
    await applyRateLimit(req.email || req.phone || "unknown", RATE_LIMITS.register);
    if (!req.email && !req.phone) {
      throw APIError.invalidArgument("email or phone is required");
    }

    if (req.email && !EMAIL_REGEX.test(req.email)) {
      throw APIError.invalidArgument("invalid email format");
    }

    if (req.password.length < PASSWORD_MIN_LENGTH) {
      throw APIError.invalidArgument(
        `password must be at least ${PASSWORD_MIN_LENGTH} characters`
      );
    }

    if (!PASSWORD_REGEX.test(req.password)) {
      throw APIError.invalidArgument(
        "password must contain uppercase, lowercase, number, and special character"
      );
    }

    if (!req.firstName.trim() || !req.lastName.trim()) {
      throw APIError.invalidArgument("first name and last name are required");
    }

    const role = req.role || "CLIENT";
    if (role !== "CLIENT" && role !== "FREELANCER") {
      throw APIError.invalidArgument("role must be CLIENT or FREELANCER");
    }

    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM users 
      WHERE LOWER(email) = LOWER(${req.email || null})
         OR phone = ${req.phone || null}
    `;

    if (existing) {
      throw APIError.alreadyExists("account with this email or phone already exists");
    }

    const passwordHash = await bcrypt.hash(req.password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Initialize roles array based on registration role
    // Freelancers can also book as clients
    const initialRoles = role === "FREELANCER" 
      ? '["CLIENT", "FREELANCER"]'
      : '["CLIENT"]';
    
    await db.exec`
      INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, roles, active_role, is_verified)
      VALUES (${userId}, ${req.firstName}, ${req.lastName}, ${req.email || null}, ${req.phone || null}, ${passwordHash}, ${role}, ${initialRoles}::jsonb, ${role}, false)
    `;

    if (role === "FREELANCER") {
      await db.exec`
        INSERT INTO freelancer_profiles (
          user_id, display_name, location_area, postcode, travel_radius_miles, categories
        )
        VALUES (
          ${userId}, 
          ${req.firstName + ' ' + req.lastName}, 
          '', 
          '', 
          10, 
          '[]'::jsonb
        )
      `;
    }

    let emailSent = false;
    let verificationToken = '';
    let isDevelopmentMode = false;
    
    if (req.email) {
      verificationToken = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.exec`
        INSERT INTO verification_tokens (user_id, token, type, expires_at)
        VALUES (${userId}, ${verificationToken}, 'email_verification', ${expiresAt})
      `;

      try {
        await sendVerificationEmail(req.email, verificationToken);
        emailSent = true;
        console.log(`[REGISTRATION] Verification email sent successfully to ${req.email}`);
      } catch (error: any) {
        console.error("Failed to send verification email:", error);
        const errorMessage = error?.message || '';
        
        if (errorMessage.includes('ResendAPIKey not configured')) {
          isDevelopmentMode = true;
          console.log('\n========================================');
          console.log('DEVELOPMENT MODE - Email not configured');
          console.log('Verification Link:', `http://localhost:4000/auth/verify?token=${verificationToken}`);
          console.log('Or use this API call to verify manually:');
          console.log(`POST /auth/verify with body: {"token": "${verificationToken}"}`);
          console.log('========================================\n');
          
          await db.exec`
            UPDATE users SET is_verified = true WHERE id = ${userId}
          `;
          console.log(`[DEV MODE] User ${req.email} auto-verified for development`);
        }
      }
    }

    await trackEvent(userId, "signup_completed", { role: role });

    return {
      userId,
      message: req.email 
        ? (emailSent 
            ? "Registration successful. Please check your email to verify your account."
            : isDevelopmentMode
              ? "Registration successful. Development mode: Account auto-verified. You can now log in."
              : "Registration successful, but verification email could not be sent. Please use the 'Resend Verification Email' option on the login page.")
        : "Registration successful. You can now log in.",
    };
  }
);
