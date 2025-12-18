import { secret } from "encore.dev/config";

// Required secrets - will throw if not set
const requiredSecrets = {
  JWTSecret: secret("JWTSecret"),
  StripeSecretKey: secret("StripeSecretKey"),
  StripeWebhookSecret: secret("StripeWebhookSecret"),
  ResendAPIKey: secret("ResendAPIKey"),
  AppURL: secret("AppURL"),
};

// Optional secrets with defaults
const optionalSecrets = {
  MapboxAPIKey: secret("MapboxAPIKey"),
  OnfidoAPIKey: secret("OnfidoAPIKey"),
  VapidPublicKey: secret("VapidPublicKey"),
  VapidPrivateKey: secret("VapidPrivateKey"),
};

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required secrets
  for (const [name, getter] of Object.entries(requiredSecrets)) {
    try {
      const value = getter();
      if (!value || value.trim() === "") {
        errors.push(`Missing required secret: ${name}`);
      }
    } catch (error) {
      errors.push(`Failed to read secret: ${name}`);
    }
  }

  // Validate secret formats
  try {
    const stripeKey = requiredSecrets.StripeSecretKey();
    if (stripeKey && !stripeKey.startsWith("sk_")) {
      errors.push("StripeSecretKey should start with 'sk_'");
    }
  } catch {}

  try {
    const appUrl = requiredSecrets.AppURL();
    if (appUrl && !appUrl.startsWith("http")) {
      errors.push("AppURL should be a valid URL starting with http:// or https://");
    }
  } catch {}

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Get environment info for debugging
export function getEnvironmentInfo(): {
  environment: string;
  hasPaymentKeys: boolean;
  hasEmailKeys: boolean;
  hasMapsKeys: boolean;
  hasKycKeys: boolean;
  hasPushKeys: boolean;
} {
  return {
    environment: process.env.NODE_ENV || "development",
    hasPaymentKeys: !!safeGetSecret(requiredSecrets.StripeSecretKey),
    hasEmailKeys: !!safeGetSecret(requiredSecrets.ResendAPIKey),
    hasMapsKeys: !!safeGetSecret(optionalSecrets.MapboxAPIKey),
    hasKycKeys: !!safeGetSecret(optionalSecrets.OnfidoAPIKey),
    hasPushKeys: !!safeGetSecret(optionalSecrets.VapidPublicKey) && !!safeGetSecret(optionalSecrets.VapidPrivateKey),
  };
}

function safeGetSecret(getter: () => string): string | null {
  try {
    return getter();
  } catch {
    return null;
  }
}

// Runtime validation (called on service startup)
export function validateOnStartup(): void {
  const { valid, errors } = validateEnvironment();
  
  if (!valid) {
    console.error("❌ Environment validation failed:");
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot start in production with invalid environment configuration");
    } else {
      console.warn("⚠️ Running in development mode with incomplete configuration");
    }
  } else {
    console.log("✅ Environment configuration validated successfully");
  }
}

