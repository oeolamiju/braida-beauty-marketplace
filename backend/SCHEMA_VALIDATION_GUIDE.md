# Zod Schema Validation Guide

This guide explains how to use Zod schemas for runtime type validation in the backend.

## Overview

All API responses now have corresponding Zod schemas that validate data at runtime, ensuring type safety between backend and frontend.

## Schema Files

Schemas are organized by service:

- `backend/shared/schemas.ts` - Common schemas and enums
- `backend/auth/schemas.ts` - Authentication endpoints
- `backend/bookings/schemas.ts` - Booking management
- `backend/services/schemas.ts` - Service listings
- `backend/profiles/schemas.ts` - User profiles
- `backend/payments/schemas.ts` - Payment processing
- `backend/payouts/schemas.ts` - Payout management
- `backend/reviews/schemas.ts` - Reviews and ratings
- `backend/disputes/schemas.ts` - Dispute resolution
- `backend/admin/schemas.ts` - Admin operations
- `backend/availability/schemas.ts` - Availability management
- `backend/search/schemas.ts` - Search functionality
- `backend/notifications/schemas.ts` - Notifications
- `backend/styles/schemas.ts` - Style management
- `backend/verification/schemas.ts` - Identity verification
- `backend/reports/schemas.ts` - Reporting system
- `backend/policies/schemas.ts` - Cancellation policies
- `backend/freelancers/schemas.ts` - Freelancer listings
- `backend/health/schemas.ts` - Health checks

## Usage Pattern

### 1. Import Schemas

```typescript
import { validateRequest, validateResponse } from "../shared/validation";
import { 
  createBookingRequestSchema, 
  createBookingResponseSchema 
} from "./schemas";
```

### 2. Validate Request (Optional)

```typescript
export const create = api<CreateBookingRequest, CreateBookingResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings" },
  async (req) => {
    // Optional: Validate request explicitly
    const validatedReq = validateRequest(createBookingRequestSchema, req);
    
    // ... business logic ...
  }
);
```

### 3. Validate Response (Recommended)

```typescript
export const create = api<CreateBookingRequest, CreateBookingResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings" },
  async (req) => {
    // ... business logic ...
    
    const response = {
      id: result.id,
      message: "Booking created successfully",
      requiresPayment: true,
      // ... other fields
    };
    
    // Validate response before returning
    return validateResponse(createBookingResponseSchema, response);
  }
);
```

## Benefits

1. **Type Safety**: Ensures responses match expected types at runtime
2. **Early Error Detection**: Catches type mismatches before reaching frontend
3. **Documentation**: Schemas serve as living documentation
4. **Frontend Safety**: TypeScript types are validated at runtime
5. **Debugging**: Clear error messages when validation fails

## Common Schemas

### Shared Enums

```typescript
import {
  userRoleSchema,
  bookingStatusSchema,
  paymentStatusSchema,
  locationTypeSchema,
  materialsPolicySchema,
  verificationStatusSchema,
  disputeStatusSchema,
  reportStatusSchema,
  notificationTypeSchema,
} from "../shared/schemas";
```

### Shared Primitives

```typescript
import {
  idSchema,              // number().int().positive()
  userIdSchema,          // string().min(1)
  emailSchema,           // string().email()
  passwordSchema,        // string().min(8)
  urlSchema,             // string().url()
  dateStringSchema,      // string().datetime()
  postcodeSchema,        // string().min(1)
  positiveIntSchema,     // number().int().positive()
  nonNegativeIntSchema,  // number().int().nonnegative()
  paginationSchema,      // { page, limit }
} from "../shared/schemas";
```

## Example: Complete Endpoint with Validation

```typescript
import { api } from "encore.dev/api";
import { validateResponse } from "../shared/validation";
import { getBookingResponseSchema } from "./schemas";
import type { GetBookingResponse } from "./schemas";

export const get = api<{ id: number }, GetBookingResponse>(
  { auth: true, expose: true, method: "GET", path: "/bookings/:id" },
  async ({ id }) => {
    // ... fetch booking from database ...
    
    const response = {
      id: booking.id,
      clientId: booking.client_id,
      freelancerId: booking.freelancer_id,
      serviceName: service.name,
      // ... map all fields ...
    };
    
    // Validate and return
    return validateResponse(getBookingResponseSchema, response);
  }
);
```

## Validation Functions

### `validateRequest<T>(schema, data)`

- Validates request data
- Throws `APIError.invalidArgument` on failure
- Returns typed data on success

### `validateResponse<T>(schema, data)`

- Validates response data
- Logs validation errors to console
- Throws regular `Error` on failure (to catch during development)
- Returns typed data on success

## Error Handling

### Request Validation Errors

```typescript
// Throws APIError with details
{
  code: "invalid_argument",
  message: "Validation failed",
  details: {
    errors: [
      { field: "email", message: "Invalid email address" },
      { field: "price", message: "Must be a positive integer" }
    ]
  }
}
```

### Response Validation Errors

```typescript
// Logs to console and throws Error
console.error("Response validation failed:", {
  errors: [...],
  data: {...}
});
// Throws: Error("Response validation failed: ...")
```

## Migration Strategy

To add validation to existing endpoints:

1. Import the relevant schemas from `./schemas.ts`
2. Import `validateResponse` from `../shared/validation`
3. Wrap the return value with `validateResponse(schema, response)`
4. Run tests to catch any mismatches
5. Fix data mapping issues

## Testing

Schemas are automatically tested when you:

1. Run the build: `npm run build`
2. Call APIs via ApiCall tool
3. Run integration tests

## Best Practices

1. **Always validate responses** in production code
2. **Validate requests** when dealing with complex input
3. **Use shared schemas** to avoid duplication
4. **Export TypeScript types** from schemas when needed
5. **Keep schemas in sync** with TypeScript interfaces
6. **Log validation failures** for debugging

## TypeScript Types from Schemas

You can infer TypeScript types from Zod schemas:

```typescript
import { z } from "zod";
import { createBookingResponseSchema } from "./schemas";

export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
```

This ensures your TypeScript types and runtime schemas are always in sync.
