import { APIError } from "encore.dev/api";
import db from "../db";

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  keyPrefix: string;     // Prefix for rate limit key
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // Auth endpoints - strict limits
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "rl:login" },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "rl:register" },
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "rl:pwreset" },
  verification: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "rl:verify" },

  // API endpoints - moderate limits
  api: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: "rl:api" },
  search: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "rl:search" },
  booking: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: "rl:booking" },
  
  // File uploads - strict limits
  upload: { windowMs: 60 * 60 * 1000, maxRequests: 20, keyPrefix: "rl:upload" },
};

// In-memory rate limit store (for development/single instance)
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: Date }>();

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = new Date();

  const existing = rateLimitStore.get(key);

  if (existing && existing.resetTime > now) {
    // Still within window
    if (existing.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime,
      };
    }

    existing.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - existing.count,
      resetTime: existing.resetTime,
    };
  }

  // New window or expired
  const resetTime = new Date(now.getTime() + config.windowMs);
  rateLimitStore.set(key, { count: 1, resetTime });

  return {
    allowed: true,
    remaining: config.maxRequests - 1,
    resetTime,
  };
}

// Middleware function to apply rate limiting
export async function applyRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<void> {
  const result = await checkRateLimit(identifier, config);

  if (!result.allowed) {
    await logRateLimitEvent(identifier, config.keyPrefix, true);
    const retryAfter = Math.ceil((result.resetTime.getTime() - Date.now()) / 1000);
    throw APIError.resourceExhausted(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`
    );
  }
}

// Overloaded checkRateLimit for string-based endpoint lookups
export async function checkRateLimitByEndpoint(
  identifier: string,
  endpoint: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[endpoint];
  return checkRateLimit(identifier, config);
}

// Get client identifier from request (IP or user ID)
export function getClientIdentifier(
  ipAddress: string | undefined,
  userId: string | undefined
): string {
  return userId || ipAddress || "unknown";
}

// Clean up expired entries periodically
setInterval(() => {
  const now = new Date();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

// Log rate limit events for monitoring
export async function logRateLimitEvent(
  identifier: string,
  endpoint: string,
  blocked: boolean
): Promise<void> {
  try {
    await db.exec`
      INSERT INTO rate_limit_logs (identifier, endpoint, blocked, created_at)
      VALUES (${identifier}, ${endpoint}, ${blocked}, NOW())
    `;
  } catch (error) {
    // Don't fail the request if logging fails
    console.error("Failed to log rate limit event:", error);
  }
}
