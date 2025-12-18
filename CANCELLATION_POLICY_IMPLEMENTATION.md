# Cancellation and Rescheduling Policy Implementation

## Overview

This implementation provides comprehensive cancellation and rescheduling policies with automatic enforcement for the beauty marketplace platform.

## Features Implemented

### 1. Cancellation Policies

#### Default Policy Configuration
- **>48 hours before service**: 100% refund
- **24-48 hours before service**: 50% refund  
- **<24 hours before service**: 0% refund
- **Freelancer cancels**: 100% refund (always)

#### Policy Enforcement
- Automatic refund calculation based on timing of cancellation
- Different rules for client vs freelancer cancellations
- Cancellation details stored in database:
  - Who cancelled (cancelled_by)
  - When cancelled (cancelled_at)
  - Reason for cancellation
  - Refund amount and percentage

### 2. Reschedule Requests

#### Workflow
1. Client or freelancer requests new time slot
2. Other party can accept or reject
3. If accepted: booking is updated with new time
4. If rejected and >24 hours remaining: full refund option available
5. Only one pending reschedule request per booking allowed

#### Features
- Request new start and end times
- Response with optional note
- Automatic notifications for both parties
- Audit trail of reschedule requests

### 3. Freelancer Reliability Tracking

#### Metrics Tracked
- Total cancellations in rolling time window (default: 30 days)
- Last-minute cancellations (<24 hours before service)
- Warning threshold (default: 2 last-minute cancellations)
- Suspension threshold (default: 5 last-minute cancellations)

#### Enforcement
- Automatic tracking when freelancer cancels
- Warning messages displayed to freelancer
- Configurable thresholds via admin panel

### 4. Admin Configuration

#### Admin Settings Page: `/admin/settings/policies`

**Cancellation Policies:**
- Configure hours thresholds for each tier
- Set refund percentages (0-100%)
- Changes take effect immediately

**Reliability Configuration:**
- Warning threshold
- Suspension threshold  
- Time window for tracking (days)

## Backend API Endpoints

### Policy Management

#### Get Cancellation Policies
```
GET /policies/cancellation
```
Returns current cancellation policy tiers.

#### Update Cancellation Policies
```
PUT /policies/cancellation
Body: {
  policies: [
    { id: number, hoursThreshold: number, refundPercentage: number }
  ]
}
```
Admin only. Updates policy configuration.

#### Get Reliability Config
```
GET /policies/reliability
```
Returns freelancer reliability thresholds.

#### Update Reliability Config
```
PUT /policies/reliability
Body: {
  warningThreshold: number,
  suspensionThreshold: number,
  timeWindowDays: number
}
```
Admin only. Updates reliability tracking configuration.

#### Get Freelancer Reliability Stats
```
GET /policies/reliability/freelancer
Query: { freelancerId?: number }
```
Returns cancellation statistics for a freelancer.

### Booking Operations

#### Cancel Booking
```
POST /bookings/:id/cancel
Body: { reason?: string }
Response: {
  message: string,
  refundPercentage: number,
  refundAmount: number,
  hoursBeforeService: number,
  reliabilityWarning?: string
}
```
Enhanced to include automatic refund calculation and reliability tracking.

#### Request Reschedule
```
POST /bookings/:bookingId/reschedule/request
Body: {
  newStartTime: Date,
  newEndTime: Date
}
Response: {
  rescheduleRequestId: number,
  message: string
}
```
Creates a new reschedule request.

#### Respond to Reschedule Request
```
POST /bookings/reschedule/:rescheduleRequestId/respond
Body: {
  accept: boolean,
  note?: string
}
Response: {
  message: string,
  refundOffered?: {
    refundPercentage: number,
    refundAmount: number
  }
}
```
Accept or reject a reschedule request.

#### List Reschedule Requests
```
GET /bookings/reschedule/requests
Response: {
  requests: RescheduleRequest[]
}
```
Lists pending reschedule requests for the authenticated user.

#### Get Booking Details
```
GET /bookings/:id
```
Enhanced response includes:
- `cancellationInfo`: Details if booking was cancelled
- `refundEstimate`: Current refund if cancelled now
- `cancellationPolicies`: Current policy tiers

