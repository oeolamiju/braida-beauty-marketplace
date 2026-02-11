-- =============================================================================
-- BRAIDA AI RECOMMENDATION SYSTEM - DATABASE MIGRATION
-- Migration: 057_ai_recommendation_system.up.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- USER FEATURES TABLE
-- Stores analyzed facial/skin/hair features for each user
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_features (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Face Shape Analysis
    face_shape TEXT CHECK (face_shape IN ('oval', 'round', 'square', 'heart', 'oblong', 'diamond')),
    face_shape_confidence DECIMAL(4,3),
    face_landmarks JSONB,
    width_to_height_ratio DECIMAL(5,4),
    forehead_to_jaw_ratio DECIMAL(5,4),
    
    -- Skin Tone Analysis (Monk Scale)
    monk_scale INTEGER CHECK (monk_scale BETWEEN 1 AND 10),
    skin_undertone TEXT CHECK (skin_undertone IN ('warm', 'cool', 'neutral')),
    skin_ita DECIMAL(6,2),
    skin_hue_angle DECIMAL(6,2),
    skin_lightness DECIMAL(5,2),
    skin_tone_confidence DECIMAL(4,3),
    
    -- Hair Analysis
    hair_type TEXT CHECK (hair_type IN ('1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C')),
    hair_density TEXT CHECK (hair_density IN ('thin', 'medium', 'thick')),
    hair_porosity TEXT CHECK (hair_porosity IN ('low', 'normal', 'high')),
    hair_length TEXT CHECK (hair_length IN ('short', 'medium', 'long', 'extra_long')),
    hair_texture_features JSONB,
    hair_confidence DECIMAL(4,3),
    current_style TEXT,
    
    -- User Preferences
    preferences JSONB DEFAULT '{}',
    
    -- Source image (anonymized reference)
    source_image_hash TEXT,
    
    -- Timestamps
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per user
    CONSTRAINT unique_user_features UNIQUE (user_id)
);

-- Indexes for user features
CREATE INDEX idx_user_features_user_id ON user_features(user_id);
CREATE INDEX idx_user_features_face_shape ON user_features(face_shape) WHERE face_shape IS NOT NULL;
CREATE INDEX idx_user_features_monk_scale ON user_features(monk_scale) WHERE monk_scale IS NOT NULL;
CREATE INDEX idx_user_features_hair_type ON user_features(hair_type) WHERE hair_type IS NOT NULL;
CREATE INDEX idx_user_features_undertone ON user_features(skin_undertone) WHERE skin_undertone IS NOT NULL;

-- -----------------------------------------------------------------------------
-- STYLE DEFINITIONS TABLE
-- Master catalog of all beauty styles with compatibility data
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS style_definitions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hair', 'makeup', 'gele', 'tailoring')),
    subcategory TEXT,
    description TEXT,
    
    -- Images
    image_urls TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    
    -- Compatibility Scores
    suitable_face_shapes TEXT[] DEFAULT '{}',
    suitable_hair_types TEXT[] DEFAULT '{}',
    suitable_skin_tones INTEGER[] DEFAULT '{}',
    suitable_undertones TEXT[] DEFAULT '{}',
    
    -- Style Properties
    maintenance_level TEXT CHECK (maintenance_level IN ('low', 'medium', 'high')),
    duration_weeks INTEGER,
    install_time_min INTEGER, -- in minutes
    install_time_max INTEGER,
    
    -- Occasions and Tags
    occasions TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Pricing
    price_range_min INTEGER, -- in pence
    price_range_max INTEGER,
    
    -- Hair-specific fields
    extensions_needed BOOLEAN DEFAULT false,
    scalp_friendly BOOLEAN DEFAULT true,
    hair_length_required TEXT[] DEFAULT '{}',
    
    -- Gele-specific fields
    complexity TEXT CHECK (complexity IN ('low', 'medium', 'high')),
    fabric_types TEXT[] DEFAULT '{}',
    
    -- Makeup-specific fields
    makeup_type TEXT,
    color_palettes JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    popularity_score DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for style definitions
CREATE INDEX idx_style_definitions_category ON style_definitions(category);
CREATE INDEX idx_style_definitions_active ON style_definitions(is_active) WHERE is_active = true;
CREATE INDEX idx_style_definitions_featured ON style_definitions(is_featured) WHERE is_featured = true;
CREATE INDEX idx_style_definitions_face_shapes ON style_definitions USING GIN(suitable_face_shapes);
CREATE INDEX idx_style_definitions_hair_types ON style_definitions USING GIN(suitable_hair_types);
CREATE INDEX idx_style_definitions_skin_tones ON style_definitions USING GIN(suitable_skin_tones);
CREATE INDEX idx_style_definitions_occasions ON style_definitions USING GIN(occasions);
CREATE INDEX idx_style_definitions_tags ON style_definitions USING GIN(tags);

