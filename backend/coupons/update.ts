import { api } from "encore.dev/api";
import db from "../db";
import type { UpdateCouponRequest } from "./schemas";
import type { DiscountCoupon } from "./types";
import { requireAdmin } from "../admin/middleware";

export const update = api(
  { method: "PATCH", path: "/admin/coupons/:id", auth: true, expose: true },
  async (req: UpdateCouponRequest): Promise<DiscountCoupon> => {
    await requireAdmin();

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (req.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(req.isActive);
    }

    if (req.usageLimit !== undefined) {
      updates.push(`usage_limit = $${paramCount++}`);
      values.push(req.usageLimit);
    }

    if (req.validUntil !== undefined) {
      updates.push(`valid_until = $${paramCount++}`);
      values.push(new Date(req.validUntil));
    }

    if (req.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(req.notes);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    const setClause = updates.join(", ");
    const query = `UPDATE discount_coupons SET ${setClause} WHERE id = '${req.id}' RETURNING *`;
    
    const rows: any[] = [];
    for await (const r of db.query(query as any)) {
      rows.push(r);
    }

    if (rows.length === 0) {
      throw new Error("Coupon not found");
    }

    const row = rows[0];
    return {
      id: row.id,
      code: row.code,
      discountType: row.discount_type,
      discountValue: parseFloat(row.discount_value),
      minBookingAmount: parseFloat(row.min_booking_amount),
      maxDiscountAmount: row.max_discount_amount ? parseFloat(row.max_discount_amount) : undefined,
      usageLimit: row.usage_limit || undefined,
      usedCount: row.used_count,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      isActive: row.is_active,
      applicableTo: row.applicable_to,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      notes: row.notes || undefined,
    };
  }
);
