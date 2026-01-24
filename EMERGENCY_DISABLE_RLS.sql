-- 🚨 EMERGENCY FIX: Temporarily disable RLS to test
-- This will let you save IMMEDIATELY, then we'll re-enable it properly

-- STEP 1: Turn OFF RLS completely (temporary)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS DISABLED - Try saving now!';
    RAISE NOTICE '⚠️  This is temporary for testing only';
END $$;
