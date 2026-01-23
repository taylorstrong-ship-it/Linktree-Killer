-- 🧨 MASTER RESET SQL - Fixes ALL column errors and rebuilds everything correctly
-- Run this in Supabase SQL Editor to completely reset and fix the database

-- 1. NUCLEAR RESET: Clear old data to stop conflicts
TRUNCATE TABLE auth.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop old functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.ensure_user_id_matches_id();

-- 2. CREATE TABLE: With ALL the columns your code needs (matching script.js getProfileData())
CREATE TABLE public.profiles (
    -- Primary Key (UUID matching auth.users.id)
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Compatibility column (mirrors id)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Branding (matching script.js)
    name TEXT DEFAULT 'My Link Page',
    bio TEXT DEFAULT 'Welcome to your link page! 🎉',
    logo TEXT DEFAULT 'logo.gif',
    
    -- Theme Colors (matching script.js)
    bg1 TEXT DEFAULT '#E4F3FF',
    bg2 TEXT DEFAULT '#E0D6FF',
    btn TEXT DEFAULT '#7DC6FF',
    btnText TEXT DEFAULT '#ffffff',
    btnPadY TEXT DEFAULT '18',
    btnRadius TEXT DEFAULT '50',
    
    -- Contact Information (matching script.js)
    contactName TEXT DEFAULT '',
    contactPhone TEXT DEFAULT '',
    contactEmail TEXT DEFAULT '',
    contactTitle TEXT DEFAULT '',
    contactWebsite TEXT DEFAULT '',
    notificationEmail TEXT DEFAULT '',
    
    -- Media
    mediaUrl TEXT DEFAULT '',
    
    -- Links (stored as JSONB array)
    links JSONB DEFAULT '[]'::jsonb,
    
    -- Legacy columns (for compatibility)
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    theme_color TEXT DEFAULT '#3b82f6',
    views INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create index on user_id for performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);

-- 4. Ensure user_id always equals id (constraint)
CREATE OR REPLACE FUNCTION public.ensure_user_id_matches_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Always keep user_id in sync with id
    IF NEW.user_id IS NULL OR NEW.user_id != NEW.id THEN
        NEW.user_id := NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_id_with_id
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_id_matches_id();

-- 5. PERMISSIONS: Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
    
-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 6. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. AUTO-TRIGGER: Create profile automatically on sign up (with ALL columns)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        user_id,
        name,
        bio,
        logo,
        bg1,
        bg2,
        btn,
        btnText,
        btnPadY,
        btnRadius,
        contactName,
        contactPhone,
        contactEmail,
        contactTitle,
        contactWebsite,
        notificationEmail,
        mediaUrl,
        links,
        username,
        full_name,
        avatar_url,
        theme_color,
        views
    )
    VALUES (
        NEW.id,
        NEW.id,  -- user_id mirrors id
        'My Link Page ' || to_char(NOW(), 'YYYY-MM-DD'),
        'Welcome to your link page! 🎉',
        'logo.gif',
        '#E4F3FF',
        '#E0D6FF',
        '#7DC6FF',
        '#ffffff',
        '18',
        '50',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '[
            {"label": "My Website", "url": "https://example.com", "icon": "fa-globe"},
            {"label": "Contact Me", "url": "mailto:hello@example.com", "icon": "fa-envelope"}
        ]'::jsonb,
        NEW.email,
        'New User',
        'https://placehold.co/400',
        '#3b82f6',
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ATTACH TRIGGER
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Master Reset Complete! All columns created. Ready for signup.';
END $$;
