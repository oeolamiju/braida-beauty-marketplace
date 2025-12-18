# Payment & Escrow Implementation

## Overview
Braida now has a complete payment and escrow system integrated with Stripe for secure, PCI-compliant payment processing.

## Features Implemented

### 1. Payment Flow
- **Booking Creation**: When a client creates a booking, a Stripe PaymentIntent is created immediately
- **Payment Collection**: Client completes payment via Stripe Elements before booking is confirmed
- **Escrow Holding**: Funds are held in escrow until service completion is confirmed
- **Auto-Confirmation**: Service automatically confirms 24h after scheduled end time if no issues reported
- **Escrow Release**: Funds released to freelancer upon confirmation (manual or automatic)

### 2. Payment States
- `unpaid` - Booking created but no payment initiated
- `payment_pending` - Payment initiated, awaiting completion
- `payment_failed` - Payment attempt failed
- `paid` - Payment succeeded, funds in escrow
- `refunded` - Full refund processed
- `partially_refunded` - Partial refund processed

### 3. Escrow States
- `held` - Funds held in escrow pending service completion
- `released` - Funds released to freelancer after confirmation
- `refunded` - Funds returned to client
- `disputed` - Payment under dispute (for future use)

### 4. Price Breakdown
Clients see a clear breakdown before payment:
- Base service price
- Materials fee (if applicable)
- Travel fee (if freelancer travels to client)
- Platform booking fee (10%)
- **Total amount**

### 5. Refund Policy Integration
- Automatic refunds when:
  - Freelancer declines booking
  - Booking expires (24h timeout)
  - Client or freelancer cancels
- Refund amount based on cancellation policy (hours before service)
- Partial refunds supported for cancellation policies

### 6. Auto-Confirmation
- Cron job runs every 10 minutes
- Checks bookings with `auto_confirm_at` timestamp passed
- Automatically confirms service and releases escrow
- Notifies both parties

## Backend Implementation

### Database Schema (`015_payment_escrow.up.sql`)
**Payments table enhancements:**
- `stripe_payment_intent_id` - Stripe PaymentIntent ID
- `stripe_charge_id` - Stripe Charge ID
- `escrow_status` - Current escrow state
- `escrow_released_at` - When funds were released
- `refund_id` - Stripe Refund ID
- `refund_status` - Refund processing status
- `refund_amount_pence` - Amount refunded
- `platform_fee_pence` - Platform fee (10%)
- `freelancer_payout_pence` - Amount freelancer receives
- `metadata` - Additional payment metadata

**Bookings table enhancements:**
- `payment_status` - Tracks payment state
- `confirmed_at` - Service confirmation timestamp
- `completed_at` - Service completion timestamp
- `auto_confirm_at` - Scheduled auto-confirmation time

**Payment webhooks table:**
- Tracks all Stripe webhook events
- Prevents duplicate processing
- Stores error information

### Services & Endpoints

#### Payments Service
**backend/payments/stripe_service.ts** (stripe_service.ts:1)
- `createPaymentIntent()` - Creates Stripe PaymentIntent
- `refundPayment()` - Processes refunds via Stripe
- `verifyWebhookSignature()` - Validates Stripe webhook signatures
- `calculatePriceBreakdown()` - Calculates pricing with platform fee

**backend/payments/create_checkout.ts** (create_checkout.ts:20)
- `POST /payments/checkout` - Initiates payment checkout
- Returns clientSecret for Stripe Elements
- Reuses existing PaymentIntent if available

**backend/payments/webhook.ts** (webhook.ts:12)
- `POST /payments/webhook` - Handles Stripe webhooks
- Processes: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
- Updates booking and payment status
- Triggers notifications

**backend/payments/refund.ts** (refund.ts:19)
- `POST /payments/refund` - Initiates refund
- Validates refund eligibility
- Processes through Stripe API

**backend/payments/get_status.ts** (get_status.ts:14)
- `GET /payments/:bookingId/status` - Gets payment status
- Returns payment details and refund eligibility

**backend/payments/confirm_service.ts** (confirm_service.ts:14)
- `POST /payments/:bookingId/confirm` - Client confirms service completion
- Releases escrow to freelancer
- Clears auto-confirmation timer

**backend/payments/process_auto_confirms.ts** (process_auto_confirms.ts:6)
- Cron job endpoint for auto-confirmations
- Runs every 10 minutes
- Releases escrow for eligible bookings

