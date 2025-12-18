# Schema Validation Examples

This document provides concrete examples of how to integrate Zod schema validation into existing API endpoints.

## Example 1: Simple GET Endpoint

**File:** `backend/bookings/get.ts`

```typescript
import { api } from "encore.dev/api";
import { validateResponse } from "../shared/validation";
import { getBookingResponseSchema } from "./schemas";
import db from "../db";

export interface GetBookingResponse {
  id: number;
  clientId: string;
  freelancerId: string;
  serviceId: number;
  serviceName: string;
  clientName: string;
  freelancerName: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  paymentStatus: string;
  locationType: string;
  // ... other fields
}

export const get = api<{ id: number }, GetBookingResponse>(
  { auth: true, expose: true, method: "GET", path: "/bookings/:id" },
  async ({ id }) => {
    const booking = await db.queryRow`
      SELECT 
        b.*,
        s.name as service_name,
        uc.name as client_name,
        uf.name as freelancer_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users uc ON b.client_id = uc.id
      JOIN users uf ON b.freelancer_id = uf.id
      WHERE b.id = ${id}
    `;

    if (!booking) {
      throw APIError.notFound("booking not found");
    }

    const response: GetBookingResponse = {
      id: booking.id,
      clientId: booking.client_id,
      freelancerId: booking.freelancer_id,
      serviceId: booking.service_id,
      serviceName: booking.service_name,
      clientName: booking.client_name,
      freelancerName: booking.freelancer_name,
      startDatetime: booking.start_datetime.toISOString(),
      endDatetime: booking.end_datetime.toISOString(),
      status: booking.status,
      paymentStatus: booking.payment_status,
      locationType: booking.location_type,
      clientAddressLine1: booking.client_address_line1,
      clientPostcode: booking.client_postcode,
      clientCity: booking.client_city,
      notes: booking.notes,
      priceBasePence: booking.price_base_pence,
      priceMaterialsPence: booking.price_materials_pence,
      priceTravelPence: booking.price_travel_pence,
      totalPricePence: booking.total_price_pence,
      createdAt: booking.created_at.toISOString(),
      expiresAt: booking.expires_at?.toISOString() || null,
      cancellationReason: booking.cancellation_reason,
      declineReason: booking.decline_reason,
    };

    // Validate response before returning
    return validateResponse(getBookingResponseSchema, response);
  }
);
```

## Example 2: POST Endpoint with Request and Response Validation

**File:** `backend/auth/login.ts`

```typescript
import { api, APIError } from "encore.dev/api";
import bcrypt from "bcryptjs";
import { validateRequest, validateResponse } from "../shared/validation";
import { loginRequestSchema, loginResponseSchema } from "./schemas";
import { generateToken } from "./auth";
import db from "../db";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
  };
}

export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    // Optional: Validate request
    validateRequest(loginRequestSchema, req);

    const user = await db.queryRow<{
      id: string;
      email: string;
      name: string;
      role: string;
      password_hash: string;
      is_verified: boolean;
    }>`
      SELECT id, email, name, role, password_hash, is_verified
      FROM users
      WHERE email = ${req.email}
    `;

    if (!user) {
      throw APIError.unauthenticated("invalid credentials");
    }

    const passwordValid = await bcrypt.compare(req.password, user.password_hash);
    if (!passwordValid) {
      throw APIError.unauthenticated("invalid credentials");
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.is_verified,
    });

    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.is_verified,
      },
    };

    // Validate response before returning
    return validateResponse(loginResponseSchema, response);
  }
);
```

## Example 3: List Endpoint with Pagination

**File:** `backend/services/list.ts`

```typescript
import { api } from "encore.dev/api";
import { validateRequest, validateResponse } from "../shared/validation";
import { listServicesRequestSchema, listServicesResponseSchema } from "./schemas";
import db from "../db";

export interface ListServicesRequest {
  freelancerId?: string;
  styleId?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ListServicesResponse {
  services: Array<{
    id: number;
    name: string;
    styleName: string;
    basePricePence: number;
    durationMinutes: number;
    isActive: boolean;
    averageRating: number | null;
    totalReviews: number;
  }>;
  total: number;
  page: number;
  limit: number;
}

export const list = api<ListServicesRequest, ListServicesResponse>(
  { expose: true, method: "GET", path: "/services" },
  async (req) => {
    // Validate request with defaults
    const validated = validateRequest(listServicesRequestSchema, req);
    
    const page = validated.page;
    const limit = validated.limit;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params: any[] = [];

    if (validated.freelancerId) {
      whereConditions.push(`s.freelancer_id = $${params.length + 1}`);
      params.push(validated.freelancerId);
    }

    if (validated.styleId !== undefined) {
      whereConditions.push(`s.style_id = $${params.length + 1}`);
      params.push(validated.styleId);
    }

    if (validated.isActive !== undefined) {
      whereConditions.push(`s.is_active = $${params.length + 1}`);
      params.push(validated.isActive);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const services = await db.query`
      SELECT 
        s.id,
        s.name,
        st.name as style_name,
        s.base_price_pence,
        s.duration_minutes,
        s.is_active,
        AVG(r.rating) as average_rating,
        COUNT(r.id) as total_reviews
      FROM services s
      JOIN styles st ON s.style_id = st.id
      LEFT JOIN bookings b ON s.id = b.service_id
      LEFT JOIN reviews r ON b.id = r.booking_id AND r.is_removed = false
      ${whereClause}
      GROUP BY s.id, st.name
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM services s
      ${whereClause}
    `;

    const response: ListServicesResponse = {
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        styleName: s.style_name,
        basePricePence: s.base_price_pence,
        durationMinutes: s.duration_minutes,
        isActive: s.is_active,
        averageRating: s.average_rating ? parseFloat(s.average_rating) : null,
        totalReviews: parseInt(s.total_reviews),
      })),
      total: totalResult?.count || 0,
      page,
      limit,
    };

    // Validate response
    return validateResponse(listServicesResponseSchema, response);
  }
);
```

