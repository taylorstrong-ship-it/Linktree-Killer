-- 🔧 FIX: Add constraints to allow UPSERT to work

-- 1. Ensure 'id' is the PRIMARY KEY (This allows onConflict: 'id')
-- We drop it first to be safe, then re-add it.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- 2. Add Unique Constraint on 'user_id' (Backup for safety)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- 3. Verify
DO $$
BEGIN
    RAISE NOTICE '✅ Constraints fixed! You can now save profiles.';
END $$;
