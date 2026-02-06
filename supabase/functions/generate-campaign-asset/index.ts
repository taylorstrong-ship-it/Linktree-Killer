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

        const { image, isUrl, brandDNA, campaign } = body;

        // VALIDATION: Ensure required data exists
        if (!brandDNA || !brandDNA.name) {
            throw new Error('Brand DNA with name is required for generation');
        }

        if (!campaign) {
            throw new Error('Campaign text is required for generation');
        }

        console.log('✅ Request validated:', {
            name: brandDNA.name,
            vibe: brandDNA.vibe,
            industry: brandDNA.industry,
            hasImage: !!image
        });

        // STEP 3: Process Image (Server-side fetch if URL)
        let imagePart = null;

        if (image && isUrl && image.startsWith('http')) {
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

        // STEP 4: Build Mega-Prompt (Creative Director Level)

        // 1. Define the Role
        const role = "You are a world-class creative director for high-end food and lifestyle brands on Instagram.";

        // 2. Define the Context based on inputs
        const industry = brandDNA?.industry || "Business";
        const vibe = brandDNA?.vibe || "Premium";
        const primaryColor = brandDNA?.primaryColor || "#FF6B35";
        const brandName = brandDNA?.name || "this brand";

        const brandContext = `BRAND: ${brandName}. VIBE: ${vibe}. PRIMARY COLORS: ${primaryColor}. INDUSTRY: ${industry}.`;
        const campaignContext = `CAMPAIGN GOAL: ${campaign}.`;
        const visualReference = imagePart
            ? `REFERENCE IMAGE STYLE: Capture the mood, lighting, and subject matter style of the attached image.`
            : "";

        // 3. The Core Instruction (The "Mega-Prompt")
        const prompt = `
${role}

TASK: Create a visually stunning, scroll-stopping Instagram feed image for the brand described below.

${brandContext}
${campaignContext}
${visualReference}

REQUIREMENTS:
- The image must perfectly embody the brand's vibe and color palette.
- The composition should be editorial and professional, not like a cheap stock photo.
- If text is included in the image, it must be naturally integrated into the scene (e.g., a neon sign on a wall, handwritten on a menu, part of the environment) and NOT overlaid as generic digital text.
- Focus on appetizing, high-quality visuals related to the ${industry} industry.
- Use professional lighting (studio quality or natural light that enhances the subject).
- Maintain Instagram-optimized square (1:1) composition with visual balance.
- Ensure the image commands attention and stops the scroll.
`.trim();

        console.log(`🤖 Generating with Gemini 3 Pro Image Preview...`);
        console.log(`   Strategy: ${imagePart ? "Image-to-Image Remix" : "Text-to-Image Generation"}`);

        // STEP 5: Call Gemini 3 API (using fetch, Deno-compatible)
        const parts: any[] = [{ text: prompt }];
        if (imagePart) parts.push(imagePart);

        const geminiStartTime = Date.now();

        const response = await fetch(
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
                })
            }
        );

        const geminiDuration = ((Date.now() - geminiStartTime) / 1000).toFixed(2);
        console.log(`✅ Gemini response received in ${geminiDuration}s`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API error:', response.status, errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const result = await response.json();

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
