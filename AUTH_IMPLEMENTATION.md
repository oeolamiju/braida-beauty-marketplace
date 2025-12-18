# Braida Authentication & Onboarding System

## Overview
Complete authentication and onboarding system for Braida Beauty Marketplace with role-based access control (RBAC) and email/phone verification.

## Setup Instructions

### Required Secrets
Configure these secrets in Settings:
- `JWTSecret` - Secret key for JWT token signing (e.g., a random 64-character string)
- `AppURL` - Frontend URL (e.g., `https://braida-beauty-marketplace-d50ae8k82vjju34hfq70.lp.dev`)

### Database Migrations
The system automatically creates these tables:
- `verification_tokens` - Email/SMS verification tokens
- `password_reset_tokens` - Password reset tokens
- `sessions` - User session tracking
- Adds `password_hash` column to `users` table

## Features Implemented

### 1. User Registration (`/auth/register`)
- **Fields**: firstName, lastName, email OR phone, password, role (CLIENT/FREELANCER)
- **Validation**:
  - Email format validation
  - Strong password requirements (8+ chars, uppercase, lowercase, number, special char)
  - Prevents duplicate email/phone accounts
- **Flow**:
  - User registers → Account created with `is_verified=false`
  - Verification token generated and sent via email or SMS
  - User redirected to verification page

### 2. Account Verification (`/auth/verify`)
- **Token-based verification**:
  - Email verification links with embedded tokens
  - SMS OTP codes
- **Verification enforcement**:
  - Clients cannot book services until verified
  - Freelancers cannot:
    - Create services
    - Accept bookings
    - Submit verification for profile
- **UI**: Verification banner shown to unverified users with resend option

### 3. Login (`/auth/login`)
- **Credentials**: Email or phone + password
- **Validation**:
  - Only verified users can log in
  - Generic error messages (no account existence hints)
- **Role-based routing**:
  - CLIENT → `/client/discover`
  - FREELANCER → `/freelancer/dashboard`
  - ADMIN → `/admin/users`
- **Returns**: JWT token + session cookie + user data

### 4. Password Reset
- **Request reset** (`/auth/forgot-password`):
  - User enters email
  - Time-limited token sent via email (60 min expiry)
  - Generic success message (no account existence hints)
- **Reset password** (`/auth/reset-password`):
  - User follows link with token
  - Sets new password with same validation rules
  - Token invalidated after use

## Backend API Endpoints

### Public Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/verify` - Verify account with token
- `POST /auth/resend-verification` - Resend verification email/SMS
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/logout` - Logout user

### Protected Endpoints
- `GET /auth/me` - Get current user info (requires auth)

## RBAC Middleware

Located in `/backend/auth/middleware.ts`:

```typescript
// Basic role checks
requireRole(...roles: string[])
requireVerified()

// Convenience methods
requireClient()
requireFreelancer()
requireAdmin()
requireVerifiedClient()
requireVerifiedFreelancer()
```

### Usage Example
```typescript
import { requireVerifiedFreelancer } from "../auth/middleware";

export const create = api(
  { auth: true, expose: true, method: "POST", path: "/services" },
  async (req) => {
    requireVerifiedFreelancer(); // Blocks unverified freelancers
    // ... rest of endpoint logic
  }
);
```

## Frontend Components

### Auth Pages
- `/auth/register` - Registration form with role selection
- `/auth/login` - Login form with password reset link
- `/auth/verify` - Verification code entry with resend
- `/auth/forgot-password` - Email entry for reset link
- `/auth/reset-password` - New password entry form

### Protected Layouts
All layouts (`ClientLayout`, `FreelancerLayout`, `AdminLayout`) include:
- Auth state check (redirects to login if not authenticated)
- Role validation (redirects if wrong role)
- Verification banner for unverified users

### Verification Banner Component
- Shows on all client/freelancer pages when unverified
- Includes "Resend Verification" button
- Dismissible but persists across page loads until verified

## Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&#)

### Token Security
- JWT tokens expire after 30 days
- Verification tokens expire after 24 hours
- Password reset tokens expire after 60 minutes
- All tokens invalidated after single use
- Bcrypt password hashing with salt rounds = 10

### Authentication Flow
1. User logs in → JWT token generated with user data
2. Token stored in localStorage + HTTP-only secure cookie
3. Token sent with all authenticated requests
4. Backend validates token and extracts auth data
5. RBAC middleware enforces role + verification checks

## Testing the System

### Manual Testing Steps

1. **Register a new user**:
   ```
   Navigate to /auth/register
   Fill form → Submit
   Check console logs for verification token
   ```

2. **Verify account**:
   ```
   Copy token from console
   Navigate to /auth/verify
   Enter token → Submit
   Should redirect to role-specific dashboard
   ```

3. **Test protected actions**:
   ```
   Try creating a service as unverified freelancer → Should fail
   Verify account → Try again → Should succeed
   ```

4. **Test password reset**:
   ```
   Navigate to /auth/forgot-password
   Enter email → Submit
   Check console for reset token
   Navigate to link → Set new password
   Login with new password
   ```

### Creating Admin Users
Admins must be created manually in the database:
```sql
INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_verified)
VALUES (
  'admin_001',
  'Admin',
  'User',
  'admin@braida.com',
  -- Use bcrypt to hash password
  '$2a$10$hashedpassword',
  'ADMIN',
  true
);
```

## Acceptance Criteria ✅

- [x] Registration with email/phone validation
- [x] Strong password validation
- [x] Duplicate account prevention
- [x] Email/SMS verification system
- [x] Verification enforcement for key actions:
  - [x] Freelancers blocked from creating services
  - [x] Freelancers blocked from accepting bookings
  - [x] Clients blocked from booking until verified
- [x] Login with verification check
- [x] Role-based routing after login
- [x] Password reset flow with time-limited tokens
- [x] RBAC middleware for route protection
- [x] Verification banner UI component
- [x] All auth UI screens implemented
- [x] Build passes successfully

## Notification System

Currently using console.log for notifications. To implement real email/SMS:

1. Update `/backend/auth/notifications.ts`
2. Integrate with email service (SendGrid, AWS SES, etc.)
3. Integrate with SMS service (Twilio, AWS SNS, etc.)
4. Add service API keys as secrets

Example SendGrid integration:
```typescript
import sgMail from '@sendgrid/mail';

const sendGridApiKey = secret("SendGridApiKey");
sgMail.setApiKey(sendGridApiKey());

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${appUrl()}/auth/verify?token=${token}`;
  await sgMail.send({
    to: email,
    from: 'noreply@braida.com',
    subject: 'Verify your Braida account',
    html: `Click here to verify: <a href="${verificationUrl}">${verificationUrl}</a>`,
  });
}
```

## Next Steps

1. **Add email/SMS provider integration** for real notifications
2. **Add rate limiting** to prevent verification spam
3. **Add CAPTCHA** to registration form
4. **Implement refresh tokens** for better security
5. **Add 2FA support** for enhanced security
6. **Add session management** dashboard for users
7. **Implement account deletion** flow
8. **Add audit logging** for security events
