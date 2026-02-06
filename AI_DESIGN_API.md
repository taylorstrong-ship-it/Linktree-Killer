# AI Design API - Setup Guide

## 🚀 Quick Start

The AI Design API (`/api/ai-design`) generates premium social media images using Google's Generative AI.

### Environment Variable

Add your Google AI API key to `.env.local`:

```env
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

**Get your API key:** https://ai.google.dev/

---

## 📡 API Reference

### Endpoint
```
POST /api/ai-design
```

### Request Body

```typescript
{
  "image": "data:image/png;base64,...",  // Base64 encoded image
  "brandDNA": {
    "primaryColor": "#FF6B35",           // Hex color
    "vibe": "Bold & Energetic",          // Brand personality
    "industry": "Fitness"                // Business category
  },
  "campaign": "$19 Family Night",        // Text to render
  "aspectRatio": "1:1"                   // "1:1" or "9:16"
}
```

### Response (Success)

```typescript
{
  "success": true,
  "imageBase64": "data:image/png;base64,..."
}
```

### Response (Error)

```typescript
{
  "success": false,
  "error": "Content blocked by safety filters",
  "message": "User-friendly explanation"
}
```

---

## 🛡️ Constraints

| Constraint | Value | Reason |
|-----------|-------|--------|
| **Max Payload** | 4MB | Vercel Edge runtime limit |
| **Image Resize** | 1024x1024 | Client-side optimization |
| **Output Format** | Base64 | Instant preview (ephemeral) |
| **Runtime** | Edge | Low latency |

---

## ⚡ Example Usage (React)

```typescript
const generateImage = async () => {
  const response = await fetch('/api/ai-design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Image,
      brandDNA: {
        primaryColor: '#FF6B35',
        vibe: 'Bold & Energetic',
        industry: 'Fitness'
      },
      campaign: '$19 Family Night',
      aspectRatio: '1:1'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Display the generated image
    setPreviewImage(data.imageBase64);
  } else {
    // Handle error
    console.error(data.error, data.message);
  }
};
```

---

## 🔍 Error Handling

| Error Code | Reason | Solution |
|-----------|--------|----------|
| **400** | Invalid input | Check request format |
| **400** | Safety filter | Try different image/text |
| **429** | Quota exceeded | Wait and retry |
| **503** | Missing API key | Configure environment |
| **504** | Timeout | Reduce image size |

---

## 🧪 Testing Checklist

- [ ] Valid request with all fields
- [ ] Missing required fields (should error)
- [ ] Oversized image (should reject)
- [ ] Invalid aspectRatio (should reject)
- [ ] Safety filter trigger (graceful error)
- [ ] API key missing (503 response)

---

## 📝 Notes

- **Stateless Design:** No database writes. Images are ephemeral.
- **Storage:** Upload to Supabase only when user clicks "Save" or "Post"
- **Rate Limiting:** Currently relies on Vercel's built-in protection
- **Model:** Uses `models/nano-banana-pro-preview` (verify model availability)

---

## 🚨 Next Steps

1. **Replace API Key Placeholder:** Update `.env.local` with real Google AI key
2. **Verify Model Name:** Confirm `nano-banana-pro-preview` exists in your Google AI account
3. **Test Endpoint:** Send a test request and verify Base64 response
4. **Monitor Costs:** Track API usage in Google AI console
