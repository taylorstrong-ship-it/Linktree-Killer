# 🎯 Hunter API v2 - Upgrade Complete

**Date:** January 26, 2026  
**Status:** ✅ Ready for Testing

---

## ✨ What Changed

### 1. **New Schema Structure**

**BEFORE (v1):**
```typescript
{
  businessName: string,
  colors: { primary, secondary },
  services: string[],
  tone: string,
  vibe: string,  // freeform text
  socials: {      // OLD
    facebook?: string,
    instagram?: string,
    linkedin?: string,
    twitter?: string
  },
  review_links: string[],
  contact_email: string
}
```

**AFTER (v2 - Hunter):**
```typescript
{
  businessName: string,
  tagline: string,
  industry: "Salon" | "Restaurant" | "General",  // NEW
  vibe: "Luxury" | "Casual" | "High Energy",     // NOW ENUM
  colors: { primary, secondary },
  description: string,  // NEW (max 150 chars for SEO)
 services: string[],
  contact: {  // NEW OBJECT
    phone: string,
    address: string,
    email: string
  },
  links: {  // 🔥 THE MONEY SECTION
    booking_url: string,    // 🎯 HUNTER TARGET
    instagram?: string,
    facebook?: string
  },
  voice_setup: {  // NEW
    tone: string,
    welcome_message: string
  }
}
```

---

## 🔥 Key Upgrade: "Hunter" Logic

The system prompt now explicitly instructs GPT-4o to:

1. **Identify the Industry** (Salon, Restaurant, General)
2. **Hunt for Action URLs**:
   - Salons → Square, Vagaro, GlossGenius, Booksy
   - Restaurants → Toast, UberEats, DoorDash
3. **Return the external booking URL** in `links.booking_url`

**If no external platform is found**, it will fallback to the main website URL.

---

## 🛠️ Frontend Migration Guide

If you have pages consuming `/api/brand-dna`, update them like this:

### Old Code (v1):
```typescript
const response = await fetch('/api/brand-dna', { ... });
const { dna } = await response.json();

// Old field names
const instagram = dna.socials?.instagram;
const email = dna.contact_email;
const primaryColor = dna.colors.primary;
```

### New Code (v2):
```typescript
const response = await fetch('/api/brand-dna', { ... });
const { dna } = await response.json();

// New field names
const instagram = dna.links?.instagram;           // ✅ socials → links
const bookingUrl = dna.links.booking_url;         // ✅ NEW!
const email = dna.contact.email;                  // ✅ contact_email → contact.email
const phone = dna.contact.phone;                  // ✅ NEW!
const primaryColor = dna.colors.primary;          // ✅ Same
const industry = dna.industry;                    // ✅ NEW!
const welcomeMsg = dna.voice_setup.welcome_message; // ✅ NEW!
```

---

## 🧪 Testing the Upgrade

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Run Hunter Test
```bash
node test-hunter-api.js
```

### Step 3: Verify Golden Record
The test will show:
```
🔥 GOLDEN RECORD TEST:
   Booking URL: https://salon-shea.square.site
   Is External Platform: ✅ YES
```

**✅ If you see `square.site`, `vagaro.com`, or similar → SUCCESS!**

---

## 🚨 Breaking Changes

### Removed Fields
- ❌ `socials` object (now `links.instagram`, `links.facebook`)
- ❌ `review_links` array (not in v2 schema)
- ❌ `contact_email` (now `contact.email`)
- ❌ `tone` at root level (now `voice_setup.tone`)

### New Required Fields
- ✅ `industry` (enum)
- ✅ `vibe` (now enum instead of freeform)
- ✅ `description` (string, max 150 chars)
- ✅ `contact` object (phone, address, email)
- ✅ `links.booking_url` (string)
- ✅ `voice_setup` object (tone, welcome_message)

---

## 📦 Files Modified

| File | Change |
|------|--------|
| `app/api/brand-dna/route.ts` | ✅ Schema upgraded, Hunter prompt installed |
| `test-hunter-api.js` | ✅ New test script created |
| `HUNTER_UPGRADE.md` | ✅ This migration guide |

---

## 🎯 Next Steps

1. **Test locally**: Run `node test-hunter-api.js` with dev server running
2. **Update frontend**: If you have pages using the old schema, refactor them
3. **Lock it in**: Once tests pass, treat `/api/brand-dna` as a black box utility

**Golden Rule:** Once `booking_url` works reliably, STOP touching `route.ts` and build on top of it.

---

## 💡 Why This Matters

**Problem:** The old scraper couldn't distinguish between:
- The **Brochure** (main website: `hairbyshae.com`)
- The **Register** (booking platform: `salon-shea.square.site`)

**Solution:** Hunter logic explicitly tells the AI to look for external booking URLs, enabling downstream features like:
- AI Receptionist sending booking links via SMS
- Automated appointment scheduling
- Revenue link prioritization

**Philosophy:** The API now understands **business intent**, not just content.

---

🚀 **Ready to test? Run:** `node test-hunter-api.js`
