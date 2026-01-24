# Directive: Fix RLS Policies

## The Problem
"Error saving profile: new row violates row-level security policy for table 'profiles'".

This means that while the database constraints might be fixed, the security rules (Row Level Security) are preventing you from inserting or updating your profile. This is common if the policies were deleted or set up incorrectly during a previous reset.

## The Solution
Run a SQL script to completely reset the RLS policies to a known working state.

### Step 1: Run `fix_rls.sql` in Supabase
1. Go to **Supabase Dashboard** → **SQL Editor**.
2. Paste the contents of `fix_rls.sql`.
3. Click **Run**.
4. Confirm success message.
5. Go back to your app and click "Save" again.

## Technical Details
This script:
1. Enables RLS on `profiles`.
2. **Drops** all existing policies (cleaning up potential conflicts).
3. **Creates** 3 simple policies:
   - `SELECT`: Everyone (public) can view profiles.
   - `INSERT`: Users can insert a row where `id` matches their Auth UID.
   - `UPDATE`: Users can update a row where `id` matches their Auth UID.
