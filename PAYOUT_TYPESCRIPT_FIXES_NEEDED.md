# TypeScript Fixes Needed for Payout System

## Overview
The payout system implementation is functionally complete but has TypeScript compilation errors that need to be resolved.

## Files Requiring Fixes

### 1. admin_get_payout.ts
- **Issue**: `db.query` returns AsyncGenerator, need `db.queryAll`
- **Line 71**: Change `db.query` to `db.queryAll<PayoutAuditLog>`

### 2. admin_get_settings.ts  
- **Issue**: Null safety checks missing for settings
- **Lines 38-44**: Add null check before accessing settings properties

### 3. admin_list_payouts.ts
- **Issue**: `db.query` returns AsyncGenerator, need `db.queryAll`
- **Line 171**: Already using conditional queries, but need `db.queryAll`
- **Line 193**: Add null check for countResult

### 4. admin_override_payout.ts
- **Issue**: actorId type mismatch (number vs string)
- **Line 50**: Cast auth.userID to number or update createAuditLog signature

### 5. get_earnings.ts
- **Issue**: Null safety checks missing for query results
- **Lines 48-52**: Add fallback values or null checks

### 6. get_history.ts
- **Issue**: `db.query` returns AsyncGenerator, need `db.queryAll`  
- **Line 87**: Change conditional queries to use `db.queryAll`
- **Line 108**: Add null check for countResult

### 7. payout_service.ts
- **Issue**: Multiple null safety and type issues
- **Line 90, 98**: Add null checks for result
- **Line 141, 161, 181**: Change actorId from `number | undefined` to `number | null`

### 8. refresh_account_status.ts
- **Issue**: Null safety checks missing for updated row
- **Lines 58-67**: Add null check or throw error if updated is null

## Pattern Fixes Needed

### Pattern 1: db.query → db.queryAll
```typescript
// WRONG
const rows = await db.query`SELECT * FROM table`;
for (const row of rows) { ... }

// CORRECT  
const rows = await db.queryAll<RowType>`SELECT * FROM table`;
for (const row of rows) { ... }
```

### Pattern 2: Null Safety
```typescript
// WRONG
const result = await db.queryRow`...`;
return result.field;

// CORRECT
const result = await db.queryRow`...`;
if (!result) throw APIError.notFound("Not found");
return result.field;
```

### Pattern 3: Optional Parameters
```typescript
// WRONG
function fn(actorId?: number) {
  await createAuditLog(payoutId, actorId, ...);  // Error: undefined not assignable to null
}

// CORRECT
function fn(actorId?: number) {
  await createAuditLog(payoutId, actorId ?? null, ...);
}
```

## Quick Fix Script

Run these fixes in order:

1. Replace all `db.query` with `db.queryAll<Type>` and specify the type
2. Add null checks after all `db.queryRow` calls
3. Convert `actorId?: number` to `actorId: number | null` in createAuditLog
4. Add `?? null` when passing optional numbers to functions expecting `number | null`

## Testing After Fixes

1. Run `encore test` to verify all TypeScript errors are resolved
2. Test the complete payout flow end-to-end
3. Verify all admin endpoints work correctly
4. Test error handling paths

## Estimated Time to Fix
- 15-20 minutes for systematic fixes across all files