## Database Schema

### New Tables

#### `cancellation_policies`
- `id`: Policy ID
- `policy_type`: Type of policy (client_cancel, etc.)
- `hours_threshold`: Minimum hours before service
- `refund_percentage`: Refund percentage (0-100)
- Timestamps

#### `freelancer_reliability_config`
- `id`: Config ID
- `warning_threshold`: Cancellations before warning
- `suspension_threshold`: Cancellations before suspension
- `time_window_days`: Rolling window for tracking
- Timestamps

#### `freelancer_cancellation_log`
- `id`: Log entry ID
- `freelancer_id`: Freelancer who cancelled
- `booking_id`: Cancelled booking
- `hours_before_service`: Hours before scheduled service
- `is_last_minute`: Boolean flag for <24 hour cancellations
- Timestamps

#### `reschedule_requests`
- `id`: Request ID
- `booking_id`: Associated booking
- `requested_by`: User who requested reschedule
- `new_start_time`: Proposed new start time
- `new_end_time`: Proposed new end time
- `status`: pending/accepted/rejected
- `responded_at`: Response timestamp
- `responded_by`: User who responded
- `response_note`: Optional response note
- Timestamps

### Enhanced Tables

#### `bookings` (new columns)
- `cancelled_by`: User ID who cancelled
- `cancelled_at`: Cancellation timestamp
- `cancellation_reason`: Reason text
- `refund_amount`: Calculated refund amount
- `refund_percentage`: Applied refund percentage

## Frontend Components

### CancellationPolicy Component
**Location:** `/frontend/components/CancellationPolicy.tsx`

Reusable component for displaying cancellation policies:
- Compact mode for booking flow
- Full mode for booking details
- Shows all policy tiers
- Highlights freelancer cancellation policy

**Usage:**
```tsx
import CancellationPolicy from "@/components/CancellationPolicy";

<CancellationPolicy 
  policies={[
    { hoursThreshold: 48, refundPercentage: 100 },
    { hoursThreshold: 24, refundPercentage: 50 },
    { hoursThreshold: 0, refundPercentage: 0 }
  ]}
  compact={false}
/>
```

### PolicySettings Page
**Location:** `/frontend/pages/admin/PolicySettings.tsx`  
**Route:** `/admin/settings/policies`

Admin interface for configuring:
- Cancellation policy tiers
- Freelancer reliability thresholds
- Real-time validation
- Informational tooltips

## Policy Calculation Logic

### Refund Calculation Algorithm

```typescript
function calculateRefund(
  bookingAmount: number,
  scheduledStartTime: Date,
  cancellationTime: Date,
  cancelledBy: 'client' | 'freelancer'
): RefundCalculation
```

**Process:**
1. Calculate hours between cancellation and scheduled start
2. If freelancer cancelled → 100% refund (always)
3. If client cancelled:
   - Find applicable policy tier based on hours
   - Apply refund percentage
   - Calculate refund amount
4. Return calculation details

**Edge Cases Handled:**
- Exact threshold boundaries (24h, 48h)
- Past service times
- Partial dollar amounts
- Multiple policy tiers

## Testing

### Unit Tests
**Location:** `/backend/policies/policy_service.test.ts`

**Test Coverage:**
- ✅ Freelancer cancellation → 100% refund
- ✅ Client cancellation >48h → 100% refund
- ✅ Client cancellation 24-48h → 50% refund
- ✅ Client cancellation <24h → 0% refund
- ✅ Edge cases at exact thresholds
- ✅ Partial amount calculations
- ✅ Hours calculation accuracy
- ✅ Policy retrieval and ordering

**Running Tests:**
```bash
npm test -- policy_service.test.ts
```

## Notifications

### New Notification Types
- `booking_reschedule_requested`: When reschedule is requested
- `booking_rescheduled`: When reschedule is accepted
- `booking_reschedule_rejected`: When reschedule is rejected

### Enhanced Notifications
- Cancellation notifications include refund information
- Reliability warnings for freelancers
- Reschedule request details

## Integration Points

