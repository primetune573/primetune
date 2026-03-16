-- Supabase Schema for PrimeTune Automotive

-- 1. `business_settings` (Stored directly for admin to change optionally, but environment variables might be easier for local)
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  google_reviews_link TEXT,
  map_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. `services`
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration_hours INT NOT NULL,
  category TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  is_emergency BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. `bookings`
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  car_brand TEXT NOT NULL,
  car_model TEXT NOT NULL,
  car_year TEXT NOT NULL,
  service_ids UUID[] NOT NULL,
  service_names_snapshot TEXT[] NOT NULL,
  price_snapshot NUMERIC(10,2) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_hours INT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  whatsapp_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We will use Supabase Auth for Admin login. 
-- The user request specified an admin user using credentials: admin / admin.
-- Since Supabase requires standard email/password, we will register an admin user:
-- admin@primetune.local / admin123 (or similar) into the Auth table.

-- Enable RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Security Policies

-- Public can read active services and business settings
CREATE POLICY "Public read active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read business settings" ON business_settings FOR SELECT USING (true);

-- Public can insert bookings (creating a booking from checkout)
-- They cannot read bookings, only admin can.
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Admin has full access to everything. 
-- We'll identify admin by an authenticated session (role = authenticated).
CREATE POLICY "Admin full access services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access settings" ON business_settings FOR ALL USING (auth.role() = 'authenticated');

-- Insert Seed Data for services
INSERT INTO services (slug, name, short_description, full_description, price, duration_hours, category, image_url, is_emergency) VALUES 
('full-service', 'Full Service', 'Complete vehicle inspection, fluid changes, and tuning.', 'Our highly comprehensive Full Service involves a multipoint inspection, oil and filter change, spark plug checks, brake inspection, battery test, and more to keep your vehicle in prime condition.', 25000.00, 5, 'Maintenance', '/images/demo/service-full.jpg', false),
('oil-change', 'Oil Change', 'Premium engine oil replacement and filter change.', 'We replace old engine oil with premium synthetic oil suited for your car, replace the oil filter, and check for leaks.', 8500.00, 1, 'Maintenance', '/images/demo/service-oil.jpg', false),
('brake-inspection', 'Brake Inspection', 'Thorough brake system check and pad replacement if needed.', 'Safety first. We inspect brake pads, rotors, and fluid levels. Price shown is starting price for inspection. Parts not included.', 3500.00, 2, 'Safety', '/images/demo/service-brake.jpg', false),
('battery-check', 'Battery Check', 'Battery health diagnosis and charging system test.', 'Quick and accurate battery health check. Includes terminal cleaning and alternator output test.', 1500.00, 1, 'Electrical', '/images/demo/service-battery.jpg', false),
('emergency-inspection', 'Emergency Inspection', 'Rapid diagnosis for breakdowns or urgent issues.', 'Immediate attention for critical mechanical or electrical failures. Jump ahead of the line.', 5000.00, 1, 'Emergency', '/images/demo/service-emergency.jpg', true),
('ac-service', 'A/C Service', 'Air conditioning system regas and performance check.', 'Keep your interior cool with a complete A/C system check and refrigerant refill.', 12000.00, 2, 'Comfort', '/images/demo/service-ac.jpg', false),
('wheel-alignment', 'Wheel Alignment', 'Precision wheel alignment and balancing.', 'Laser-guided wheel alignment fixing pull and uneven tire wear.', 4000.00, 1, 'Maintenance', '/images/demo/service-alignment.jpg', false);
