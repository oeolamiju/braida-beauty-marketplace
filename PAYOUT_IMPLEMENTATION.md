# Payout System Implementation

## Overview
Complete freelancer payout and earnings system with Stripe Connect integration, automated processing, and full admin management.

## Features Implemented

### Database Schema
- **payout_accounts**: Stripe Connected Account information for freelancers
- **payout_settings**: Platform-wide commission, fees, and configuration
- **payout_schedules**: Per-freelancer payout schedule preferences
- **payouts**: Individual payout records with status tracking
- **payout_batches**: Batch processing for scheduled payouts
- **payout_audit_logs**: Complete audit trail for all payout actions

### Backend Services

#### Payout Account Management (`backend/payouts`)
- `create_account.ts`: Create Stripe Connected Account (Braida Verified only)
- `get_account.ts`: Retrieve payout account status
- `refresh_account_status.ts`: Sync account status from Stripe
- `set_schedule.ts`: Configure payout schedule (per-transaction, weekly, bi-weekly)

#### Payout Processing
- `payout_service.ts`: Core business logic
  - Calculate commission and fees
  - Create payout records
  - Process individual payouts via Stripe transfers
  - Audit logging for all actions
- `process_scheduled.ts`: Cron job (Fridays 9 AM) for batch processing

#### Earnings Dashboard
- `get_earnings.ts`: Aggregate earnings statistics
  - Total earned
  - Pending in escrow
  - Next payout amount/date
  - Available balance
- `get_history.ts`: Paginated payout history with status filtering

#### Admin Management
- `admin_get_settings.ts`: Retrieve payment settings
- `admin_update_settings.ts`: Update commission %, fees, timeouts
- `admin_list_payouts.ts`: List all payouts with filtering
- `admin_get_payout.ts`: View payout details with audit logs
- `admin_override_payout.ts`: Manual status override for disputes

#### Stripe Connect Integration (`stripe_connect.ts`)
- Connected Account creation (Express type)
- Account Link generation for onboarding
- Account status retrieval
- Transfer processing to connected accounts

### Booking Integration
- Modified `backend/payments/confirm_service.ts`: Creates payout after escrow release
- Modified `backend/payments/process_auto_confirms.ts`: Creates payout on auto-confirmation

### Frontend Pages

#### Freelancer Pages
- `/freelancer/earnings`: Earnings dashboard
  - Stats cards (earned, escrow, next payout, available)
  - Payout history table
  - Verification requirement check
- `/freelancer/payout-setup`: Account setup
  - Stripe Connect onboarding flow
  - Account status display
  - Requirements tracking
  - Payout schedule configuration

#### Admin Pages
- `/admin/payouts`: Payout management
  - Summary statistics
  - Searchable payout list
  - Status filtering
  - Pagination
- `/admin/payouts/:id`: Payout detail
  - Full payout information
  - Audit log timeline
  - Manual override capability
- `/admin/settings/payments`: Platform settings
  - Commission percentage
  - Fixed booking fee
  - Auto-confirmation timeout
  - Default payout schedule

## Configuration

### Required Secrets
- `StripeSecretKey`: Stripe API secret key

### Payout Settings (Configurable via Admin)
- Platform Commission: Default 15%
- Booking Fee: Default $0.00
- Auto-Confirmation Timeout: Default 72 hours
- Default Payout Schedule: Weekly

### Payout Schedules
- **Per Transaction**: Immediate payout after booking completion
- **Weekly**: Payouts every Friday
- **Bi-Weekly**: Payouts every other Friday

## Security & Verification

### Access Control
- Only Braida Verified freelancers can create payout accounts
- Only Braida Verified freelancers can receive payouts
- Admin endpoints require admin role verification
- Freelancer endpoints require authentication

### Audit Trail
All payout actions are logged with:
- Actor ID
- Action type
- Status changes
- Timestamps
- IP address (when available)
- User agent (when available)

## Payment Flow

1. **Booking Completion**
   - Client confirms service OR auto-confirmation triggers
   - Escrow is released from payment
   - System calculates payout amounts (service - commission - fees)
   - Payout record created with appropriate schedule

2. **Payout Scheduling**
   - **Per-transaction**: Status set to "scheduled" immediately
   - **Weekly/Bi-weekly**: Status set to "pending", scheduled for next Friday

3. **Payout Processing**
   - Cron job runs every Friday at 9 AM
   - Processes all payouts with `scheduled_date <= today`
   - Verifies freelancer verification status
   - Verifies payout account status
   - Creates Stripe transfer to connected account
   - Updates status to "paid" on success
   - Logs failures for admin review

4. **Dispute Handling**
   - Admins can override payout status
   - Requires admin notes for audit trail
   - Can cancel, hold, or manually mark as paid

## Testing Checklist

- [ ] Create payout account as verified freelancer
- [ ] Complete Stripe Connect onboarding
- [ ] Complete a booking and confirm service
- [ ] Verify payout record creation
- [ ] Test different payout schedules
- [ ] View earnings dashboard
- [ ] View payout history
- [ ] Admin: View all payouts
- [ ] Admin: Override payout status
- [ ] Admin: Update payment settings
- [ ] Test cron job (manual trigger)
- [ ] Test audit logging
- [ ] Test non-verified freelancer restrictions

## Routes Added

### Freelancer Routes
- `GET /payouts/account` - Get payout account
- `POST /payouts/account` - Create payout account
- `POST /payouts/account/refresh` - Refresh account status
- `POST /payouts/schedule` - Set payout schedule
- `GET /payouts/earnings` - Get earnings stats
- `GET /payouts/history` - Get payout history

### Admin Routes
- `GET /admin/payouts/settings` - Get payment settings
- `PUT /admin/payouts/settings` - Update payment settings
- `GET /admin/payouts` - List all payouts
- `GET /admin/payouts/:id` - Get payout details
- `POST /admin/payouts/:id/override` - Override payout status

### Cron Jobs
- `process-scheduled-payouts`: Every Friday at 9 AM UTC

## Database Migrations
- `016_payout_system.up.sql`: Complete payout schema

## Dependencies
- Stripe SDK (already installed)
- Encore.ts cron jobs
- Encore.ts SQL database

## Future Enhancements
- Bulk payout processing UI for admins
- Payout analytics and reporting
- Multi-currency support
- Custom payout schedules per freelancer
- Email notifications for payout events
- Export payout data (CSV/PDF)
- Dispute resolution workflow integration
