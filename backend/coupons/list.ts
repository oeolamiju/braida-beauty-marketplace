import { api } from "encore.dev/api";
import db from "../db";
import type { ListCouponsRequest } from "./schemas";
import type { DiscountCoupon } from "./types";
import { requireAdmin } from "../admin/middleware";

interface ListCouponsResponse {
  coupons: DiscountCoupon[];
  total: number;
  page: number;
  limit: number;
}

export const list = api(
  { method: "GET", path: "/admin/coupons", auth: true, expose: true },
  async (req: ListCouponsRequest): Promise<ListCouponsResponse> => {
    await requireAdmin();

    const page = req.page ?? 1;
    const limit = req.limit ?? 20;
    const offset = (page - 1) * limit;

    let coupons: any[];
    let total: number;

    if (req.isActive !== undefined) {
      const countRow = await db.queryRow<{ total: bigint }>`
        SELECT COUNT(*) as total FROM discount_coupons WHERE is_active = ${req.isActive}
      `;
      total = countRow ? Number(countRow.total) : 0;

      const rows: any[] = [];
      for await (const row of db.query`
        SELECT * FROM discount_coupons WHERE is_active = ${req.isActive}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `) {
        rows.push(row);
      }
      coupons = rows;
    } else {
      const countRow = await db.queryRow<{ total: bigint }>`
        SELECT COUNT(*) as total FROM discount_coupons
      `;
      total = countRow ? Number(countRow.total) : 0;

      const rows: any[] = [];
      for await (const row of db.query`
        SELECT * FROM discount_coupons
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `) {
        rows.push(row);
      }
      coupons = rows;
    }

    const mappedCoupons = coupons.map((row) => ({
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
    }));

    return {
      coupons: mappedCoupons,
      total,
      page,
      limit,
    };
  }
);
