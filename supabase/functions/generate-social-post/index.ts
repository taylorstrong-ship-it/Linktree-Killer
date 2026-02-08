/**
 * 🎨 SOCIAL POST GENERATOR v1.0
 * 
 * **Purpose:** Generate professional social media posts using Gemini 3.0 Pro's native image generation
 * 
 * **Key Features:**
 * - Uses Gemini 3.0 Pro (gemini-3-pro-image-preview) for NATIVE image generation
 * - AI handles 100% of pixel work (no Canvas/Fabric.js)
 * - Enhances photos with lighting/color-grading
 * - Renders text directly onto images with perfect legibility
 * - Uploads to Supabase Storage and returns public URLs
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
    user_image_url: string;
    caption_text: string;
    brand_dna: {
        company_name?: string;
        colors?: {
            primary?: string;
            secondary?: string;
            accent?: string;
        };
        typography?: {
            heading?: string;
            body?: string;
        };
        business_type?: string;
    };
    format?: 'instagram_post' | 'instagram_story' | 'facebook_post';
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body: GenerateRequest = await req.json();
        const { user_image_url, caption_text, brand_dna, format = 'instagram_post' } = body;

        console.log('🎨 Starting generation:', { caption_text, format, brand: brand_dna.company_name });

        // Validate inputs
        if (!user_image_url || !caption_text) {
            return new Response(
                JSON.stringify({ error: 'user_image_url and caption_text are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get API keys
        const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!googleApiKey || !supabaseUrl || !supabaseServiceKey) {
            throw new Error('Required environment variables not configured');
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(googleApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview' }); // Latest 2026 image generation model with reasoning

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Format specifications
        const formatSpecs = {
            instagram_post: { width: 1080, height: 1080, ratio: '1:1', name: 'Instagram Post' },
            instagram_story: { width: 1080, height: 1920, ratio: '9:16', name: 'Instagram Story' },
            facebook_post: { width: 1200, height: 630, ratio: '1.91:1', name: 'Facebook Post' }
        };

        const spec = formatSpecs[format];

        // Step 3: Fetch user image and convert to inlineData format
        console.log('📥 Fetching user image:', user_image_url);
        const imageResponse = await fetch(user_image_url);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

        console.log('✅ Image loaded, constructing Director\'s Prompt...');

        // Step 4: Construct "Director's Prompt" for Gemini 3
        const directorPrompt = `You are a HIGH-END SOCIAL MEDIA DESIGNER creating a premium ${spec.name} (${spec.ratio}, ${spec.width}x${spec.height}px).

🎯 YOUR MISSION:
Enhance this raw photo and render professional text overlays to create a scroll-stopping social media post.

📊 BRAND CONTEXT:
- Business Name: ${brand_dna.company_name || 'Premium Brand'}
- Industry: ${brand_dna.business_type || 'Restaurant'}
- Primary Brand Color: ${brand_dna.colors?.primary || '#FF6B35'}
- Secondary Color: ${brand_dna.colors?.secondary || '#1a1a1a'}
- Accent Color: ${brand_dna.colors?.accent || '#00FF41'}
- Heading Font: ${brand_dna.typography?.heading || 'Bold Sans-serif'}
- Body Font: ${brand_dna.typography?.body || 'Clean Sans-serif'}

💬 MESSAGE TO COMMUNICATE:
"${caption_text}"

🎨 YOUR TASKS:

1. **PHOTO ENHANCEMENT:**
   - Optimize lighting and exposure for maximum visual impact
   - Color-grade the image to be vibrant and premium
   - Enhance contrast and sharpness
   - Make the product/subject pop with professional retouching

2. **TEXT RENDERING:**
   - Render the caption text ("${caption_text}") DIRECTLY onto the image
   - Use the brand's heading font style (${brand_dna.typography?.heading || 'Bold Sans-serif'})
   - Text color should be ${brand_dna.colors?.primary || '#FF6B35'} or white (whichever has better contrast)
   - Add text shadows/outlines to ensure 100% LEGIBILITY
   - Spelling must be PERFECT - verify every word
   - Text should be large, bold, and easy to read on mobile

3. **VISUAL COMPOSITION:**
   - Apply brand colors (${brand_dna.colors?.primary}, ${brand_dna.colors?.accent}) as accent elements
   - Add a subtle branded graphic element or shape using brand colors
   - Ensure the composition fits ${spec.ratio} aspect ratio EXACTLY
   - Leave breathing room - don't overcrowd the design
   - Create visual hierarchy: subject → text → accents

4. **QUALITY STANDARDS:**
   - Text must be 100% LEGIBLE with high contrast
   - Spelling must be PERFECT
   - Composition must match ${spec.name} format exactly
   - Design should feel premium and professional
   - Ready for immediate posting - no edits needed

🚫 CRITICAL CONSTRAINTS:
- ALL text must be RENDERED IN THE IMAGE (not described)
- Use EXACT brand colors provided
- Maintain ${spec.width}x${spec.height}px dimensions
- Ensure text is readable on mobile devices
- Zero tolerance for spelling errors

Generate the complete, production-ready social media post image NOW.`;

        // Step 5: Generate the image
        console.log('🤖 Calling Gemini 3.0 Pro...');
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: directorPrompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
            }
        });

        const response = result.response;

        // Extract generated image from response
        const generatedImage = response.candidates?.[0]?.content?.parts?.find(
            (part: any) => part.inlineData
        );

        if (!generatedImage?.inlineData) {
            throw new Error('Gemini did not return a generated image');
        }

        console.log('✅ Image generated, uploading to Supabase Storage...');

        // Step 6: Upload to Supabase Storage bucket 'generated-content'
        const imageData = generatedImage.inlineData.data;
        const imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));

        const timestamp = Date.now();
        const filename = `${format}_${timestamp}.png`;
        const filePath = `generated-posts/${filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated-content')
            .upload(filePath, imageBytes, {
                contentType: 'image/png',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload failed:', uploadError);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Step 7: Return the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('generated-content')
            .getPublicUrl(filePath);

        console.log('✅ Upload complete:', publicUrl);

        return new Response(
            JSON.stringify({
                success: true,
                image_url: publicUrl,
                format: format,
                dimensions: `${spec.width}x${spec.height}`,
                caption: caption_text
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('❌ Generation error:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to generate social post',
                details: error.message
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