-- -----------------------------------------------------------------------------
-- STYLE COMPATIBILITY SCORES TABLE
-- Pre-computed compatibility scores for faster recommendations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS style_compatibility_scores (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    style_id TEXT NOT NULL REFERENCES style_definitions(id) ON DELETE CASCADE,
    
    -- Face Shape Scores (0-1)
    face_shape_oval DECIMAL(4,3) DEFAULT 0.5,
    face_shape_round DECIMAL(4,3) DEFAULT 0.5,
    face_shape_square DECIMAL(4,3) DEFAULT 0.5,
    face_shape_heart DECIMAL(4,3) DEFAULT 0.5,
    face_shape_oblong DECIMAL(4,3) DEFAULT 0.5,
    face_shape_diamond DECIMAL(4,3) DEFAULT 0.5,
    
    -- Hair Type Scores (0-1)
    hair_type_3a DECIMAL(4,3) DEFAULT 0.5,
    hair_type_3b DECIMAL(4,3) DEFAULT 0.5,
    hair_type_3c DECIMAL(4,3) DEFAULT 0.5,
    hair_type_4a DECIMAL(4,3) DEFAULT 0.5,
    hair_type_4b DECIMAL(4,3) DEFAULT 0.5,
    hair_type_4c DECIMAL(4,3) DEFAULT 0.5,
    
    -- Monk Scale Scores (0-1) for each scale 1-10
    monk_scale_scores JSONB DEFAULT '{}',
    
    -- Undertone Scores
    undertone_warm DECIMAL(4,3) DEFAULT 0.5,
    undertone_cool DECIMAL(4,3) DEFAULT 0.5,
    undertone_neutral DECIMAL(4,3) DEFAULT 0.5,
    
    -- Expert-derived reason text
    compatibility_reasons JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_style_compatibility UNIQUE (style_id)
);

CREATE INDEX idx_style_compatibility_style ON style_compatibility_scores(style_id);

-- -----------------------------------------------------------------------------
-- FREELANCER CAPABILITIES TABLE
-- Tracks what each freelancer specializes in
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS freelancer_capabilities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Style Expertise
    expertise_styles TEXT[] DEFAULT '{}',
    expertise_categories TEXT[] DEFAULT '{}',
    
    -- Hair Type Expertise (which hair types they're skilled with)
    hair_type_expertise TEXT[] DEFAULT '{}',
    
    -- Skin Tone Experience (track successful services by skin tone)
    skin_tone_experience INTEGER[] DEFAULT '{}',
    
    -- Certifications and Training
    certifications TEXT[] DEFAULT '{}',
    training_completed TEXT[] DEFAULT '{}',
    
    -- Portfolio Categories
    portfolio_categories TEXT[] DEFAULT '{}',
    
    -- Performance Metrics
    average_rating_by_category JSONB DEFAULT '{}',
    completed_bookings_by_category JSONB DEFAULT '{}',
    
    -- Availability
    max_daily_bookings INTEGER DEFAULT 4,
    service_radius_km INTEGER DEFAULT 25,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_freelancer_capability UNIQUE (freelancer_id)
);

CREATE INDEX idx_freelancer_capabilities_freelancer ON freelancer_capabilities(freelancer_id);
CREATE INDEX idx_freelancer_capabilities_styles ON freelancer_capabilities USING GIN(expertise_styles);
CREATE INDEX idx_freelancer_capabilities_hair_types ON freelancer_capabilities USING GIN(hair_type_expertise);
CREATE INDEX idx_freelancer_capabilities_categories ON freelancer_capabilities USING GIN(expertise_categories);

-- -----------------------------------------------------------------------------
-- RECOMMENDATION LOGS TABLE
-- Tracks all recommendations for analysis and improvement
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendation_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Request Details
    category TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    
    -- User Features at Time of Recommendation
    user_features_snapshot JSONB DEFAULT '{}',
    
    -- Recommendations Generated
    style_recommendations JSONB DEFAULT '[]',
    freelancer_recommendations JSONB DEFAULT '[]',
    
    -- User Interactions
    viewed_items TEXT[] DEFAULT '{}',
    clicked_items TEXT[] DEFAULT '{}',
    saved_items TEXT[] DEFAULT '{}',
    booked_item TEXT,
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    
    -- Performance Metrics
    generation_time_ms INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendation_logs_user ON recommendation_logs(user_id);
