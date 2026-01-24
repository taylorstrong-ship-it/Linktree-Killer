-- 🚨 FIX RLS POLICY: Allow public to read profiles!
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated or anonymous) to SELECT (read) profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Ensure we don't have conflicting policies (optional, but good practice)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- Verify the fix
SELECT * FROM public.profiles LIMIT 1;
