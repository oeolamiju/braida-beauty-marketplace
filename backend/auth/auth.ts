import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import jwt from "jsonwebtoken";
import { checkAccountStatus } from "./middleware";

const jwtSecret = secret("JWTSecret");

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export const auth = authHandler<AuthParams, AuthData>(async (data) => {
  const token = data.authorization?.replace("Bearer ", "") ?? (typeof data.session === "string" ? data.session : data.session?.value);
  if (!token) {
    throw APIError.unauthenticated("missing token");
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, jwtSecret()) as any;
  } catch (jwtErr) {
    console.error("[AUTH] JWT verification failed:", jwtErr);
    throw APIError.unauthenticated("invalid or expired token");
  }

  try {
    await checkAccountStatus(decoded.userId);
  } catch (statusErr: any) {
    console.error("[AUTH] Account status check failed:", statusErr);
    // If it's already an APIError, re-throw it (e.g., "account suspended")
    if (statusErr?.code) {
      throw statusErr;
    }
    throw APIError.unauthenticated("account verification failed");
  }

  return {
    userID: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    isVerified: decoded.isVerified,
  };
});

export const gw = new Gateway({ authHandler: auth });

export function generateToken(payload: {
  userId: string;
  email: string;
  role: string;
  isVerified: boolean;
}): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "30d" });
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
