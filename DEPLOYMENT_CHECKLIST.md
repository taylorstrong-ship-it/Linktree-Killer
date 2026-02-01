# PostGenerator - Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Review

- [x] All files created and in correct locations
- [x] No syntax errors in JavaScript modules
- [x] HTML structure is valid
- [x] CSS design system implemented
- [x] Shared packages created (config, ui)
- [x] Database migrations written
- [x] Edge Function implemented (mock)
- [x] Vercel routing configured

### ✅ File Structure

```
/linktree-killer/
├── /apps/
│   └── /post-generator/
│       ├── index.html
│       ├── styles.css
│       ├── app.js
│       ├── modules/
│       │   ├── auth.js
│       │   ├── storage.js
│       │   ├── brand-kit.js
│       │   └── generator.js
│       ├── README.md
│       └── TESTING_GUIDE.md
├── /packages/
│   ├── /config/
│   │   ├── supabase-client.js
│   │   └── tailwind.config.js
│   └── /ui/
│       └── shared-nav.js
├── /migrations/
│   ├── create_brand_kits_table.sql
│   ├── create_generated_posts_table.sql
│   └── create_storage_buckets.sql
├── /supabase/
│   └── /functions/
│       └── /generate-post/
│           └── index.ts
└── vercel.json (updated)
```

---

## Deployment Steps

### 1. Database Setup (Required First)

**Run these SQL migrations in Supabase Dashboard:**

```bash
# Go to: Supabase Dashboard → SQL Editor → New Query

# Paste and run each migration in order:
1. create_brand_kits_table.sql
2. create_generated_posts_table.sql
3. create_storage_buckets.sql
```

**Verify**:
```sql
-- Check tables exist
\dt brand_kits
\dt generated_posts

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('brand_kits', 'generated_posts');
```

### 2. Deploy Edge Function

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy function
supabase functions deploy generate-post

# Test it
supabase functions invoke generate-post --data '{
  "brandKit": {"primary_color": "#3B82F6", "secondary_color": "#10B981"},
  "textContent": {"headline": "Test"},
  "template": "bold-headline"
}'
```

### 3. Configure Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

```bash
# These should already exist from BioLinker
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Verify in browser console** (after deployment):
```javascript
// Should be defined
window.ENV.SUPABASE_URL
window.ENV.SUPABASE_ANON_KEY
```

### 4. Deploy to Vercel

```bash
# Commit all changes
git add .
git commit -m "feat: Add PostGenerator app to monorepo

- Created /apps/post-generator with vanilla JS frontend
- Added shared packages (config, ui) for cross-app reusability
- Implemented brand kit management with Supabase
- Created 4 social media post templates
- Set up Edge Function for post generation (mock)
- Configured Vercel routing for static files
- Added comprehensive documentation"

# Push to GitHub
git push origin main

# Vercel will auto-deploy
```

**Monitor deployment**:
- Check Vercel dashboard for build logs
- Verify no build errors
- Check function logs for issues

### 5. Post-Deployment Testing

**Test full workflow**:

1. **Visit App**
   ```
   https://yourdomain.com/apps/post-generator
   ```

2. **Login Flow**
   - Should redirect to `/login` if not authenticated
   - After login, returns to PostGenerator

3. **Create Brand Kit**
   - Click "+ New Brand Kit"
   - Upload logo (test with a small PNG)
   - Set colors
   - Click "Create"
   - Verify success toast

4. **Generate Post**
   - Select brand kit
   - Choose template
   - Enter headline
   - Click "Generate Post"
   - Verify preview appears

5. **Download**
   - Click "Download Post"
   - Verify file downloads

### 6. Verify Database Records

**Check Supabase Tables:**

```sql
-- Should see your brand kit
SELECT * FROM brand_kits ORDER BY created_at DESC LIMIT 5;

-- Should see generated post
SELECT * FROM generated_posts ORDER BY created_at DESC LIMIT 5;

-- Should see uploaded logo (if any)
SELECT * FROM storage.objects 
WHERE bucket_id = 'post-generator' 
ORDER BY created_at DESC LIMIT 5;
```

### 7. Mobile Testing

**Test on real devices**:
- iOS Safari (iPhone)
- Android Chrome
- Tablet (iPad/Android)

**Check**:
- Layout is responsive
- Forms are usable
- Modals display correctly
- Touch targets are adequate (44px+)

---

## Rollback Plan

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Vercel Dashboard
# Deployments → Previous Deployment → Promote to Production
```

---

## Success Criteria

✅ App accessible at `/apps/post-generator`
✅ Authentication redirects working
✅ Brand kit CRUD operations functional
✅ Post generation works (mock images)
✅ Download functionality works
✅ Mobile responsive layout
✅ No console errors
✅ Database tables populated correctly
✅ Storage bucket working
✅ Edge Function responding

---

## Known Limitations

⚠️ **Mock Image Generation**: Currently returns placeholder images from placehold.co
- Replace with real generation logic after initial testing
- See Edge Function TODO comments

⚠️ **No Post History**: Generated posts are saved to DB but not displayed in UI
- Add "My Posts" view in future enhancement

⚠️ **Single Template Styling**: All templates currently return the same mock image
- Implement actual template designs in Edge Function

---

## Monitoring & Logs

**Check these after deployment:**

1. **Vercel Logs**
   - Vercel Dashboard → Deployments → View Function Logs
   - Look for errors during page load

2. **Supabase Logs**
   - Supabase Dashboard → Functions → Logs
   - Check for Edge Function errors

3. **Browser Console**
   - Open DevTools → Console
   - Should see no errors
   - Check network tab for failed requests

4. **Database Activity**
   - Supabase Dashboard → Database → Activity
   - Monitor RLS policy violations

---

## Next Steps After Deployment

1. **Replace Mock Edge Function**
   - Implement real image generation
   - Use canvas or @vercel/og
   - Apply template-specific layouts

2. **Add Advanced Features**
   - Post history view
   - Edit existing posts
   - Share to social media
   - Bulk generation

3. **Performance Optimization**
   - Add loading skeletons
   - Implement image caching
   - Optimize bundle size

4. **Analytics**
   - Track usage metrics
   - Monitor generation times
   - User engagement data

---

## Support & Troubleshooting

**Common Issues:**

| Issue | Solution |
|-------|----------|
| 404 on `/apps/post-generator` | Check vercel.json rewrites deployed |
| "Not authenticated" | Check auth cookies are set at correct domain |
| Upload fails | Verify Storage bucket exists and RLS policies correct |
| Edge Function 500 | Check Supabase logs for function errors |
| Preview not showing | Check CORS headers on Edge Function response |

**Get Help:**
- Review `/apps/post-generator/README.md`
- Check `/apps/post-generator/TESTING_GUIDE.md`
- Review implementation plan and walkthrough docs

---

**Deployment Complete! 🎉**
