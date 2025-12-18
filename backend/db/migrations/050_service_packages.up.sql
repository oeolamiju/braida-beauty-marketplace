-- Service packages/bundles for freelancers to offer bundled services at discounted prices
CREATE TABLE service_packages (
    id SERIAL PRIMARY KEY,
    freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    discount_amount_pence INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    valid_until TIMESTAMPTZ,
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services included in packages
CREATE TABLE package_services (
    id SERIAL PRIMARY KEY,
    package_id INTEGER NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE(package_id, service_id)
);

-- Indexes
CREATE INDEX idx_service_packages_freelancer ON service_packages(freelancer_id);
CREATE INDEX idx_service_packages_active ON service_packages(is_active);
CREATE INDEX idx_package_services_package ON package_services(package_id);
CREATE INDEX idx_package_services_service ON package_services(service_id);

