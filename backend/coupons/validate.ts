import { api } from "encore.dev/api";
import db from "../db";
import type { ValidateCouponRequest } from "./schemas";

interface ValidateCouponResponse {
  valid: boolean;
  discountAmount?: number;
  message?: string;
}

export const validate = api(
  { method: "POST", path: "/coupons/validate", auth: true, expose: true },
  async (req: ValidateCouponRequest): Promise<ValidateCouponResponse> => {
    const coupon = await db.queryRow<any>`
      SELECT * FROM discount_coupons WHERE code = ${req.code}
    `.catch(() => null);

    if (!coupon) {
      return { valid: false, message: "Coupon code not found" };
    }

    if (!coupon.is_active) {
      return { valid: false, message: "This coupon is no longer active" };
    }

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      return { valid: false, message: "This coupon is not yet valid" };
    }

    if (now > validUntil) {
      return { valid: false, message: "This coupon has expired" };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, message: "This coupon has reached its usage limit" };
    }

    if (req.bookingAmount < parseFloat(coupon.min_booking_amount)) {
      return {
        valid: false,
        message: `Minimum booking amount of £${coupon.min_booking_amount} required`,
      };
    }

    if (coupon.applicable_to === "NEW_USERS") {
      const userBookings = await db.queryRow<{ count: bigint }>`
        SELECT COUNT(*) as count FROM bookings WHERE user_id = ${req.userId} AND status != 'CANCELLED'
      `.catch(() => null);
      
      if (userBookings && Number(userBookings.count) > 0) {
        return { valid: false, message: "This coupon is only valid for new users" };
      }
    }

    let discountAmount = 0;
    if (coupon.discount_type === "PERCENTAGE") {
      discountAmount = (req.bookingAmount * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
      }
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }

    discountAmount = Math.min(discountAmount, req.bookingAmount);

    return {
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  }
);
