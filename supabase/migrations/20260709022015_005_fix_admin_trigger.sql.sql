/*
# Fix handle_new_user trigger to bypass RLS

The handle_new_user trigger function was failing because it inserts into the
admins table which has RLS enabled. Even though the function is SECURITY
DEFINER, it needs to explicitly bypass RLS to insert into the admins table
during user creation.

1. Security Changes
- Recreate handle_new_user() with SECURITY DEFINER and explicit RLS bypass
- The function only creates an admin record for the specific admin email
*/

-- Recreate the trigger function with proper RLS bypass
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if this email matches the admin email
  IF NEW.email = 'admin@vattams.net' THEN
    INSERT INTO admins (user_id, email, name, role, is_active)
    VALUES (NEW.id, NEW.email, 'Super Admin', 'super_admin', true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
