# Brand DNA Requirements for AI Agents

## Critical Data Points for Neural Uplink

The AI agents (Voice + Chat) are **only as smart as the data they receive**. During the initial Firecrawl scrape, we need to extract:

---

## 🔴 TIER 1: Essential (Must Have)

### Business Basics
```typescript
{
  business_name: string;        // "Acme Pizza"
  tone: string;                 // "Friendly and casual"
  industry: string;             // "Restaurant / Food Service"
}
```

### Contact Information
```typescript
{
  business_intel: {
    phone: string;              // "(555) 123-4567"
    email: string;              // "contact@acmepizza.com"
    address: string;            // "123 Main St, City, State"
    hours: {
      monday: string;           // "11am - 10pm"
      tuesday: string;
      // ... all days
      // OR simple string: "11am-10pm daily"
    }
  }
}
```

---

## 🟡 TIER 2: Highly Valuable (Should Have)

### Products/Services
```typescript
{
  business_intel: {
    menu?: Array<{              // For restaurants
      name: string;
      price?: string;
      description?: string;
    }>;
    services?: Array<{          // For service businesses
      name: string;
      description: string;
      pricing?: string;
    }>;
    products?: Array<{          // For retail
      name: string;
      category: string;
      price?: string;
    }>;
  }
}
```

### Special Offers
```typescript
{
  business_intel: {
    promotions?: Array<{
      title: string;            // "$19 Family Night"
      description: string;      // "Every Tuesday"
      validUntil?: string;
    }>;
  }
}
```

### FAQs
```typescript
{
  business_intel: {
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
  }
}
```

---

## 🟢 TIER 3: Nice to Have (Enhances Responses)

### About/Story
```typescript
{
  business_intel: {
    about?: string;             // "Family-owned since 1995..."
    mission?: string;
    values?: string[];
  }
}
```

### Social Proof
```typescript
{
  business_intel: {
    testimonials?: Array<{
      text: string;
      author: string;
    }>;
    awards?: string[];
    certifications?: string[];
  }
}
```

### Policies
```typescript
{
  business_intel: {
    delivery?: string;          // "Free delivery over $25"
    returns?: string;
    payment_methods?: string[]; // ["Visa", "Mastercard", "Cash"]
    parking?: string;
    accessibility?: string;
  }
}
```

---

## 🎯 Scrape Strategy for Maximum Data Capture

### 1. Primary Targets (Homepage)
- **Hero section** → Business name, tagline, primary CTA
- **Navigation menu** → Service categories, product types
- **Footer** → Hours, contact, social links

### 2. Secondary Pages to Crawl
- `/about` → Story, mission, team
- `/menu` or `/products` → Full catalog
- `/contact` → Complete contact info
- `/faq` → Pre-answered questions
- `/specials` or `/promotions` → Current offers

### 3. Structured Data Extraction
If the site has Schema.org markup, prioritize:
- `LocalBusiness` → Hours, location, phone
- `Restaurant` → Menu, cuisine type
- `Product` → Catalog data
- `FAQPage` → Questions/answers

---

## 💡 Example: Perfect Brand DNA for AI Agents

```typescript
const IDEAL_BRAND_DNA = {
  business_name: "Acme Wood-Fired Pizza",
  tone: "Warm, family-friendly, locally-focused",
  industry: "Restaurant - Italian",
  
  business_intel: {
    // Contact
    phone: "(555) 867-5309",
    email: "hello@acmepizza.com",
    address: "456 Oak Street, Portland, OR 97214",
    hours: "Mon-Thu: 11am-9pm, Fri-Sat: 11am-11pm, Sun: 12pm-8pm",
    
    // Menu (subset)
    menu: [
      { name: "Margherita", price: "$12", description: "Fresh mozzarella, basil, San Marzano tomatoes" },
      { name: "Pepperoni", price: "$14", description: "Classic pepperoni, mozzarella, house red sauce" },
      { name: "Hawaiian", price: "$13", description: "Ham, pineapple, mozzarella" },
      { name: "Build Your Own", price: "From $10", description: "Unlimited toppings" }
    ],
    
    // Promotions
    promotions: [
      { title: "$19 Family Night", description: "Large 2-topping pizza + breadsticks, every Tuesday" },
      { title: "Happy Hour", description: "Half-price appetizers, Mon-Fri 3pm-5pm" }
    ],
    
    // Policies
    delivery: "Free delivery within 5 miles on orders over $25",
    payment_methods: ["Cash", "Visa", "Mastercard", "Apple Pay"],
    
    // About
    about: "Family-owned since 1995. We use organic flour and local ingredients.",
    
    // FAQs (extracted from site)
    faqs: [
      { question: "Do you have gluten-free options?", answer: "Yes! We offer gluten-free crust for all pizzas." },
      { question: "Can I make a reservation?", answer: "We don't take reservations, but call ahead for large groups." }
    ]
  }
};
```

---

## 🚨 Critical Edge Cases to Handle

### Scenario 1: Minimal Data Scraped
If we only get:
```typescript
{
  business_name: "Acme Pizza",
  tone: "Professional",
  business_intel: {}
}
```

**AI Agent Behavior:**
- Will respond: *"I don't have specific details on that. Please contact us directly."*
- Still functional, but not impressive

### Scenario 2: Rich Data Scraped
With full extraction:
- **User:** "What time do you close?"
- **AI:** "We're open until 9pm tonight! Friday and Saturday we stay open until 11pm."

- **User:** "Do you have gluten-free pizza?"
- **AI:** "Yes! We offer gluten-free crust for all our pizzas."

---

## 📋 Firecrawl Scrape Checklist

When implementing/improving the scrape logic, ensure:

- [ ] **Crawl depth:** At least 2 levels (homepage + key pages)
- [ ] **Extract structured data:** Check for Schema.org markup
- [ ] **Parse tables:** Menu/pricing tables → structured JSON
- [ ] **Extract contact blocks:** Phone, email, address patterns
- [ ] **Hours parsing:** Regex for "Mon-Fri: 9am-5pm" patterns
- [ ] **FAQ detection:** Look for Q&A patterns
- [ ] **Image extraction:** Hero images, logos for visual identity
- [ ] **Social links:** For future integrations
- [ ] **Special offers:** Detect "coupon", "special", "promo" sections

---

## 🔗 Integration Point

The Neural Uplink component expects this structure:

```typescript
<NeuralUplink brandDNA={extractedBrandDNA} />
```

**Where `extractedBrandDNA` comes from:**
1. Firecrawl scrapes the site
2. Edge Function `/api/extract-brand-dna` analyzes HTML
3. Gemini extracts structured business_intel
4. Data stored in Supabase `brand_data` table
5. Frontend loads into localStorage
6. Passed to Neural Uplink

---

## 📈 Quality Metrics

**Good Scrape:** Agent can answer 70% of customer questions
**Great Scrape:** Agent can answer 90% of customer questions
**Perfect Scrape:** Agent feels indistinguishable from a human staff member

---

## 🎯 Next Steps for Scrape Improvement

1. **Audit current scrape output** - What are we missing?
2. **Add structured data parser** - Schema.org → Direct mapping
3. **Implement FAQ extraction** - Dedicated parser for Q&A pages
4. **Menu parser** - Convert HTML tables → Structured menu array
5. **Hours normalizer** - Handle all hour format variations
6. **Policy extractor** - Detect delivery/returns/payment info

**Goal:** The richer the Brand DNA, the smarter the AI agents. This is the foundation for everything.
