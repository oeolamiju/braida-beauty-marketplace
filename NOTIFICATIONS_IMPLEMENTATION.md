# Notifications System Implementation

## Overview
Comprehensive notifications system with both in-app and email notifications for the Braida Beauty Marketplace platform.

## Features Implemented

### 1. Email Service Integration
- **File**: `backend/notifications/email_service.ts`
- **Provider**: Resend (configured via `ResendAPIKey` secret)
- **Email Templates**:
  - New booking request (to freelancer)
  - Booking accepted/confirmed (to client)
  - Booking declined (to client)
  - Booking reminders (24h and 2h before)
  - Payment receipt
  - Refund confirmation
  - Payout confirmation
  - Review reminder

### 2. Notification Types
All notification types defined in `backend/notifications/types.ts`:

**Booking Notifications**:
- `new_booking_request` - Freelancer receives new booking
- `booking_confirmed` - Client's booking is accepted
- `booking_declined` - Client's booking is declined
- `booking_cancelled` - Booking is cancelled
- `booking_expired` - Booking request expired
- `booking_reminder` - 24h and 2h reminders before booking
- `booking_reschedule_requested` - Reschedule requested
- `booking_rescheduled` - Booking rescheduled
- `booking_reschedule_rejected` - Reschedule rejected

**Payment Notifications** (Critical - cannot be disabled):
- `booking_paid` - Payment received for booking
- `payment_confirmed` - Payment successfully processed
- `payment_failed` - Payment failed
- `payment_released` - Payment released to freelancer
- `booking_refunded` - Refund processed

**Other Notifications**:
- `review_reminder` - Reminder to leave review after service
- `service_auto_confirmed` - Service auto-confirmed after 24h
- `message_received` - New message received
- `dispute_raised` - New dispute created
- `dispute_needs_review` - Admin needs to review dispute
- `dispute_resolved` - Dispute resolved

### 3. Database Schema
**Migration**: `backend/db/migrations/022_notification_preferences_update.up.sql`

Added notification preference columns for all new notification types plus:
- `email_enabled` - Master toggle for email notifications (critical notifications always sent)

### 4. Notification Triggers

#### Booking Events
**Files Updated**:
- `backend/bookings/create.ts` - New booking request email to freelancer
- `backend/bookings/accept.ts` - Booking confirmed email to client
- `backend/bookings/decline.ts` - Booking declined email to client

#### Payment Events
**File Updated**: `backend/payments/webhook.ts`
- Payment success → Receipt email to client
- Payment refund → Refund email to client

### 5. Scheduled Notifications

#### Booking Reminders
**File**: `backend/notifications/send_reminders.ts`
- Two cron jobs running every 10 minutes:
  - 24-hour reminder before booking
  - 2-hour reminder before booking
- Prevents duplicate reminders via database check
- Sends to both client and freelancer

#### Review Reminders
**File**: `backend/notifications/send_review_reminders.ts`
- Cron job running every hour
- Sends reminder 24h after booking completion
- Only if no review exists
- Prevents duplicates

### 6. Notification Preferences

#### Backend API
**Files**:
- `backend/notifications/get_preferences.ts` - Get user preferences
- `backend/notifications/update_preferences.ts` - Update preferences

**Features**:
- Individual toggles for each notification type
- Master email toggle (`email_enabled`)
- Critical payment notifications always sent (cannot be disabled)
- Auto-creates default preferences on first access

#### Frontend UI
**File**: `frontend/pages/NotificationSettings.tsx`

**Features**:
- Grouped notification settings by category
- Clear indication of critical notifications
- Master email toggle at top
- Real-time updates with optimistic UI
- Toast notifications for save confirmation

### 7. In-App Notifications

#### Existing Components (Already Implemented)
- `frontend/components/NotificationBell.tsx` - Bell icon with unread count
- `frontend/contexts/NotificationContext.tsx` - Real-time notification context
- `backend/notifications/stream.ts` - WebSocket streaming for real-time updates

## Configuration Required

### Environment Setup
1. **Resend API Key**:
   - Go to Settings in the sidebar
   - Add secret: `ResendAPIKey`
   - Get key from https://resend.com/api-keys

2. **Email Domain**:
   - Current: `notifications@braida.beauty`
   - Update in `backend/notifications/email_service.ts` if needed

## Email Templates
All emails include:
- Branded header
- Clear call-to-action button
- Direct link to relevant page
- Footer with copyright
- Responsive HTML design

## Critical Notification Policy
Payment-related notifications are marked as critical and ALWAYS sent via email, regardless of user preferences:
- `booking_paid`
- `payment_confirmed`
- `payment_failed`
- `payment_released`
- `booking_refunded`

This ensures users never miss important financial updates.

## Testing

### To Test Email Notifications:
1. Configure ResendAPIKey secret
2. Create a booking as client
3. Accept booking as freelancer
4. Verify emails received

### To Test Scheduled Reminders:
1. Create a booking for 24 hours in the future
2. Wait for cron job to run (every 10 minutes)
3. Verify reminder notification and email

### To Test Review Reminders:
1. Complete a booking
2. Mark as completed (24h after end time)
3. Wait for cron job (every 1 hour)
4. Verify review reminder

## Known Issues

### Pre-existing TypeScript Errors
The `disputes` module has pre-existing TypeScript errors unrelated to this notification implementation:
- Database query syntax errors
- Type mismatches with sendNotification
- These should be addressed separately

See `/DISPUTE_TYPESCRIPT_FIXES_NEEDED.md` for details.

## Files Created
- `/backend/notifications/email_service.ts` - Email templates and sending
- `/backend/notifications/send_reminders.ts` - Booking reminder cron jobs
- `/backend/notifications/send_review_reminders.ts` - Review reminder cron job
- `/backend/db/migrations/022_notification_preferences_update.up.sql` - Schema update

## Files Modified
- `/backend/notifications/types.ts` - Added new notification types
- `/backend/notifications/send.ts` - Added email sending logic
- `/backend/notifications/get_preferences.ts` - Added all preference fields
- `/backend/notifications/update_preferences.ts` - Added all preference fields
- `/backend/bookings/create.ts` - Added booking request email
- `/backend/bookings/accept.ts` - Added booking confirmed email
- `/backend/bookings/decline.ts` - Added booking declined email
- `/backend/payments/webhook.ts` - Added payment/refund emails
- `/frontend/pages/NotificationSettings.tsx` - Complete UI overhaul

## Next Steps
1. Configure ResendAPIKey in Settings
2. Test email delivery for all notification types
3. Monitor cron job execution logs
4. Adjust cron frequencies if needed
5. Consider adding SMS notifications (future enhancement)
6. Fix pre-existing disputes module TypeScript errors
