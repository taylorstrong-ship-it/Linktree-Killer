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
        const startTime = Date.now();

        // STEP 1: Get Gemini API Key
        const apiKey = Deno.env.get('GEMINI_API_KEY') ||
            Deno.env.get('GOOGLE_API_KEY') ||
            Deno.env.get('GOOGLE_AI_API_KEY');

        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }

        // STEP 2: Parse Request
        const body = await req.json();

        // ROBUST LOGGING: See exactly what the frontend sent
        console.log('📦 PAYLOAD RECEIVED:', JSON.stringify(body, null, 2));

        const { image, isUrl, brandDNA, campaign, sourceImageUrl } = body;

        // 🎨 MULTIMODAL MODE DETECTION
        const isBeautifierMode = !!sourceImageUrl;
        console.log(`🎨 MODE: ${isBeautifierMode ? 'Image Enhancement (Beautifier)' : 'Standard Generation'}`);

        // VALIDATION: Ensure required data exists
        if (!brandDNA || !brandDNA.name) {
            throw new Error('Brand DNA with name is required for generation');
        }

        if (!campaign && !isBeautifierMode) {
            throw new Error('Campaign text is required for generation');
        }

        console.log('✅ Request validated:', {
            name: brandDNA.name,
            vibe: brandDNA.vibe,
            industry: brandDNA.industry,
            hasImage: !!image,
            hasSourceImage: !!sourceImageUrl,
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
        console.log(`🎯 Decision: ${hasSourceImage ? 'PATH A - Enhance Existing Image' : 'PATH B - Generate From Scratch'}`);

        // 🎨 System Instruction (Same for both paths)
        systemRole = "You are an elite Creative Director and Graphic Designer. Your goal is to produce a production-ready social media ad.";

        // ✨ PATH A: We have a source image - ENHANCE IT
        if (hasSourceImage) {
            userPrompt = `You are a Graphic Designer creating a luxury social media ad.

**TASK:** Polish the provided image and add professional overlay text.

**VISUAL INSTRUCTIONS (DO NOT WRITE THIS TEXT ON THE IMAGE):**
- Keep the subject EXACTLY as is (do not hallucinate new objects)
- Fix lighting, color grading, and visual appeal
- Make it look high-end and professional
- DO NOT change the product/subject itself

**TEXT OVERLAY INSTRUCTIONS (ONLY WRITE THIS TEXT):**
- HEADLINE: "${brandDNA?.adHook || campaign || 'Special Offer'}" (Render in large, modern white typography)
- BUTTON: "${brandDNA?.cta || 'Learn More'}" (Render inside a pill-shaped button)

**BRAND CONTEXT:**
- Name: ${brandName}
- Industry: ${industry}
- Vibe: ${vibe}
- Primary Color: ${primaryColor}

**CRITICAL NEGATIVE CONSTRAINT:**
- DO NOT write "VISUAL INSTRUCTIONS" on the image
- DO NOT write "Keep the subject EXACTLY as is" on the image
- DO NOT write "Fix lighting" on the image
- ONLY render the HEADLINE and BUTTON text specified above

OUTPUT: A polished, professional ad graphic ready for Instagram.`;
        }
        // 🔥 PATH B: No source image - GENERATE FROM BRAND DNA
        else {
            userPrompt = `You are a Graphic Designer creating a luxury social media ad from scratch.

**TASK:** Create a photorealistic image for this brand: ${brandName}.

**VISUAL INSTRUCTIONS (DO NOT WRITE THIS TEXT ON THE IMAGE):**
- Subject: Based on ${industry}
  * If Salon/Beauty → Beautiful hair, happy client in modern salon
  * If Food/Restaurant → Delicious plated dish, professional food photography
  * If Tech/SaaS → Glowing dashboard on premium laptop
  * If Landscaping → Lush green gardens, outdoor transformation
  * If Plumber → Modern, luxurious bathroom
  * Otherwise → Deduce from industry what the brand's core visual should be
- Style: Photorealistic, High-End, Professional Lighting
- NO PEOPLE IN SUITS (unless Law Firm, Consulting, or Corporate Business)
- NO generic office supplies or stock photos
- Focus on the actual product/service

**TEXT OVERLAY INSTRUCTIONS (ONLY WRITE THIS TEXT):**
- HEADLINE: "${brandDNA?.adHook || campaign || 'Get Started Today'}" (Render in large, elegant typography)
- BUTTON: "${brandDNA?.cta || 'Book Now'}" (Render inside a pill-shaped button)

**BRAND CONTEXT:**
- Name: ${brandName}
- Industry: ${industry}
- Description: ${description}
- Vibe: ${vibe}

**CRITICAL NEGATIVE CONSTRAINT:**
- DO NOT write "A high-quality lifestyle shot" on the image
- DO NOT write "Photorealistic image" on the image
- DO NOT write "Based on ${industry}" on the image
- DO NOT write the visual description as text
- ONLY render the HEADLINE and BUTTON text specified above

OUTPUT: A scroll-stopping Instagram ad that looks like a professional agency created it.`;
        }

        const prompt = `${systemRole}\n\n${userPrompt}`.trim();

        console.log(`🤖 Gemini 3 Prompt Strategy:`);
        console.log(`   Path: ${hasSourceImage ? 'IMAGE ENHANCEMENT' : 'TEXT-TO-IMAGE GENERATION'}`);
        console.log(`   Model: ${MODEL_NAME}`);
        console.log(`   Timeout: 60s`);
        console.log(`   Brand: ${brandName} (${industry})`);
        console.log(`   CTA: ${brandDNA?.cta || 'Learn More'}`);
        console.log(`   Headline: ${brandDNA?.adHook || campaign}`);

        // STEP 5: Call Gemini 3 API with 15-second timeout controller
        const parts: any[] = [{ text: prompt }];
        if (imagePart) parts.push(imagePart);

        const geminiStartTime = Date.now();

        // 🛡️ TIMEOUT CONTROLLER: Prevent function from hanging
        // Set to 60 seconds for high-fidelity rendering
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s limit for high-quality generation

        let response;
        let result;
        let timedOut = false;

        try {
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
                            parts: parts
                        }],
                        generationConfig: {
                            responseModalities: ["IMAGE"]
                        }
                    }),
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);
            const geminiDuration = ((Date.now() - geminiStartTime) / 1000).toFixed(2);
            console.log(`✅ Gemini response received in ${geminiDuration}s`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Gemini API error:', response.status, errorText);
                throw new Error(`Gemini API error: ${response.status}`);
            }

            result = await response.json();
        } catch (error: any) {
            clearTimeout(timeoutId);

            // 🚨 TIMEOUT DETECTED: Return safe fallback
            if (error.name === 'AbortError') {
                console.warn('⏱️ Gemini API timed out after 15s. Returning Unsplash fallback...');
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

            // Other errors: throw to be caught by outer try/catch
            throw error;
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
        console.error('❌ Generation failed:', error);

        // 🛡️ IRONCLAD BACKEND: Return graceful fallback instead of 500 error
        // This prevents the frontend from showing "Preview Unavailable" errors

        // Determine error type for logging
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

        console.log(`🤫 Returning graceful fallback (ErrorType: ${errorType})`);

        // 🎯 ALWAYS RETURN 200 OK with image: null
        // The frontend will keep showing the original hero image
        return new Response(
            JSON.stringify({
                success: false,
                image: null,
                error: errorType,
                message: 'AI generation unavailable - using original image'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // ✅ CRITICAL: Return 200, not 500
            }
        );
    }
});
