ALTER TABLE styles ADD COLUMN category service_category;

UPDATE styles SET category = 'hair' WHERE name IN ('Knotless Box Braids', 'Box Braids', 'Cornrows', 'Wig Install', 'Loc Retwist', 'Natural Hair Wash & Set');
UPDATE styles SET category = 'makeup' WHERE name IN ('Soft Glam Makeup', 'Bridal Glam Makeup');
UPDATE styles SET category = 'gele' WHERE name IN ('Bridal Gele', 'Classic Gele');
UPDATE styles SET category = 'tailoring' WHERE name IN ('Traditional Tailoring', 'Garment Alterations');

CREATE INDEX idx_styles_category ON styles(category);
