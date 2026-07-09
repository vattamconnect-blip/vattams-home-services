/*
# Fix admin record for admin@vattams.net

1. Changes to `admins` table
   - Ensure admin@vattams.net exists with super_admin role
   - Set is_active = true
   - The admin will use email/password login only

2. Security
   - Add RLS policy for admin access
   - Allow service role to manage admins for authentication
*/

-- Update or insert admin record
INSERT INTO admins (id, email, name, role, is_active)
VALUES (
  gen_random_uuid(),
  'admin@vattams.net',
  'Admin',
  'super_admin',
  true
)
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  is_active = true;

-- Drop old policies and create new ones
DROP POLICY IF EXISTS "Admins read own record by user_id" ON admins;
CREATE POLICY "Admins read own record by user_id" ON admins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on admins" ON admins;
CREATE POLICY "Service role full access on admins" ON admins FOR ALL
  TO service_role USING (true) WITH CHECK (true);
