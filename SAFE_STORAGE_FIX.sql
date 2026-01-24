-- Safe Storage Bucket Setup
-- This script safely creates the 'images' bucket and sets up proper permissions
-- Run this in Supabase SQL Editor

-- 1. Create Bucket (Safely - won't error if it already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop Old Policies (To fix the "already exists" error)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;

-- 3. Re-Apply Fresh Policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- Verify the setup
SELECT 
    'Bucket created: ' || name as status,
    'Public: ' || public as access_level
FROM storage.buckets 
WHERE id = 'images';
