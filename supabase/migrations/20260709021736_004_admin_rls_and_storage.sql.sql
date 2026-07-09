/*
# Admin RLS Policies and Storage Bucket

1. Overview
This migration adds admin-level RLS policies to all application tables so that
users with an active admin record can perform full CRUD operations. It also
creates a storage bucket for user-uploaded images (profile photos, booking
before/after images, banners, service images).

2. Security Changes
- Adds SELECT/INSERT/UPDATE/DELETE policies for admin users on every table
  that was previously owner-scoped or public-read-only.
- Admin access is granted via the is_admin() helper function which checks
  the admins table for an active record matching auth.uid().
- Creates a public storage bucket "uploads" with RLS policies allowing
  authenticated users to upload and all users to read.

3. Tables Modified
- categories, services, banners — admin write access added
- customers, technicians — admin full access added
- bookings, booking_images — admin full access added
- payments, reviews, notifications — admin full access added
- coupons, invoices, app_settings — admin write access added
- admins — admin management access

4. Storage
- Creates "uploads" bucket for file uploads.
- Public read, authenticated write policies.

5. Important Notes
- All policies use DROP IF EXISTS first for idempotency.
- Admin policies are additive — they do not remove existing owner-scoped
  policies, they simply add an additional access path for admin users.
*/

-- ============================================================
-- Helper: is_admin function already exists from migration 002.
-- We use it to gate admin access on every table.
-- ============================================================

-- ============================================================
-- CATEGORIES — admin write
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- SERVICES — admin write
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_services" ON services;
CREATE POLICY "admin_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_update_services" ON services FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- BANNERS — admin write
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_banners" ON banners;
CREATE POLICY "admin_insert_banners" ON banners FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_banners" ON banners;
CREATE POLICY "admin_update_banners" ON banners FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_banners" ON banners;
CREATE POLICY "admin_delete_banners" ON banners FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- CUSTOMERS — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_select_customers" ON customers;
CREATE POLICY "admin_select_customers" ON customers FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_insert_customers" ON customers;
CREATE POLICY "admin_insert_customers" ON customers FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_customers" ON customers;
CREATE POLICY "admin_update_customers" ON customers FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_customers" ON customers;
CREATE POLICY "admin_delete_customers" ON customers FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- TECHNICIANS — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_select_technicians" ON technicians;
CREATE POLICY "admin_select_technicians" ON technicians FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_insert_technicians" ON technicians;
CREATE POLICY "admin_insert_technicians" ON technicians FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_technicians" ON technicians;
CREATE POLICY "admin_update_technicians" ON technicians FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_technicians" ON technicians;
CREATE POLICY "admin_delete_technicians" ON technicians FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- BOOKINGS — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_select_bookings" ON bookings;
CREATE POLICY "admin_select_bookings" ON bookings FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_insert_bookings" ON bookings;
CREATE POLICY "admin_insert_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_bookings" ON bookings;
CREATE POLICY "admin_delete_bookings" ON bookings FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- BOOKING IMAGES — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_select_booking_images" ON booking_images;
CREATE POLICY "admin_select_booking_images" ON booking_images FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_booking_images" ON booking_images;
CREATE POLICY "admin_update_booking_images" ON booking_images FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_booking_images" ON booking_images;
CREATE POLICY "admin_delete_booking_images" ON booking_images FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- PAYMENTS — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_payments" ON payments;
CREATE POLICY "admin_insert_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_payments" ON payments;
CREATE POLICY "admin_update_payments" ON payments FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_payments" ON payments;
CREATE POLICY "admin_delete_payments" ON payments FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- REVIEWS — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_select_reviews" ON reviews;
CREATE POLICY "admin_select_reviews" ON reviews FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- NOTIFICATIONS — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_notifications" ON notifications;
CREATE POLICY "admin_insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_notifications" ON notifications;
CREATE POLICY "admin_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_notifications" ON notifications;
CREATE POLICY "admin_delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- COUPONS — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_coupons" ON coupons;
CREATE POLICY "admin_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- INVOICES — admin full access
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_invoices" ON invoices;
CREATE POLICY "admin_insert_invoices" ON invoices FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_invoices" ON invoices;
CREATE POLICY "admin_update_invoices" ON invoices FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_invoices" ON invoices;
CREATE POLICY "admin_delete_invoices" ON invoices FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- APP SETTINGS — admin write
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_settings" ON app_settings;
CREATE POLICY "admin_insert_settings" ON app_settings FOR INSERT
  TO authenticated WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_settings" ON app_settings;
CREATE POLICY "admin_update_settings" ON app_settings FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_settings" ON app_settings;
CREATE POLICY "admin_delete_settings" ON app_settings FOR DELETE
  TO authenticated USING (is_admin(auth.uid()));

-- ============================================================
-- ADMINS — admin management (super_admin can manage all)
-- ============================================================
DROP POLICY IF EXISTS "admin_select_all_admins" ON admins;
CREATE POLICY "admin_select_all_admins" ON admins FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_all_admins" ON admins;
CREATE POLICY "admin_update_all_admins" ON admins FOR UPDATE
  TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_admins" ON admins;
CREATE POLICY "admin_delete_admins" ON admins FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid() AND a.role = 'super_admin')
  );

-- ============================================================
-- STORAGE BUCKET: uploads
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
CREATE POLICY "Public read uploads" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Authenticated upload uploads" ON storage.objects;
CREATE POLICY "Authenticated upload uploads" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Authenticated update uploads" ON storage.objects;
CREATE POLICY "Authenticated update uploads" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'uploads') WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Authenticated delete uploads" ON storage.objects;
CREATE POLICY "Authenticated delete uploads" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'uploads');
