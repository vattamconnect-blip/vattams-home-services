/*
# Add Admins Table for Admin Panel Authentication

1. New Tables
- `admins` - Admin user profiles with permissions
- Links to auth.users via user_id
- Tracks admin role and permissions

2. Security
- RLS enabled with admin-only access
- Only admin users can manage other admins
- First admin is created via seed data

3. Important Notes
- Admin credentials: admin@vattams.net / Admin@123
- Admin is auto-promoted based on email in app_metadata
- Row Level Security ensures only admins can access admin data
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies: Admins can only access if they have an admin record
DROP POLICY IF EXISTS "admins_select_own" ON admins;
CREATE POLICY "admins_select_own" ON admins FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid() 
      AND a.is_active = true
    )
  );

DROP POLICY IF EXISTS "admins_insert_check" ON admins;
CREATE POLICY "admins_insert_check" ON admins FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid() 
      AND a.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "admins_update_own" ON admins;
CREATE POLICY "admins_update_own" ON admins FOR UPDATE
  TO authenticated USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid() 
      AND a.role = 'super_admin'
    )
  );

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = user_uuid 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup and auto-promote admin
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if this email matches the admin email
  IF NEW.email = 'admin@vattams.net' THEN
    INSERT INTO admins (user_id, email, name, role, is_active)
    VALUES (NEW.id, NEW.email, 'Super Admin', 'super_admin', true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create admin record
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();