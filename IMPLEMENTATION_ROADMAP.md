# Implementation Roadmap - Taylored AI Solutions

## 🎯 Vision
Build the most intelligent Link-in-Bio platform powered by comprehensive Brand DNA extraction.

---

## Phase 1: Intelligent Image Selection ✅ COMPLETE

### Goal
Use authentic product photos in AI-generated ads instead of logos.

### What We Built
1. **Brand Images Extraction** (`extract-brand-dna/index.ts`)
   - Captures 10+ product/gallery images from website
   - Stores in `brand_images` array alongside logo

2. **Smart Ranking Algorithm** (backend + frontend)
   - Filters out logos by filename/aspect ratio
   - Scores by size, keywords, position
   - Selects best authentic product photo

3. **Campaign Integration** (`generate-campaign-asset/index.ts`)
   - Uses ranked images for AI generation
   - Fallback chain: product → hero → OG image

### Results
- ✅ Tested with milliesitalian.com
- ✅ Real pasta/food photos used (not logo)
- ✅ Professional, authentic-looking ads
- ✅ No hallucinated images

### Deployment
- Pushed to production: Feb 6, 2026
- Commit: `bdbf24b`

---

## Phase 2: AI Image Classification 📅 NEXT

### Goal
Gemini Vision automatically classifies all brand images.

### Implementation Plan

#### Step 1: Add Classification Function
**File**: `supabase/functions/extract-brand-dna/index.ts`

```typescript
async function classifyImagesWithGemini(imageUrls: string[]) {
  const results = [];
  
  for (const url of imageUrls.slice(0, 10)) {
    const image = await fetchImageAsBase64(url);
    
    const prompt = `Classify this business image. Return JSON:
    {
      "type": "food|product|person|logo|place",
      "subcategory": "specific description",
      "quality_score": 0-100,
      "professional": true/false,
      "best_for": ["instagram_post", "hero_image", "gallery"]
    }`;
    
    const response = await gemini.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: image.mimeType, data: image.base64 } }
        ]
      }]
    });
    
    results.push({
      url,
      ...JSON.parse(response.text())
    });
  }
  
  return results;
}
```

#### Step 2: Update Brand DNA Schema
```typescript
interface BrandDNA {
  // ... existing fields
  brand_images: string[];
  brand_images_analyzed: {
    url: string;
    type: string;
    subcategory: string;
    quality_score: number;
    professional: boolean;
    best_for: string[];
  }[];
}
```

#### Step 3: Update Smart Selection
Use classification data to improve ranking:
- Prioritize `professional: true`
- Boost high `quality_score`
- Filter by `type` (prefer "food" for restaurants)

### Success Criteria
- [ ] 95%+ classification accuracy
- [ ] Quality scores match human judgment
- [ ] Logo detection 100% accurate
- [ ] 10 images classified in <15s

### Timeline
- Week 1 of Phase 2

---

## Phase 3: Business Intelligence 📅 PLANNED

### Goal
GPT-4 deeply understands the business from website content.

### Implementation Plan

#### Step 1: Content Analysis
**File**: `supabase/functions/extract-brand-dna/index.ts`