### Updated Booking Endpoints

**backend/bookings/create.ts** (create.ts:25)
- Creates PaymentIntent immediately during booking creation
- Returns `clientSecret` for payment UI
- Sets booking to `payment_pending` state

**backend/bookings/decline.ts** (decline.ts:17)
- Auto-refunds if payment was made
- Updates payment and booking status

**backend/bookings/cancel.ts** (cancel.ts:21)
- Calculates refund based on cancellation policy
- Processes refund through Stripe
- Updates payment status accordingly

## Frontend Implementation

### Components

**frontend/components/PaymentCheckout.tsx** (PaymentCheckout.tsx:1)
- Stripe Elements integration
- Shows price breakdown
- Handles payment confirmation
- Error handling and user feedback

**frontend/components/BookingForm.tsx** (BookingForm.tsx:26)
- Enhanced to show payment UI after booking creation
- Transitions to payment screen when `requiresPayment=true`
- Handles payment success/cancel flows

### Pages

**frontend/pages/client/BookingDetail.tsx** (BookingDetail.tsx:54)
- Displays payment status badges
- Shows escrow information
- Auto-confirmation timer display
- Refund information

## Configuration Required

### Stripe Secrets
Set these in Leap Settings (sidebar → Settings):

1. **StripeSecretKey** - Your Stripe secret API key (sk_...)
2. **StripeWebhookSecret** - Webhook signing secret (whsec_...)

### Stripe Publishable Key
Set in frontend environment:
- Create `.env` file in frontend directory (if not exists)
- Add: `VITE_STRIPE_PUBLISHABLE_KEY=pk_...`

### Stripe Webhook Setup
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://braida-beauty-marketplace-d50ae8k82vjju34hfq70.api.lp.dev/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook signing secret to StripeWebhookSecret

## Payment Flow Example

### Client Books a Service
1. Client fills out booking form (date, time, location)
2. On submit:
   - Backend creates booking with `payment_status='unpaid'`
   - Creates Stripe PaymentIntent
   - Inserts payment record with `status='initiated'`
   - Returns `clientSecret` to frontend
3. Frontend shows payment UI with Stripe Elements
4. Client enters card details and submits
5. Stripe processes payment
6. Webhook received: `payment_intent.succeeded`
7. Backend updates:
   - Payment `status='succeeded'`
   - Booking `payment_status='paid'`
   - Sets `auto_confirm_at` to 24h after service end
8. Notifications sent to both parties

### Service Completion
**Option A: Manual Confirmation**
1. Client confirms service via UI
2. Backend releases escrow
3. Payment `escrow_status='released'`
4. Freelancer notified

**Option B: Auto-Confirmation**
1. Cron job detects `auto_confirm_at` passed
2. Automatically releases escrow
3. Both parties notified

### Cancellation with Refund
1. User cancels booking
2. Backend calculates refund based on policy
3. Calls Stripe refund API
4. Updates payment and booking status
5. Client notified of refund

## Security Features

1. **Webhook Signature Verification** - All webhooks verified with HMAC
2. **Idempotency** - Duplicate webhook events ignored via event_id tracking
3. **PCI Compliance** - Card data never touches our servers (Stripe Elements)
4. **Auth Checks** - All endpoints validate user permissions
5. **Escrow Protection** - Funds held until service confirmed

## Notifications

New notification types added:
- `booking_paid` - Freelancer notified of payment
- `payment_confirmed` - Client notified payment succeeded
- `payment_failed` - Client notified payment failed
- `payment_released` - Freelancer notified escrow released
- `booking_refunded` - Client notified of refund
- `service_auto_confirmed` - Both parties notified of auto-confirmation

## Testing Checklist

- [ ] Create booking with payment
- [ ] Complete payment successfully
- [ ] Test payment failure handling
- [ ] Freelancer decline triggers refund
- [ ] Client cancel triggers refund
- [ ] Manual service confirmation
- [ ] Auto-confirmation after 24h
- [ ] Webhook duplicate detection
- [ ] Price breakdown accuracy
- [ ] Escrow status tracking

## Future Enhancements

- Payout automation to freelancer bank accounts
- Dispute resolution workflow
- Payment analytics dashboard
- Multiple payment methods (Apple Pay, Google Pay)
- Subscription/recurring bookings
- Split payments for multi-freelancer bookings
