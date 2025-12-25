export interface CreateCouponRequest {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  applicableTo?: "ALL" | "NEW_USERS" | "SPECIFIC_SERVICES";
  notes?: string;
}

export interface UpdateCouponRequest {
  id: string;
  isActive?: boolean;
  usageLimit?: number;
  validUntil?: string;
  notes?: string;
}

export interface ValidateCouponRequest {
  code: string;
  bookingAmount: number;
  userId: string;
}

export interface ApplyCouponRequest {
  code: string;
  userId: string;
  bookingId: string;
  bookingAmount: number;
}

export interface ListCouponsRequest {
  isActive?: boolean;
  page?: number;
  limit?: number;
}
