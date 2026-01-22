-- Supabase Schema for Linktree Killer Profiles Table
-- Run this in the Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Branding
    name TEXT DEFAULT 'Taylored Pet Portraits',
    bio TEXT DEFAULT 'Custom portraits & helping shelter pets 🐾',
    logo TEXT DEFAULT 'logo.gif',
    
    -- Theme Colors
    bg1 TEXT DEFAULT '#E4F3FF',
    bg2 TEXT DEFAULT '#E0D6FF',
    btn TEXT DEFAULT '#7DC6FF',
    btnText TEXT DEFAULT '#ffffff',
    btnPadY TEXT DEFAULT '18',
    btnRadius TEXT DEFAULT '50',
    
    -- Contact Information
    contactName TEXT DEFAULT 'Taylor Strong',
    contactPhone TEXT DEFAULT '555-0123',
    contactEmail TEXT DEFAULT 'hello@taylored.com',
    contactTitle TEXT DEFAULT 'Founder',
    contactWebsite TEXT DEFAULT 'https://tayloredpetportraits.com',
    notificationEmail TEXT DEFAULT 'leads@mybrand.com',
    
    -- Media
    mediaUrl TEXT DEFAULT '',
    
    -- Links (stored as JSONB array)
    links JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);

-- Ensure one profile per user
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Note: Default profiles are now created automatically via trigger when users sign up
-- See the create_profile_for_new_user() function below

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create default profile for new user
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, name, bio, logo, links)
    VALUES (
        NEW.id,
        'My Link Page',
        'Welcome to your link page! 🎉',
        'logo.gif',
        '[
            {"label": "My Website", "url": "https://example.com", "icon": "fa-globe"},
            {"label": "Contact Me", "url": "mailto:hello@example.com", "icon": "fa-envelope"}
        ]'::jsonb
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user();
