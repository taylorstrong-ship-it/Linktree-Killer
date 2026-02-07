# Taylored AI Solutions - Project Overview

## 🎯 Project Mission
AI-powered Link-in-Bio builder that extracts Brand DNA from any website and generates complete brand ecosystems in seconds.

---

## 🏗️ Current Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase (PostgreSQL)
- **AI Services**:
  - Firecrawl (web scraping + brand extraction)
  - GPT-4 (business intelligence)
  - Gemini Vision (image generation + analysis)
- **Deployment**: Vercel (frontend) + Supabase (backend)

### Core Systems

#### 1. Brand DNA Extraction Pipeline
**File**: `supabase/functions/extract-brand-dna/index.ts`

**Flow**:
```
User URL → Firecrawl API → Extract:
  - Company name/description
  - Logo + brand images (products, gallery)
  - Color palette (primary, secondary, accents)
  - Typography
  - Social links
  → OpenAI Analysis → Business type detection
  → Return complete Brand DNA object
```

**Key Features**:
- Multi-tier image fallback (logo → hero → OG image → favicon)
- Intelligent brand image extraction (10+ product photos)
- Color palette from logo analysis
- Business type classification

#### 2. Smart Image Selection
**Files**: 
- `supabase/functions/generate-campaign-asset/index.ts` (backend)
- `components/dashboard/SocialPreviewWidget.tsx` (frontend)

**Algorithm**:
1. Filter out logos (by filename, extension, aspect ratio)
2. Score images by:
   - Size (larger = better)
   - Keywords (food, product, menu)
   - Position (earlier in array = better)
3. Select highest-scoring authentic product photo
4. Fallback to hero image if no products found

#### 3. AI Campaign Generation
**File**: `supabase/functions/generate-campaign-asset/index.ts`

**Flow**:
```
Brand DNA + Campaign Brief → Gemini Vision API → Generate:
  - Ad copy (headline + CTA)
  - Image composition (product + branding)
  - Color-coordinated design
  → Return preview URL
```

#### 4. Link-in-Bio Builder
**File**: `app/builder/page.tsx`

**Features**:
- Drag-and-drop link editor
- Custom button styling (brand colors)
- Social media integrations
- QR code generation
- Analytics tracking

---

## 📊 Data Flow

### Brand DNA Schema
```typescript
interface BrandDNA {
  company_name: string;
  description: string;
  business_type: string;
  logo_url: string;
  brand_images: string[];      // NEW: Product/gallery photos
  hero_image?: string;
  og_image?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}
```

### Storage
- **LocalStorage**: Active session brand data
- **Supabase DB**: User-saved brands, campaigns, links
- **Supabase Storage**: User-uploaded images, generated assets

---

## 🎨 Design System

### Color Palette
- **Primary**: `#C8A882` (Gold)
- **Background**: `#0a0a0a` (Near Black)
- **Accent**: `#00ff87` (Neon Green)
- **Text**: `#ffffff` / `#888888`

### UI Principles
- Dark mode by default
- Glassmorphism effects
- Smooth animations (60fps target)
- Mobile-first responsive design

---

## 🚀 Recent Implementation (Feb 2026)

### ✅ Completed: Intelligent Image Selection
**Problem**: Ads were using logos instead of product photos, looking generic.

**Solution**:
1. Modified Brand DNA extraction to capture `brand_images` array
2. Implemented smart ranking to filter logos
3. Updated campaign generation to prioritize product photos
4. Added fallback logic (product → hero → OG image)

**Impact**: Ads now show authentic product imagery, dramatically improving visual quality.

### ✅ Completed: Firecrawl Integration
**Problem**: Previous scan method was slow and incomplete.

**Solution**:
1. Switched to Firecrawl API with advanced extraction
2. Disabled redundant Hero Hunter (performance optimization)
3. Upgraded Firecrawl plan for advanced scraping formats

**Impact**: Faster scans (10-20s), more comprehensive brand data.

### ✅ Completed: Response Format Fix
**Problem**: Frontend expected `{success, brandDNA}` but Edge Function returned brandDNA directly.

**Solution**: Restored wrapper format in Edge Function response.

