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
            userPrompt = `I am providing a raw photo from the client's website.

1. **ENHANCE:** Keep the subject EXACTLY as is (do not hallucinate a new dish/product). Fix the lighting, color grading, and visual appeal to make it look high-end and professional.

2. **DESIGN:** Overlay the headline "${brandDNA?.adHook || campaign || 'Special Offer'}" in modern white typography and a button with "${brandDNA?.cta || 'Learn More'}".

3. **CONSTRAINT:** Do not change the food/product/subject itself. Just polish it to look premium.

BRAND CONTEXT:
- Name: ${brandName}
- Industry: ${industry}
- Vibe: ${vibe}
- Primary Color: ${primaryColor}

OUTPUT: A polished, professional ad graphic ready for Instagram.`;
        }
        // 🔥 PATH B: No source image - GENERATE FROM BRAND DNA
        else {
            userPrompt = `I do not have a source photo. You must hallucinate the perfect asset based on this Brand DNA:

BRAND: ${brandName}
INDUSTRY: ${industry}
DESCRIPTION: ${description}
VIBE: ${vibe}

1. **VISUALIZE:** Generate a photorealistic image of the brand's core offering:
   - If Italian Restaurant → Draw perfect Lasagna or Pasta
   - If Plumber → Draw a modern, luxurious bathroom
   - If Tech Startup → Draw a glowing dashboard on a premium laptop
   - If Landscaping → Draw lush green gardens, outdoor transformation
   - If Salon/Beauty → Draw a happy client with fresh hairstyle in modern salon
   - Otherwise: Deduce from the industry what the brand's core visual should be

2. **DESIGN:** Overlay the headline "${brandDNA?.adHook || campaign || 'Get Started Today'}" in modern white typography and a button with "${brandDNA?.cta || 'Book Now'}".

3. **NEGATIVE CONSTRAINT:** 
   - NO PEOPLE IN SUITS unless this is explicitly a Law Firm, Consulting Agency, or Corporate Business
   - NO generic office supplies or conference rooms
   - Focus on the actual product/service the brand offers
   - Use photorealistic quality, not cartoon or clipart

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

        // Determine error type and status code
        let statusCode = 500;
        let errorMessage = error.message || 'Generation failed';
        let errorType = 'INTERNAL_ERROR';

        if (error.message?.includes('API key')) {
            statusCode = 500;
            errorType = 'API_KEY_ERROR';
            errorMessage = 'Server configuration error: Missing API key';
        } else if (error.message?.includes('Gemini API error')) {
            statusCode = 502;
            errorType = 'GEMINI_API_ERROR';
            errorMessage = 'External API error: ' + error.message;
        } else if (error.message?.includes('Content blocked')) {
            statusCode = 400;
            errorType = 'CONTENT_BLOCKED';
            errorMessage = 'Content moderation: ' + error.message;
        } else if (error.message?.includes('No content generated')) {
            statusCode = 500;
            errorType = 'NO_CONTENT';
            errorMessage = 'Generation failed: No content returned from AI';
        }

        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage,
                errorType: errorType,
                details: error.stack ? error.stack.split('\n')[0] : undefined,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: statusCode,
            }
        );
    }
});
