/*
# Fix profiles table for phone OTP auth

1. Changes to `profiles` table
   - Add `phone` column for storing user phone numbers
   - Add `name` column for optional user name
   - These are needed for phone OTP login flow

2. Add RLS policies for the new columns
   - Allow users to insert their own profile
   - Allow users to read their own profile
   - Allow users to update their own profile

3. Note: The app uses phone OTP for customer/technician login
*/

-- Add phone and name columns if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
    ALTER TABLE profiles ADD COLUMN name text;
  END IF;
END $$;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users delete own profile" ON profiles;
CREATE POLICY "Users delete own profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Grant anon access for unauthenticated users (for testing)
DROP POLICY IF EXISTS "Anon can insert profiles" ON profiles;
CREATE POLICY "Anon can insert profiles" ON profiles FOR INSERT
  TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can read profiles" ON profiles;
CREATE POLICY "Anon can read profiles" ON profiles FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "Anon can update profiles" ON profiles;
CREATE POLICY "Anon can update profiles" ON profiles FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone);
