-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('CLIENT', 'FREELANCER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE service_category AS ENUM ('hair', 'makeup', 'gele', 'tailoring');
CREATE TYPE materials_policy AS ENUM ('client_provides', 'stylist_provides', 'both');
CREATE TYPE location_type AS ENUM ('client_travels_to_stylist', 'stylist_travels_to_client');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'disputed', 'expired');
CREATE TYPE payment_status AS ENUM ('initiated', 'succeeded', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE report_status AS ENUM ('new', 'under_review', 'resolved');
CREATE TYPE dispute_status AS ENUM ('new', 'in_review', 'resolved');
CREATE TYPE availability_exception_type AS ENUM ('blocked', 'extra');

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'CLIENT',
  status user_status NOT NULL DEFAULT 'active',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Freelancer profiles
CREATE TABLE freelancer_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  location_area TEXT NOT NULL,
  postcode TEXT NOT NULL,
  travel_radius_miles INTEGER NOT NULL DEFAULT 5,
  categories JSONB NOT NULL DEFAULT '[]',
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_freelancer_profiles_postcode ON freelancer_profiles(postcode);
CREATE INDEX idx_freelancer_profiles_verification ON freelancer_profiles(verification_status);

-- Styles catalog
CREATE TABLE styles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  reference_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,
  stylist_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category service_category NOT NULL,
  subcategory TEXT,
  description TEXT,
  base_price_pence INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  materials_policy materials_policy NOT NULL,
  materials_fee_pence INTEGER DEFAULT 0,
  location_types JSONB NOT NULL DEFAULT '[]',
  travel_fee_pence INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_stylist ON services(stylist_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Service styles junction table
CREATE TABLE service_styles (
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  style_id BIGINT NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, style_id)
);

-- Availability rules
CREATE TABLE availability_rules (
  id BIGSERIAL PRIMARY KEY,
  stylist_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_availability_rules_stylist ON availability_rules(stylist_id);

-- Availability exceptions
CREATE TABLE availability_exceptions (
  id BIGSERIAL PRIMARY KEY,
  stylist_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  type availability_exception_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_availability_exceptions_stylist ON availability_exceptions(stylist_id);

-- Bookings
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES users(id),
  stylist_id TEXT NOT NULL REFERENCES users(id),
  service_id BIGINT NOT NULL REFERENCES services(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  location_type location_type NOT NULL,
  client_address_line1 TEXT,
  client_postcode TEXT,
  client_city TEXT,
  notes TEXT,
  price_base_pence INTEGER NOT NULL,
  price_materials_pence INTEGER NOT NULL DEFAULT 0,
  price_travel_pence INTEGER NOT NULL DEFAULT 0,
  total_price_pence INTEGER NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_stylist ON bookings(stylist_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_datetime ON bookings(start_datetime);

-- Payments
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id),
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  status payment_status NOT NULL DEFAULT 'initiated',
  amount_pence INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Payouts
CREATE TABLE payouts (
  id BIGSERIAL PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,
  provider_payout_id TEXT,
  status payout_status NOT NULL DEFAULT 'pending',
  amount_pence INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_freelancer ON payouts(freelancer_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Reviews
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id),
  client_id TEXT NOT NULL REFERENCES users(id),
  freelancer_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_freelancer ON reviews(freelancer_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);

-- Reports
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  reported_user_id TEXT NOT NULL REFERENCES users(id),
  booking_id BIGINT REFERENCES bookings(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  status report_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);

-- Disputes
CREATE TABLE disputes (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id),
  raised_by_id TEXT NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'new',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disputes_booking ON disputes(booking_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- Admin action logs
CREATE TABLE admin_action_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  details_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_action_logs_admin ON admin_action_logs(admin_id);
CREATE INDEX idx_admin_action_logs_entity ON admin_action_logs(entity_type, entity_id);
