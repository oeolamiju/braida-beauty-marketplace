-- Add studio and mobile pricing to services
ALTER TABLE services
ADD COLUMN studio_price_pence INTEGER,
ADD COLUMN mobile_price_pence INTEGER;

-- Add default studio and mobile fees to freelancer profiles
ALTER TABLE freelancer_profiles
ADD COLUMN default_studio_fee_pence INTEGER DEFAULT 0,
ADD COLUMN default_mobile_fee_pence INTEGER DEFAULT 0;

-- Update existing services to use new pricing structure
-- Set studio_price_pence to current base_price for services that support client_travels_to_stylist
UPDATE services
SET studio_price_pence = base_price_pence
WHERE location_types::jsonb @> '["client_travels_to_stylist"]'::jsonb
  OR location_types::jsonb @> '["client_travels_to_freelancer"]'::jsonb;

-- Set mobile_price_pence to base_price + travel_fee for services that support stylist_travels_to_client
UPDATE services
SET mobile_price_pence = base_price_pence + travel_fee_pence
WHERE location_types::jsonb @> '["stylist_travels_to_client"]'::jsonb
  OR location_types::jsonb @> '["freelancer_travels_to_client"]'::jsonb;

-- Add comment explaining the new pricing structure
COMMENT ON COLUMN services.studio_price_pence IS 'Price when client travels to stylist studio';
COMMENT ON COLUMN services.mobile_price_pence IS 'Price when stylist travels to client location';
COMMENT ON COLUMN freelancer_profiles.default_studio_fee_pence IS 'Default fee for studio services (client travels to stylist)';
COMMENT ON COLUMN freelancer_profiles.default_mobile_fee_pence IS 'Default fee for mobile services (stylist travels to client)';
