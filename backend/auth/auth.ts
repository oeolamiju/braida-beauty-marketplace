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

  try {
    const decoded = jwt.verify(token, jwtSecret()) as any;

    await checkAccountStatus(decoded.userId);

    return {
      userID: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isVerified: decoded.isVerified,
    };
  } catch (err) {
    throw APIError.unauthenticated("invalid token", err as Error);
  }
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
