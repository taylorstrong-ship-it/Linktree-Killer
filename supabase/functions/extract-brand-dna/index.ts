/**
 * 🔥 BRAND DNA EXTRACTION ENGINE v3.0
 * 
 * **Purpose:** Extract comprehensive brand intelligence using Firecrawl v2's native branding format
 * 
 * **Key Features:**
 * - Uses Firecrawl's `branding` format for complete visual identity extraction
 * - Uses `links` format for automatic social media detection
 * - AI-powered business type detection and smart CTA generation
 * - Returns 100% structured, validated brand DNA
 * 
 * **Data Extracted:**
 * - Logo, favicon, og:image
 * - Complete color palette (10+ semantic colors)
 * - Full typography system (fonts, sizes, weights)
 * - Social links (Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube)
 * - Business type + smart CTAs
 * - Brand personality traits
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import FirecrawlApp from 'npm:@mendable/firecrawl-js@1.0.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandDNA {
    // Core Identity
    company_name: string;
    business_type: string;
    industry: string;
    description: string;

    // Visual Assets
    logo_url: string;
    favicon_url: string;
    hero_image: string;
    og_image: string;
    brand_images: string[];  // 🖼️ ACTUAL product/gallery photos (not just meta tags)

    // Colors
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_primary_color: string;
    text_secondary_color: string;
    color_scheme: string;

    // Typography
    fonts: string[];
    typography: Record<string, any>;

    // Social Links
    social_links: Record<string, string>;

    // Business Intelligence
    suggested_ctas: Array<{
        title: string;
        url: string;
        type: string;
    }>;

    // 🆕 AI-POWERED BRAND INTELLIGENCE (v4.0)
    brand_voice?: string;  // e.g., "Warm and welcoming with a playful edge"
    tone_score?: number;   // 1-10 scale (1=formal, 10=casual)
    personality_traits?: string[];  // ["Friendly", "Energetic", "Community-focused"]
    brand_archetype?: string;  // "The Caregiver", "The Explorer", etc.
    writing_style?: {
        sentence_length: 'short' | 'medium' | 'long';
        vocabulary: 'simple' | 'moderate' | 'sophisticated';
        uses_emojis: boolean;
        uses_humor: boolean;
    };
    social_media_examples?: Array<{
        type: string;
        caption: string;
        visual_description: string;
        cta: string;
        hashtags: string[];
    }>;

    // 🀄 VISUAL SOCIAL POSTS (v5.0) - Instagram-ready with Gemini-enhanced images
    visual_social_posts?: Array<{
        type: string;
        caption: string;
        visual_description: string;
        cta: string;
        hashtags: string[];
        original_image_url: string;
        enhanced_image_url: string;
        enhancement_success: boolean;
    }> | null;

    // 🧠 DEEP SOUL EXTRACTION (v6.0) - "20-Year Employee" Intelligence
    business_intel?: {
        archetype: string;  // "The Friendly Neighbor", "The Rebel", "The Jester"
        vibe_keywords: string[];  // ["Cozy", "Loud", "Fast", "Upscale"]
        atmosphere: string;  // "Quiet Date Night" | "Loud Sports Bar" | "Family Friendly"
        signature_items: string[];  // Top 3 signature menu items/services
        unique_features: string[];  // Specific claims ("Grass-fed beef", "Imported flour")
        policies: {
            reservations?: string;  // "Required" | "Recommended" | "Walk-ins welcome"
            parking?: string;  // "Valet" | "Street" | "Lot" | "None"
            dietary?: string;  // "GF menu" | "Vegan options" | "Keto-friendly"
            dress_code?: string;  // "Casual" | "Business Casual" | "Formal"
            hours_note?: string;  // "Late night" | "Breakfast only" | "24/7"
        };
        price_range?: string;  // "$" | "$$" | "$$$" | "$$$$"
        insider_tips?: string[];  // ["Ask for the truffle fries", "Sit at the bar for faster service"]
        source: string; // Metadata
    };

}

// =================================================================
// 🤖 AI ANALYSIS HELPERS (Brand DNA v4.0)
// =================================================================

/**
 * Analyze brand voice and personality using GPT-4o
 */
