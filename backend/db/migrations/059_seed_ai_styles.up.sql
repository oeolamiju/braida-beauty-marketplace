-- =============================================================================
-- SEED AI RECOMMENDATION SYSTEM WITH POPULAR AFRICAN HAIRSTYLES
-- Comprehensive catalog of braiding, locs, and protective styles
-- =============================================================================

-- Insert Popular Box Braid Variations
INSERT INTO style_definitions (name, category, description, suitable_face_shapes, suitable_hair_types, suitable_skin_tones, maintenance_level, duration_weeks, occasions, price_range_min, price_range_max, tags, popularity_score, is_active) VALUES

-- Box Braids
('Classic Box Braids', 'hair', 'Traditional box braids with medium-sized sections, protective and versatile', 
  ARRAY['oval', 'oblong', 'heart', 'diamond'], ARRAY['4A', '4B', '4C', '3C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'medium', 8, ARRAY['everyday', 'work', 'vacation', 'party'], 15000, 30000, 
  ARRAY['protective', 'braids', 'low-maintenance'], 95, true),

('Jumbo Box Braids', 'hair', 'Larger braids for a bold look, quicker installation time',
  ARRAY['oval', 'square', 'oblong'], ARRAY['4A', '4B', '4C', '3C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', 6, ARRAY['everyday', 'vacation', 'party'], 12000, 25000,
  ARRAY['protective', 'braids', 'bold'], 88, true),

('Knotless Box Braids', 'hair', 'Braids without knots at the base, gentler on edges and more natural-looking',
  ARRAY['oval', 'heart', 'diamond', 'round'], ARRAY['4A', '4B', '4C', '3C', '3B'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'medium', 6, ARRAY['everyday', 'work', 'wedding', 'party'], 20000, 40000,
  ARRAY['protective', 'braids', 'knotless', 'trending'], 98, true),

('Bohemian Box Braids', 'hair', 'Box braids with curly ends left out for a romantic, carefree look',
  ARRAY['oval', 'heart', 'oblong'], ARRAY['3A', '3B', '3C', '4A'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'medium', 6, ARRAY['vacation', 'party', 'photoshoot'], 18000, 35000,
  ARRAY['protective', 'braids', 'bohemian', 'romantic'], 85, true),

-- Cornrows & Feed-in Braids
('Classic Cornrows', 'hair', 'Traditional cornrows braided close to the scalp in straight back rows',
  ARRAY['oval', 'round', 'square', 'oblong'], ARRAY['4A', '4B', '4C', '3C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', 3, ARRAY['everyday', 'work', 'sports'], 5000, 15000,
  ARRAY['protective', 'cornrows', 'classic', 'athletic'], 90, true),

('Feed-in Cornrows', 'hair', 'Cornrows that start small and gradually get thicker, natural-looking and less tension',
  ARRAY['oval', 'heart', 'diamond', 'round'], ARRAY['4A', '4B', '4C', '3C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'medium', 4, ARRAY['everyday', 'work', 'party'], 8000, 20000,
  ARRAY['protective', 'cornrows', 'feed-in', 'trending'], 92, true),

('Stitch Braids', 'hair', 'Cornrows with a horizontal stitch pattern, sleek and modern',
  ARRAY['oval', 'square', 'oblong'], ARRAY['4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'medium', 4, ARRAY['party', 'photoshoot', 'special_events'], 10000, 25000,
  ARRAY['protective', 'cornrows', 'stitch', 'artistic'], 88, true),

-- Locs & Faux Locs
('Traditional Locs', 'hair', 'Natural locs formed through organic matting and twisting, permanent style',
  ARRAY['oval', 'round', 'oblong', 'diamond'], ARRAY['4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'high', 520, ARRAY['everyday', 'cultural', 'spiritual'], 0, 10000,
  ARRAY['locs', 'permanent', 'cultural', 'natural'], 80, true),

('Faux Locs', 'hair', 'Temporary locs created with extensions, loc look without commitment',
  ARRAY['oval', 'oblong', 'heart', 'square'], ARRAY['3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', 8, ARRAY['everyday', 'vacation', 'cultural'], 18000, 35000,
  ARRAY['protective', 'locs', 'faux', 'low-maintenance'], 87, true),

('Goddess Locs', 'hair', 'Faux locs with curly ends, bohemian and feminine',
  ARRAY['oval', 'heart', 'diamond'], ARRAY['3A', '3B', '3C', '4A'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', 6, ARRAY['vacation', 'party', 'wedding'], 20000, 40000,
  ARRAY['protective', 'locs', 'goddess', 'bohemian'], 91, true),

-- Twist Styles
('Senegalese Twists', 'hair', 'Two-strand twists using Kanekalon hair, sleek and elegant',
  ARRAY['oval', 'oblong', 'heart', 'diamond'], ARRAY['4A', '4B', '4C', '3C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', 8, ARRAY['everyday', 'work', 'vacation'], 15000, 30000,
  ARRAY['protective', 'twists', 'senegalese'], 89, true),

('Marley Twists', 'hair', 'Twists with kinky Marley hair for natural texture',
  ARRAY['oval', 'round', 'square', 'oblong'], ARRAY['4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', 6, ARRAY['everyday', 'casual', 'vacation'], 13000, 28000,
  ARRAY['protective', 'twists', 'marley', 'natural'], 86, true),

('Passion Twists', 'hair', 'Spring twists with water wave hair, bouncy and textured',
  ARRAY['oval', 'heart', 'diamond', 'round'], ARRAY['3B', '3C', '4A', '4B'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', 6, ARRAY['vacation', 'party', 'photoshoot'], 16000, 32000,
  ARRAY['protective', 'twists', 'passion', 'bouncy'], 93, true),

-- Natural Styles (Twist-outs, etc.)
('Two-Strand Twist Out', 'hair', 'Natural style created by twisting hair and unraveling for defined curls',
  ARRAY['oval', 'round', 'heart'], ARRAY['3B', '3C', '4A', '4B'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'high', 1, ARRAY['everyday', 'casual'], 3000, 8000,
  ARRAY['natural', 'twist-out', 'defined-curls'], 75, true),

('Braid Out', 'hair', 'Natural style created from unraveled braids for stretched, wavy texture',
  ARRAY['oval', 'oblong', 'diamond'], ARRAY['3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'high', 1, ARRAY['everyday', 'casual'], 3000, 8000,
  ARRAY['natural', 'braid-out', 'wavy'], 72, true),

('Wash and Go', 'hair', 'Defined curls achieved with product and air drying',
  ARRAY['oval', 'round', 'heart', 'diamond'], ARRAY['3A', '3B', '3C', '4A'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'high', 1, ARRAY['everyday', 'casual'], 2000, 5000,
  ARRAY['natural', 'wash-and-go', 'curls'], 78, true),

-- Crochet Styles
('Crochet Braids', 'hair', 'Braids installed using crochet method with cornrow base',
  ARRAY['oval', 'round', 'square', 'heart'], ARRAY['4A', '4B', '4C', '3C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', 6, ARRAY['everyday', 'vacation', 'party'], 12000, 25000,
  ARRAY['protective', 'crochet', 'versatile'], 84, true),

-- Fulani Braids
('Fulani Braids', 'hair', 'Traditional West African style with center cornrows and side braids',
  ARRAY['oval', 'oblong', 'heart', 'diamond'], ARRAY['4A', '4B', '4C', '3C'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'medium', 4, ARRAY['cultural', 'party', 'special_events'], 15000, 30000,
  ARRAY['cultural', 'braids', 'fulani', 'traditional'], 89, true);

-- Insert Compatibility Scores for Hair Styles
-- (Setting higher scores for hair types that work best with each style)
INSERT INTO style_compatibility_scores (style_id, hair_type_4a, hair_type_4b, hair_type_4c, hair_type_3c, hair_type_3b, hair_type_3a)
SELECT 
  id,
  CASE WHEN '4A' = ANY(suitable_hair_types) THEN 0.9 ELSE 0.4 END,
  CASE WHEN '4B' = ANY(suitable_hair_types) THEN 0.9 ELSE 0.4 END,
  CASE WHEN '4C' = ANY(suitable_hair_types) THEN 0.9 ELSE 0.4 END,
  CASE WHEN '3C' = ANY(suitable_hair_types) THEN 0.85 ELSE 0.4 END,
  CASE WHEN '3B' = ANY(suitable_hair_types) THEN 0.8 ELSE 0.3 END,
  CASE WHEN '3A' = ANY(suitable_hair_types) THEN 0.75 ELSE 0.3 END
FROM style_definitions
WHERE category = 'hair';

-- Set face shape compatibility scores
UPDATE style_compatibility_scores scs
SET 
  face_shape_oval = CASE WHEN 'oval' = ANY(sd.suitable_face_shapes) THEN 0.9 ELSE 0.5 END,
  face_shape_round = CASE WHEN 'round' = ANY(sd.suitable_face_shapes) THEN 0.85 ELSE 0.5 END,
  face_shape_square = CASE WHEN 'square' = ANY(sd.suitable_face_shapes) THEN 0.85 ELSE 0.5 END,
  face_shape_heart = CASE WHEN 'heart' = ANY(sd.suitable_face_shapes) THEN 0.85 ELSE 0.5 END,
  face_shape_oblong = CASE WHEN 'oblong' = ANY(sd.suitable_face_shapes) THEN 0.85 ELSE 0.5 END,
  face_shape_diamond = CASE WHEN 'diamond' = ANY(sd.suitable_face_shapes) THEN 0.85 ELSE 0.5 END
FROM style_definitions sd
WHERE scs.style_id = sd.id AND sd.category = 'hair';

-- Set neutral undertone compatibility (all styles work with all undertones for hair)
UPDATE style_compatibility_scores
SET 
  undertone_warm = 0.8,
  undertone_cool = 0.8,
  undertone_neutral = 0.9
WHERE style_id IN (SELECT id FROM style_definitions WHERE category = 'hair');

-- Insert Makeup Styles
INSERT INTO style_definitions (name, category, description, suitable_face_shapes, suitable_skin_tones, maintenance_level, occasions, price_range_min, price_range_max, tags, popularity_score, is_active) VALUES

('Natural Everyday Makeup', 'makeup', 'Minimal makeup for a fresh, natural look',
  ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', ARRAY['everyday', 'work'], 5000, 15000,
  ARRAY['natural', 'minimal', 'everyday'], 92, true),

('Soft Glam', 'makeup', 'Polished makeup with warm tones and subtle contouring',
  ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'medium', ARRAY['party', 'date', 'photoshoot'], 10000, 25000,
  ARRAY['glam', 'soft', 'warm-tones'], 95, true),

('Full Glam', 'makeup', 'Bold, dramatic makeup with full coverage and defined features',
  ARRAY['oval', 'square', 'oblong', 'diamond'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'high', ARRAY['wedding', 'party', 'special_events'], 15000, 40000,
  ARRAY['glam', 'dramatic', 'bold'], 88, true),

('Bridal Makeup', 'makeup', 'Long-lasting, camera-ready makeup for weddings',
  ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'high', ARRAY['wedding'], 20000, 60000,
  ARRAY['bridal', 'special-occasion', 'long-lasting'], 90, true);

-- Insert Makeup Compatibility Scores
INSERT INTO style_compatibility_scores (style_id, undertone_warm, undertone_cool, undertone_neutral, monk_scale_scores)
SELECT 
  id,
  0.8, 0.8, 0.9,
  '{"1": 0.9, "2": 0.9, "3": 0.9, "4": 0.9, "5": 0.9, "6": 0.9, "7": 0.9, "8": 0.9, "9": 0.9, "10": 0.9}'::jsonb
FROM style_definitions
WHERE category = 'makeup';

-- Insert Gele Styles
INSERT INTO style_definitions (name, category, description, suitable_face_shapes, suitable_skin_tones, maintenance_level, occasions, price_range_min, price_range_max, tags, popularity_score, is_active) VALUES

('Classic Butterfly Gele', 'gele', 'Traditional butterfly-shaped gele, elegant and timeless',
  ARRAY['oval', 'oblong', 'diamond'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'medium', ARRAY['wedding', 'cultural', 'special_events'], 8000, 20000,
  ARRAY['traditional', 'butterfly', 'elegant'], 87, true),

('Rose Flower Gele', 'gele', 'Gele styled to resemble a rose, sophisticated and feminine',
  ARRAY['oval', 'heart', 'round'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'high', ARRAY['wedding', 'party', 'cultural'], 10000, 25000,
  ARRAY['rose', 'sophisticated', 'feminine'], 85, true),

('Fan Gele', 'gele', 'Wide fan-shaped gele for maximum impact',
  ARRAY['oval', 'square', 'oblong'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'high', ARRAY['wedding', 'special_events'], 12000, 30000,
  ARRAY['fan', 'bold', 'statement'], 82, true),

('Simple Pleated Gele', 'gele', 'Minimal pleating for a clean, modern look',
  ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY[1,2,3,4,5,6,7,8,9,10],
  'low', ARRAY['cultural', 'church', 'party'], 5000, 15000,
  ARRAY['simple', 'modern', 'minimal'], 90, true);

-- Insert Gele Compatibility Scores
INSERT INTO style_compatibility_scores (style_id, face_shape_oval, face_shape_round, face_shape_square, face_shape_heart, face_shape_oblong, face_shape_diamond)
SELECT 
  id,
  CASE WHEN 'oval' = ANY(suitable_face_shapes) THEN 0.9 ELSE 0.6 END,
  CASE WHEN 'round' = ANY(suitable_face_shapes) THEN 0.85 ELSE 0.6 END,
  CASE WHEN 'square' = ANY(suitable_face_shapes) THEN 0.85 ELSE 0.6 END,
  CASE WHEN 'heart' = ANY(suitable_face_shapes) THEN 0.85 ELSE 0.6 END,
  CASE WHEN 'oblong' = ANY(suitable_face_shapes) THEN 0.85 ELSE 0.6 END,
  CASE WHEN 'diamond' = ANY(suitable_face_shapes) THEN 0.85 ELSE 0.6 END
FROM style_definitions
WHERE category = 'gele';
