# PostGenerator 2.0

AI-powered social media post generator with brand DNA extraction, style analysis, and carousel creation.

## Features

### 1. Brand DNA Extraction
- **Auto-import** from any website URL
- Uses Brandfetch API for logos, colors, and fonts
- Fallback to custom scraper if API unavailable
- One-click apply to brand kit

### 2. AI Style Analysis
- Upload 3-5 example social media posts
- Gemini Vision analyzes visual style, colors, text patterns
- Creates reusable style profile
- Influences future post generation

### 3. Enhanced Templates
- **Instagram Tall Portrait** (3:4) - 1080×1440px
- **Instagram Portrait** (4:5) - 1080×1350px
- **Instagram Square** (1:1) - 1080×1080px
- **Instagram Story** (9:16) - 1080×1920px
- **Facebook/LinkedIn** (16:9) - 1200×630px

### 4. Carousel Generation
- Create 2-7 slide carousels
- Individual content per slide
- Batch generation
- Download as ZIP file

### 5. Single Post Generation
- Quick single post creation
- Real-time preview
- Download as PNG

## Tech Stack

- **Frontend**: HTML + Tailwind CSS + Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Edge Functions + Storage)
- **Auth**: Supabase Auth (shared with BioLinker)
- **APIs**: Brandfetch API, Gemini Vision API
- **Deployment**: Vercel

## Database Schema

### `style_profiles`
Stores AI-analyzed visual styles from example posts.

```sql
CREATE TABLE style_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  brand_kit_id UUID REFERENCES brand_kits,
  dominant_colors JSONB,
  text_style JSONB,
  layout_pattern TEXT,
  visual_style TEXT,
  brand_voice TEXT,
  example_images JSONB,
  created_at TIMESTAMPTZ
);
```

### `carousel_posts`
Stores generated carousel posts.

```sql
CREATE TABLE carousel_posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  brand_kit_id uuid REFERENCES brand_kits,
  slide_count INTEGER CHECK (slide_count BETWEEN 2 AND 7),
  image_urls JSONB,
  slides_content JSONB,
  template_used TEXT,
  created_at TIMESTAMPTZ
);
```

### `brand_kits` (Updated)
Added `style_profile_id` column to link with style profiles.

## Edge Functions

### 1. `extract-brand-dna`
Extracts brand information from website.

**Endpoint**: `/functions/v1/extract-brand-dna`

**Request**:
```json
{
  "url": "example.com"
}
```

**Response**:
```json
{
  "success": true,
  "brandDNA": {
    "company_name": "Example Co",
    "logo_url": "https://...",
    "primary_color": "#3B82F6",
    "secondary_color": "#10B981",
    "fonts": ["Inter", "Roboto"]
  }
}
```

### 2. `analyze-style`
Analyzes example posts using Gemini Vision.

**Endpoint**: `/functions/v1/analyze-style`

**Request**:
```json
{
  "images": ["data:image/png;base64,..."]
}
```

**Response**:
```json
{
  "success": true,
  "styleProfile": {
    "dominant_colors": ["#FF5733", "#3498DB"],
    "text_style": {
      "placement": "center",
      "weight": "bold",
      "alignment": "center"
    },
    "layout_pattern": "text-over-image",
    "visual_style": "minimalist",
    "brand_voice": "professional yet friendly"
  }
}
```

### 3. `generate-carousel`
Generates multiple slides for carousel.

**Endpoint**: `/functions/v1/generate-carousel`

**Request**:
```json
{
  "brandKit": {...},
  "template": "square",
  "slides": [
    {"headline": "Slide 1", "body": "...", "cta": "..."},
    {"headline": "Slide 2", "body": "...", "cta": "..."}
  ]
}
```

**Response**:
```json
{
  "success": true,
  "imageUrls": [
    "https://storage.supabase.co/.../slide-1.png",
    "https://storage.supabase.co/.../slide-2.png"
  ]
}
```

## Setup

### 1. Database Migrations

Run these migrations in Supabase SQL editor:

```bash
# In order:
migrations/create_style_profiles_table.sql
migrations/create_carousel_posts_table.sql
migrations/update_brand_kits_add_style_profile.sql
```

### 2. Edge Functions

Deploy Edge Functions to Supabase:

```bash
# Deploy brand DNA extraction
supabase functions deploy extract-brand-dna

# Deploy style analysis
supabase functions deploy analyze-style

# Deploy carousel generation
supabase functions deploy generate-carousel
```

### 3. Environment Variables

Set these in your Supabase project:

```bash
# Brandfetch API (for brand DNA extraction)
BRANDFETCH_API_KEY=your_brandfetch_key

# Gemini AI (for style analysis)
GEMINI_API_KEY=your_gemini_key

# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Get API Keys

**Brandfetch API**:
1. Visit https://brandfetch.com/api
2. Sign up for free tier (1000 requests/month)
3. Get API key from dashboard

**Gemini API**:
1. Visit https://ai.google.dev
2. Create project
3. Enable Gemini API
4. Generate API key

### 5. Local Development

The app is served from `/public/apps/post-generator/` via Next.js:

```bash
# Start development server
npm run dev

# Visit
http://localhost:3000/apps/post-generator
```

## Usage

### Brand DNA Import

1. Enter website URL (e.g., `example.com`)
2. Click "Import"
3. Review extracted data
4. Click "Apply to Brand Kit"
5. Save brand kit

### Style Analysis

1. Click "Upload Examples"
2. Select 3-5 images
3. Click "Analyze Style"
4. Review style profile
5. Click "Save Style Profile"

### Single Post

1. Select brand kit
2. Choose template
3. Enter headline, body, CTA
4. Click "Generate Post"
5. Download PNG

### Carousel

1. Click "Carousel" tab
2. Select brand kit and template
3. Enter content for slide 1
4. Click "+ Add Slide" (up to 7 total)
5. Navigate between slides with arrows
6. Click "Generate Carousel"
7. Download ZIP

## Architecture

```
/public/apps/post-generator/
├── index.html          # Main UI (3-column layout)
├── styles.css          # Custom styles
├── app.js              # Main orchestrator
└── modules/
    ├── brand-dna.js    # Brand DNA extraction
    ├── style-analysis.js # AI style analysis
    └── carousel.js     # Carousel generation
```

## Known Limitations

1. **Mock Image Generation**: Currently using placeholder images. Replace with actual generation logic in Edge Functions.
2. **Logo Upload**: Brand DNA imported logos are preview-only. Must re-upload to save to Storage.
3. **Rate Limits**: 
   - Brandfetch: 1000 requests/month (free tier)
   - Gemini: Check current quota
4. **Browser Compatibility**: Requires modern browser with ES6 module support.

## Next Steps

1. Replace mock image generation with actual logic
2. Implement logo upload to Supabase Storage
3. Add post history view
4. Add batch editing for carousels
5. Implement A/B testing for templates
6. Add more template variations

## Support

For issues or questions:
- Check `/apps/post-generator/TESTING_GUIDE.md`
- Review Supabase logs for Edge Function errors
- Verify API keys are configured correctly

---

**Version**: 2.0.0  
**Status**: Development  
**Last Updated**: 2026-02-01
