-- Migration: Add Newsletter Subscribers Table
-- Date: 2026-01-23
-- Description: Creates subscribers table for newsletter email capture with RLS policies

-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on profile_id for faster lookups
CREATE INDEX IF NOT EXISTS subscribers_profile_id_idx ON public.subscribers(profile_id);

-- Create unique constraint to prevent duplicate subscriptions
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_profile_unique 
ON public.subscribers(email, profile_id);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can subscribe (public INSERT)
CREATE POLICY "Anyone can subscribe to newsletters"
    ON public.subscribers FOR INSERT
    WITH CHECK (true);

-- RLS Policy: Profile owners can view their own subscribers
CREATE POLICY "Profile owners can view their subscribers"
    ON public.subscribers FOR SELECT
    USING (
        profile_id IN (
            SELECT id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE public.subscribers IS 'Newsletter email subscribers linked to profile owners';
COMMENT ON COLUMN public.subscribers.email IS 'Subscriber email address';
COMMENT ON COLUMN public.subscribers.profile_id IS 'Foreign key to the profile owner';
