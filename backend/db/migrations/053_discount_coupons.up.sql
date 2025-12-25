CREATE TABLE IF NOT EXISTS discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_booking_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  applicable_to VARCHAR(20) DEFAULT 'ALL' CHECK (applicable_to IN ('ALL', 'NEW_USERS', 'SPECIFIC_SERVICES')),
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES discount_coupons(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  booking_id BIGINT REFERENCES bookings(id),
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX idx_discount_coupons_valid_dates ON discount_coupons(valid_from, valid_until);
CREATE INDEX idx_discount_coupons_active ON discount_coupons(is_active);
CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_booking_id ON coupon_usage(booking_id);
