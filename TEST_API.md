# API Endpoint Test Guide

## Quick Browser Console Test

Once your deployment is live, open your browser console (F12) on any page and run:

```javascript
// Test the AI Import API endpoint
fetch('https://linktree-killer.vercel.app/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ url: 'tayloredpetportraits.com' })
})
.then(res => res.json())
.then(data => {
  console.log('✅ API Response:', data);
  if (data.error && data.error.includes('OpenAI API key')) {
    console.error('❌ API Key not configured!');
  } else if (data.success) {
    console.log('✅ API is working! Generated profile:', data.data);
  }
})
.catch(err => console.error('❌ Error:', err));
```

## Expected Results

### ✅ Success (API Key Configured):
```json
{
  "success": true,
  "data": {
    "name": "Taylored Pet Portraits",
    "bio": "Custom pet portraits...",
    "bg1": "#3b82f6",
    "bg2": "#2563eb",
    "btn": "#1d4ed8",
    "links": [...]
  }
}
```

### ❌ Error (API Key Missing):
```json
{
  "error": "OpenAI API key not configured"
}
```

### ❌ Other Errors:
- `404 Not Found` → API route not deployed
- `500 Internal Server Error` → Check function logs
- Network error → Deployment may still be building

## Manual Test in Builder

1. Go to: `https://linktree-killer.vercel.app/builder.html`
2. Log in
3. Paste a URL in "AI Magic Import" field
4. Click "AI Import"
5. Watch for:
   - Button shows "Analyzing..." (loading state works)
   - After 5-10 seconds, form populates
   - Success toast appears
