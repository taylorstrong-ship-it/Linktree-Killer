-- 🔧 FIX: Reset RLS Policies to allow saving

-- 1. Enable RLS (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to ensure a clean slate
-- We use diverse names to catch whatever might be there
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;

-- 3. Create NEW, clean policies

-- A. PUBLIC READ: Allow everyone to see profiles (required for public pages)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- B. AUTH INSERT: Allow authenticated users to insert THEIR OWN profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- C. AUTH UPDATE: Allow authenticated users to update THEIR OWN profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Verify
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies Reset! You should be able to save now.';
END $$;