```typescript
async function analyzeBusinessIntelligence(scrapedData: any) {
  const prompt = `Analyze this business website content:
  
  ${scrapedData.markdown.slice(0, 8000)}
  
  Extract and return JSON:
  {
    "business_category": "detailed category",
    "core_offerings": ["item 1", "item 2", ...],
    "unique_value_props": ["what makes them different"],
    "target_audience": {
      "demographics": "age, location, income",
      "psychographics": "values, interests, lifestyle"
    },
    "brand_personality": {
      "tone": "professional|casual|playful",
      "values": ["quality", "innovation", ...],
      "mission": "what they stand for"
    }
  }`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

#### Step 2: Power AI Features
Use business intelligence for:
- **Chatbot**: Answer customer questions accurately
- **Voice Agent**: Sound authentic to brand personality
- **Ad Copy**: Match brand tone and values
- **Content Generator**: Suggest relevant topics

### Success Criteria
- [ ] Business type 98%+ accurate
- [ ] 5+ unique differentiators identified
- [ ] Target audience 90%+ accurate
- [ ] Works across diverse industries

### Timeline
- Week 2 of Phase 3

---

## Phase 4: Content Studio Gallery 📅 PLANNED

### Goal
Build visual gallery UI showing all brand images with AI insights.

### Implementation Plan

#### Step 1: Gallery Component
**File**: `components/dashboard/ContentStudio.tsx`

```typescript
export default function ContentStudio({ brandDNA }: { brandDNA: BrandDNA }) {
  const images = brandDNA.brand_images_analyzed || [];
  
  return (
    <div className="content-studio">
      <h2>Your Brand Image Library</h2>
      
      {/* Filters */}
      <div className="filters">
        <button>All ({images.length})</button>
        <button>Food ({images.filter(i => i.type === 'food').length})</button>
        <button>Products ({images.filter(i => i.type === 'product').length})</button>
        <button>People ({images.filter(i => i.type === 'person').length})</button>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {images
          .sort((a, b) => b.quality_score - a.quality_score)
          .map(img => (
            <div key={img.url} className="image-card">
              <img src={img.url} alt={img.subcategory} />
              
              {/* Quality Badge */}
              {img.quality_score >= 90 && (
                <div className="badge">⭐ Pro Quality</div>
              )}
              
              {/* AI Insights */}
              <div className="insights">
                <p className="subcategory">{img.subcategory}</p>
                <div className="tags">
                  {img.best_for.map(use => (
                    <span key={use} className="tag">{use}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
```

#### Step 2: Upload + Auto-Classify
- User uploads new image
- Gemini Vision classifies instantly
- Adds to gallery with metadata

#### Step 3: Smart Recommendations
- "Best for Instagram: [image]"
- "Professional headshot: [image]"
- "Hero image candidate: [image]"

### Success Criteria
- [ ] Gallery shows all classified images
- [ ] Filter by type/quality
- [ ] Upload new images → auto-classify < 5s
- [ ] AI recommendations visible

### Timeline
- Week 1 of Phase 4

---

## Phase 5: Voice Agent Integration 🔮 FUTURE

### Goal
AI voice agent that can talk about the business authentically.

### Implementation
- Use Business Intelligence data
- ElevenLabs for voice synthesis
- Retell AI for conversation flow
- Brand personality for tone matching

### Use Cases
- Phone answering service
- Appointment booking
- Product inquiries
- Brand storytelling

---

## Phase 6: Chatbot with Brand Context 🔮 FUTURE

### Goal
Embedded chatbot that knows everything about the business.

### Implementation
- RAG (Retrieval Augmented Generation)
- Vector embeddings of website content
- Brand DNA as context window
- GPT-4 for responses

### Use Cases
- Customer support
- Product recommendations
- Hours/location info
- General inquiries

---

## 📊 Progress Tracker

| Phase | Status | Timeline | Blocker |
|-------|--------|----------|---------|
| **Phase 1** | ✅ Complete | Week 1 | None |
| **Phase 2** | 📅 Next | Week 2 | Awaiting kickoff |
| **Phase 3** | 📋 Planned | Week 3-4 | Awaiting Phase 2 |
| **Phase 4** | 📋 Planned | Week 5 | Awaiting Phase 3 |
| **Phase 5** | 🔮 Future | TBD | Multiple dependencies |
| **Phase 6** | 🔮 Future | TBD | Multiple dependencies |

---

## 💰 Cost Analysis

### Current (Phase 1)
- Per scan: $0.45-0.85
- Monthly (100 scans): $45-85

### Phase 2 Addition
- Gemini Vision (10 images): +$0.20/scan
- Monthly increase: +$20

### Phase 3 Addition
- GPT-4 analysis: +$0.15/scan
- Monthly increase: +$15

### Phase 4
- No additional API costs (UI only)

### Total at Phase 4 Completion
- Per scan: ~$0.80-1.20
- Monthly (100 scans): $80-120

---

## 🎯 Success Metrics

### Technical
- Scan success rate: >95%
- Average scan time: <20s
- Image classification accuracy: >95%
- Business analysis accuracy: >90%

### User Impact
- Zero manual data entry
- One scan = complete brand intelligence
- AI features powered by rich context
- Professional results instantly

---

**Last Updated**: February 6, 2026
**Current Phase**: Phase 1 Complete ✅ | Phase 2 Ready 📅
