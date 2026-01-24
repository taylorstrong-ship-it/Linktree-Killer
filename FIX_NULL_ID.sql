-- 🔧 FIX: Auto-generate ID if app doesn't provide one
-- This prevents "null value in column 'id'" errors

-- 1. Enable UUID generator (required for Postgres to auto-generate IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Set DEFAULT value for ID column
-- If the app sends NULL for id, Postgres will generate a random UUID automatically
ALTER TABLE profiles 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. Similarly for user_id (keep them in sync)
ALTER TABLE profiles 
  ALTER COLUMN user_id SET DEFAULT uuid_generate_v4();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Auto-ID generation enabled!';
    RAISE NOTICE '✅ Now try saving again in the app';
END $$;
