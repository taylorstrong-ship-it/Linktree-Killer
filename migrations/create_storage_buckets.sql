-- Migration: Create Supabase Storage bucket for PostGenerator
-- Description: Set up storage bucket and RLS policies for user uploads
-- Author: Taylored Solutions
-- Created: 2026-01-31

-- Create storage bucket for post-generator (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-generator',
  'post-generator',
  true,  -- Public access to generated URLs
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage Objects

-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'post-generator' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update files in their own folder
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'post-generator' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete files in their own folder
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'post-generator' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Anyone can read files from post-generator bucket (public access)
CREATE POLICY "Public read access to post-generator files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-generator');
