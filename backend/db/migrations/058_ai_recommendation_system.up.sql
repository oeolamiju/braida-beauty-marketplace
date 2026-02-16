-- =============================================================================
-- AI RECOMMENDATION SYSTEM SCHEMA
-- Tables for user features, style definitions, recommendations, and tracking
-- =============================================================================

-- User Features Table
-- Stores analyzed or manually entered user physical features
CREATE TABLE IF NOT EXISTS user_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Face Shape Analysis
  face_shape TEXT CHECK (face_shape IN ('oval', 'round', 'square', 'heart', 'oblong', 'diamond')),
  face_shape_confidence DECIMAL(3,2),
  face_landmarks JSONB,
  width_to_height_ratio DECIMAL(4,3),
  forehead_to_jaw_ratio DECIMAL(4,3),
  
  -- Skin Tone Analysis (Monk Scale)
  monk_scale INTEGER CHECK (monk_scale BETWEEN 1 AND 10),
  skin_undertone TEXT CHECK (skin_undertone IN ('warm', 'cool', 'neutral')),
  skin_ita DECIMAL(5,2),
  skin_hue_angle DECIMAL(5,2),
  skin_lightness DECIMAL(5,2),
  skin_tone_confidence DECIMAL(3,2),
  
  -- Hair Analysis
  hair_type TEXT CHECK (hair_type IN ('1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C')),
  hair_density TEXT CHECK (hair_density IN ('thin', 'medium', 'thick')),
  hair_porosity TEXT CHECK (hair_porosity IN ('low', 'normal', 'high')),
  hair_length TEXT CHECK (hair_length IN ('short', 'medium', 'long', 'extra_long')),
  hair_texture_features JSONB,
  hair_confidence DECIMAL(3,2),
  
  -- User Preferences
  preferences JSONB DEFAULT '{}',
  
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_features_user_id ON user_features(user_id);
CREATE INDEX idx_user_features_hair_type ON user_features(hair_type) WHERE hair_type IS NOT NULL;
CREATE INDEX idx_user_features_monk_scale ON user_features(monk_scale) WHERE monk_scale IS NOT NULL;
CREATE INDEX idx_user_features_face_shape ON user_features(face_shape) WHERE face_shape IS NOT NULL;

-- Style Definitions Table
-- Catalog of all available styles with compatibility information
CREATE TABLE IF NOT EXISTS style_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hair', 'makeup', 'gele', 'tailoring')),
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',
  
  -- Compatibility Arrays
  suitable_face_shapes TEXT[] DEFAULT '{}',
  suitable_hair_types TEXT[] DEFAULT '{}',
  suitable_skin_tones INTEGER[] DEFAULT '{}',
  
  -- Style Metadata
  maintenance_level TEXT CHECK (maintenance_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  duration_weeks INTEGER,
  occasions TEXT[] DEFAULT '{}',
  price_range_min INTEGER DEFAULT 0,
  price_range_max INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  
  -- Popularity & Status
  popularity_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_style_definitions_category ON style_definitions(category);
CREATE INDEX idx_style_definitions_active ON style_definitions(is_active) WHERE is_active = true;
CREATE INDEX idx_style_definitions_popularity ON style_definitions(popularity_score DESC);

-- Style Compatibility Scores Table
-- Detailed compatibility scores for each style with different features
CREATE TABLE IF NOT EXISTS style_compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES style_definitions(id) ON DELETE CASCADE,
  
  -- Face Shape Compatibility Scores (0.0 to 1.0)
  face_shape_oval DECIMAL(3,2) DEFAULT 0.5,
  face_shape_round DECIMAL(3,2) DEFAULT 0.5,
  face_shape_square DECIMAL(3,2) DEFAULT 0.5,
  face_shape_heart DECIMAL(3,2) DEFAULT 0.5,
  face_shape_oblong DECIMAL(3,2) DEFAULT 0.5,
  face_shape_diamond DECIMAL(3,2) DEFAULT 0.5,
  
  -- Hair Type Compatibility Scores
  hair_type_3a DECIMAL(3,2) DEFAULT 0.5,
  hair_type_3b DECIMAL(3,2) DEFAULT 0.5,
  hair_type_3c DECIMAL(3,2) DEFAULT 0.5,
  hair_type_4a DECIMAL(3,2) DEFAULT 0.5,
  hair_type_4b DECIMAL(3,2) DEFAULT 0.5,
  hair_type_4c DECIMAL(3,2) DEFAULT 0.5,
  
  -- Skin Tone Undertone Compatibility
  undertone_warm DECIMAL(3,2) DEFAULT 0.5,
  undertone_cool DECIMAL(3,2) DEFAULT 0.5,
  undertone_neutral DECIMAL(3,2) DEFAULT 0.5,
  
  -- Monk Scale Specific Scores (stored as JSONB for flexibility)
  monk_scale_scores JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(style_id)
);

