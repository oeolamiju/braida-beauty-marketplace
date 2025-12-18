CREATE INDEX IF NOT EXISTS idx_services_category_active ON services(category, is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_services_freelancer_active ON services(stylist_id, is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_client_status ON bookings(client_id, status, start_datetime DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_freelancer_status ON bookings(stylist_id, status, start_datetime DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(start_datetime DESC) WHERE status IN ('pending', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_reviews_freelancer_rating ON reviews(freelancer_id, rating, created_at DESC) WHERE removed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_verified_city ON freelancer_profiles(verification_status, verification_city) WHERE verification_status = 'verified';

CREATE INDEX IF NOT EXISTS idx_users_role_verified ON users(role, is_verified, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_verification_status ON freelancer_profiles(verification_status, verification_submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_booking_status ON payments(booking_id, status);

CREATE INDEX IF NOT EXISTS idx_payouts_freelancer_status ON payouts(freelancer_id, status, created_at DESC);
