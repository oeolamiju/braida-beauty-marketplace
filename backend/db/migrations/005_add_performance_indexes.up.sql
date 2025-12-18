-- Performance indexes based on common query patterns

-- Composite index for services filtered by stylist_id and is_active
-- Used in: /services?stylistId=X queries
CREATE INDEX IF NOT EXISTS idx_services_stylist_active ON services(stylist_id, is_active);

-- Composite index for services filtered by category and is_active
-- Used in: /services?category=X queries
CREATE INDEX IF NOT EXISTS idx_services_category_active ON services(category, is_active);

-- Composite index for services with created_at for sorting
-- Used in: LIST queries with ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_services_active_created ON services(is_active, created_at DESC);

-- Composite index for bookings by client_id and status
-- Used in: Client viewing their bookings filtered by status
CREATE INDEX IF NOT EXISTS idx_bookings_client_status ON bookings(client_id, status);

-- Composite index for bookings by stylist_id and status
-- Used in: Stylist viewing their bookings filtered by status
CREATE INDEX IF NOT EXISTS idx_bookings_stylist_status ON bookings(stylist_id, status);

-- Composite index for bookings by status and start_datetime
-- Used in: Admin queries, upcoming bookings, etc.
CREATE INDEX IF NOT EXISTS idx_bookings_status_start ON bookings(status, start_datetime);

-- Composite index for bookings by client and start_datetime for sorting
-- Used in: Client viewing their bookings chronologically
CREATE INDEX IF NOT EXISTS idx_bookings_client_start ON bookings(client_id, start_datetime DESC);

-- Composite index for bookings by stylist and start_datetime for sorting
-- Used in: Stylist viewing their bookings chronologically
CREATE INDEX IF NOT EXISTS idx_bookings_stylist_start ON bookings(stylist_id, start_datetime DESC);

-- Index on service_styles for reverse lookups
-- Used in: Finding services by style_id
CREATE INDEX IF NOT EXISTS idx_service_styles_style ON service_styles(style_id);

-- Composite index for freelancer_profiles verification status and created_at
-- Used in: LIST verified freelancers with sorting
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_verified_created ON freelancer_profiles(verification_status, created_at DESC);

-- Index on reviews created_at for sorting
-- Used in: Displaying recent reviews
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Composite index for reviews by freelancer with rating
-- Used in: Calculating average ratings, filtering high-rated reviews
CREATE INDEX IF NOT EXISTS idx_reviews_freelancer_rating ON reviews(freelancer_id, rating);

-- Index on availability_rules for active rules
-- Used in: Checking stylist availability
CREATE INDEX IF NOT EXISTS idx_availability_rules_stylist_active ON availability_rules(stylist_id, is_active);

-- Index on availability_exceptions date range queries
-- Used in: Finding exceptions in a date range
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_stylist_dates ON availability_exceptions(stylist_id, start_datetime, end_datetime);

-- Composite index for reports by status and created_at
-- Used in: Admin viewing reports by status, sorted by date
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC);

-- Index on reports by reporter for user history
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

-- Composite index for disputes by status and created_at
-- Used in: Admin viewing disputes by status, sorted by date
CREATE INDEX IF NOT EXISTS idx_disputes_status_created ON disputes(status, created_at DESC);

-- Index on admin_action_logs created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created ON admin_action_logs(created_at DESC);

-- Composite index for payments by status and created_at
-- Used in: Financial reporting, payment reconciliation
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at DESC);

-- Composite index for payouts by freelancer and status
-- Used in: Freelancer viewing payout history, filtering by status
CREATE INDEX IF NOT EXISTS idx_payouts_freelancer_status ON payouts(freelancer_id, status);

-- Composite index for payouts by status and created_at
-- Used in: Admin processing payouts, financial reporting
CREATE INDEX IF NOT EXISTS idx_payouts_status_created ON payouts(status, created_at DESC);

-- Index on users status for filtering active/suspended users
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Composite index for users by role and status
-- Used in: Admin queries filtering users by role and status
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);

-- Index on users is_verified for filtering
-- Used in: Finding unverified users, verification queries
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);

-- Partial index for pending bookings (most frequently queried status)
CREATE INDEX IF NOT EXISTS idx_bookings_pending ON bookings(stylist_id, start_datetime) WHERE status = 'pending';

-- Partial index for active services (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_services_active_only ON services(category, created_at DESC) WHERE is_active = true;
