-- Script to clear all user accounts and related data
-- Run this script to start fresh with no registered users

-- Disable foreign key checks temporarily
BEGIN;

-- Delete in order of dependencies (child tables first)

-- Clear payment-related data
DELETE FROM payout_items;
DELETE FROM payouts;
DELETE FROM payments;

-- Clear booking-related data
DELETE FROM reviews;
DELETE FROM booking_messages;
DELETE FROM booking_audit_log;
DELETE FROM bookings;

-- Clear dispute-related data
DELETE FROM dispute_messages;
DELETE FROM disputes;

-- Clear service-related data
DELETE FROM service_styles;
DELETE FROM service_images;
DELETE FROM services;

-- Clear user-related data
DELETE FROM portfolio_images;
DELETE FROM availability_slots;
DELETE FROM freelancer_profiles;
DELETE FROM notification_preferences;
DELETE FROM notifications;
DELETE FROM push_subscriptions;
DELETE FROM verification_tokens;
DELETE FROM password_reset_tokens;

-- Clear audit logs
DELETE FROM admin_audit_log;
DELETE FROM audit_logs;
DELETE FROM rate_limit_logs;

-- Finally, delete all users
DELETE FROM users;

-- Reset sequences for clean IDs
ALTER SEQUENCE IF EXISTS bookings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS services_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS disputes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payouts_id_seq RESTART WITH 1;

COMMIT;

-- Verify deletion
SELECT 'Users remaining: ' || COUNT(*) FROM users;

