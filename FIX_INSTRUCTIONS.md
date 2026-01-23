# 🧨 Nuclear Fix Instructions

## The Problem
Error: `column profiles.user_id does not exist`

## The Solution

### Step 1: Run the SQL Fix in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of `schema_nuclear_fix.sql`
3. Paste and click **Run**

**What this does:**
- ✅ Adds `user_id` column to `profiles` table
- ✅ Populates `user_id` for existing rows (sets it = `id`)
- ✅ Updates the trigger to populate both `id` and `user_id` on signup
- ✅ Adds a constraint to keep `user_id` in sync with `id`

**Note:** The SQL script includes an optional `TRUNCATE` command (commented out) to delete all users. Uncomment it if you want a fresh start.

### Step 2: Verify the AI Button

The AI Auto-Build button is **already implemented** in `builder.html`:

- ✅ Located at the top of the sidebar
- ✅ Purple gradient background
- ✅ Input field: "Paste your Instagram or Website URL..."
- ✅ Button: "🚀 Auto-Build Profile"
- ✅ Loading state: "👨‍🍳 Let it cook..."
- ✅ Success state: "Done!" (shows for 2 seconds)

**The button calls `aiMagicImport()` function which:**
- Calls `/api/generate` endpoint
- Shows loading spinner
- Populates form fields on success
- Updates preview automatically

### Step 3: Test It

1. **Refresh** your website after running the SQL script
2. **Sign Up** as a new user (or sign in if you kept existing users)
3. You should see the **Purple "✨ AI Magic Import"** box at the top
4. Paste a URL (e.g., `tayloredpetportraits.com`)
5. Click **"🚀 Auto-Build Profile"**
6. Watch it say **"👨‍🍳 Let it cook..."**
7. See **"Done!"** after completion
8. Form fields should auto-populate!

## What Changed

### Database (`schema_nuclear_fix.sql`)
- Added `user_id` column (mirrors `id`)
- Updated trigger to populate both columns
- Added constraint to keep them in sync

### Code (`script.js`)
- Updated `saveProfile()` to include `user_id`
- Updated `createDefaultProfile()` to include `user_id`
- All queries still use `id` as primary key, but `user_id` is included for compatibility

### UI (`builder.html`)
- AI button already implemented ✅
- "Let it cook" loading message ✅
- "Done!" success state ✅

## Troubleshooting

**If you still see the error:**
1. Make sure you ran the SQL script in Supabase
2. Check that the `user_id` column exists: `SELECT * FROM profiles LIMIT 1;`
3. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Check browser console for any JavaScript errors

**If the AI button doesn't work:**
1. Check browser console (F12) for errors
2. Verify `/api/generate` endpoint is deployed (check Vercel logs)
3. Make sure OpenAI API key is set in Vercel environment variables
