-- Content Management System for dynamic pages
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  category VARCHAR(100) NOT NULL,
  is_published BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  last_edited_by UUID REFERENCES users(id)
);

CREATE INDEX idx_content_pages_slug ON content_pages(slug);
CREATE INDEX idx_content_pages_category ON content_pages(category);
CREATE INDEX idx_content_pages_published ON content_pages(is_published);

-- Content version history
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  edited_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, version)
);

CREATE INDEX idx_content_versions_page ON content_versions(page_id);

-- FAQ Management
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faq_category ON faq_items(category);
CREATE INDEX idx_faq_active ON faq_items(is_active);

-- Safety Resources Management
CREATE TABLE IF NOT EXISTS safety_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  url VARCHAR(1000),
  phone_number VARCHAR(50),
  is_emergency BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_safety_resources_type ON safety_resources(resource_type);
CREATE INDEX idx_safety_resources_emergency ON safety_resources(is_emergency);

-- Seed initial content pages
INSERT INTO content_pages (slug, title, content, meta_description, category, is_published, published_at) VALUES
('terms-of-service', 'Terms of Service', 
'<h1>Terms of Service</h1>
<p>Last updated: December 25, 2025</p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Braida Beauty Marketplace, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>2. Use License</h2>
<p>Permission is granted to temporarily access the materials on Braida Beauty Marketplace for personal, non-commercial transitory viewing only.</p>

<h2>3. Service Terms</h2>
<p>Users must be at least 18 years old to use this service. All bookings are subject to freelancer approval and availability.</p>

<h2>4. Payment Terms</h2>
<p>All payments are processed securely through our payment partner. Refunds are subject to our cancellation policy.</p>

<h2>5. User Conduct</h2>
<p>Users agree to use the platform responsibly and not engage in fraudulent, abusive, or illegal activities.</p>',
'Terms and conditions for using Braida Beauty Marketplace',
'legal',
true,
NOW()),

('privacy-policy', 'Privacy Policy',
'<h1>Privacy Policy</h1>
<p>Last updated: December 25, 2025</p>

<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us, including name, email, phone number, and payment information.</p>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services, process bookings, and communicate with you.</p>

<h2>3. Information Sharing</h2>
<p>We share information with freelancers for booking purposes and with service providers who assist in our operations.</p>

<h2>4. Data Security</h2>
<p>We implement appropriate technical and organizational measures to protect your personal information.</p>

<h2>5. Your Rights</h2>
<p>You have the right to access, update, or delete your personal information at any time.</p>',
'Privacy policy for Braida Beauty Marketplace',
'legal',
true,
NOW()),

('community-guidelines', 'Community Guidelines',
'<h1>Community Guidelines</h1>
<p>Last updated: December 25, 2025</p>

<h2>Our Commitment</h2>
<p>Braida Beauty Marketplace is committed to fostering a safe, respectful, and inclusive community for all users.</p>

<h2>Respect and Professionalism</h2>
<p>Treat all users with respect. Harassment, discrimination, or abusive behavior will not be tolerated.</p>

<h2>Safety First</h2>
<p>Always prioritize safety. Meet in public places, verify credentials, and report any suspicious activity.</p>

<h2>Quality Standards</h2>
<p>Freelancers must maintain high standards of service quality and professionalism.</p>

<h2>Honest Communication</h2>
<p>Provide accurate information in your profiles, services, and communications.</p>',
'Community guidelines for Braida Beauty Marketplace users',
'community',
true,
NOW()),

('safety-tips', 'Safety Tips',
'<h1>Safety Tips</h1>

<h2>For Clients</h2>
<ul>
<li>Verify freelancer credentials and reviews before booking</li>
<li>Meet in public or well-lit locations</li>
<li>Share your appointment details with a trusted contact</li>
<li>Trust your instincts - cancel if something feels wrong</li>
<li>Keep all communication on the platform</li>
</ul>

<h2>For Freelancers</h2>
<ul>
<li>Screen new clients carefully</li>
<li>Set clear boundaries and policies</li>
<li>Keep emergency contacts accessible</li>
<li>Trust your professional judgment</li>
<li>Report suspicious behavior immediately</li>
</ul>

<h2>General Safety</h2>
<ul>
<li>Never share personal financial information</li>
<li>Use secure payment methods only</li>
<li>Keep proof of appointments and communications</li>
<li>Report violations of community guidelines</li>
</ul>',
'Safety tips for using Braida Beauty Marketplace',
'safety',
true,
NOW());

-- Seed FAQ items
INSERT INTO faq_items (category, question, answer, display_order, is_active) VALUES
('general', 'What is Braida Beauty Marketplace?', 'Braida Beauty Marketplace connects clients with professional beauty freelancers for hairstyling, braiding, makeup, and other beauty services.', 1, true),
('general', 'How do I book a service?', 'Browse services, select your preferred freelancer, choose a time slot, and complete the booking with secure payment.', 2, true),
('booking', 'Can I cancel or reschedule my booking?', 'Yes, you can cancel or request to reschedule based on the freelancer''s cancellation policy. Check the policy details on each service.', 1, true),
('booking', 'How do I know if my booking is confirmed?', 'You''ll receive a notification once the freelancer accepts your booking. Check your bookings dashboard for status updates.', 2, true),
('payment', 'What payment methods are accepted?', 'We accept all major credit and debit cards through our secure Stripe payment system.', 1, true),
('payment', 'When will I be charged?', 'Payment is processed when you complete your booking. Funds are held securely until the service is completed.', 2, true),
('freelancer', 'How do I become a freelancer?', 'Click "Become a Freelancer" to create your profile, add your services, complete verification, and start accepting bookings.', 1, true),
('freelancer', 'How do I get paid?', 'Set up your Stripe Connect account in the Earnings section. Payouts are processed based on your chosen schedule.', 2, true);

-- Seed safety resources
INSERT INTO safety_resources (title, description, resource_type, phone_number, is_emergency, display_order) VALUES
('Emergency Services', 'For immediate danger or medical emergency', 'emergency', '911', true, 1),
('National Domestic Violence Hotline', '24/7 confidential support for domestic violence victims', 'hotline', '1-800-799-7233', false, 2),
('Crisis Text Line', 'Free 24/7 support via text message', 'hotline', 'Text HOME to 741741', false, 3),
('RAINN Sexual Assault Hotline', 'National Sexual Assault Hotline', 'hotline', '1-800-656-4673', false, 4);
