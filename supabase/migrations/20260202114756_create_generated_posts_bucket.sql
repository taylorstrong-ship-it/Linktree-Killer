-- PostGenerator 2.0: Create Storage Bucket for Generated Posts
-- Run this in Supabase SQL Editor or Dashboard

-- 1. Create public bucket for generated posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'generated-posts',
    'generated-posts',
    true,  -- Public read access
    10485760,  -- 10MB max file size
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable public read access (anyone can view)
CREATE POLICY "Public read access for generated posts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-posts');

-- 3. Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated-posts');

-- 4. Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'generated-posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verification
SELECT * FROM storage.buckets WHERE id = 'generated-posts';