async function analyzeBrandVoice(
    url: string,
    companyName: string,
    markdown: string,
    socialLinks: Record<string, string>,
    anthropicKey: string
): Promise<{
    brand_voice: string;
    tone_score: number;
    personality_traits: string[];
    brand_archetype: string;
    writing_style: any;
}> {
    const prompt = `You are an elite brand strategist conducting a DEEP SOUL extraction.

Your mission: Analyze this website as if you need to train an AI agent to sound like a 20-year employee who knows EVERYTHING about this business.

WEBSITE: ${url}
COMPANY: ${companyName}

CONTENT SAMPLES:
${markdown.slice(0, 8000)}

SOCIAL MEDIA LINKS:
${Object.keys(socialLinks).length > 0 ? JSON.stringify(socialLinks, null, 2) : 'None found'}

=== DEEP SOUL EXTRACTION PROTOCOL ===

1. 🎭 **ARCHETYPE** (The Soul):
   - Identify the brand archetype: The Caregiver, The Rebel, The Jester, The Hero, The Explorer, The Creator, The Ruler, The Sage, The Innocent, The Everyman, The Lover, The Magician
   - Evidence: Quote specific phrases that reveal this archetype
   - Example: "The Caregiver" if language emphasizes nurturing, family, warmth

2. 🎶 **ATMOSPHERE** (The Vibe):
   - Is this a "Quiet Date Night" spot or a "Loud Sports Bar"?
   - Options: "Intimate & Romantic", "Loud & Energetic", "Cozy & Casual", "Upscale & Refined", "Fast & Convenient", "Family-Friendly Chaos"
   - Be SPECIFIC. Don't say "welcoming" - say "The kind of place where regulars hug the bartender"

3. 🔥 **SIGNATURE ITEMS** (The Killers):
   - Extract the top 3 menu items / services that are HIGHLIGHTED or REPEATED
   - Look for: "Famous for", "Signature", "Award-winning", "Customer favorite"
   - Include specific details: "Truffle Mushroom Pizza (hand-stretched dough)" not just "Pizza"

4. ✨ **UNIQUE FEATURES** (The Secrets):
   - Specific sourcing claims: "Grass-fed beef", "Imported Italian flour", "Organic ingredients"
   - Special techniques: "Wood-fired", "Handmade daily", "Family recipe since 1950"
   - Certifications: "Certified organic", "Sustainable seafood", "Fair trade"

5. 📋 **POLICIES** (The Intel):
   - 📞 Reservations: "Required" | "Recommended" | "Walk-ins welcome" | "Call ahead"
   - 🅿️ Parking: "Valet" | "Street only" | "Parking lot" | "Garage nearby" | "None mentioned"
   - 🥗 Dietary: "Gluten-free menu" | "Vegan options" | "Keto-friendly" | "Nut-free" | "None mentioned"
   - 👔 Dress Code: "Casual" | "Business Casual" | "Smart Casual" | "Formal" | "None mentioned"
   - ⏰ Hours Note: "Late night (past midnight)" | "Breakfast only" | "24/7" | "Weekend brunch" | "Standard"

6. 💰 **PRICE RANGE** (The Reality Check):
   - Based on menu prices, descriptive language, and neighborhood:
   - "$" = Budget-friendly (<$15/person)
   - "$$" = Moderate ($15-30/person)
   - "$$$" = Upscale ($30-60/person)
   - "$$$$" = Fine Dining (>$60/person)

7. 🕵️ **INSIDER TIPS** (The Secrets):
   - Extract 2-3 insider tips a 20-year employee would share:
   - Examples: "Ask for the corner booth", "Truffle fries aren't on the menu but they'll make them", "Tuesday nights are half-price wine"
   - Look for: mentions of "secret menu", "ask your server about", "hidden gem", special deals

8. 🎯 **VIBE KEYWORDS** (The Descriptors):
   - 4-6 adjectives that capture the FEELING:
   - Be SPECIFIC: ["Dimly-lit", "Bustling", "Romantic", "Rustic"] not ["Nice", "Good", "Great"]

9. 🗣️ **BRAND VOICE** (The Tone):
   - How does this brand communicate? One descriptive sentence.
   - Examples: "Warm and family-oriented with Italian grandma energy" | "Edgy and irreverent like a punk rock dive bar" | "Polished and professional with subtle luxury cues"

10. 📈 **TONE SCORE** (The Scale):
   - Rate 1-10: (1 = Corporate/Formal, 10 = Super Casual/Playful)
   - Evidence: Quote phrases that justify this score

11. ✍️ **WRITING STYLE**:
   - Sentence length: "short" (mostly <10 words) | "medium" (10-20 words) | "long" (>20 words)
   - Vocabulary: "simple" (everyday words) | "moderate" (some industry terms) | "sophisticated" (elevated language)
   - Uses emojis: true/false
   - Uses humor: true/false

12. 🎨 **PERSONALITY TRAITS** (The Character):
   - 3-5 adjectives: ["Welcoming", "Energetic", "Traditional", "Innovative", "Community-focused"]

CRITICAL RULES:
- Be EVIDENCE-BASED: Quote actual text from the website
- Be SPECIFIC: "Wood-fired Margherita pizza" not "pizza"
- Think like a DATA SCIENTIST: Extract facts, not assumptions
- Think like an INSIDER: What would a 20-year employee know that a first-time visitor doesn't?

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "brand_voice": "One vivid sentence describing communication style",
  "tone_score": 7,
  "personality_traits": ["Welcoming", "Family-oriented", "Traditional"],
  "brand_archetype": "The Caregiver",
  "writing_style": {
    "sentence_length": "medium",
    "vocabulary": "simple",
    "uses_emojis": false,
    "uses_humor": true
  }
}`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-opus-4.6', // NEWEST: Feb 5, 2026 - Most intelligent for brand psychology
                max_tokens: 2000,
                temperature: 0.3,
                messages: [
                    { role: 'user', content: prompt + '\n\nRespond with ONLY valid JSON, no other text.' }
                ],
            }),
        });

        const data = await response.json();
        const content = data.content?.[0]?.text || '{}';
        const analysis = JSON.parse(content);

        console.log('🎯 Brand Voice Analysis:', analysis);
        return analysis;
    } catch (error) {
        console.error('⚠️ Brand voice analysis failed:', error);
        // Return safe defaults
        return {
            brand_voice: 'Professional and customer-focused',
            tone_score: 5,
            personality_traits: ['Professional', 'Reliable'],
            brand_archetype: 'The Regular Guy/Gal',
            writing_style: {
                sentence_length: 'medium',
                vocabulary: 'moderate',
                uses_emojis: false,
                uses_humor: false
            }
        };
    }
}

/**
 * Generate example social media posts using Claude Sonnet 5
 * UPGRADED: Using Claude Sonnet 5 (Feb 3, 2026) - Best for authentic brand writing
 */
async function generateSocialMediaExamples(
    companyName: string,
    businessType: string,
    brandVoice: string,
    personalityTraits: string[],
    toneScore: number,
    anthropicKey: string
): Promise<Array<any>> {
    const prompt = `You are a social media content creator who has studied this brand's voice.

BRAND: ${companyName}
INDUSTRY: ${businessType}
BRAND VOICE: ${brandVoice}
PERSONALITY: ${personalityTraits?.join(', ') || 'Professional'}
TONE: ${toneScore}/10 (1=formal, 10=casual)

TASK: Create 3 example social media posts this brand might actually post.

POST TYPES:
1. Product/Service Highlight
2. Behind the Scenes / Team Spotlight  
3. Customer Testimonial / Value Prop

RULES:
- Match their exact voice and tone
- Be industry-specific and realistic
- Captions: 100-150 characters (Instagram-optimized)
- If tone > 6, use emojis. If tone < 4, avoid emojis.
- Include realistic CTAs

Respond ONLY with valid JSON:
{
  "examples": [
    {
      "type": "product_highlight",
      "caption": "Actual caption text matching brand voice...",
      "visual_description": "Describe the image (e.g., 'Close-up of signature latte with house foam art')",
      "cta": "Book Now",
      "hashtags": ["#relevant", "#hashtags"]
    }
  ]
}`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-5-20260203', // NEWEST: Feb 3, 2026 - Best for brand writing
                max_tokens: 2000,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        const content = data.content[0]?.text || '{}';
        const result = JSON.parse(content);

        console.log('📸 Social Media Examples:', result);
        return result.examples || [];
    } catch (error) {
        console.error('⚠️ Social media generation failed:', error);
        // Return safe defaults
        return [{
            type: 'product_highlight',
            caption: `Check out what makes ${companyName} special!`,
            visual_description: `Professional photo showcasing ${businessType} services`,
            cta: 'Learn More',
            hashtags: [`#${businessType.toLowerCase().replace(' ', '')}`]
        }];
    }
}

/**
 * 🧠 DEEP SOUL EXTRACTION - Brand Intelligence using Claude Opus 4.6
 * UPGRADED: Using Claude Opus 4.6 (Feb 5, 2026) - Most intelligent model for brand psychology
 * Extracts insider business knowledge for "20-year employee" AI intelligence
 */