## Example 4: Complex Nested Response

**File:** `backend/admin/get_booking.ts`

```typescript
import { api, APIError } from "encore.dev/api";
import { requireAdmin } from "./middleware";
import { validateResponse } from "../shared/validation";
import { adminGetBookingResponseSchema } from "./schemas";
import db from "../db";

export interface AdminGetBookingResponse {
  id: number;
  clientId: string;
  freelancerId: string;
  serviceId: number;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  freelancerEmail: string;
  serviceName: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  paymentStatus: string;
  locationType: string;
  totalPricePence: number;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
}

export const getBooking = api<{ id: number }, AdminGetBookingResponse>(
  { auth: true, expose: true, method: "GET", path: "/admin/bookings/:id" },
  async ({ id }) => {
    requireAdmin();

    const booking = await db.queryRow`
      SELECT 
        b.*,
        s.name as service_name,
        uc.name as client_name,
        uc.email as client_email,
        uf.name as freelancer_name,
        uf.email as freelancer_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users uc ON b.client_id = uc.id
      JOIN users uf ON b.freelancer_id = uf.id
      WHERE b.id = ${id}
    `;

    if (!booking) {
      throw APIError.notFound("booking not found");
    }

    const response: AdminGetBookingResponse = {
      id: booking.id,
      clientId: booking.client_id,
      freelancerId: booking.freelancer_id,
      serviceId: booking.service_id,
      clientName: booking.client_name,
      clientEmail: booking.client_email,
      freelancerName: booking.freelancer_name,
      freelancerEmail: booking.freelancer_email,
      serviceName: booking.service_name,
      startDatetime: booking.start_datetime.toISOString(),
      endDatetime: booking.end_datetime.toISOString(),
      status: booking.status,
      paymentStatus: booking.payment_status,
      locationType: booking.location_type,
      totalPricePence: booking.total_price_pence,
      notes: booking.notes,
      cancellationReason: booking.cancellation_reason,
      createdAt: booking.created_at.toISOString(),
    };

    return validateResponse(adminGetBookingResponseSchema, response);
  }
);
```

## Example 5: Using Schema Type Inference

**File:** `backend/bookings/types.ts`

```typescript
import { z } from "zod";
import {
  createBookingRequestSchema,
  createBookingResponseSchema,
  getBookingResponseSchema,
  listBookingsRequestSchema,
  listBookingsResponseSchema,
} from "./schemas";

// Infer TypeScript types from Zod schemas
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;
export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
export type GetBookingResponse = z.infer<typeof getBookingResponseSchema>;
export type ListBookingsRequest = z.infer<typeof listBookingsRequestSchema>;
export type ListBookingsResponse = z.infer<typeof listBookingsResponseSchema>;
```

Then in your endpoint:

```typescript
import { api } from "encore.dev/api";
import { validateResponse } from "../shared/validation";
import { createBookingResponseSchema } from "./schemas";
import type { CreateBookingRequest, CreateBookingResponse } from "./types";

export const create = api<CreateBookingRequest, CreateBookingResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings" },
  async (req) => {
    // Implementation...
    
    const response: CreateBookingResponse = {
      // ... build response
    };

    return validateResponse(createBookingResponseSchema, response);
  }
);
```

## Key Patterns

### 1. Always Map Database Fields to API Response

```typescript
// Good - explicit mapping
const response = {
  id: dbRow.id,
  name: dbRow.name,
  createdAt: dbRow.created_at.toISOString(),
};

// Bad - direct return without mapping
return dbRow; // Field names won't match schema
```

### 2. Handle Nullable Fields Correctly

```typescript
// Good
const response = {
  bio: user.bio || null,
  phoneNumber: user.phone_number || null,
};

// Schema
z.object({
  bio: z.string().nullable(),
  phoneNumber: z.string().nullable(),
});
```

### 3. Convert Dates to ISO Strings

```typescript
// Good
const response = {
  createdAt: booking.created_at.toISOString(),
  expiresAt: booking.expires_at?.toISOString() || null,
};

// Schema
z.object({
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
});
```

### 4. Parse Numbers Correctly

```typescript
// Good
const response = {
  averageRating: dbRow.avg_rating ? parseFloat(dbRow.avg_rating) : null,
  totalReviews: parseInt(dbRow.review_count),
};

// Schema
z.object({
  averageRating: z.number().min(0).max(5).nullable(),
  totalReviews: z.number().int().nonnegative(),
});
```
