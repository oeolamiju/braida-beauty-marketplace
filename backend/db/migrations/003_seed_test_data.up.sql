-- Seed test stylists and services
-- Note: These user IDs will be replaced with actual Clerk IDs in production

-- Test stylists
INSERT INTO users (id, first_name, last_name, email, role, is_verified, created_at) VALUES
  ('test_stylist_1', 'Amara', 'Okafor', 'amara.okafor@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_2', 'Zainab', 'Hassan', 'zainab.hassan@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_3', 'Keisha', 'Williams', 'keisha.williams@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_4', 'Nia', 'Campbell', 'nia.campbell@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_5', 'Chiamaka', 'Nwosu', 'chiamaka.nwosu@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_6', 'Tasha', 'Brown', 'tasha.brown@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_7', 'Folake', 'Adeyemi', 'folake.adeyemi@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_8', 'Maya', 'Thompson', 'maya.thompson@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_9', 'Chioma', 'Obi', 'chioma.obi@test.com', 'FREELANCER', true, NOW()),
  ('test_stylist_10', 'Jasmine', 'Davis', 'jasmine.davis@test.com', 'FREELANCER', true, NOW());

-- Freelancer profiles
INSERT INTO freelancer_profiles (user_id, display_name, bio, location_area, postcode, travel_radius_miles, categories, verification_status) VALUES
  ('test_stylist_1', 'Amara Braids', 'Specializing in protective styles with 8+ years experience. Natural hair expert.', 'South London', 'SW9 8DN', 10, '["hair"]', 'verified'),
  ('test_stylist_2', 'Zainab Beauty Studio', 'Certified makeup artist specializing in bridal and special occasion looks.', 'East London', 'E15 2GW', 8, '["makeup"]', 'verified'),
  ('test_stylist_3', 'Keisha Hair Lounge', 'Creative braider and loc specialist. Book your transformation today!', 'North London', 'N15 4QL', 12, '["hair"]', 'verified'),
  ('test_stylist_4', 'Nia Glam', 'Professional MUA for all skin tones. Bridal specialist with portfolio.', 'West London', 'W10 5NE', 15, '["makeup"]', 'verified'),
  ('test_stylist_5', 'Chi Couture', 'Expert tailor for traditional African wear. Custom designs available.', 'Central London', 'SE1 7PB', 5, '["tailoring"]', 'verified'),
  ('test_stylist_6', 'Tasha Styles', 'Braiding specialist with a passion for intricate cornrow designs.', 'South London', 'SE15 5EW', 10, '["hair"]', 'verified'),
  ('test_stylist_7', 'Folake Gele & Beauty', 'Traditional gele tying and makeup for Nigerian weddings and events.', 'East London', 'E6 1HX', 20, '["gele", "makeup"]', 'verified'),
  ('test_stylist_8', 'Maya Hair Studio', 'Natural hair care specialist. Wash, condition, and protective styling.', 'North London', 'N17 0AP', 10, '["hair"]', 'verified'),
  ('test_stylist_9', 'Chi Chi Tailoring', 'Bespoke tailoring and alterations. Traditional wear expert with quick turnaround.', 'West London', 'W12 7RJ', 8, '["tailoring"]', 'verified'),
  ('test_stylist_10', 'Jazz Beauty Bar', 'Glam makeup artist and wig installation specialist.', 'South London', 'SW16 1BW', 12, '["makeup", "hair"]', 'verified');

-- Sample services
INSERT INTO services (stylist_id, title, category, subcategory, description, base_price_pence, duration_minutes, materials_policy, location_types, travel_fee_pence) VALUES
  ('test_stylist_1', 'Knotless Box Braids - Medium', 'hair', 'braids', 'Beautiful knotless box braids, medium size. Includes hair.', 15000, 360, 'stylist_provides', '["stylist_travels_to_client"]', 1500),
  ('test_stylist_1', 'Cornrows - Full Head', 'hair', 'braids', 'Classic cornrows in any pattern you desire.', 6000, 180, 'client_provides', '["stylist_travels_to_client"]', 1000),
  ('test_stylist_2', 'Bridal Makeup Package', 'makeup', 'bridal', 'Full bridal makeup with trial session included.', 25000, 120, 'stylist_provides', '["stylist_travels_to_client"]', 2000),
  ('test_stylist_2', 'Soft Glam Makeup', 'makeup', 'everyday', 'Natural glam perfect for photos or special occasions.', 8000, 60, 'stylist_provides', '["stylist_travels_to_client", "client_travels_to_stylist"]', 1500),
  ('test_stylist_3', 'Loc Retwist & Style', 'hair', 'locs', 'Professional loc maintenance and styling.', 7500, 150, 'client_provides', '["client_travels_to_stylist"]', 0),
  ('test_stylist_4', 'Bridal Glam', 'makeup', 'bridal', 'Stunning bridal makeup for your big day.', 22000, 90, 'stylist_provides', '["stylist_travels_to_client"]', 2500),
  ('test_stylist_5', 'Traditional Complete Outfit', 'tailoring', 'traditional', 'Custom-made traditional Nigerian outfit from your fabric.', 35000, 0, 'client_provides', '["client_travels_to_stylist"]', 0),
  ('test_stylist_6', 'Jumbo Box Braids', 'hair', 'braids', 'Thick, chunky box braids for a bold look.', 12000, 240, 'stylist_provides', '["stylist_travels_to_client"]', 1000),
  ('test_stylist_7', 'Bridal Gele Tying', 'gele', 'bridal', 'Elaborate bridal gele styling for your wedding.', 15000, 60, 'client_provides', '["stylist_travels_to_client"]', 2000),
  ('test_stylist_8', 'Natural Hair Wash & Set', 'hair', 'natural', 'Deep cleanse, condition, and styling for natural hair.', 5500, 120, 'stylist_provides', '["client_travels_to_stylist"]', 0),
  ('test_stylist_9', 'Garment Alterations', 'tailoring', 'alterations', 'Professional alterations for any garment.', 3000, 0, 'client_provides', '["client_travels_to_stylist"]', 0),
  ('test_stylist_10', 'Wig Install - Full Lace', 'hair', 'wig', 'Professional wig installation with customization.', 18000, 180, 'both', '["client_travels_to_stylist"]', 0);

-- Link some services to styles
INSERT INTO service_styles (service_id, style_id) VALUES
  (1, 1), -- Knotless box braids
  (2, 3), -- Cornrows
  (3, 6), -- Bridal glam makeup
  (4, 5), -- Soft glam makeup
  (5, 11), -- Loc retwist
  (6, 6), -- Bridal glam
  (7, 9), -- Traditional tailoring
  (8, 2), -- Box braids
  (9, 7), -- Bridal gele
  (10, 12), -- Natural hair wash & set
  (11, 10), -- Alterations
  (12, 4); -- Wig install
