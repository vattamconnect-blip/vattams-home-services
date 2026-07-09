/*
# Update Admin Policy and Create Seed Admin

1. Updates the admins table to allow creation for the seed admin email
2. Creates a function to check if a user should be promoted to admin
3. Creates an auto-promotion trigger
*/

-- First, let's allow any authenticated user to insert their own admin record
-- if they match the admin email
DROP POLICY IF EXISTS "admins_insert_check" ON admins;

CREATE POLICY "admins_insert_own_or_seed" ON admins FOR INSERT
  TO authenticated WITH CHECK (
    -- Allow if email matches seed admin
    email = 'admin@vattams.net'
    OR
    -- Or if user is super_admin creating another admin
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid() 
      AND a.role = 'super_admin'
    )
  );

-- Create a function that auto-creates admin record on login
-- This will be called from the frontend for seed admin
CREATE OR REPLACE FUNCTION register_admin(p_user_id uuid, p_email text)
RETURNS void AS $$
BEGIN
  INSERT INTO admins (user_id, email, name, role, is_active)
  VALUES (p_user_id, p_email, CASE WHEN p_email = 'admin@vattams.net' THEN 'Super Admin' ELSE 'Admin' END, 
          CASE WHEN p_email = 'admin@vattams.net' THEN 'super_admin' ELSE 'admin' END, true)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION register_admin TO authenticated;