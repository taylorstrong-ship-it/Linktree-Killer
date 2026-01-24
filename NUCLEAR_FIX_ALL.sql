-- 🧨 NUCLEAR FIX: Fixes BOTH constraints AND RLS policies in one shot
-- Run this ONCE in Supabase SQL Editor to fix all save errors

-- ============================================
-- PART 1: FIX CONSTRAINTS
-- ============================================

-- Ensure 'id' is PRIMARY KEY (required for upsert)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Add Unique Constraint on 'user_id' for safety
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- ============================================
-- PART 2: FIX RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;

-- Create NEW policies

-- A. PUBLIC READ (allows everyone to view profiles)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- B. AUTH INSERT (allows logged-in users to create their own profile)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- C. AUTH UPDATE (allows logged-in users to update their own profile)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ NUCLEAR FIX COMPLETE!';
    RAISE NOTICE '✅ Constraints set on id and user_id';
    RAISE NOTICE '✅ RLS Policies reset';
    RAISE NOTICE '✅ You should be able to save now!';
END $$;
