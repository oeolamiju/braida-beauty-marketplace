import { APIError } from "encore.dev/api";

// Email validation
export function validateEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    throw APIError.invalidArgument("Invalid email format");
  }
  
  if (trimmed.length > 254) {
    throw APIError.invalidArgument("Email too long");
  }
  
  return trimmed;
}

// Phone validation (UK format)
export function validatePhone(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");
  
  // UK phone patterns
  const ukPatterns = [
    /^(\+44|0044|44)?[1-9]\d{9,10}$/,  // Standard UK
    /^0[1-9]\d{8,10}$/,                  // Domestic
  ];
  
  if (!ukPatterns.some(p => p.test(cleaned))) {
    throw APIError.invalidArgument("Invalid UK phone number");
  }
  
  return cleaned;
}

// Password validation
export function validatePassword(password: string): void {
  if (password.length < 8) {
    throw APIError.invalidArgument("Password must be at least 8 characters");
  }
  
  if (password.length > 128) {
    throw APIError.invalidArgument("Password too long");
  }
  
  // Check for common patterns
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLower || !hasUpper || !hasNumber) {
    throw APIError.invalidArgument(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    );
  }
}

// Name validation
export function validateName(name: string): string {
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    throw APIError.invalidArgument("Name must be at least 2 characters");
  }
  
  if (trimmed.length > 100) {
    throw APIError.invalidArgument("Name too long");
  }
  
  // Only allow letters, spaces, hyphens, apostrophes
  if (!/^[\p{L}\s\-']+$/u.test(trimmed)) {
    throw APIError.invalidArgument("Name contains invalid characters");
  }
  
  return trimmed;
}

// Postcode validation (UK)
export function validatePostcode(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s/g, "");
  
  // UK postcode regex
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/;
  
  if (!postcodeRegex.test(cleaned)) {
    throw APIError.invalidArgument("Invalid UK postcode");
  }
  
  // Format with space
  return cleaned.replace(/^(.+)(\d[A-Z]{2})$/, "$1 $2");
}

// Sanitize text input (prevent XSS)
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Sanitize for database (prevent SQL injection - though we use parameterized queries)
export function sanitizeForDb(text: string): string {
  // Remove null bytes and other control characters
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

// Validate and sanitize URL
export function validateUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw APIError.invalidArgument("URL must use HTTP or HTTPS protocol");
    }
    
    return parsed.toString();
  } catch {
    throw APIError.invalidArgument("Invalid URL format");
  }
}

// Validate price in pence
export function validatePrice(pricePence: number): number {
  if (!Number.isInteger(pricePence)) {
    throw APIError.invalidArgument("Price must be a whole number (in pence)");
  }
  
  if (pricePence < 0) {
    throw APIError.invalidArgument("Price cannot be negative");
  }
  
  if (pricePence > 100000000) { // £1,000,000 max
    throw APIError.invalidArgument("Price exceeds maximum allowed");
  }
  
  return pricePence;
}

// Validate duration in minutes
export function validateDuration(minutes: number): number {
  if (!Number.isInteger(minutes)) {
    throw APIError.invalidArgument("Duration must be a whole number");
  }
  
  if (minutes < 15) {
    throw APIError.invalidArgument("Minimum duration is 15 minutes");
  }
  
  if (minutes > 720) { // 12 hours max
    throw APIError.invalidArgument("Maximum duration is 12 hours");
  }
  
  return minutes;
}

// Validate date/time
export function validateDateTime(dateString: string): Date {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw APIError.invalidArgument("Invalid date format");
  }
  
  return date;
}

// Validate future date
export function validateFutureDate(dateString: string, minHoursAhead: number = 1): Date {
  const date = validateDateTime(dateString);
  const minTime = Date.now() + minHoursAhead * 60 * 60 * 1000;
  
  if (date.getTime() < minTime) {
    throw APIError.invalidArgument(
      `Date must be at least ${minHoursAhead} hour(s) in the future`
    );
  }
  
  return date;
}

// Validate rating
export function validateRating(rating: number): number {
  if (!Number.isInteger(rating)) {
    throw APIError.invalidArgument("Rating must be a whole number");
  }
  
  if (rating < 1 || rating > 5) {
    throw APIError.invalidArgument("Rating must be between 1 and 5");
  }
  
  return rating;
}

// Validate pagination
export function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  const validPage = Math.max(1, Math.floor(page || 1));
  const validLimit = Math.min(100, Math.max(1, Math.floor(limit || 20)));
  
  return { page: validPage, limit: validLimit };
}

// Validate sort field against allowed list
export function validateSortField(field: string, allowedFields: string[]): string {
  if (!allowedFields.includes(field)) {
    throw APIError.invalidArgument(
      `Invalid sort field. Allowed: ${allowedFields.join(", ")}`
    );
  }
  return field;
}

// Validate sort order
export function validateSortOrder(order: string): "asc" | "desc" {
  const normalized = order.toLowerCase();
  if (normalized !== "asc" && normalized !== "desc") {
    throw APIError.invalidArgument("Sort order must be 'asc' or 'desc'");
  }
  return normalized;
}

