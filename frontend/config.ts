// Braida Beauty Marketplace - Frontend Configuration
// All values MUST be set via environment variables in production

// API Configuration - VITE_API_URL must be set in environment
// Fallback to Leap backend API URL for development
export const API_URL = import.meta.env.VITE_API_URL || "https://braida-beauty-marketplace-d50ae8k82vjju34hfq70.api.lp.dev";

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

// Mapbox Configuration
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// App Configuration
export const APP_NAME = "Braida Beauty Marketplace";
// APP_URL should match the frontend deployment URL
export const APP_URL = import.meta.env.VITE_APP_BASE_URL || "https://app.braida.co.uk";

// Feature Flags
export const ENABLE_PUSH_NOTIFICATIONS = import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === "true";
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";

// Warn in development if required env vars are missing
if (import.meta.env.DEV) {
  if (!import.meta.env.VITE_API_URL) {
    console.warn("[Config] VITE_API_URL not set, using staging fallback");
  }
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    console.warn("[Config] VITE_STRIPE_PUBLISHABLE_KEY not set, payments will not work");
  }
}