CREATE INDEX idx_recommendation_logs_category ON recommendation_logs(category);
CREATE INDEX idx_recommendation_logs_created ON recommendation_logs(created_at);
CREATE INDEX idx_recommendation_logs_booked ON recommendation_logs(booked_item) WHERE booked_item IS NOT NULL;

-- -----------------------------------------------------------------------------
-- BIAS AUDIT LOGS TABLE
-- Tracks fairness audits for the AI system
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bias_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    audit_type TEXT NOT NULL CHECK (audit_type IN ('skin_tone', 'hair_type', 'intersectional', 'comprehensive')),
    
    -- Metrics
    overall_fairness_score DECIMAL(5,4),
    skin_tone_disparity DECIMAL(5,4),
    hair_type_disparity DECIMAL(5,4),
    intersectional_disparity DECIMAL(5,4),
    
    -- Detailed Results
    group_performance JSONB DEFAULT '{}',
    detailed_metrics JSONB DEFAULT '{}',
    
    -- Recommendations
    mitigation_recommendations TEXT[] DEFAULT '{}',
    
    -- Sample Sizes
    total_samples INTEGER,
    samples_by_group JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bias_audit_logs_type ON bias_audit_logs(audit_type);
CREATE INDEX idx_bias_audit_logs_created ON bias_audit_logs(created_at);

-- -----------------------------------------------------------------------------
-- USER STYLE INTERACTIONS TABLE
-- Tracks how users interact with styles for collaborative filtering
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_style_interactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    style_id TEXT NOT NULL REFERENCES style_definitions(id) ON DELETE CASCADE,
    
    -- Interaction Types
    viewed BOOLEAN DEFAULT false,
    clicked BOOLEAN DEFAULT false,
    saved BOOLEAN DEFAULT false,
    booked BOOLEAN DEFAULT false,
    
    -- Implicit Feedback
    view_duration_seconds INTEGER,
    scroll_depth_percent INTEGER,
    
    -- Explicit Feedback
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    
    -- Timestamps
    first_viewed_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ,
    booked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_user_style_interaction UNIQUE (user_id, style_id)
);

CREATE INDEX idx_user_style_interactions_user ON user_style_interactions(user_id);
CREATE INDEX idx_user_style_interactions_style ON user_style_interactions(style_id);
CREATE INDEX idx_user_style_interactions_booked ON user_style_interactions(booked) WHERE booked = true;

-- -----------------------------------------------------------------------------
-- SEED DATA: INITIAL STYLE DEFINITIONS
-- -----------------------------------------------------------------------------

