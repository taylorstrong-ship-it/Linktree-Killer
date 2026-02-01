-- Add custom_domain column to profiles table
-- This allows looking up profiles by a custom domain (e.g., bio.hairbyshea.com)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- Create an index for fast lookups by domain
CREATE INDEX IF NOT EXISTS profiles_custom_domain_idx ON profiles(custom_domain);

-- Comment: To test this, you can manually update a row:
-- UPDATE profiles SET custom_domain = 'bio.hairbyshea.com' WHERE name = 'My Link Page';

-- CRITICAL: Allow public access to profiles (Link-in-Bio pages must be public!)
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);
