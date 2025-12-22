// Braida Beauty Marketplace - Frontend Configuration
// All values can be overridden via environment variables

// API Configuration - Hardcoded for production
export const API_URL = "https://staging-braida-beauty-marketplace-vrc2.encr.app";

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51SJWKzPWaiD9PFTK4WdKZCnEZpjR7eLRsmIBm6y2SrCRZPc7USecnBixQEa9UEjo5lR1IRf6aN4ZBpvM31f4btty00lMWmfykF";

// Mapbox Configuration
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// App Configuration
export const APP_NAME = "Braida Beauty Marketplace";
export const APP_URL = import.meta.env.VITE_APP_URL || "https://braida.uk";

// Feature Flags
export const ENABLE_PUSH_NOTIFICATIONS = import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === "true";
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
