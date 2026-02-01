# Magic Import Diagnostic Test

## Test the live deployment

1. Open browser DevTools (F12)
2. Go to Console tab
3. Go to https://www.tayloredsolutions.ai/builder
4. Login if needed
5. Click "Magic Import from URL"
6. Paste: https://stripe.com
7. Click Import
8. Watch the Console for these logs:

### Expected Console Output (Working):
```
🚀 Launching Magic Scrape for: https://stripe.com
✨ Magic Import started: {businessName: "Stripe", ...}
🎨 Business DNA Extracted: {colors: {...}, fonts: [...], ...}
✅ Extracted: Stripe (8523ms total)
```

### If You See This (API Key Missing):
```
❌ Import failed: Failed to fetch
Network tab shows: 500 Internal Server Error
```

### If You See This (Timeout):
```
⏱️ Request timed out (30s limit)
```

### If You See This (Zod Validation):
```
❌ Import failed: Missing business name - could not extract brand identity
```

## Quick Fix Checklist

### 1. Check Vercel Environment Variables
```bash
vercel env ls
```

Should show:
- ✅ OPENAI_API_KEY (production, preview, development)
- ✅ FIRECRAWL_KEY (production, preview, development)
- ✅ VAPI_PRIVATE_KEY (production, preview, development)

### 2. If Missing, Add Them:
Go to: https://vercel.com/dashboard
→ Select project: linktree-killer
→ Settings → Environment Variables
→ Add missing keys
→ Redeploy

### 3. Check Latest Deployment
```bash
vercel ls
```

The top one should be "Ready" (not "Error")

### 4. Force Redeploy (if needed)
```bash
vercel --prod
```

## Common Issues

**Issue 1: "Animation spins forever"**
- Cause: API timeout or network error
- Fix: Check console for specific error, verify env vars

**Issue 2: "No colors extracted"**
- Cause: OpenAI returned empty response or parsing failed
- Fix: Check if OPENAI_API_KEY is set in Vercel

**Issue 3: "Failed to fetch"**
- Cause: API route crashed (likely missing env var)
- Fix: Add OPENAI_API_KEY to Vercel

**Issue 4: "Works locally, broken on Vercel"**
- Cause: .env file exists locally but not on Vercel
- Fix: Add all keys to Vercel Environment Variables
