/*
# VATTAMS HOME SERVICES - Initial Database Schema

1. Overview
This migration creates the complete database schema for a mobile-first service booking platform
with three user types: Customers, Technicians, and Admins.

2. New Tables
- `categories` - Service categories (AC Services, Plumbing, Electrical, etc.)
- `services` - Individual services with pricing
- `banners` - Promotional banners for the home screen
- `customers` - Customer profiles linked to auth.users
- `technicians` - Technician profiles with skills and availability
- `bookings` - Service booking records with full status tracking
- `booking_images` - Before/after images for each booking
- `payments` - Payment records for completed services
- `reviews` - Customer reviews for technicians
- `notifications` - In-app notifications for all users
- `coupons` - Discount coupons for customers
- `invoices` - Generated invoices for completed bookings
- `app_settings` - Platform configuration settings

3. Security
- RLS enabled on all tables
- Owner-scoped policies for customers, technicians
- Admin has full access via service role
- Proper foreign key constraints with cascade deletes

4. Important Notes
- Uses Supabase Auth for authentication
- Mobile OTP and Google OAuth supported
- Booking status tracked through full lifecycle
- Technician location tracking for live tracking
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  base_price decimal(10,2) NOT NULL,
  duration_minutes integer DEFAULT 60,
  image_url text,
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  link_type text CHECK (link_type IN ('category', 'service', 'url')),
  link_value text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  address text,
  city text,
  pincode text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  landmark text,
  profile_image_url text,
  fcm_token text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  address text,
  city text,
  pincode text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  profile_image_url text,
  aadhaar_number text,
  pan_number text,
  skills jsonb DEFAULT '[]',
  categories jsonb DEFAULT '[]',
  is_online boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  is_suspended boolean DEFAULT false,
  rating decimal(3,2) DEFAULT 0.00,
  total_jobs integer DEFAULT 0,
  total_earnings decimal(10,2) DEFAULT 0.00,
  fcm_token text,
  bank_account_number text,
  bank_ifsc text,
  bank_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Customer details at booking time
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  customer_landmark text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  
  -- Service details
  service_name text NOT NULL,
  service_price decimal(10,2) NOT NULL,
  
  -- Scheduling
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  
  -- Status tracking
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'assigned',
    'technician_on_the_way',
    'started',
    'completed',
    'cancelled'
  )),
  
  -- Additional info
  notes text,
  images text[],
  
  -- Pricing
  final_amount decimal(10,2),
  parts_used jsonb DEFAULT '[]',
  parts_cost decimal(10,2) DEFAULT 0.00,
  service_charge decimal(10,2) DEFAULT 0.00,
  discount_amount decimal(10,2) DEFAULT 0.00,
  coupon_id uuid,
  
  -- Timestamps
  assigned_at timestamptz,
  on_the_way_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Booking images table
CREATE TABLE IF NOT EXISTS booking_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  image_type text NOT NULL CHECK (image_type IN ('before', 'after')),
  image_url text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'card', 'online')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'technician', 'admin')),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL,
  min_order_amount decimal(10,2) DEFAULT 0.00,
  max_discount decimal(10,2),
  usage_limit integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  
  -- Invoice details
  subtotal decimal(10,2) NOT NULL,
  discount decimal(10,2) DEFAULT 0.00,
  tax decimal(10,2) DEFAULT 0.00,
  total decimal(10,2) NOT NULL,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_technician ON bookings(technician_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Services policies (public read)
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Banners policies (public read)
DROP POLICY IF EXISTS "public_read_banners" ON banners;
CREATE POLICY "public_read_banners" ON banners FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Customers policies (owner only)
DROP POLICY IF EXISTS "customers_select_own" ON customers;
CREATE POLICY "customers_select_own" ON customers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "customers_insert_own" ON customers;
CREATE POLICY "customers_insert_own" ON customers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "customers_update_own" ON customers;
CREATE POLICY "customers_update_own" ON customers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Technicians policies (owner only)
DROP POLICY IF EXISTS "technicians_select_own" ON technicians;
CREATE POLICY "technicians_select_own" ON technicians FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "technicians_insert_own" ON technicians;
CREATE POLICY "technicians_insert_own" ON technicians FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "technicians_update_own" ON technicians;
CREATE POLICY "technicians_update_own" ON technicians FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bookings policies (customer/technician access)
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
CREATE POLICY "bookings_select_own" ON bookings FOR SELECT
  TO authenticated USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR technician_id IN (SELECT id FROM technicians WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "bookings_insert_customer" ON bookings;
CREATE POLICY "bookings_insert_customer" ON bookings FOR INSERT
  TO authenticated WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "bookings_update_own" ON bookings;
CREATE POLICY "bookings_update_own" ON bookings FOR UPDATE
  TO authenticated USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR technician_id IN (SELECT id FROM technicians WHERE user_id = auth.uid())
  );

-- Booking images policies (via booking ownership)
DROP POLICY IF EXISTS "booking_images_select" ON booking_images;
CREATE POLICY "booking_images_select" ON booking_images FOR SELECT
  TO authenticated USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
      OR technician_id IN (SELECT id FROM technicians WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "booking_images_insert" ON booking_images;
CREATE POLICY "booking_images_insert" ON booking_images FOR INSERT
  TO authenticated WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE technician_id IN (SELECT id FROM technicians WHERE user_id = auth.uid())
    )
  );

-- Payments policies
DROP POLICY IF EXISTS "payments_select_own" ON payments;
CREATE POLICY "payments_select_own" ON payments FOR SELECT
  TO authenticated USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR technician_id IN (SELECT id FROM technicians WHERE user_id = auth.uid())
  );

-- Reviews policies
DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  TO anon, authenticated USING (is_public = true);

DROP POLICY IF EXISTS "reviews_insert_customer" ON reviews;
CREATE POLICY "reviews_insert_customer" ON reviews FOR INSERT
  TO authenticated WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Notifications policies (owner only)
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Coupons policies (public read active coupons)
DROP POLICY IF EXISTS "coupons_read" ON coupons;
CREATE POLICY "coupons_read" ON coupons FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Invoices policies
DROP POLICY IF EXISTS "invoices_select_own" ON invoices;
CREATE POLICY "invoices_select_own" ON invoices FOR SELECT
  TO authenticated USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR technician_id IN (SELECT id FROM technicians WHERE user_id = auth.uid())
  );

-- App settings (public read)
DROP POLICY IF EXISTS "settings_read" ON app_settings;
CREATE POLICY "settings_read" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

-- Create function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS text AS $$
DECLARE
  booking_num text;
BEGIN
  booking_num := 'VHS' || to_char(now(), 'YYMMDD') || '-' || 
    lpad(floor(random() * 10000)::text, 4, '0');
  RETURN booking_num;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  invoice_num text;
BEGIN
  invoice_num := 'INV' || to_char(now(), 'YYMM') || '-' || 
    lpad(floor(random() * 100000)::text, 5, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Insert default categories
INSERT INTO categories (name, description, icon, display_order) VALUES
('AC Services', 'Air conditioning installation, repair, and maintenance', 'wind', 1),
('Refrigerator', 'Refrigerator repair and maintenance', 'thermometer', 2),
('Washing Machine', 'Washing machine repair and service', 'droplets', 3),
('CCTV', 'Security camera installation and setup', 'video', 4),
('Electrical', 'Electrical wiring, repair, and installation', 'zap', 5),
('Plumbing', 'Plumbing services and repairs', 'wrench', 6)
ON CONFLICT DO NOTHING;

-- Insert default services
INSERT INTO services (category_id, name, description, base_price, is_popular) VALUES
((SELECT id FROM categories WHERE name = 'AC Services'), 'AC Installation', 'Professional AC installation service', 1499.00, true),
((SELECT id FROM categories WHERE name = 'AC Services'), 'AC Service', 'Regular AC maintenance and service', 499.00, true),
((SELECT id FROM categories WHERE name = 'AC Services'), 'AC Deep Cleaning', 'Thorough deep cleaning of AC unit', 799.00, false),
((SELECT id FROM categories WHERE name = 'AC Services'), 'AC Jet Pump Cleaning', 'High-pressure jet pump cleaning', 699.00, false),
((SELECT id FROM categories WHERE name = 'AC Services'), 'AC Gas Refill', 'Gas refill and pressure check', 999.00, true),
((SELECT id FROM categories WHERE name = 'Refrigerator'), 'Refrigerator Repair', 'Repair for all refrigerator issues', 599.00, true),
((SELECT id FROM categories WHERE name = 'Washing Machine'), 'Washing Machine Repair', 'Repair for all washing machine issues', 599.00, true),
((SELECT id FROM categories WHERE name = 'CCTV'), 'CCTV Installation', 'Security camera installation', 999.00, false),
((SELECT id FROM categories WHERE name = 'Electrical'), 'Electrical Repair', 'General electrical repair work', 399.00, true),
((SELECT id FROM categories WHERE name = 'Plumbing'), 'Plumbing Service', 'General plumbing repairs', 399.00, true)
ON CONFLICT DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (key, value, description) VALUES
('app_name', 'VATTAMS HOME SERVICES', 'Application name'),
('support_phone', '+91-9876543210', 'Support phone number'),
('support_whatsapp', '+91-9876543210', 'WhatsApp support number'),
('service_charge_percent', '10', 'Service charge percentage'),
('min_booking_amount', '99', 'Minimum booking amount')
ON CONFLICT (key) DO NOTHING;