CREATE INDEX idx_style_compatibility_style_id ON style_compatibility_scores(style_id);

-- Freelancer Capabilities Table
-- Tracks freelancer expertise and specializations
CREATE TABLE IF NOT EXISTS freelancer_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  expertise_styles TEXT[] DEFAULT '{}',
  hair_type_expertise TEXT[] DEFAULT '{}',
  skin_tone_experience INTEGER[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  portfolio_categories TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(freelancer_id)
);

CREATE INDEX idx_freelancer_capabilities_freelancer_id ON freelancer_capabilities(freelancer_id);

-- User Style Interactions Table
-- Tracks user interactions with styles for collaborative filtering
CREATE TABLE IF NOT EXISTS user_style_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES style_definitions(id) ON DELETE CASCADE,
  
  -- Interaction Flags
  viewed BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  saved BOOLEAN DEFAULT false,
  booked BOOLEAN DEFAULT false,
  
  -- Interaction Metadata
  view_duration_seconds INTEGER,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  
  -- Timestamps
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ,
  booked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, style_id)
);

CREATE INDEX idx_user_style_interactions_user_id ON user_style_interactions(user_id);
CREATE INDEX idx_user_style_interactions_style_id ON user_style_interactions(style_id);
CREATE INDEX idx_user_style_interactions_booked ON user_style_interactions(user_id, style_id) WHERE booked = true;

-- Recommendation Logs Table
-- Logs all recommendations for analytics and improvement
CREATE TABLE IF NOT EXISTS recommendation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  
  user_features_snapshot JSONB,
  style_recommendations JSONB,
  freelancer_recommendations JSONB,
  
  clicked_items TEXT[] DEFAULT '{}',
  booked_item TEXT,
  
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendation_logs_user_id ON recommendation_logs(user_id);
CREATE INDEX idx_recommendation_logs_category ON recommendation_logs(category);
CREATE INDEX idx_recommendation_logs_created_at ON recommendation_logs(created_at DESC);

-- Bias Audit Logs Table
-- Tracks fairness audits for monitoring bias in recommendations
CREATE TABLE IF NOT EXISTS bias_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL,
  metrics JSONB NOT NULL,
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bias_audit_logs_created_at ON bias_audit_logs(created_at DESC);

-- Comments
COMMENT ON TABLE user_features IS 'Stores analyzed user physical features for AI recommendations';
COMMENT ON TABLE style_definitions IS 'Catalog of beauty styles with metadata and compatibility info';
COMMENT ON TABLE style_compatibility_scores IS 'Detailed compatibility scores for each style';
COMMENT ON TABLE freelancer_capabilities IS 'Freelancer expertise and specialization tracking';
COMMENT ON TABLE user_style_interactions IS 'Tracks user interactions for collaborative filtering';
COMMENT ON TABLE recommendation_logs IS 'Logs all recommendations for analytics';
COMMENT ON TABLE bias_audit_logs IS 'Tracks fairness audits for bias monitoring';