### Phase 5 Payments Integration
The refund calculation logic is implemented and stored in the database. When payment processing is integrated:

1. **Refund Processing:**
   - Read `refund_amount` from cancelled bookings
   - Process through payment gateway
   - Update booking with refund status

2. **Database Fields Ready:**
   - `bookings.refund_amount`: Amount to refund
   - `bookings.refund_percentage`: Policy applied
   - `bookings.cancelled_by`: Who initiated
   - `bookings.cancelled_at`: When cancelled

3. **Suggested Implementation:**
```typescript
// In payment service
async function processRefund(bookingId: number) {
  const booking = await getBooking(bookingId);
  if (booking.refund_amount > 0) {
    await paymentGateway.refund({
      amount: booking.refund_amount,
      originalPaymentId: booking.payment_id,
      reason: booking.cancellation_reason
    });
    
    await updateBooking(bookingId, {
      refund_processed: true,
      refund_processed_at: new Date()
    });
  }
}
```

## Configuration Defaults

### Cancellation Policies
| Hours Before Service | Refund Percentage |
|---------------------|-------------------|
| 48+                 | 100%              |
| 24-48               | 50%               |
| 0-24                | 0%                |

### Reliability Thresholds
| Metric              | Default Value |
|---------------------|---------------|
| Warning Threshold   | 2             |
| Suspension Threshold| 5             |
| Time Window         | 30 days       |

## Future Enhancements

1. **Automated Suspension:**
   - Automatically suspend freelancers who exceed threshold
   - Appeal process for suspended accounts

2. **Partial Refunds:**
   - Service fee handling
   - Platform fee considerations

3. **Reschedule Limits:**
   - Maximum reschedule requests per booking
   - Time limits for requesting reschedules

4. **Analytics:**
   - Cancellation rate tracking
   - Refund cost analysis
   - Freelancer reliability dashboard

5. **Grace Periods:**
   - Emergency cancellation exceptions
   - Weather-related cancellations
   - Medical emergency handling

## Migration Notes

The database migration `013_cancellation_policies.up.sql` includes:
- All new tables with proper indexes
- Default policy configuration
- Foreign key constraints
- Existing bookings compatibility (nullable columns)

**Safe to deploy** - No data loss, backward compatible.

## Support and Troubleshooting

### Common Issues

**Policy not applying:**
- Check admin configuration at `/admin/settings/policies`
- Verify database migration ran successfully
- Check backend logs for calculation errors

**Reschedule request not working:**
- Ensure booking is in `confirmed` or `pending` status
- Verify no existing pending reschedule request
- Check new times are in the future

**Reliability warnings not showing:**
- Verify freelancer has cancelled bookings in time window
- Check threshold configuration
- Review `freelancer_cancellation_log` table

## API Response Examples

### Cancel Booking Response
```json
{
  "message": "Booking cancelled successfully",
  "refundPercentage": 50,
  "refundAmount": 37.50,
  "hoursBeforeService": 36,
  "reliabilityWarning": "Warning: You have 2 last-minute cancellations in the last 30 days..."
}
```

### Get Booking Response (Enhanced)
```json
{
  "id": 123,
  "status": "cancelled",
  "cancellationInfo": {
    "cancelledBy": "456",
    "cancelledAt": "2024-01-15T10:30:00Z",
    "cancellationReason": "Family emergency",
    "refundAmount": 75.00,
    "refundPercentage": 100
  },
  "refundEstimate": null,
  "cancellationPolicies": [
    { "hoursThreshold": 48, "refundPercentage": 100 },
    { "hoursThreshold": 24, "refundPercentage": 50 },
    { "hoursThreshold": 0, "refundPercentage": 0 }
  ]
}
```

## Conclusion

This implementation provides a complete, production-ready cancellation and rescheduling system with:
- ✅ Automated policy enforcement
- ✅ Flexible admin configuration
- ✅ Comprehensive tracking and audit trails
- ✅ User-friendly interfaces
- ✅ Unit test coverage
- ✅ Ready for payment integration

The system is designed to be fair to both clients and freelancers while protecting the platform from abuse through reliability tracking.
