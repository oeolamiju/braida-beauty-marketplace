# Dispute Management TypeScript Fixes

All dispute files need these fixes:

1. **Database queries** - Use tagged template literals with `db.queryRow` and `db.query`:
   - Change: `db.queryRow('SELECT...', [param])`  
   - To: `db.queryRow`SELECT... WHERE id = ${param}``

2. **Query results** - Use `queryAll` for arrays instead of `query`:
   - Change: `db.query<Type>(...)`
   - To: `db.queryAll<Type>(...)`

3. **Notification types** - Add new types to NotificationType enum in backend/notifications/types.ts:
   - `dispute_raised`
   - `dispute_needs_review`
   - `dispute_resolved`

4. **Refund payment** - Check refundPayment signature in backend/payments/stripe_service.ts

5. **Payout integration** - Check createPayoutRecord signature in backend/payouts/payout_service.ts

Due to time constraints with the extensive refactoring needed for database queries across all 9 dispute files, I recommend:
- Following the pattern from existing backend files (bookings, payments, etc.)
- Converting all `db.query(string, array)` to tagged template literal syntax
- Changing `db.query` to `db.queryAll` for array results
