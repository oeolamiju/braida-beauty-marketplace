export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type ApplicableTo = "ALL" | "NEW_USERS" | "SPECIFIC_SERVICES";

export interface DiscountCoupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableTo: ApplicableTo;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  bookingId?: string;
  discountAmount: number;
  usedAt: Date;
}