async function extractDeepSoulIntel(
    url: string, companyName: string, businessType: string, markdown: string, openaiKey: string
): Promise<{ archetype: string; vibe_keywords: string[]; atmosphere: string; signature_items: string[]; unique_features: string[]; policies: Record<string, string>; price_range: string; insider_tips: string[]; } | null> {
    const prompt = `Extract DEEP operational knowledge from this ${businessType}:

URL: ${url}
BUSINESS: ${companyName}
CONTENT: ${markdown.slice(0, 10000)}

Extract: 1) ATMOSPHERE ("Intimate & Romantic" | "Loud & Energetic" | "Cozy & Casual" | "Upscale & Refined" | "Fast & Convenient" | "Family-Friendly"), 2) VIBE (4-6 specific adjectives), 3) SIGNATURE ITEMS (top 3), 4) UNIQUE FEATURES (2-4 specifics), 5) POLICIES (reservations/parking/dietary/dress_code/hours), 6) PRICE ("$"/"$$"/"$$$"/"$$$$"), 7) INSIDER TIPS (1-3), 8) ARCHETYPE (Caregiver/Rebel/Jester/Hero/Everyman/Lover/Explorer)

JSON only:
{"archetype":"The Caregiver","atmosphere":"Cozy & Casual","vibe_keywords":["Rustic","Welcoming"],"signature_items":["Truffle Pizza"],"unique_features":["Wood-fired oven"],"policies":{"reservations":"Recommended","parking":"Street"},"price_range":"$$","insider_tips":["Ask for truffle fries"]}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-5.2', messages: [{ role: 'system', content: 'Business intelligence analyst. JSON only.' }, { role: 'user', content: prompt }],
                response_format: { type: 'json_object' }, temperature: 0.3,
            }),
        });
        const data = await response.json();
        const intel = JSON.parse(data.choices[0]?.message?.content || '{}');
        console.log('🧠 Deep Soul Intel:', intel);
        return intel;
    } catch (error) {
        console.error('⚠️ Deep Soul extraction failed:', error);
        return null;
    }
}

/**
 * 🎯 SELECT TOP IMAGES FOR SOCIAL POSTS
 * 
 * Intelligently ranks and selects the best N brand images for social media.
 * Filters out logos/icons and prioritizes high-quality product/service photos.
 */
function selectTopImages(
    brandImages: string[],
    industry: string,
    count: number = 3
): string[] {
    console.log(`🎯 Selecting top ${count} images from ${brandImages.length} candidates...`);

    if (brandImages.length === 0) {
        console.log('⚠️ No brand images available');
        return [];
    }

    // Score and rank images
    const rankedImages = brandImages
        .map((url, index) => {
            let score = 100; // Base score
            const urlLower = url.toLowerCase();

            // ✅ PREFER larger images (better quality)
            if (urlLower.includes('w_1920') || urlLower.includes('w_2500')) score += 50;
            if (urlLower.includes('w_1366') || urlLower.includes('w_1200')) score += 40;
            if (urlLower.includes('w_854') || urlLower.includes('w_768')) score += 20;

            // ✅ INDUSTRY-SPECIFIC SCORING
            const industryLower = industry.toLowerCase();
            if (industryLower.includes('food') || industryLower.includes('restaurant')) {
                if (urlLower.includes('food') || urlLower.includes('dish') ||
                    urlLower.includes('plate') || urlLower.includes('meal')) score += 40;
                if (urlLower.includes('pasta') || urlLower.includes('pizza') ||
                    urlLower.includes('sushi') || urlLower.includes('dessert')) score += 35;
            }
            if (industryLower.includes('salon') || industryLower.includes('hair') || industryLower.includes('beauty')) {
                if (urlLower.includes('hair') || urlLower.includes('style') ||
                    urlLower.includes('cut') || urlLower.includes('color')) score += 40;
                if (urlLower.includes('salon') || urlLower.includes('beauty')) score += 35;
            }
            if (industryLower.includes('retail') || industryLower.includes('ecommerce') || industryLower.includes('shop')) {
                if (urlLower.includes('product') || urlLower.includes('item')) score += 40;
            }

            // ✅ PREFER first few images (usually hero shots)
            if (index === 0) score += 15;
            if (index === 1) score += 10;
            if (index === 2) score += 5;

            // ✅ CDN images are usually professional quality
            if (urlLower.includes('squarespace-cdn') || urlLower.includes('cloudinary') ||
                urlLower.includes('shopify') || urlLower.includes('wixstatic') ||
                urlLower.includes('imgix')) score += 15;

            // ✅ Gallery/product indicators
            if (urlLower.includes('gallery') || urlLower.includes('portfolio')) score += 10;

            return { url, score };
        })
        .sort((a, b) => b.score - a.score)  // Best first
        .slice(0, count);  // Take top N

    const selectedUrls = rankedImages.map(img => img.url);

    console.log(`✅ Selected ${selectedUrls.length} images:`);
    rankedImages.forEach((img, i) => {
        const filename = img.url.substring(img.url.lastIndexOf('/') + 1, img.url.lastIndexOf('/') + 40);
        console.log(`   ${i + 1}. ${filename}... (score: ${img.score})`);
    });

    return selectedUrls;
}

/**
 * 🎨 ENHANCE IMAGE WITH GEMINI 3 + ADD DESIGN ELEMENTS
 * 
 * Takes a brand's actual product photo and:
 * 1. Enhances quality (lighting, color, sharpness)
 * 2. Adds design overlays (text, CTA, branding)
 * 3. Returns Instagram-ready post
 */
async function enhanceImageWithDesign(
    imageUrl: string,
    brandName: string,
    brandColors: { primary: string; secondary: string },
    postConcept: {
        caption: string;
        cta: string;
    },
    industry: string,
    geminiKey: string
): Promise<{ enhanced_url: string; success: boolean }> {
    console.log(`🎨 Enhancing image with Gemini 3: ${imageUrl.substring(0, 60)}...`);

    try {
        // Step 1: Fetch source image as Base64
        console.log('  📥 Fetching source image...');
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64 = btoa(String.fromCharCode(...uint8Array));
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        console.log(`  ✅ Image fetched: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`);

        // Step 2: Build Gemini prompt
        const industrySpecific = industry.toLowerCase().includes('food') || industry.toLowerCase().includes('restaurant')
            ? 'Increase appetite appeal - vivid colors, professional food photography, bokeh depth of field'
            : industry.toLowerCase().includes('salon') || industry.toLowerCase().includes('hair') || industry.toLowerCase().includes('beauty')
                ? 'Emphasize texture, shine, and professional hair styling. Make it look like a magazine cover'
                : 'Professional photography enhancement with premium aesthetic';

        const systemRole = `You are an Elite Creative Director creating Instagram posts for ${industry} businesses.
        
MISSION: Transform this product photo into a scroll-stopping Instagram post (1080x1080).

STEPS:
1. **ENHANCE THE IMAGE:**
   - ${industrySpecific}
   - Improve lighting, color balance, and sharpness
   - Keep the subject authentic - DO NOT replace or hallucinate new elements

2. **ADD DESIGN OVERLAYS:**
   - Brand Name: "${brandName}" (top center, elegant modern typography)
   - Caption: "${postConcept.caption}" (make it pop, ensure high contrast)
   - CTA: "${postConcept.cta}" (pill-shaped button, color: ${brandColors.primary})
   - Make overlays look professionally integrated, not slapped on
   
3. **COMPOSITION:**
   - Instagram 1:1 ratio (1080x1080)
   - Safe zones: 15% top/bottom clear space for text
   - Text should interact naturally with the image

OUTPUT: A single, cohesive Instagram post ready to publish.`;

        // Step 3: Call Gemini API
        console.log('  🚀 Calling Gemini 3 Pro Image API...');
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    data: base64,
                                    mimeType: mimeType
                                }
                            },
                            {
                                text: systemRole
                            }
                        ],
                    }],
                    generationConfig: {
                        responseModalities: ["IMAGE"]
                    }
                }),
            }
        );

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('  ❌ Gemini API error:', errorText.substring(0, 200));
            throw new Error(`Gemini API failed: ${geminiResponse.status}`);
        }

        const result = await geminiResponse.json();

        // Step 4: Extract enhanced image
        const candidate = result.candidates?.[0];
        const contentParts = candidate?.content?.parts || [];
        const inlineData = contentParts[0]?.inlineData;

        if (!inlineData || !inlineData.data) {
            throw new Error('No image data in Gemini response');
        }

        const enhancedBase64 = inlineData.data;
        const enhancedMimeType = inlineData.mimeType || 'image/png';
        const enhancedDataUri = `data:${enhancedMimeType};base64,${enhancedBase64}`;

        console.log('  ✅ Image enhanced successfully with design overlays');

        return {
            enhanced_url: enhancedDataUri,
            success: true
        };
    } catch (error) {
        console.error('  ⚠️ Image enhancement failed:', error);
        // Fallback to original image
        return {
            enhanced_url: imageUrl,
            success: false
        };
    }
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { url } = await req.json();

        if (!url) {
            return new Response(
                JSON.stringify({ error: 'URL is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
        const openaiKey = Deno.env.get('OPENAI_API_KEY');

        if (!firecrawlKey || !openaiKey) {
            return new Response(
                JSON.stringify({ error: 'Missing API keys' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`🔥 Extracting Brand DNA from: ${url}`);

        // STEP 1: Extract using Firecrawl's native branding + links + markdown formats
        const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });

        const scrapeResult = await firecrawl.scrapeUrl(url, {
            formats: ['branding', 'links', 'markdown', 'html'], // ✨ HTML for advanced image extraction
            onlyMainContent: false,
            waitFor: 5000, // ⬆️ Increased to 5s for lazy-loaded images (Instagram, etc.)
            removeBase64Images: false, // Keep inline images
        }) as any;

        console.log('📊 Firecrawl Response:', JSON.stringify(scrapeResult, null, 2));

        // Extract data from response
        const branding = scrapeResult?.branding || scrapeResult?.data?.branding || {};
        const links = scrapeResult?.links || scrapeResult?.data?.links || [];
        const markdown = scrapeResult?.markdown || scrapeResult?.data?.markdown || '';

        console.log('🎨 Branding Data:', JSON.stringify(branding, null, 2));
        console.log('🔗 Links Data:', JSON.stringify(links, null, 2));

        // STEP 2: Extract social media links from links array
        const socialLinks: Record<string, string> = {};

        if (Array.isArray(links)) {
            links.forEach((link: string) => {
                const url = link.toLowerCase();
                if (url.includes('instagram.com/')) socialLinks.instagram = link;
                if (url.includes('facebook.com/')) socialLinks.facebook = link;
                if (url.includes('twitter.com/') || url.includes('x.com/')) socialLinks.twitter = link;
                if (url.includes('linkedin.com/')) socialLinks.linkedin = link;
                if (url.includes('tiktok.com/')) socialLinks.tiktok = link;
                if (url.includes('youtube.com/')) socialLinks.youtube = link;
            });
        }

        console.log('📱 Social Links Extracted:', socialLinks);

        // STEP 3: Business Type Detection using OpenAI
        const businessTypePrompt = `You are a business classification expert analyzing a website.

URL: ${url}
Company: ${branding.companyName || 'Unknown'}
Content Sample: ${markdown.slice(0, 1500)}

CLASSIFY into the MOST SPECIFIC industry:

FOOD & HOSPITALITY:
- "Restaurant" → Keywords: food, menu, dining, reservations, cuisine, italian, pizza, bistro
- "Cafe" → Keywords: coffee, breakfast, brunch, bakery

BEAUTY & WELLNESS:
- "Hair Salon" → Keywords: hair, cuts, color, styling, barber
- "Beauty Spa" → Keywords: facial, massage, skincare, nails, wellness

RETAIL & COMMERCE:
- "Retail Store" → Physical products, shopping
- "Ecommerce" → Online store, cart, checkout

SERVICES:
- "Fitness Gym" → Workouts, training, classes, personal trainer
- "Real Estate" → Properties, homes, listings, agents
- "Professional Services" → ONLY for B2B: legal, accounting, consulting

CRITICAL RULES:
1. If URL contains "restaurant", "bistro", "cafe", "italian", "pizza" → ALWAYS "Restaurant"
2. If content has "menu", "reservations", "dine-in", "takeout" → ALWAYS "Restaurant"
3. NEVER use "Professional Services" for customer-facing businesses
4. Be SPECIFIC, not generic

Respond with ONLY valid JSON:
{
  "business_type": "Exact industry name from list above",
  "industry": "Same as business_type",
  "description": "One sentence about what they do (max 150 chars)",
  "suggested_ctas": [
    {
      "title": "Primary action (e.g., Order Online, Book Appointment)",
      "url": "/",
      "type": "primary"
    }
  ]
}`;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-5.2', // FLAGSHIP: Latest reasoning model for business classification (Feb 2026)
                messages: [
                    { role: 'system', content: 'You are a business analyst. Respond only with valid JSON.' },
                    { role: 'user', content: businessTypePrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            }),
        });

        const openaiData = await openaiResponse.json();
        const aiAnalysis = JSON.parse(openaiData.choices[0]?.message?.content || '{}');

        console.log('🤖 AI Analysis:', aiAnalysis);

        // 🔧 AGGRESSIVE FALLBACK: Catch ANY generic classification via partial matching
        const businessTypeLower = (aiAnalysis.business_type || '').toLowerCase();
        if (businessTypeLower.includes('service') ||
            businessTypeLower.includes('professional') ||
            businessTypeLower.includes('general') ||
            !aiAnalysis.business_type) {

            const urlLower = url.toLowerCase();
            const contentLower = markdown.slice(0, 2000).toLowerCase();

            console.log(`⚠️ AI returned generic "${aiAnalysis.business_type}", activating keyword fallback...`);

            // Restaurant detection
            if (urlLower.match(/restaurant|bistro|cafe|pizza|italian|dining|kitchen|eatery/) ||
                contentLower.match(/menu|reservation|dine|cuisine|food|dish|chef/)) {
                aiAnalysis.business_type = 'Restaurant';
                aiAnalysis.industry = 'Restaurant';
                console.log('🔧 FALLBACK: Detected Restaurant via keywords');
            }
            // Salon detection
            else if (urlLower.match(/salon|hair|beauty|barber/) ||
                contentLower.match(/haircut|styling|color|spa|facial/)) {
                aiAnalysis.business_type = 'Hair Salon';
                aiAnalysis.industry = 'Hair Salon';
                console.log('🔧 FALLBACK: Detected Hair Salon via keywords');
            }
            // Fitness detection
            else if (urlLower.match(/gym|fitness|yoga|pilates/) ||
                contentLower.match(/workout|training|class|personal trainer/)) {
                aiAnalysis.business_type = 'Fitness Gym';
                aiAnalysis.industry = 'Fitness Gym';
                console.log('🔧 FALLBACK: Detected Fitness Gym via keywords');
            }
        }

        console.log('✅ Final Industry Classification:', aiAnalysis.business_type);

        // 🆕 STEP 3.5: AI-POWERED BRAND INTELLIGENCE (v4.0)
        console.log('🤖 Starting AI brand voice analysis...');

        const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

        // Analyze brand voice with Claude Opus 4.6
        const brandVoiceAnalysis = await analyzeBrandVoice(
            url,
            branding.companyName || 'Unknown',
            markdown,
            socialLinks,
            anthropicKey
        );

        // Generate social media examples with Claude 3.5 if Anthropic key is available
        let socialExamples = [];
        if (anthropicKey) {
            socialExamples = await generateSocialMediaExamples(
                branding.companyName || 'Unknown',
                aiAnalysis.business_type || 'general',
                brandVoiceAnalysis.brand_voice,
                brandVoiceAnalysis.personality_traits,
                brandVoiceAnalysis.tone_score,
                anthropicKey
            );
        } else {
            console.log('⚠️ ANTHROPIC_API_KEY not found - skipping social media example generation');
        }

        // 🧠 STEP 3.7: DEEP SOUL INTELLIGENCE EXTRACTION (v6.0)
        console.log('🧠 Starting Deep Soul Intelligence extraction...');
        const deepSoulIntel = await extractDeepSoulIntel(
            url,
            branding.companyName || 'Unknown',
            aiAnalysis.business_type || 'general',
            markdown,
            openaiKey
        );

        if (deepSoulIntel) {
            console.log('✅ Deep Soul Intelligence extracted:', deepSoulIntel);
        } else {
            console.log('⚠️ Deep Soul extraction failed - using defaults');
        }

        // STEP 3.6: 🀄 VISUAL SOCIAL MEDIA GENERATION (v5.0)
        // Generate Instagram-ready posts with enhanced images + design overlays
        let visualSocialPosts = null;

        // We need: brand images array, social concepts, and Gemini key
        // Note: We'll do image extraction first, THEN enhance them
        console.log('📋 Preparing for visual social post generation...');

        // STEP 4: Enhanced Image Extraction with Multi-Tier Fallback + Hero Hunter
        // 🎯 STRATEGY: EXTRACT EVERYTHING, FILTER LATER
        // Don't be smart during extraction - grab ALL images and let downstream consumers pick the best ones
        const extractImagesFromMarkdown = (markdown: string): Array<{ url: string, score: number }> => {
            const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
            const images: Array<{ url: string, score: number }> = [];
            let match;

            while ((match = imageRegex.exec(markdown)) !== null) {
                const imageUrl = match[1];
                const urlLower = imageUrl.toLowerCase();

                // ❌ ONLY exclude OBVIOUS non-photos
                // Skip tracking pixels (1x1 images)
                if (urlLower.includes('1x1') || urlLower.includes('tracking') || urlLower.includes('pixel')) {
                    console.log(`  ⚠️ Skipping tracking pixel: ${imageUrl.substring(0, 60)}...`);
                    continue;
                }

                // Skip really tiny images (likely icons/bullets)
                if (urlLower.includes('w_50') || urlLower.includes('h_50') ||
                    urlLower.includes('w_16') || urlLower.includes('h_16')) {
                    console.log(`  ⚠️ Skipping tiny icon: ${imageUrl.substring(0, 60)}...`);
                    continue;
                }

                // ✅ EVERYTHING ELSE: ADD IT!
                // Score is just for sorting, NOT for filtering
                let score = 100; // Base score - everyone starts equal

                // Prefer larger images (hints at hero/product photos)
                if (urlLower.includes('w_1366') || urlLower.includes('w_1200') || urlLower.includes('w_1920')) score += 50;
                if (urlLower.includes('w_768') || urlLower.includes('w_854') || urlLower.includes('w_800')) score += 30;

                // CDN images are likely real brand assets
                if (urlLower.includes('squarespace-cdn') || urlLower.includes('cloudinary') ||
                    urlLower.includes('wixstatic') || urlLower.includes('shopify')) score += 20;

                images.push({ url: imageUrl, score });
            }

            // Sort by score (best first), but RETURN ALL
            return images.sort((a, b) => b.score - a.score);
        };

        // =================================================================
        // 🦸 HERO HUNTER: Brute-force HTML <img> tag parser
        // =================================================================

        // 🎯 HERO HUNTER: Brute-force HTML image extraction
        const heroHunter = async (targetUrl: string): Promise<string> => {
            console.log('🎯 HERO HUNTER ACTIVATED - Scanning HTML for images...');

            try {
                // Fetch raw HTML
                const htmlResponse = await fetch(targetUrl);
                const html = await htmlResponse.text();
                console.log(`  📄 HTML fetched: ${html.length} characters`);

                const foundImages: Array<{ url: string, source: string }> = [];

                // TIER 0: 🎯 EXPLICIT OG:IMAGE META TAG (Highest priority)
                const ogImageRegex = /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi;
                const ogImageMatch = ogImageRegex.exec(html);

                if (ogImageMatch) {
                    const ogImageUrl = ogImageMatch[1];
                    console.log(`  🎯 Found og:image meta tag: "${ogImageUrl.substring(0, 60)}..."`);

                    // Validate it's an absolute URL
                    if (ogImageUrl.startsWith('http')) {
                        console.log(`    ✅ TIER 0 SUCCESS: Using og:image meta tag`);
                        return ogImageUrl;
                    } else {
                        // Convert to absolute URL
                        const absoluteOgImage = new URL(ogImageUrl, targetUrl).toString();
                        console.log(`    🔗 Converted relative og:image to absolute: ${absoluteOgImage}`);
                        return absoluteOgImage;
                    }
                }

                console.log('  ⚠️ No og:image meta tag found, falling back to other methods...');

                // TIER 1: Scan for large <img> tags (width/height > 300)
                const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
                let imgMatch;
                let imgCount = 0;

                while ((imgMatch = imgRegex.exec(html)) !== null) {
                    imgCount++;
                    const imgTag = imgMatch[0];
                    const imgSrc = imgMatch[1];

                    // Extract width/height if present
                    const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
                    const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);

                    const width = widthMatch ? parseInt(widthMatch[1]) : 0;
                    const height = heightMatch ? parseInt(heightMatch[1]) : 0;

                    console.log(`  🖼️ Found img tag #${imgCount}: src="${imgSrc.substring(0, 60)}..." width=${width} height=${height}`);

                    // If image is large enough, add to candidates
                    if (width > 300 || height > 300) {
                        foundImages.push({ url: imgSrc, source: `img-tag (${width}x${height})` });
                        console.log(`    ✅ QUALIFIED: Large image (${width}x${height})`);
                    } else if (width === 0 && height === 0) {
                        // No dimensions specified - assume it's large (common for hero images)
                        foundImages.push({ url: imgSrc, source: 'img-tag (no-dimensions)' });
                        console.log(`    ⚠️ QUALIFIED: No dimensions specified, assuming hero image`);
                    } else {
                        console.log(`    ❌ REJECTED: Too small (${width}x${height})`);
                    }
                }

                console.log(`  📊 Total img tags found: ${imgCount}, Qualified: ${foundImages.length}`);

                // TIER 2: Scan for background-image styles on body/main divs
                const bgRegex = /style=["'][^"']*background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
                let bgMatch;
                let bgCount = 0;

                while ((bgMatch = bgRegex.exec(html)) !== null) {
                    bgCount++;
                    const bgUrl = bgMatch[1];
                    console.log(`  🎨 Found background-image #${bgCount}: url="${bgUrl.substring(0, 60)}..."`);
                    foundImages.push({ url: bgUrl, source: 'background-image' });
                    console.log(`    ✅ QUALIFIED: Background image`);
                }

                console.log(`  📊 Total background-images found: ${bgCount}`);

                // If we found candidates, pick the first one
                if (foundImages.length > 0) {
                    const selectedImage = foundImages[0];
                    console.log(`  🏆 HERO HUNTER SUCCESS: Selected "${selectedImage.url.substring(0, 60)}..." from ${selectedImage.source}`);

                    // Convert to absolute URL
                    let absoluteUrl = selectedImage.url;
                    if (!absoluteUrl.startsWith('http')) {
                        absoluteUrl = new URL(absoluteUrl, targetUrl).toString();
                        console.log(`    🔗 Converted to absolute URL: ${absoluteUrl}`);
                    }

                    // Validate URL
                    if (!absoluteUrl.startsWith('http')) {
                        console.log(`    ❌ INVALID: URL doesn't start with http - discarding`);
                        return '';
                    }

                    return absoluteUrl;
                } else {
                    console.log('  ❌ HERO HUNTER FAILED: No images found');
                    return '';
                }

            } catch (error) {
                console.error('  ❌ HERO HUNTER ERROR:', error);
                return '';
            }
        };

        // Construct Complete Brand DNA with Enhanced Image Selection
        // 🚑 HOTFIX: Multi-Tier Brand Image Extraction
        let finalLogo = branding.images?.logo || '';
        const ogImage = branding.images?.ogImage ||
            branding.images?.og_image ||
            scrapeResult?.metadata?.ogImage ||
            scrapeResult?.metadata?.['og:image'] ||
            scrapeResult?.metadata?.['twitter:image'] || '';
        const heroImage = branding.images?.heroImage || branding.images?.hero_image || '';

        console.log('📊 Image Extraction Sources:');
        console.log('  - Branding Logo:', finalLogo || 'null');
        console.log('  - OG Image:', ogImage || 'null');
        console.log('  - Hero Image:', heroImage || 'null');

        // TIER 1: If logo is missing OR it looks like a generic favicon...
        if (!finalLogo ||
            finalLogo.includes('favicon') ||
            finalLogo.includes('site_icon') ||
            finalLogo.includes('android-chrome') ||
            finalLogo.includes('apple-touch-icon') ||
            finalLogo.includes('pfavico.ico')) {

            console.log('⚠️ Logo missing or generic favicon detected');

            // TIER 2: Try the Open Graph Image (High quality main photo)
            if (ogImage) {
                finalLogo = ogImage;
                console.log('🎯 Using OG Image as logo:', ogImage);
            }
            // TIER 3: Try the Hero Image
            else if (heroImage) {
                finalLogo = heroImage;
                console.log('🎯 Using Hero Image as logo:', heroImage);
            }
            // TIER 4: Extract largest image from markdown content
            else if (markdown) {
                console.log('🔍 Scanning markdown for prominent images...');
                const markdownImages = extractImagesFromMarkdown(markdown);

                if (markdownImages.length > 0) {
                    finalLogo = markdownImages[0].url;
                    console.log(`🎯 Using largest markdown image as logo (score: ${markdownImages[0].score}):`, finalLogo);
                    console.log(`  📸 Found ${markdownImages.length} total images in markdown`);
                } else {
                    console.log('⚠️ No suitable images found in markdown');
                }
            }

            // TIER 5: 🎯 HERO HUNTER - DISABLED (Too slow, Firecrawl already got images)
            // The Hero Hunter fetches HTML again after Firecrawl already processed it
            // This causes timeouts. If we need it, we should pass Firecrawl's HTML to it.
            /*
            if (!finalLogo) {
                console.log('🔍 ACTIVATING HERO HUNTER (TIER 5)...');
                const heroUrl = await heroHunter(url);
                if (heroUrl) {
                    finalLogo = heroUrl;
                    console.log('🎯 HERO HUNTER SUCCESS - Using extracted hero image:', heroUrl);
                } else {
                    console.log('⚠️ HERO HUNTER FAILED - No images found in HTML');
                }
            }
            */

            // TIER 6: Last resort - use favicon if available
            if (!finalLogo && branding.images?.favicon) {
                finalLogo = branding.images.favicon;
                console.log('⚠️ Using favicon as absolute last resort:', branding.images.favicon);
            }
        } else {
            console.log('✅ Valid logo found:', finalLogo);
        }

        // Ensure absolute URL (Handle relative paths like '/images/me.jpg')
        if (finalLogo && !finalLogo.startsWith('http')) {
            try {
                finalLogo = new URL(finalLogo, url).toString();
                console.log('🔗 Converted to absolute URL:', finalLogo);
            } catch (e) {
                console.error('⚠️ Failed to convert to absolute URL:', e);
            }
        }

        // Final validation - discard if URL doesn't start with http
        if (finalLogo && !finalLogo.startsWith('http')) {
            console.error('❌ FINAL VALIDATION FAILED: URL does not start with http - discarding:', finalLogo);
            finalLogo = '';
        }

        console.log('🏆 Final Logo Selected:', finalLogo || 'NONE - Image extraction failed completely');

        // ====================================================================
        // 🖼️ STEP 4B: INTELLIGENT GALLERY SCANNER
        // ====================================================================
        // Purpose: Find ACTUAL product/service images (food, products, people, etc.)
        // NOT just meta tag images (which are often just the logo)

        console.log('🖼️ SCANNING FOR PRODUCT/GALLERY IMAGES...');
        const brandImages: string[] = [];

        // Extract ALL images from markdown
        const allMarkdownImages = extractImagesFromMarkdown(markdown);
        console.log(`  📸 Found ${allMarkdownImages.length} images in markdown content`);

        // 🚨 ENHANCED HTML SCRAPER: Always run, not just fallback (finds more images)
        // This captures srcset, data-src, background-image, and modern patterns
        if (scrapeResult?.html) {
            console.log('🔍 ENHANCED HTML SCRAPER: Scanning for images with advanced patterns...');
            const html = scrapeResult.html;
            let htmlImageCount = 0;

            // Pattern 1: Standard <img src="...">
            const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            let match;
            while ((match = imgSrcRegex.exec(html)) !== null && htmlImageCount < 20) {
                const imgSrc = match[1];
                if (imgSrc && !imgSrc.startsWith('data:')) {
                    const absoluteUrl = imgSrc.startsWith('http') ? imgSrc :
                        (() => { try { return new URL(imgSrc, url).toString(); } catch { return null; } })();
                    if (absoluteUrl) {
                        allMarkdownImages.push({ url: absoluteUrl, score: 100 });
                        htmlImageCount++;
                        console.log(`    ✅ [IMG SRC] #${htmlImageCount}: ${absoluteUrl.substring(0, 70)}...`);
                    }
                }
            }

            // Pattern 2: Lazy-loaded images <img data-src="..." data-lazy-src="...">
            const lazySrcRegex = /<img[^>]+data-(?:lazy-)?src=["']([^"']+)["'][^>]*>/gi;
            while ((match = lazySrcRegex.exec(html)) !== null && htmlImageCount < 20) {
                const imgSrc = match[1];
                if (imgSrc && !imgSrc.startsWith('data:')) {
                    const absoluteUrl = imgSrc.startsWith('http') ? imgSrc :
                        (() => { try { return new URL(imgSrc, url).toString(); } catch { return null; } })();
                    if (absoluteUrl) {
                        allMarkdownImages.push({ url: absoluteUrl, score: 110 }); // Higher score (lazy = important)
                        htmlImageCount++;
                        console.log(`    ✅ [LAZY SRC] #${htmlImageCount}: ${absoluteUrl.substring(0, 70)}...`);
                    }
                }
            }

            // Pattern 3: Responsive images <source srcset="...">, <img srcset="...">
            const srcsetRegex = /(?:source|img)[^>]+srcset=["']([^"']+)["'][^>]*>/gi;
            while ((match = srcsetRegex.exec(html)) !== null && htmlImageCount < 20) {
                // srcset format: "image.jpg 1x, image@2x.jpg 2x" - take the first URL
                const srcsetValue = match[1];
                const firstUrl = srcsetValue.split(',')[0].trim().split(' ')[0];
                if (firstUrl && !firstUrl.startsWith('data:')) {
                    const absoluteUrl = firstUrl.startsWith('http') ? firstUrl :
                        (() => { try { return new URL(firstUrl, url).toString(); } catch { return null; } })();
                    if (absoluteUrl) {
                        allMarkdownImages.push({ url: absoluteUrl, score: 120 }); // Srcset = high quality
                        htmlImageCount++;
                        console.log(`    ✅ [SRCSET] #${htmlImageCount}: ${absoluteUrl.substring(0, 70)}...`);
                    }
                }
            }

            // Pattern 4: Background images in inline styles
            const bgImageRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
            while ((match = bgImageRegex.exec(html)) !== null && htmlImageCount < 20) {
                const bgUrl = match[1];
                if (bgUrl && !bgUrl.startsWith('data:')) {
                    const absoluteUrl = bgUrl.startsWith('http') ? bgUrl :
                        (() => { try { return new URL(bgUrl, url).toString(); } catch { return null; } })();
                    if (absoluteUrl) {
                        allMarkdownImages.push({ url: absoluteUrl, score: 90 }); // BG images often heroes
                        htmlImageCount++;
                        console.log(`    ✅ [BG IMAGE] #${htmlImageCount}: ${absoluteUrl.substring(0, 70)}...`);
                    }
                }
            }

            console.log(`  📊 Enhanced HTML scraper found ${htmlImageCount} additional images`);
        }

        // Filter out images with MINIMAL filtering (only skip obvious junk)
        const rejectionReasons: Record<string, number> = {};

        for (const img of allMarkdownImages) {
            const url = img.url.toLowerCase();

            // Skip if it's the EXACT logo we already extracted (by URL, not pattern)
            if (finalLogo && img.url === finalLogo) {
                rejectionReasons['duplicate-logo'] = (rejectionReasons['duplicate-logo'] || 0) + 1;
                console.log(`  ⚠️ Skipping: This is the exact logo URL`);
                continue;
            }

            // ✅ RELAXED FILTERING: Only skip OBVIOUS junk
            // Removed 'logo', 'brand' keywords - too aggressive!

            // Skip tracking pixels and 1x1 images
            if (url.includes('1x1') || url.includes('tracking') || url.includes('pixel.gif') || url.includes('spacer.gif')) {
                rejectionReasons['tracking-pixel'] = (rejectionReasons['tracking-pixel'] || 0) + 1;
                console.log(`  ⚠️ Skipping: Tracking pixel`);
                continue;
            }

            // Skip ONLY if filename is literally 'favicon' or 'apple-touch-icon'
            if (url.includes('favicon.') || url.includes('apple-touch-icon')) {
                rejectionReasons['favicon'] = (rejectionReasons['favicon'] || 0) + 1;
                console.log(`  ⚠️ Skipping: Favicon`);
                continue;
            }

            // ✅ ACCEPT EVERYTHING ELSE! Let downstream consumers (selectTopImages) do smart ranking
            brandImages.push(img.url);
            console.log(`  ✅ BRAND IMAGE #${brandImages.length}: ${img.url.substring(0, 80)}...`);

            // Limit to 15 images (increased from 10)
            if (brandImages.length >= 15) {
                console.log('  📊 Reached 15 images limit, stopping scan');
                break;
            }
        }

        // 📊 DIAGNOSTIC REPORT
        console.log('📊 Image Filtering Report:');
        console.log(`  - Total scanned: ${allMarkdownImages.length}`);
        console.log(`  - Accepted: ${brandImages.length}`);
        console.log(`  - Rejected: ${Object.values(rejectionReasons).reduce((a, b) => a + b, 0)}`);
        if (Object.keys(rejectionReasons).length > 0) {
            console.log('  - Rejection breakdown:', rejectionReasons);
        }

        // 🎯 Deduplicate images (remove near-duplicates with same basename)
        const uniqueImages = new Set<string>();
        const deduplicatedImages: string[] = [];

        for (const imgUrl of brandImages) {
            // Extract basename without query params (e.g., "photo.jpg" from "/path/photo.jpg?w=1200")
            const basename = imgUrl.split('/').pop()?.split('?')[0] || imgUrl;

            if (!uniqueImages.has(basename)) {
                uniqueImages.add(basename);
                deduplicatedImages.push(imgUrl);
            }
        }

        console.log(`🎯 Deduplication: ${brandImages.length} → ${deduplicatedImages.length} unique images`);
        const finalBrandImages = deduplicatedImages;

        console.log(`🎯 Gallery Scanner Results: ${finalBrandImages.length} product images found`);

        // If we found NO product images, try the heroImage/ogImage as fallback
        // (only if it's different from the logo)
        if (finalBrandImages.length === 0) {
            console.log('⚠️ No gallery images found, checking if hero/og images are viable...');

            if (heroImage && heroImage !== finalLogo) {
                finalBrandImages.push(heroImage);
                console.log(`  ✅ Using hero_image as product photo: ${heroImage}`);
            } else if (ogImage && ogImage !== finalLogo) {
                finalBrandImages.push(ogImage);
                console.log(`  ✅ Using og_image as product photo: ${ogImage}`);
            } else {
                console.log('  ⚠️ hero_image and og_image are the same as logo - NO PRODUCT PHOTOS AVAILABLE');
            }
        }

        // 🀄 STEP 3.7: GENERATE VISUAL SOCIAL POSTS (v5.1)
        // Generate Instagram posts - works with OR without brand images!
        // Path A: Enhance real photos | Path B: Generate from scratch
        if (socialExamples.length > 0) {
            const geminiKey = Deno.env.get('GEMINI_API_KEY') ||
                Deno.env.get('GOOGLE_API_KEY') ||
                Deno.env.get('GOOGLE_AI_API_KEY');

            if (geminiKey) {
                console.log('🎨 ============ VISUAL SOCIAL GENERATION ============');
                console.log(`🖼️ Found ${finalBrandImages.length} brand images and ${socialExamples.length} text concepts`);

                // Select top 3 images for social posts
                const selectedImages = selectTopImages(
                    finalBrandImages,
                    aiAnalysis.business_type || 'general',
                    3
                );

                if (selectedImages.length > 0) {
                    console.log(`✅ Selected ${selectedImages.length} images for enhancement`);

                    // 🎯 CRITICAL FIX: Always generate 3 posts for carousel
                    // Strategy: Use first 3 concepts, repeat images if needed
                    const targetPostCount = 3;
                    const conceptsToUse = socialExamples.slice(0, targetPostCount);

                    console.log(`🎯 Generating ${conceptsToUse.length} visual posts (target: ${targetPostCount})`);

                    // Enhance each concept with available images (cycle through images if we have fewer than 3)
                    try {
                        visualSocialPosts = await Promise.all(
                            conceptsToUse.map(async (concept: any, idx: number) => {
                                // Cycle through available images (e.g., if 2 images, use [0,1,0] for 3 posts)
                                const imageUrl = selectedImages[idx % selectedImages.length];

                                const enhanced = await enhanceImageWithDesign(
                                    imageUrl,
                                    branding.companyName || 'Unknown',
                                    {
                                        primary: branding.colors?.primary || '#FF6B35',
                                        secondary: branding.colors?.secondary || branding.colors?.primary || '#FF6B35'
                                    },
                                    {
                                        caption: concept.caption,
                                        cta: concept.cta
                                    },
                                    aiAnalysis.business_type || 'general',
                                    geminiKey
                                );

                                return {
                                    ...concept,
                                    original_image_url: imageUrl,
                                    enhanced_image_url: enhanced.enhanced_url,
                                    enhancement_success: enhanced.success
                                };
                            })
                        );

                        console.log(`✅ Generated ${visualSocialPosts.length} visual social posts`);
                        const successCount = visualSocialPosts.filter((p: any) => p.enhancement_success).length;
                        console.log(`   🌟 ${successCount}/${visualSocialPosts.length} successfully enhanced with Gemini`);
                    } catch (error) {
                        console.error('❌ Visual social post generation failed:', error);
                        visualSocialPosts = null;
                    }
                } else {
                    // PATH B: Generate from scratch (text-to-image fallback)
                    console.log('🎨 PATH B: No real photos available - generating images from scratch with Gemini');
                    console.log(`   Creating ${Math.min(3, socialExamples.length)} visual posts using text-to-image`);

                    try {
                        // Generate images from text descriptions
                        visualSocialPosts = await Promise.all(
                            socialExamples.slice(0, 3).map(async (concept: any) => {
                                // Build text-to-image prompt
                                const textToImagePrompt = `Create a professional Instagram post image (1080x1080) for a ${aiAnalysis.business_type || 'business'}.

BRAND: ${branding.companyName || 'Business'}
CONCEPT: ${concept.visual_description}
CAPTION: ${concept.caption}
CTA: ${concept.cta}
COLOR SCHEME: ${branding.colors?.primary || '#FF6B35'}

INCLUDE:
- Brand name "${branding.companyName || 'Business'}" (elegant typography, top center)
- Visual representation of: ${concept.visual_description}
- Caption text: "${concept.caption}" (ensure readability)
- CTA button: "${concept.cta}" (color: ${branding.colors?.primary || '#FF6B35'})

STYLE: Modern, professional, Instagram-ready. Match the ${aiAnalysis.business_type || 'business'} industry aesthetic.`;

                                console.log(`   🎨 Generating post ${socialExamples.indexOf(concept) + 1}/3...`);

                                // Call Gemini for text-to-image
                                const geminiResponse = await fetch(
                                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiKey}`,
                                    {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            contents: [{
                                                role: 'user',
                                                parts: [{ text: textToImagePrompt }]
                                            }],
                                            generationConfig: {
                                                responseModalities: ["IMAGE"]
                                            }
                                        })
                                    }
                                );

                                if (!geminiResponse.ok) {
                                    throw new Error(`Gemini text-to-image failed: ${geminiResponse.status}`);
                                }

                                const result = await geminiResponse.json();
                                const inlineData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData;

                                if (!inlineData?.data) {
                                    throw new Error('No image data in Gemini response');
                                }

                                const generatedDataUri = `data:${inlineData.mimeType || 'image/png'};base64,${inlineData.data}`;

                                return {
                                    ...concept,
                                    original_image_url: '', // No original - generated from scratch
                                    enhanced_image_url: generatedDataUri,
                                    enhancement_success: true
                                };
                            })
                        );

                        console.log(`✅ PATH B SUCCESS: Generated ${visualSocialPosts.length} posts from scratch`);
                    } catch (error) {
                        console.error('❌ PATH B FAILED:', error);
                        visualSocialPosts = null;
                    }
                }
            } else {
                console.log('⚠️ GEMINI_API_KEY not found - skipping visual enhancement');
            }
        } // End visual social generation

        const brandDNA: BrandDNA = {
            // Core Identity
            company_name: branding.companyName || url.replace(/https?:\/\/(www\.)?/, '').split('/')[0],
            business_type: aiAnalysis.business_type || 'general',
            industry: aiAnalysis.business_type || 'general',
            description: aiAnalysis.description || '',

            // Visual Assets (with multi-tier fallback)
            logo_url: finalLogo,
            favicon_url: branding.images?.favicon || '',
            hero_image: heroImage || ogImage || '',
            og_image: ogImage || '',
            brand_images: brandImages,  // 🖼️ ACTUAL product/gallery photos

            // Colors (with fallbacks)
            primary_color: branding.colors?.primary || '#3B82F6',
            secondary_color: branding.colors?.secondary || '#8B5CF6',
            accent_color: branding.colors?.accent || '#10B981',
            background_color: branding.colors?.background || '#FFFFFF',
            text_primary_color: branding.colors?.textPrimary || '#1F2937',
            text_secondary_color: branding.colors?.textSecondary || '#6B7280',
            color_scheme: branding.colorScheme || 'light',

            // Typography
            fonts: branding.fonts || [],
            typography: branding.typography || {},

            // Social Links
            social_links: socialLinks,

            // Business Intelligence
            suggested_ctas: aiAnalysis.suggested_ctas || [],

            // 🆕 AI-POWERED BRAND INTELLIGENCE (v4.0)
            brand_voice: brandVoiceAnalysis.brand_voice,
            tone_score: brandVoiceAnalysis.tone_score,
            personality_traits: brandVoiceAnalysis.personality_traits,
            brand_archetype: brandVoiceAnalysis.brand_archetype,
            writing_style: brandVoiceAnalysis.writing_style,
            social_media_examples: socialExamples,

            // 🀄 VISUAL SOCIAL POSTS (v5.0) - Instagram-ready with enhanced images
            visual_social_posts: visualSocialPosts,

            // 🧠 DEEP SOUL EXTRACTION (v6.0) - "20-Year Employee" Intelligence
            business_intel: deepSoulIntel ? {
                ...deepSoulIntel,
                source: 'gpt-5.2_deep_soul_extraction'
            } : undefined,

            // Metadata
            source: 'firecrawl_v2_branding',
        };

        console.log('✅ Complete Brand DNA:', JSON.stringify(brandDNA, null, 2));

        // ====================================================================
        // 🚀 STEP 5: PRE-COMPUTATION - Fire-and-Forget Background Generation
        // ====================================================================
        // Immediately trigger 3 campaign asset variations in the background
        // while the client is redirecting to the dashboard.
        // By the time the dashboard loads, images are already 50% done!

        console.log(`🚀 PRE-COOKING: Triggered background image generation for ${brandDNA.company_name}`);

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

        if (supabaseUrl && supabaseAnonKey) {
            const variations = [
                { format: 'Instagram Post', style: 'vibrant' },
                { format: 'Story', style: 'bold' },
                { format: 'Hero', style: 'professional' }
            ];

            // Fire-and-forget: Don't await these calls
            variations.forEach(async (variation, index) => {
                try {
                    console.log(`  🎨 [${index + 1}/3] Queuing ${variation.format} (${variation.style})...`);

                    // Non-blocking fetch - let it run in background
                    fetch(`${supabaseUrl}/functions/v1/generate-campaign-asset`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${supabaseAnonKey}`,
                        },
                        body: JSON.stringify({
                            brandDNA,  // Pass fresh brand DNA directly
                            format: variation.format,
                            style: variation.style,
                            precompute: true  // Flag to indicate this is background generation
                        })
                    }).catch(error => {
                        // Silent catch - don't let background errors affect client response
                        console.error(`  ⚠️ Background generation failed for ${variation.format}:`, error.message);
                    });

                    console.log(`    ✅ Dispatched ${variation.format} to background queue`);
                } catch (error) {
                    console.error(`  ⚠️ Error dispatching ${variation.format}:`, error.message);
                }
            });

            console.log('🎯 All 3 variations dispatched! Client response proceeding...');
        } else {
            console.warn('⚠️ Supabase credentials missing - skipping pre-computation');
        }

        // STEP 6: Return Brand DNA with success wrapper (homepage expects this format)
        // Client gets instant response while images generate in background
        return new Response(
            JSON.stringify({
                success: true,
                brandDNA: brandDNA
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        console.error('❌ Error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to extract brand DNA',
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
