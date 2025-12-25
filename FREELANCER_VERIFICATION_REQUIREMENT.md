# Freelancer Verification Requirement

## Overview
This document describes the implementation of the freelancer verification requirement that ensures clients cannot switch to freelancer mode until their profile has been set up and verified by an admin.

## Changes Made

### 1. Backend - Role Switching Validation (`backend/auth/switch_role.ts`)
**Added verification check when switching to FREELANCER role:**
- Checks if a freelancer profile exists for the user
- Validates that the profile's `verification_status` is `verified`
- Throws descriptive errors if:
  - No freelancer profile exists
  - Profile exists but is not verified (showing current status)

**Error Messages:**
- "freelancer profile not found. Please complete your freelancer profile setup first"
- "freelancer profile is not verified. Current status: {status}. Your profile must be verified by an admin before you can switch to freelancer mode"

### 2. Backend - Become Freelancer Flow (`backend/auth/become_freelancer.ts`)
**Modified to prevent automatic role activation:**
- Creates freelancer profile with `verification_status = 'unverified'`
- Adds `FREELANCER` to user's roles array
- **Does NOT switch active_role to FREELANCER** (stays as CLIENT)
- Returns token with current active role (CLIENT)
- Updated success message to inform user about verification requirement

**New Response Message:**
"Freelancer profile created! Your profile will be reviewed by our admin team. You'll be able to switch to freelancer mode once your profile is verified."

### 3. Backend - Verification Notifications
**Added new notification types (`backend/notifications/types.ts`):**
- `verification_approved` - Sent when admin approves profile
- `verification_rejected` - Sent when admin rejects profile

**Updated Admin Verification Endpoints:**

#### `backend/verification/admin_approve.ts`
- Sends notification when profile is approved
- Title: "Profile Verified! 🎉"
- Message: "Your freelancer profile has been verified! You can now switch to freelancer mode and start accepting bookings."

#### `backend/verification/admin_reject.ts`
- Sends notification when profile is rejected
- Title: "Profile Verification Update"
- Message: Includes rejection reason from admin

**Database Migration (`055_verification_notifications.up.sql`):**
- Added notification preference columns for verification events
- Both default to TRUE (enabled)

### 4. Frontend - Role Switcher Component (`frontend/components/RoleSwitcher.tsx`)
**Enhanced error handling:**
- Detects verification-related errors
- Shows user-friendly message: "Your freelancer profile must be verified by an admin before you can switch to freelancer mode."
- Distinguishes between verification errors and other errors

### 5. Frontend - Become Freelancer Page (`frontend/pages/BecomeFreelancerPage.tsx`)
**Updated post-submission flow:**
- Changed success message to reflect verification requirement
- Redirects to `/client/discover` instead of `/freelancer/dashboard`
- Maintains CLIENT as active role after profile creation
- Updated toast notification to emphasize pending verification

## User Flow

### For New Freelancers:

1. **Client creates account** → Role: CLIENT
2. **Client completes "Become Freelancer" form** → 
   - Freelancer profile created with `verification_status = 'unverified'`
   - User now has roles: [CLIENT, FREELANCER]
   - Active role remains: CLIENT
3. **Client sees notification**: "Profile created and is pending verification"
4. **Client attempts to switch to freelancer mode** → 
   - ❌ Blocked with message about verification requirement
5. **Admin reviews and approves profile** → 
   - Profile status updated to `verified`
   - User receives notification: "Profile Verified! 🎉"
6. **Client can now switch to freelancer mode** → 
   - ✅ Allowed to switch
   - Active role changes to FREELANCER
   - Redirected to freelancer dashboard

### For Rejected Profiles:

1. **Admin rejects profile** →
   - Profile status updated to `rejected`
   - User receives notification with rejection reason
2. **User can resubmit verification** (existing flow)

## Security Benefits

1. **Quality Control**: Ensures only verified freelancers can offer services
2. **Fraud Prevention**: Admin review prevents fake or malicious profiles
3. **Platform Integrity**: Maintains trust by requiring approval before freelancers can accept bookings
4. **Clear Communication**: Users are informed at every step about their verification status

## Technical Implementation

### Database Fields Used:
- `users.roles` (TEXT[]) - Array of user roles
- `users.active_role` (TEXT) - Currently active role
- `freelancer_profiles.verification_status` (ENUM) - Values: 'unverified', 'pending', 'verified', 'rejected'

### API Endpoints Modified:
- `POST /auth/become-freelancer` - Creates profile without activating role
- `POST /auth/switch-role` - Validates verification status
- `POST /verification/admin/approve` - Sends approval notification
- `POST /verification/admin/reject` - Sends rejection notification

## Testing Recommendations

1. **Test case: Client tries to switch before profile creation**
   - Expected: Error about missing profile

2. **Test case: Client tries to switch with unverified profile**
   - Expected: Error about verification requirement

3. **Test case: Client tries to switch with rejected profile**
   - Expected: Error about verification requirement

4. **Test case: Client tries to switch with verified profile**
   - Expected: Success, role switches to FREELANCER

5. **Test case: Admin approves profile**
   - Expected: User receives verification_approved notification

6. **Test case: Admin rejects profile**
   - Expected: User receives verification_rejected notification
