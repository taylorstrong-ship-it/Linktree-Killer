# Directive: Fix Save Profile Error (Constraint Mismatch)

## The Problem
The user sees "Error saving profile: there is no unique or exclusion constraint matching the ON CONFLICT specification".
This happens because `script.js` calls `.upsert(..., { onConflict: 'id' })`, but the `profiles` table in Supabase likely missing the **Primary Key** or **Unique Constraint** on the `id` column.

## The Solution
Run a SQL script to force the constraints to exist.

### Step 1: Run `fix_constraints.sql` in Supabase
1. Go to **Supabase Dashboard** → **SQL Editor**.
2. Paste the contents of `fix_constraints.sql`.
3. Click **Run**.

### Step 2: Verify
1. Reload the "Linktree Killer" app (localhost or deployed).
2. Click "Save Changes".
3. Success message should appear.

## Technical Details
The SQL script will:
1. Ensure `id` is the **PRIMARY KEY**.
2. Add a unique constraint to `user_id` as well (for good measure).
3. Verify the constraints exist.
