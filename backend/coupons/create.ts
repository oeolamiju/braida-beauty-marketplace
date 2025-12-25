import { api } from "encore.dev/api";
import db from "../db";
import type { CreateCouponRequest } from "./schemas";
import type { DiscountCoupon } from "./types";
import { requireAdmin } from "../admin/middleware";

export const create = api(
  { method: "POST", path: "/admin/coupons", auth: true, expose: true },
  async (req: CreateCouponRequest): Promise<DiscountCoupon> => {
    await requireAdmin();

    if (!req.code || req.code.length < 3 || req.code.length > 50) {
      throw new Error("Code must be between 3 and 50 characters");
    }
    if (!/^[A-Z0-9_-]+$/.test(req.code)) {
      throw new Error("Code must contain only uppercase letters, numbers, hyphens, and underscores");
    }
    if (!req.discountValue || req.discountValue <= 0) {
      throw new Error("Discount value must be positive");
    }

    const validated = {
      ...req,
      minBookingAmount: req.minBookingAmount ?? 0,
      applicableTo: req.applicableTo ?? "ALL",
    };

    const authData = (api as any).currentRequest?.auth;
    const userId = authData?.userID;

    if (validated.discountType === "PERCENTAGE" && validated.discountValue > 100) {
      throw new Error("Percentage discount cannot exceed 100%");
    }

    const validFrom = new Date(validated.validFrom);
    const validUntil = new Date(validated.validUntil);

    if (validUntil <= validFrom) {
      throw new Error("Valid until date must be after valid from date");
    }

    const row = await db.queryRow<any>`
      INSERT INTO discount_coupons (
        code, discount_type, discount_value, min_booking_amount, max_discount_amount,
        usage_limit, valid_from, valid_until, applicable_to, created_by, notes
      ) VALUES (
        ${validated.code},
        ${validated.discountType},
        ${validated.discountValue},
        ${validated.minBookingAmount},
        ${validated.maxDiscountAmount || null},
        ${validated.usageLimit || null},
        ${validFrom},
        ${validUntil},
        ${validated.applicableTo},
        ${userId},
        ${validated.notes || null}
      )
      RETURNING *
    `;
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
