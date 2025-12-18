-- Seed styles catalog
INSERT INTO styles (name, description, is_active) VALUES
  ('Knotless Box Braids', 'Protective braiding style with a more natural, tension-free root', true),
  ('Box Braids', 'Classic protective braiding style with neat, squared-off sections', true),
  ('Cornrows', 'Traditional braiding style with hair braided close to the scalp in rows', true),
  ('Wig Install', 'Professional wig application including customization and securing', true),
  ('Soft Glam Makeup', 'Natural, everyday makeup look with subtle enhancement', true),
  ('Bridal Glam Makeup', 'Full glamour makeup for wedding day with long-lasting finish', true),
  ('Bridal Gele', 'Traditional Nigerian head wrap for weddings and special occasions', true),
  ('Classic Gele', 'Traditional West African head wrap for formal events', true),
  ('Traditional Tailoring', 'Custom sewing of traditional Nigerian occasion wear', true),
  ('Garment Alterations', 'Professional clothing alterations and adjustments', true),
  ('Loc Retwist', 'Maintenance and styling service for dreadlocks', true),
  ('Natural Hair Wash & Set', 'Professional wash, condition, and styling for natural hair', true)
ON CONFLICT (name) DO NOTHING;