**Impact**: Homepage scan flow working end-to-end.

---

## 📋 Current Status (Feb 6, 2026)

### ✅ Working Features
- [x] Homepage brand scanner
- [x] Brand DNA extraction (full pipeline)
- [x] Intelligent image selection
- [x] AI campaign generation
- [x] Link-in-bio builder
- [x] Social preview widget
- [x] QR code generator

### 🚧 In Progress
- [ ] AI image classification (Gemini Vision)
- [ ] Content studio gallery UI
- [ ] Business intelligence analysis

### 📅 Planned
- [ ] Voice agent integration
- [ ] Chatbot with brand context
- [ ] Analytics dashboard
- [ ] A/B testing for campaigns

---

## 🗂️ Key File Locations

### Frontend
- `app/page.tsx` - Homepage with scanner
- `app/builder/page.tsx` - Link-in-bio editor
- `app/generator/page.tsx` - Content generator
- `components/dashboard/SocialPreviewWidget.tsx` - AI ad preview
- `components/dashboard/BrandDashboard.tsx` - Brand overview

### Backend
- `supabase/functions/extract-brand-dna/index.ts` - Brand extraction
- `supabase/functions/generate-campaign-asset/index.ts` - AI campaign gen
- `app/api/scan/route.ts` - Scan endpoint (fallback)

### Config
- `.env.local` - Local API keys
- `supabase/config.toml` - Supabase config
- `next.config.js` - Next.js config

---

## 🔑 Environment Variables

### Required Keys
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `FIRECRAWL_API_KEY` (Supabase secret)
- `OPENAI_API_KEY` (Supabase secret)
- `GOOGLE_AI_API_KEY` (Supabase secret)

### Current Plan
- Firecrawl: Monthly plan (recent upgrade)
- OpenAI: Pay-as-you-go
- Gemini: Free tier (sufficient for now)

---

## 💰 Cost Structure

### Per Complete Brand Scan
- Firecrawl: $0.10-0.50
- GPT-4 analysis: $0.15
- Gemini Vision (campaign): $0.20
- **Total**: ~$0.45-0.85 per scan

### Monthly Estimates (100 scans)
- Firecrawl: $10-50
- OpenAI: $15
- Gemini: Free
- Vercel: Free (Hobby)
- Supabase: Free (within limits)
- **Total**: ~$25-65/month

---

## 🎯 Next Milestones

### Phase 2: AI Image Classification (This Week)
**Goal**: Gemini Vision analyzes all brand images and classifies them.

**Implementation**:
- Add `classifyImagesWithGemini()` to Brand DNA extraction
- Store classifications in `brand_images_analyzed` field
- Enable smart sorting by image type/quality

### Phase 3: Business Intelligence (Next Week)
**Goal**: GPT-4 deeply understands the business from website content.

**Implementation**:
- Extract core offerings, value props, target audience
- Generate brand personality profile
- Power chatbot and voice agent with insights

### Phase 4: Content Studio (Week 3)
**Goal**: Gallery UI showing all brand images with AI insights.

**Implementation**:
- Grid layout with quality badges
- Filter by type (food, product, people)
- Upload new images → auto-classify
- AI recommendations for best use cases

---

## 🐛 Known Issues

### Resolved
- ✅ Firecrawl 402 error (plan upgraded)
- ✅ Logo appearing in ads (smart selection implemented)
- ✅ Response format mismatch (wrapper restored)
- ✅ Hero Hunter timeout (disabled)

### Active
- None currently

---

## 📈 Success Metrics

### Technical
- Scan completion rate: ~90%
- Average scan time: 10-20s
- Image selection accuracy: ~95%
- Campaign generation success: ~98%

### User Impact
- One 10-second scan captures complete brand
- AI-generated ads use authentic imagery
- Zero manual image uploads required
- Professional results instantly

---

## 🔗 Important Links

- **Live Site**: https://tayloredsolutions.ai
- **GitHub**: https://github.com/taylorstrong-ship-it/Linktree-Killer
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/qxkicdhsrlpehgcsapsh

---

**Last Updated**: February 6, 2026
**Status**: ✅ Production Ready | 🚀 Active Development
