/**
 * 🎨 CAMPAIGN ASSET GENERATOR
 * 
 * **Purpose:** Generate AI-powered Instagram ad images using Gemini 2.0
 * 
 * **Why Supabase Edge Function?**
 * - No timeout limits (vs 10s on Vercel Hobby)
 * - Deno runtime supports long-running AI generation
 * - Direct Gemini API access without Node.js dependencies
 * 
 * **Flow:**
 * 1. Receive brand DNA + reference image + campaign text
 * 2. Fetch reference image from URL (server-side, no CORS)
 * 3. Convert to Base64 for Gemini
 * 4. Call Gemini API with image-to-image remix prompt
 * 5. Return generated image as Base64 data URI
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL_NAME = "gemini-3-pro-image-preview";

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: FETCH IMAGE AS BASE64
// ─────────────────────────────────────────────────────────────────────────────

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
    try {
        console.log('📥 Fetching image from:', url.substring(0, 60) + '...');

        // 🛡️ MEMORY SAFETY: Check content-length BEFORE downloading
        // This prevents OOM crashes on Edge Functions with 256MB RAM limits
        const headResponse = await fetch(url, { method: 'HEAD' });
        const contentLength = headResponse.headers.get('content-length');

        if (contentLength) {
            const sizeInMB = parseInt(contentLength) / (1024 * 1024);
            console.log(`📊 Image size: ${sizeInMB.toFixed(2)} MB`);

            // 🚨 4MB LIMIT: Skip large images to prevent memory exhaustion
            if (sizeInMB > 4) {
                console.warn(`⚠️ Image too large (${sizeInMB.toFixed(2)} MB > 4 MB). Skipping to prevent OOM.`);
                console.warn('   Falling back to text-to-image generation (Path B)');
                return null;
            }
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TayloredAI/1.0)',
            },
        });

        if (!response.ok) {
            console.error('❌ Image fetch failed:', response.status);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Convert to Base64 using btoa
        const base64 = btoa(String.fromCharCode(...uint8Array));

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        console.log('✅ Image fetched:', contentType, `(${(arrayBuffer.byteLength / 1024).toFixed(2)} KB)`);

        return { base64, mimeType: contentType };
    } catch (error) {
        console.error('❌ Image fetch error:', error);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        console.log('🎨 ============ CAMPAIGN ASSET GENERATOR ============');
        console.log('📊 DIAGNOSTICS: Function invoked at', new Date().toISOString());
        const startTime = Date.now();

        // ====================================================================
        // 🔬 STEP 1: ENVIRONMENT HEALTH CHECK (CRITICAL)
        // ====================================================================
        const apiKey = Deno.env.get('GEMINI_API_KEY') ||
            Deno.env.get('GOOGLE_API_KEY') ||
            Deno.env.get('GOOGLE_AI_API_KEY');

        console.log('🔑 API Key Check:', {
            GEMINI_API_KEY_exists: !!Deno.env.get('GEMINI_API_KEY'),
            GOOGLE_API_KEY_exists: !!Deno.env.get('GOOGLE_API_KEY'),
            GOOGLE_AI_API_KEY_exists: !!Deno.env.get('GOOGLE_AI_API_KEY'),
            resolved_key_length: apiKey?.length || 0
        });

        if (!apiKey) {
            console.error('❌ CRITICAL ERROR: GEMINI_API_KEY is missing from environment variables.');
            console.error('📋 Available env vars:', Object.keys(Deno.env.toObject()).join(', '));
            return new Response(
                JSON.stringify({
                    error: 'CONFIGURATION ERROR',
                    message: 'GEMINI_API_KEY is missing. Please add it to Supabase Edge Function Secrets.',
                    hint: 'Run: supabase secrets set GEMINI_API_KEY=your_key_here'
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200 // Return 200 so frontend can read the JSON error
                }
            );
        }

        console.log(`✅ API Key validated (Length: ${apiKey.length} characters)`);

        // STEP 2: Parse Request
        const body = await req.json();

        // ROBUST LOGGING: See exactly what the frontend sent
        console.log('📦 PAYLOAD RECEIVED:', JSON.stringify(body, null, 2));

        const { image, isUrl, brandDNA, campaign, sourceImageUrl, userInstructions } = body;

        // 🎨 MULTIMODAL MODE DETECTION
        const isBeautifierMode = !!sourceImageUrl;
        console.log(`🎨 MODE: ${isBeautifierMode ? 'Image Enhancement (Beautifier)' : 'Standard Generation'}`);

        // VALIDATION: Ensure required data exists
        if (!brandDNA || !brandDNA.name) {
            throw new Error('Brand DNA with name is required for generation');
        }

        if (!campaign && !isBeautifierMode && !userInstructions) {
            throw new Error('Campaign text or user instructions required for generation');
        }

        console.log('✅ Request validated:', {
            name: brandDNA.name,
            vibe: brandDNA.vibe,
            industry: brandDNA.industry,
            hasImage: !!image,
            hasSourceImage: !!sourceImageUrl,
            hasUserInstructions: !!userInstructions,
            mode: isBeautifierMode ? 'BEAUTIFIER' : 'GENERATOR'
        });

        // STEP 3: Process Image (Server-side fetch if URL)
        let imagePart = null;

        // 🎨 BEAUTIFIER MODE: Fetch source image from heroImage
        if (isBeautifierMode && sourceImageUrl) {
            console.log('🖼️ BEAUTIFIER MODE: Fetching source image from heroImage...');
            const imageData = await fetchImageAsBase64(sourceImageUrl);

            if (imageData) {
                imagePart = {
                    inlineData: {
                        data: imageData.base64,
                        mimeType: imageData.mimeType
                    }
                };
                console.log('✅ Source image loaded for enhancement');
            } else {
                console.warn('⚠️ Source image fetch failed, falling back to text-only generation');
            }
        }
        // STANDARD MODE: Use provided reference image
        else if (image && isUrl && image.startsWith('http')) {
            console.log('🌐 Server-side image fetch...');
            const imageData = await fetchImageAsBase64(image);

            if (imageData) {
                imagePart = {
                    inlineData: {
                        data: imageData.base64,
                        mimeType: imageData.mimeType
                    }
                };
            } else {
                console.warn('⚠️ Image fetch failed, falling back to text-only generation');
            }
        } else if (image && image.startsWith('data:')) {
            // Already Base64
            const matches = image.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                imagePart = {
                    inlineData: {
                        data: matches[2],
                        mimeType: matches[1]
                    }
                };
                console.log('✅ Base64 image parsed');
            }
        }

        // 🧠 THE "BRAIN": Two-Path Intelligent Prompt Construction

        // Extract brand variables
        const brandName = brandDNA?.name || 'this brand';
        const industry = brandDNA?.industry || 'Business';
        const description = brandDNA?.description || brandDNA?.tagline || '';
        const vibe = brandDNA?.vibe || 'Premium';
        const primaryColor = brandDNA?.primaryColor || '#FF6B35';

        let systemRole = '';
        let userPrompt = '';


        // 👁️ STEP A: Determine if we have a source image
        const hasSourceImage = !!imagePart;
        console.log(`🎯 Decision: ${hasSourceImage ? 'PATH A - Enhance Existing Image' : 'PATH B - Pure AI Generation'}`);

        // 🎨 AI CREATIVE DIRECTOR & COMMERCIAL RETOUCHER
        // Takes their ACTUAL product photo and engineers a high-performance Instagram ad
        systemRole = `You are an Elite AI Creative Director & Commercial Retoucher (Gemini 3 Pro).
  
INPUTS:
- Source Image: [The User's ACTUAL Website Photo]
- Brand Name: "${brandDNA?.name}"
- Industry: "${industry}"
- Bio/Story: "${brandDNA?.bio || ''}"
- Primary Color: "${primaryColor}"

MISSION: 
Take the PROVIDED source image (the client's actual product) and engineer a high-performance Instagram Ad (1080x1080).

STRICT EXECUTION PROTOCOL:

1. **THE VISUAL (Retouch, Don't Replace):**
    - **Goal:** The hero is the *actual* food/product in the source image.
    - **Action:** Apply "High-End Magazine" retouching. Fix lighting, increase appetite appeal, and sharpen details.
    - **Constraint:** Do NOT hallucinate new objects. Do NOT swap the lasagna for a generic stock photo. Keep it authentic.
    - **Composition:** Ensure the subject is centered with 15% clear space at the top and bottom (Safe Zones).

2. **BRAND IDENTITY (The Wrapper):**
    - **Logo Integration:** Seamlessly integrate the brand name "${brandDNA?.name}" at the TOP CENTER. Make it look like a high-end masthead or signage.
    - **Headline:** Analyze the Bio ("${brandDNA?.bio}").
        * *If Slogan Exists:* USE IT (e.g., "Est. 1954").
        * *Fallback:* Write a luxury hook (e.g., "Taste the Tradition").
        * *Style:* Elegant, editorial typography that complements the image.

3. **THE CALL TO ACTION (The "Button"):**
    - **Action:** Render a hyper-realistic "Button" UI element at the BOTTOM CENTER.
    - **Text:** "${industry.match(/food|restaurant/i) ? 'Order Online' : industry.match(/beauty|salon|hair/i) ? 'Book Now' : 'Learn More'}"
    - **Design:** Pill-shaped, High Contrast (Use Primary Color: ${primaryColor}).
    - **Physics:** Add subtle drop shadow and gloss so it looks clickable.

4. **OUTPUT:**
    - A single, cohesive 1080x1080 JPEG where the Text, Button, and Photo interact perfectly (e.g., the text is behind the steam of the pasta).
    - NO text cropping. NO generic people.
    - This is the FINAL output ready for Instagram/Facebook.`;

        // ✨ PATH A: We have a source image - ENHANCE IT
        if (hasSourceImage) {
            // 🎯 CRITICAL FIX: Separate campaign text from beautification instructions
            // - campaign = Text overlay (e.g., "Order Now - Pizza Palace")
            // - userInstructions = Industry beautification guidance (e.g., "food photography")
            const headlineText = campaign || brandDNA?.adHook || 'Special Offer';
            const ctaText = brandDNA?.cta || 'Learn More';

            // Industry-specific beautification instructions (from frontend)
            const beautificationGuidance = userInstructions || 'Enhance lighting and composition to look professional and premium.';

            // Add design urgency based on headline keywords
            let designGuidance = '';
            const lowerHeadline = headlineText.toLowerCase();
            if (lowerHeadline.match(/sale|deal|discount|off|limited|special|promo/i)) {
                designGuidance = '\n- DESIGN STYLE: Bold, urgent, attention-grabbing (this is a LIMITED TIME OFFER)';
            } else if (lowerHeadline.match(/new|arrival|launch|introducing|meet/i)) {
                designGuidance = '\n- DESIGN STYLE: Fresh, exciting, modern (this is a NEW ANNOUNCEMENT)';
            } else if (lowerHeadline.match(/event|save the date|join|rsvp/i)) {
                designGuidance = '\n- DESIGN STYLE: Elegant, inviting, clear date/time placement';
            } else if (lowerHeadline.match(/team|meet|about|we are/i)) {
                designGuidance = '\n- DESIGN STYLE: Warm, friendly, approachable (this is ABOUT PEOPLE)';
            }

            userPrompt = `Create a professional Instagram post for ${brandName}.

**BRAND CONTEXT:**
- Name: ${brandName}
- Industry: ${industry}
- Vibe: ${vibe}
- Color Palette: ${primaryColor}

**IMAGE BEAUTIFICATION:**
${beautificationGuidance}

**VISUAL REQUIREMENTS:**
- Apply ${industry}-specific photography enhancement (lighting, depth, color grading)
- Keep the subject authentic and true to the source image
- Professional, high-end aesthetic

**CAMPAIGN TEXT:**
Create a realistic CTA appropriate for a ${industry} business promoting their services/products:
- Suggested direction: "${headlineText}"
- Make it sound natural and authentic for ${brandName}
- Examples for ${industry}: ${industry.match(/food|restaurant/i) ? '"Order Now", "Reserve Your Table", "Try Our Signature Dish"' :
                    industry.match(/beauty|salon|hair/i) ? '"Book Your Appointment", "Get Your Glow", "Transform Your Look"' :
                        industry.match(/retail|shop|ecommerce/i) ? '"Shop Now", "New Arrivals", "Limited Collection"' :
                            '"Get Started", "Learn More", "Schedule Today"'
                }

**TEXT STYLING:**
- Large, bold, modern typography
- High contrast for readability  
- Professional placement (top or bottom center)

OUTPUT: An Instagram-ready campaign post that looks like it came from ${brandName}'s official account.`;

        }

        // 🔥 PATH B: No source image - GENERATE FROM BRAND DNA
        else {
            userPrompt = `You are a Graphic Designer creating a luxury social media ad from scratch.

** TASK:** Create a photorealistic image for this brand: ${brandName}.

** VISUAL INSTRUCTIONS(DO NOT WRITE THIS TEXT ON THE IMAGE):**
                - Subject: Based on ${industry}
  * If Salon / Beauty → Beautiful hair, happy client in modern salon
                * If Food / Restaurant → Delicious plated dish, professional food photography
                    * If Tech / SaaS → Glowing dashboard on premium laptop
                        * If Landscaping → Lush green gardens, outdoor transformation
                            * If Plumber → Modern, luxurious bathroom
                                * Otherwise → Deduce from industry what the brand's core visual should be
                                    - Style: Photorealistic, High - End, Professional Lighting
                                        - NO PEOPLE IN SUITS(unless Law Firm, Consulting, or Corporate Business)
                                            - NO generic office supplies or stock photos
                                                - Focus on the actual product / service

                                                    ** TEXT OVERLAY INSTRUCTIONS(ONLY WRITE THIS TEXT):**
                                                        - HEADLINE: "${brandDNA?.adHook || campaign || 'Get Started Today'}"(Render in large, elegant typography)
                                                            - BUTTON: "${brandDNA?.cta || 'Book Now'}"(Render inside a pill - shaped button)

                                                                ** BRAND CONTEXT:**
                                                                    - Name: ${brandName}
            - Industry: ${industry}
            - Description: ${description}
            - Vibe: ${vibe}

** CRITICAL NEGATIVE CONSTRAINT:**
                - DO NOT write "A high-quality lifestyle shot" on the image
                    - DO NOT write "Photorealistic image" on the image
                        - DO NOT write "Based on ${industry}" on the image
                            - DO NOT write the visual description as text
                                - ONLY render the HEADLINE and BUTTON text specified above

            OUTPUT: A scroll - stopping Instagram ad that looks like a professional agency created it.`;
        }

        const prompt = `${systemRole} \n\n${userPrompt} `.trim();

        console.log(`🤖 Gemini 3 Prompt Strategy: `);
        console.log(`   Path: ${hasSourceImage ? 'IMAGE ENHANCEMENT' : 'TEXT-TO-IMAGE GENERATION'} `);
        console.log(`   Model: ${MODEL_NAME} `);
        console.log(`   Timeout: 60s`);
        console.log(`   Brand: ${brandName} (${industry})`);
        console.log(`   CTA: ${brandDNA?.cta || 'Learn More'} `);
        console.log(`   Headline: ${brandDNA?.adHook || campaign} `);

        // ====================================================================
        // 🎨 STEP 5A: BUILD MULTI-MODAL PARTS ARRAY
        // ====================================================================
        // Strategy: Send ACTUAL brand assets (logo + product photos) as reference images
        // This creates authentic, on-brand output vs. AI hallucinating logos from text

        console.log('🎨 Building multi-modal parts array...');
        const parts: any[] = [];

        // PART 1: BRAND LOGO (if available)
        if (brandDNA?.logo_url) {
            console.log(`📸 Fetching brand logo: ${brandDNA.logo_url}`);
            const logoImage = await fetchImageAsBase64(brandDNA.logo_url);

            if (logoImage) {
                parts.push({
                    inlineData: {
                        mimeType: logoImage.mimeType,
                        data: logoImage.base64
                    }
                });
                console.log(`  ✅ Logo added to parts array (${logoImage.mimeType})`);
            } else {
                console.log('  ⚠️ Logo fetch failed - will generate text-based logo');
            }
        }


        // PART 2: PRODUCT/HERO PHOTO (if available and not already in imagePart)
        // 🧠 INTELLIGENT SELECTION: Pick the BEST product photo, not just first one
        if (!hasSourceImage) {
            let productImageUrl = null;

            console.log('🎯 SMART IMAGE SELECTION: Analyzing brand_images array...');

            // PRIORITY 1: Use brand_images array with INTELLIGENT RANKING
            if (brandDNA?.brand_images && brandDNA.brand_images.length > 0) {
                console.log(`  📸 Found ${brandDNA.brand_images.length} brand images to analyze`);

                // 🧠 RANK images by quality indicators
                const rankedImages = brandDNA.brand_images
                    .map((url, index) => {
                        let score = 100; // Base score
                        const urlLower = url.toLowerCase();

                        // ❌ FILTER OUT LOGOS (they're not product photos!)
                        const isLogo =
                            urlLower.includes('logo') ||
                            urlLower.includes('favicon') ||
                            urlLower.includes('icon') ||
                            urlLower.includes('badge') ||
                            url === brandDNA.logo_url;

                        if (isLogo) {
                            console.log(`  ⚠️ Skipping logo: ${url.substring(url.lastIndexOf('/') + 1)}`);
                            return { url, score: 0, reason: 'logo' };
                        }

                        // ✅ PREFER larger images (better quality)
                        if (urlLower.includes('w_1920') || urlLower.includes('w_2500')) score += 50;
                        if (urlLower.includes('w_1366') || urlLower.includes('w_1200')) score += 40;
                        if (urlLower.includes('w_854') || urlLower.includes('w_768')) score += 20;

                        // ✅ PREFER specific product/food keywords
                        if (urlLower.includes('food') || urlLower.includes('dish') ||
                            urlLower.includes('plate') || urlLower.includes('meal')) score += 30;
                        if (urlLower.includes('product') || urlLower.includes('item')) score += 25;
                        if (urlLower.includes('pasta') || urlLower.includes('pizza')) score += 35;

                        // ✅ PREFER first few images (usually hero shots)
                        if (index === 0) score += 15;
                        if (index === 1) score += 10;
                        if (index === 2) score += 5;

                        // ✅ CDN images are usually professional quality
                        if (urlLower.includes('squarespace-cdn') || urlLower.includes('cloudinary') ||
                            urlLower.includes('shopify') || urlLower.includes('wixstatic')) score += 15;

                        return { url, score, reason: 'product' };
                    })
                    .filter(img => img.score > 0)  // Remove logos
                    .sort((a, b) => b.score - a.score);  // Best first

                if (rankedImages.length > 0) {
                    productImageUrl = rankedImages[0].url;
                    console.log(`  ✅ BEST IMAGE SELECTED (score: ${rankedImages[0].score})`);
                    console.log(`     URL: ${productImageUrl.substring(productImageUrl.lastIndexOf('/') + 1)}`);
                    console.log(`  📊 Top 3 candidates:`);
                    rankedImages.slice(0, 3).forEach((img, i) => {
                        const filename = img.url.substring(img.url.lastIndexOf('/') + 1);
                        console.log(`     ${i + 1}. ${filename} (score: ${img.score})`);
                    });
                } else {
                    console.log('  ⚠️ All brand_images were logos - trying fallback...');
                }
            }

            // PRIORITY 2: Fallback to hero_image (but only if different from logo)
            if (!productImageUrl && brandDNA?.hero_image && brandDNA.hero_image !== brandDNA?.logo_url) {
                productImageUrl = brandDNA.hero_image;
                console.log(`  📸 Using hero_image as fallback: ${productImageUrl}`);
            }

            // PRIORITY 3: Fallback to og_image (but only if different from logo)
            if (!productImageUrl && brandDNA?.og_image && brandDNA.og_image !== brandDNA?.logo_url) {
                productImageUrl = brandDNA.og_image;
                console.log(`  📸 Using og_image as fallback: ${productImageUrl}`);
            }

            if (!productImageUrl) {
                console.log('  ⚠️ No product photos available - will generate from scratch');
            }

            if (productImageUrl) {
                console.log(`📸 Fetching product photo: ${productImageUrl}`);
                const productImage = await fetchImageAsBase64(productImageUrl);

                if (productImage) {
                    parts.push({
                        inlineData: {
                            mimeType: productImage.mimeType,
                            data: productImage.base64
                        }
                    });
                    console.log(`  ✅ Product photo added to parts array (${productImage.mimeType})`);
                } else {
                    console.log('  ⚠️ Product photo fetch failed - will generate from scratch');
                }
            }
        }

        // PART 3: TEXT PROMPT (instructions on how to use the reference images)
        const enhancedPrompt = parts.length > 0
            ? `REFERENCE IMAGES PROVIDED:
${parts.length >= 1 ? '- Image 1: Brand LOGO (use this EXACTLY at top center, do not redraw)' : ''}
${parts.length >= 2 ? '- Image 2: Product PHOTO (enhance and use as hero, apply pro retouching)' : ''}

COMPOSITION INSTRUCTIONS:
${prompt}

CRITICAL: Use the provided reference images AS-IS. Do not hallucinate new logos or products.`
            : prompt;

        parts.push({ text: enhancedPrompt });

        // PART 4: SOURCE IMAGE (if provided for enhancement path)
        if (imagePart) {
            parts.push(imagePart);
            console.log('  ✅ Source image added to parts array (enhancement mode)');
        }

        console.log(`🎯 Final parts array: ${parts.length} parts`);
        console.log(`   - Reference images: ${parts.filter(p => p.inlineData).length}`);
        console.log(`   - Text prompts: ${parts.filter(p => p.text).length}`);

        const geminiStartTime = Date.now();

        // 🛡️ TIMEOUT CONTROLLER: Prevent function from hanging
        // Set to 60 seconds for high-fidelity rendering
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s limit for high-quality generation

        let response;
        let result;
        let timedOut = false;

        try {
            console.log('🚀 Initiating Gemini API call...');
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            role: 'user',
                            parts: parts,
                        }],
                        generationConfig: {
                            responseModalities: ["IMAGE"]
                        }
                    }),
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);
            const geminiDuration = ((Date.now() - geminiStartTime) / 1000).toFixed(2);
            console.log(`✅ Gemini response received in ${geminiDuration}s (Status: ${response.status})`);

            // ====================================================================
            // 🚨 GEMINI API ERROR HANDLING WITH DETAILED DIAGNOSTICS
            // ====================================================================
            if (!response.ok) {
                const errorText = await response.text();
                let errorDetails;
                try {
                    errorDetails = JSON.parse(errorText);
                } catch {
                    errorDetails = { message: errorText };
                }

                console.error('❌ GEMINI API ERROR DETAILS:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorBody: errorDetails
                });

                // Return specific error messages to frontend
                let userMessage = 'AI generation failed. ';
                if (response.status === 401) {
                    userMessage = 'AUTHENTICATION ERROR: Invalid or expired Gemini API key. Please check your Supabase secrets.';
                } else if (response.status === 403) {
                    userMessage = 'PERMISSION ERROR: API key does not have access to Gemini 3.0. Check your Google Cloud project permissions.';
                } else if (response.status === 400) {
                    userMessage = `BAD REQUEST: ${errorDetails.error?.message || errorText}`;
                } else if (response.status === 429) {
                    userMessage = 'RATE LIMIT ERROR: Too many requests to Gemini API. Please try again in a few moments.';
                } else if (response.status === 500 || response.status === 503) {
                    userMessage = 'GEMINI SERVICE ERROR: Google AI service is temporarily unavailable. Please try again.';
                } else {
                    userMessage = `Gemini API error (${response.status}): ${errorDetails.error?.message || 'Unknown error'}`;
                }

                return new Response(
                    JSON.stringify({
                        error: 'GEMINI_API_ERROR',
                        message: userMessage,
                        status_code: response.status,
                        details: errorDetails
                    }),
                    {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 200 // Return 200 so frontend can parse the error
                    }
                );
            }

            result = await response.json();
            console.log('📦 Gemini response parsed successfully');
        } catch (error: any) {
            clearTimeout(timeoutId);

            // ====================================================================
            // 🚨 TIMEOUT DETECTED: Return safe fallback
            // ====================================================================
            if (error.name === 'AbortError') {
                console.warn('⏱️ Gemini API timed out after 60s. Returning Unsplash fallback...');
                timedOut = true;

                // Generate industry-specific Unsplash fallback
                const industryLower = (brandDNA?.industry || 'business').toLowerCase();
                let unsplashQuery = 'professional business';

                // Map industry to Unsplash search term
                if (industryLower.match(/food|restaurant|pizza|cafe|dining|bistro|italian|kitchen/i)) {
                    unsplashQuery = 'delicious food plated dish restaurant';
                } else if (industryLower.match(/beauty|hair|salon|spa|fashion|clothing/i)) {
                    unsplashQuery = 'beauty editorial fashion luxury';
                } else if (industryLower.match(/tech|software|saas|app|digital/i)) {
                    unsplashQuery = 'modern technology workspace futuristic';
                } else if (industryLower.match(/landscaping|outdoor|garden|lawn/i)) {
                    unsplashQuery = 'lush green garden landscaping outdoor';
                } else if (industryLower.match(/fitness|gym|wellness|yoga/i)) {
                    unsplashQuery = 'fitness gym athletic dynamic';
                } else if (industryLower.match(/real estate|property|home/i)) {
                    unsplashQuery = 'modern home architecture interior';
                }

                const fallbackImage = `https://source.unsplash.com/1024x1024/?${encodeURIComponent(unsplashQuery)}`;

                return new Response(
                    JSON.stringify({
                        image: fallbackImage,
                        status: 'timeout_fallback',
                        message: 'AI generation timed out, using high-quality placeholder'
                    }),
                    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // ====================================================================
            // 🚨 NETWORK OR OTHER ERRORS
            // ====================================================================
            console.error('❌ Gemini API call failed:', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack
            });

            return new Response(
                JSON.stringify({
                    error: 'NETWORK_ERROR',
                    message: `Failed to connect to Gemini API: ${error.message}`,
                    error_type: error.name
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200
                }
            );
        }

        // STEP 6: Extract Generated Image (Gemini 3 format)
        const candidate = result.candidates?.[0];
        if (!candidate) {
            throw new Error('No content generated');
        }

        // Check for safety blocks
        if (result.promptFeedback?.blockReason) {
            throw new Error('Content blocked - please adjust campaign text');
        }

        // Gemini 3 returns image in candidates[0].content.parts[0].inlineData
        const contentParts = candidate.content?.parts || [];
        const inlineData = contentParts[0]?.inlineData;

        if (!inlineData || !inlineData.data) {
            console.error('❌ Response structure:', JSON.stringify(result).substring(0, 500));
            throw new Error('No image data in response');
        }

        const generatedBase64 = inlineData.data;
        const generatedMimeType = inlineData.mimeType || 'image/png';

        const imageDataUri = `data:${generatedMimeType};base64,${generatedBase64}`;

        const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`🎉 Success! Total time: ${totalDuration}s`);

        return new Response(
            JSON.stringify({
                success: true,
                image: imageDataUri,
                metadata: {
                    duration: totalDuration,
                    strategy: imagePart ? 'remix' : 'generate',
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        // ====================================================================
        // 🔬 RAW ERROR EXPOSURE FOR DEBUGGING
        // ====================================================================
        console.error('❌ Generation failed:', error);
        console.error('📦 Full Error Object:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            raw: error
        });
        console.error('🔥 SERIALIZED ERROR:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

        // Determine error type for categorization
        let errorType = 'UNKNOWN_ERROR';

        if (error.message?.includes('API key')) {
            errorType = 'API_KEY_ERROR';
        } else if (error.message?.includes('Gemini API error')) {
            errorType = 'GEMINI_API_ERROR';
        } else if (error.message?.includes('Content blocked')) {
            errorType = 'CONTENT_BLOCKED';
        } else if (error.message?.includes('No content generated')) {
            errorType = 'NO_CONTENT';
        } else if (error.name === 'AbortError') {
            errorType = 'TIMEOUT';
        } else if (error.message?.includes('out of memory') || error.message?.includes('OOM')) {
            errorType = 'OUT_OF_MEMORY';
        }

        console.log(`🚨 RETURNING RAW ERROR (Type: ${errorType})`);

        // ====================================================================
        // 🔥 EXPOSE RAW ERROR DETAILS - NO MASKING
        // ====================================================================
        return new Response(
            JSON.stringify({
                error: errorType,
                message: error.message || 'Unknown error occurred',
                error_name: error.name,
                error_stack: error.stack,
                raw_error: String(error),
                hint: errorType === 'API_KEY_ERROR'
                    ? 'Check GEMINI_API_KEY in Supabase Edge Function Secrets'
                    : errorType === 'TIMEOUT'
                        ? 'The AI model took too long to respond. Try again.'
                        : 'Check Supabase function logs for details'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Return 200 so frontend can read the JSON error
            }
        );
    }
});
