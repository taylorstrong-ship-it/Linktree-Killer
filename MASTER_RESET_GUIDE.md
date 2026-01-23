# 🧨 Master Reset Guide - Complete Recovery

## The Problem
- Database columns missing (`user_id`, `bg1`, `bg2`, etc.)
- Email verification blocking login
- UI not showing properly

## The Solution: 3-Step Nuclear Reset

### 🔓 Step 1: Turn OFF Email Verification (Do This First!)

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. **Uncheck** "Confirm email" 
3. Click **Save**
4. Go to **Authentication** → **Users** tab
5. **Delete** your existing test user (e.g., `Tay.strong...`) so you can start fresh

**Why:** This allows instant login without waiting for email verification.

---

### 🧨 Step 2: Run the Master Reset SQL

1. Go to **Supabase** → **SQL Editor**
2. **Delete everything** in the editor
3. Copy the **entire contents** of `schema_master_reset.sql`
4. Paste and click **Run**

**What this does:**
- ✅ Deletes ALL users and profiles (fresh start)
- ✅ Creates `profiles` table with **ALL** columns your code needs:
  - `id` (UUID primary key)
  - `user_id` (mirrors id for compatibility)
  - `name`, `bio`, `logo` (branding)
  - `bg1`, `bg2`, `btn`, `btnText`, `btnPadY`, `btnRadius` (theme colors)
  - `contactName`, `contactPhone`, `contactEmail`, `contactTitle`, `contactWebsite`, `notificationEmail` (contact info)
  - `mediaUrl` (media)
  - `links` (JSONB array)
  - Legacy columns: `username`, `full_name`, `avatar_url`, `theme_color`, `views`
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates auto-trigger to create profile on signup
- ✅ Adds constraint to keep `user_id` in sync with `id`

**Expected Result:** You should see "✅ Master Reset Complete!" message.

---

### 🔨 Step 3: Verify the UI (Already Implemented!)

The AI Auto-Build button is **already in `builder.html`**:

✅ **Location:** Top of sidebar (right after header)  
✅ **Design:** Purple gradient card with "✨ AI Magic Import"  
✅ **Input:** "Paste your Instagram or Website URL..."  
✅ **Button:** "🚀 Auto-Build Profile"  
✅ **Loading:** "👨‍🍳 Let it cook..."  
✅ **Success:** "Done!" (shows for 2 seconds)

**If you don't see it:**
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Check browser console (F12) for errors

---

## 🧪 Testing Checklist

After running the SQL script:

1. **Refresh** your website
2. **Sign Up** with a new email (should log in instantly, no email needed)
3. **Verify:** You should see:
   - Purple "✨ AI Magic Import" box at top
   - All form fields visible
   - No console errors
4. **Test AI Import:**
   - Paste `tayloredpetportraits.com` (or any URL)
   - Click "🚀 Auto-Build Profile"
   - Button should say "👨‍🍳 Let it cook..."
   - After completion, shows "Done!" for 2 seconds
   - Form fields should auto-populate
5. **Test Save:**
   - Make a change to any field
   - Click "Save Changes" button
   - Should see "Profile saved successfully!" toast

---

## 🐛 Troubleshooting

### Error: "column profiles.user_id does not exist"
- **Fix:** Make sure you ran `schema_master_reset.sql` completely
- **Check:** Run `SELECT * FROM profiles LIMIT 1;` in SQL Editor to see columns

### Error: "column profiles.bg1 does not exist"
- **Fix:** Same as above - the SQL script includes all columns

### Still can't log in
- **Check:** Email verification is OFF in Supabase Auth settings
- **Check:** You deleted the old user and created a new one
- **Check:** Browser console for auth errors

### AI button not showing
- **Check:** Hard refresh (Cmd+Shift+R)
- **Check:** Browser console for JavaScript errors
- **Check:** `builder.html` has the `ai-auto-build-section` div

### AI button doesn't work
- **Check:** Browser console (F12) for API errors
- **Check:** `/api/generate` endpoint is deployed (check Vercel logs)
- **Check:** OpenAI API key is set in Vercel environment variables

---

## 📋 Files Reference

- **`schema_master_reset.sql`** - Complete database reset script
- **`builder.html`** - Already has AI button implemented
- **`script.js`** - Already has `aiMagicImport()` function
- **`api/generate.js`** - Serverless function for AI generation

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Sign up logs you in instantly (no email wait)
- ✅ Purple AI box is visible at top of sidebar
- ✅ No console errors
- ✅ AI import populates form fields
- ✅ Save button works without errors

**If all checkboxes are green, you're back to cooking! 👨‍🍳**
