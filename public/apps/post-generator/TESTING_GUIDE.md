# PostGenerator - Quick Start Guide

## Prerequisites Checklist

Before testing PostGenerator, ensure:

- [ ] Supabase project is set up
- [ ] Database migrations have been run
- [ ] Storage bucket is configured
- [ ] Edge Function is deployed (mock version is fine)
- [ ] Environment variables are set in Vercel
- [ ] The app is deployed or running locally

---

## Step 1: Run Database Migrations

Execute these SQL files in your Supabase SQL Editor (or via CLI):

```bash
# Option A: Via Supabase Dashboard
# Go to SQL Editor → New Query → Paste contents of each file → Run

# Option B: Via psql CLI
psql $DATABASE_URL < migrations/create_brand_kits_table.sql
psql $DATABASE_URL < migrations/create_generated_posts_table.sql
psql $DATABASE_URL < migrations/create_storage_buckets.sql
```

**Verify**:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('brand_kits', 'generated_posts');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('brand_kits', 'generated_posts');

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'post-generator';
```

---

## Step 2: Deploy Edge Function (Optional - Mock)

The mock Edge Function is included for testing. Deploy it:

```bash
# If using Supabase CLI
supabase functions deploy generate-post

# Test locally first
supabase functions serve generate-post

# In another terminal, test it
curl -X POST http://localhost:54321/functions/v1/generate-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "brandKit": {
      "primary_color": "#3B82F6",
      "secondary_color": "#10B981"
    },
    "textContent": {
      "headline": "Test Post",
      "body": "This is a test",
      "cta": "Click Here"
    },
    "template": "bold-headline"
  }'
```

Expected response:
```json
{
  "success": true,
  "imageUrl": "https://placehold.co/1200x630/...",
  "timestamp": "2026-01-31T..."
}
```

---

## Step 3: Test the Frontend

### 3.1 Access the App

**Local Development**:
```bash
npm run dev
# Visit: http://localhost:3000/apps/post-generator
```

**Production**:
```
https://yourdomain.com/apps/post-generator
```

### 3.2 Login Flow

1. Visit `/apps/post-generator`
2. If not logged in → redirects to `/login?redirect=/apps/post-generator`
3. Login with your credentials
4. Redirected back to PostGenerator

### 3.3 Create Brand Kit

1. Click "+ New Brand Kit" button
2. Fill in form:
   - **Name**: "My Test Brand"
   - **Logo**: Upload an image (optional)
   - **Primary Color**: Choose blue (#3B82F6)
   - **Secondary Color**: Choose green (#10B981)
   - **Set as default**: Check this box
3. Click "Create"

**Expected Result**:
- Success toast appears
- Brand kit appears in dropdown
- Preview shows selected colors
- Logo appears if uploaded

### 3.4 Generate a Post

1. Select your brand kit from dropdown
2. Click a template (e.g., "Bold Headline")
3. Enter content:
   - **Headline**: "Transform Your Marketing" *(required)*
   - **Body**: "Create stunning posts in seconds"
   - **CTA**: "Get Started Free"
4. Click "Generate Post"

**Expected Result**:
- Loading overlay appears with spinner
- After 2 seconds:
  - Preview shows mock image with your headline
  - Download button appears
  - Success toast notification

### 3.5 Download Post

1. Click "Download Post" button
2. File downloads as `post-2026-01-31.png`
3. Open file → should show placeholder image

---

## Step 4: Test Edge Cases

### Empty State
- Don't create a brand kit
- Try to generate → should show error toast

### Invalid Input
- Leave headline blank
- Try to submit → HTML5 validation prevents

### File Upload
- Try uploading a 10MB file → should show error "File too large"
- Try uploading a PDF → should show error "Invalid file type"

### Mobile Responsiveness
- Open DevTools (F12)
- Toggle device toolbar
- Select iPhone 12 Pro
- Verify:
  - Layout is single column
  - Forms are full-width
  - Modals are centered
  - Touch targets are large enough

---

## Step 5: Verify Database Records

After creating brand kit and generating posts, check Supabase:

```sql
-- Check brand kits
SELECT * FROM brand_kits WHERE user_id = 'YOUR_USER_ID';

-- Check generated posts
SELECT * FROM generated_posts WHERE user_id = 'YOUR_USER_ID';

-- Check storage files
SELECT * FROM storage.objects WHERE bucket_id = 'post-generator';
```

---

## Troubleshooting

### Issue: "Failed to initialize app"
**Solution**: Check browser console for errors. Likely missing env vars.

```javascript
// Should see in console:
window.ENV = {
  SUPABASE_URL: 'https://...',
  SUPABASE_ANON_KEY: 'eyJ...'
}
```

### Issue: "Not authenticated" error
**Solution**: Clear cookies and login again.

### Issue: Edge Function returns 404
**Solution**: 
- Check function is deployed: `supabase functions list`
- Verify URL in `/apps/post-generator/modules/generator.js`

### Issue: Image upload fails
**Solution**:
- Check Storage bucket exists
- Verify RLS policies allow INSERT for authenticated users
- Check file meets requirements (5MB, valid format)

### Issue: "CORS error" when calling Edge Function
**Solution**: Edge Function already has CORS headers. Check:
- Function deployed correctly
- Authorization header included
- Request format matches API contract

---

## Success Criteria

✅ Database tables exist with RLS enabled
✅ Storage bucket created with policies
✅ Edge Function deployed and responding
✅ Can access app at `/apps/post-generator`
✅ Redirects to login when not authenticated
✅ Can create brand kit with logo upload
✅ Can select template
✅ Can generate post (mock image appears)
✅ Can download image
✅ Mobile responsive layout works

---

## Next Steps After Testing

1. **Replace Mock Edge Function**
   - Implement real image generation
   - Use canvas or @vercel/og
   - Apply actual templates

2. **Add Post History**
   - View past generated posts
   - Re-download capability

3. **Deploy to Production**
   ```bash
   git add .
   git commit -m "Add PostGenerator app"
   git push origin main
   # Vercel auto-deploys
   ```

4. **Run Migrations in Production**
   - Go to Supabase Dashboard (production project)
   - SQL Editor → Run migration files
   - Verify tables and policies

5. **Test Production**
   - Visit production URL
   - Complete full workflow
   - Check database records in prod Supabase

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs (Functions → Logs)
3. Verify environment variables
4. Review `apps/post-generator/README.md`
5. Check implementation plan and walkthrough docs

---

**Happy Testing! 🚀**