-- Insert Hair Styles (Braids)
INSERT INTO style_definitions (id, name, category, subcategory, description, suitable_face_shapes, suitable_hair_types, suitable_skin_tones, maintenance_level, duration_weeks, occasions, tags, extensions_needed, scalp_friendly) VALUES
('style_knotless_box', 'Knotless Box Braids', 'hair', 'braids', 'Gentle braids that start with your natural hair, reducing tension on the scalp. Perfect for a protective style that looks natural.', ARRAY['oval', 'heart', 'diamond', 'oblong'], ARRAY['3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'medium', 8, ARRAY['everyday', 'work', 'vacation', 'wedding'], ARRAY['protective', 'low_tension', 'versatile'], true, true),

('style_cornrows', 'Classic Cornrows', 'hair', 'braids', 'Traditional braided style close to the scalp. Timeless and versatile for any occasion.', ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY['3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'low', 4, ARRAY['everyday', 'work', 'sports', 'vacation'], ARRAY['traditional', 'scalp_visible', 'versatile'], false, true),

('style_passion_twists', 'Passion Twists', 'hair', 'twists', 'Romantic, bohemian style with soft, fluffy twists. Perfect for a natural, effortless look.', ARRAY['oval', 'heart', 'round'], ARRAY['3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'medium', 8, ARRAY['everyday', 'date', 'vacation', 'wedding'], ARRAY['bohemian', 'romantic', 'soft'], true, true),

('style_locs_starter', 'Starter Locs', 'hair', 'locs', 'Begin your loc journey with professionally installed starter locs. A lifetime commitment to natural beauty.', ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY['4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'low', NULL, ARRAY['everyday', 'work', 'spiritual'], ARRAY['permanent', 'natural', 'cultural'], false, true),

('style_goddess_locs', 'Goddess Locs', 'hair', 'locs', 'Faux locs with curly ends for a bohemian goddess aesthetic. Glamorous yet natural looking.', ARRAY['oval', 'heart', 'diamond'], ARRAY['3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'medium', 8, ARRAY['everyday', 'festival', 'vacation', 'photoshoot'], ARRAY['bohemian', 'glamorous', 'protective'], true, true),

('style_senegalese_twists', 'Senegalese Twists', 'hair', 'twists', 'Sleek, rope-like twists that are elegant and professional. Great for work and special occasions.', ARRAY['oval', 'oblong', 'diamond'], ARRAY['3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'medium', 8, ARRAY['work', 'formal', 'everyday'], ARRAY['professional', 'sleek', 'elegant'], true, true),

('style_fulani_braids', 'Fulani Braids', 'hair', 'braids', 'Traditional West African style with center part and side braids adorned with beads and cowrie shells.', ARRAY['oval', 'heart', 'diamond'], ARRAY['3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'medium', 6, ARRAY['cultural', 'festival', 'photoshoot', 'wedding'], ARRAY['cultural', 'adorned', 'traditional', 'artistic'], true, true);

-- Insert Gele Styles
INSERT INTO style_definitions (id, name, category, subcategory, description, suitable_face_shapes, suitable_hair_types, suitable_skin_tones, maintenance_level, occasions, tags, complexity, fabric_types) VALUES
('style_gele_butterfly', 'Butterfly Gele', 'gele', 'elaborate', 'Dramatic butterfly wings that create height and elegance. Perfect for making a statement at celebrations.', ARRAY['round', 'square'], ARRAY['3A', '3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'high', ARRAY['wedding', 'party', 'owambe'], ARRAY['dramatic', 'statement', 'elegant'], 'high', ARRAY['aso_oke', 'damask', 'sego']),

('style_gele_rose', 'Rose Flower Gele', 'gele', 'elaborate', 'Beautiful rose-shaped pleats for a romantic, feminine look. Ideal for brides and special occasions.', ARRAY['oval', 'heart', 'oblong'], ARRAY['3A', '3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'high', ARRAY['wedding', 'engagement', 'party'], ARRAY['romantic', 'feminine', 'bridal'], 'high', ARRAY['aso_oke', 'damask']),

('style_gele_fan', 'Fan Style Gele', 'gele', 'moderate', 'Elegant fan-shaped arrangement that frames the face beautifully. Versatile for various occasions.', ARRAY['oval', 'oblong'], ARRAY['3A', '3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'medium', ARRAY['wedding', 'party', 'church'], ARRAY['elegant', 'framing', 'versatile'], 'medium', ARRAY['aso_oke', 'damask', 'sego']),

('style_gele_simple', 'Simple Pleated Gele', 'gele', 'simple', 'Classic elegant pleats for a sophisticated, understated look. Perfect for church and formal events.', ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY['3A', '3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'low', ARRAY['church', 'formal', 'work'], ARRAY['classic', 'sophisticated', 'understated'], 'low', ARRAY['aso_oke', 'damask', 'sego', 'cotton']);

-- Insert Makeup Styles
INSERT INTO style_definitions (id, name, category, subcategory, description, suitable_face_shapes, suitable_hair_types, suitable_skin_tones, maintenance_level, occasions, tags, makeup_type, color_palettes) VALUES
('style_makeup_soft_glam', 'Soft Glam Makeup', 'makeup', 'glam', 'Subtle, radiant makeup that enhances your natural beauty. Perfect for everyday elegance.', ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY['3A', '3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'medium', ARRAY['everyday', 'work', 'date', 'brunch'], ARRAY['natural', 'radiant', 'subtle'], 'soft_glam', '[{"name": "warm_nudes", "suitableMonkScales": [7,8,9,10], "suitableUndertones": ["warm"]}]'::jsonb),

('style_makeup_full_glam', 'Full Glam Makeup', 'makeup', 'glam', 'Bold, dramatic makeup for when you want to make a statement. Perfect for events and photoshoots.', ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY['3A', '3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'high', ARRAY['party', 'wedding', 'photoshoot', 'gala'], ARRAY['bold', 'dramatic', 'statement'], 'full_glam', '[{"name": "rich_berries", "suitableMonkScales": [7,8,9,10], "suitableUndertones": ["cool", "neutral"]}]'::jsonb),

('style_makeup_bridal', 'Bridal Makeup', 'makeup', 'bridal', 'Timeless, long-lasting makeup designed to photograph beautifully and last all day.', ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY['3A', '3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'high', ARRAY['wedding', 'engagement'], ARRAY['bridal', 'timeless', 'long_lasting', 'photogenic'], 'bridal', '[{"name": "classic_bridal", "suitableMonkScales": [1,2,3,4,5,6,7,8,9,10], "suitableUndertones": ["warm", "cool", "neutral"]}]'::jsonb),

('style_makeup_natural', 'Natural No-Makeup Makeup', 'makeup', 'natural', 'Enhance your features while looking like you are not wearing any makeup. The ultimate natural beauty look.', ARRAY['oval', 'round', 'square', 'heart', 'oblong', 'diamond'], ARRAY['3A', '3B', '3C', '4A', '4B', '4C'], ARRAY[1,2,3,4,5,6,7,8,9,10], 'low', ARRAY['everyday', 'work', 'casual'], ARRAY['natural', 'minimal', 'effortless'], 'natural', '[{"name": "skin_match", "suitableMonkScales": [1,2,3,4,5,6,7,8,9,10], "suitableUndertones": ["warm", "cool", "neutral"]}]'::jsonb);

-- Insert compatibility scores for styles
INSERT INTO style_compatibility_scores (style_id, face_shape_oval, face_shape_round, face_shape_square, face_shape_heart, face_shape_oblong, face_shape_diamond, hair_type_3a, hair_type_3b, hair_type_3c, hair_type_4a, hair_type_4b, hair_type_4c, undertone_warm, undertone_cool, undertone_neutral, monk_scale_scores, compatibility_reasons) VALUES
('style_knotless_box', 0.9, 0.7, 0.7, 0.85, 0.8, 0.85, 0.5, 0.6, 0.8, 0.9, 0.95, 0.95, 0.9, 0.9, 0.9, '{"1": 0.9, "2": 0.9, "3": 0.9, "4": 0.9, "5": 0.9, "6": 0.9, "7": 0.9, "8": 0.9, "9": 0.9, "10": 0.9}', '{"oval": "Versatile style works perfectly with balanced features", "round": "Length helps elongate face", "heart": "Frames face beautifully"}'),
('style_cornrows', 0.9, 0.85, 0.85, 0.85, 0.9, 0.9, 0.4, 0.5, 0.8, 0.9, 0.95, 0.95, 0.9, 0.9, 0.9, '{"1": 0.9, "2": 0.9, "3": 0.9, "4": 0.9, "5": 0.9, "6": 0.9, "7": 0.9, "8": 0.9, "9": 0.9, "10": 0.9}', '{"oval": "Classic style suits all", "round": "Can add height with designs", "square": "Softens angles"}'),
('style_gele_butterfly', 0.7, 0.95, 0.9, 0.75, 0.6, 0.75, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, '{"1": 0.9, "2": 0.9, "3": 0.9, "4": 0.9, "5": 0.9, "6": 0.9, "7": 0.9, "8": 0.9, "9": 0.9, "10": 0.9}', '{"round": "Height creates elongation", "square": "Dramatic wings soften angles"}'),
('style_makeup_soft_glam', 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.95, 0.85, 0.9, '{"1": 0.8, "2": 0.85, "3": 0.85, "4": 0.9, "5": 0.9, "6": 0.9, "7": 0.95, "8": 0.95, "9": 0.95, "10": 0.95}', '{"all": "Enhances natural beauty across all face shapes"}');

-- -----------------------------------------------------------------------------
-- TRIGGERS FOR UPDATED_AT
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_features_updated_at BEFORE UPDATE ON user_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_style_definitions_updated_at BEFORE UPDATE ON style_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_style_compatibility_updated_at BEFORE UPDATE ON style_compatibility_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freelancer_capabilities_updated_at BEFORE UPDATE ON freelancer_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_style_interactions_updated_at BEFORE UPDATE ON user_style_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- ADD NOTIFICATION PREFERENCES FOR AI FEATURES
-- -----------------------------------------------------------------------------

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS ai_recommendation_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS style_match_alerts BOOLEAN DEFAULT true;

-- -----------------------------------------------------------------------------
-- COMMENTS FOR DOCUMENTATION
-- -----------------------------------------------------------------------------

COMMENT ON TABLE user_features IS 'Stores AI-analyzed facial, skin, and hair features for each user';
COMMENT ON TABLE style_definitions IS 'Master catalog of all beauty styles with AI compatibility data';
COMMENT ON TABLE style_compatibility_scores IS 'Pre-computed compatibility scores for faster recommendations';
COMMENT ON TABLE freelancer_capabilities IS 'Tracks freelancer expertise for AI matching';
COMMENT ON TABLE recommendation_logs IS 'Audit log for all AI recommendations';
COMMENT ON TABLE bias_audit_logs IS 'Fairness and bias monitoring for AI system';
COMMENT ON TABLE user_style_interactions IS 'User interactions for collaborative filtering';
