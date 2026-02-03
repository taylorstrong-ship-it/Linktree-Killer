import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BrandDNA {
    id?: string
    company_name: string
    primary_color: string
    secondary_color: string
    fonts?: Array<{ family: string; role: string }>
    industry?: string
    tone?: string
    brand_voice_keywords?: string[]
}

interface CampaignRequest {
    campaignName: string
    userPrompt: string
    referenceImageBase64?: string
    brandDNA: BrandDNA
}

interface CampaignPlan {
    storyPrompt: string
    feedPrompt: string
    infoPrompt: string
    caption: string
    hashtags: string[]
}

interface CampaignResponse {
    success: boolean
    campaign: {
        id: string
        storyImageUrl: string
        feedImageUrl: string
        infoImageUrl: string
        caption: string
        hashtags: string[]
    }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        // Parse request
        const { campaignName, userPrompt, referenceImageBase64, brandDNA }: CampaignRequest = await req.json()

        // Validate input
        if (!campaignName || !userPrompt || !brandDNA) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: campaignName, userPrompt, brandDNA' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get environment variables
        const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
        const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        if (!GOOGLE_AI_KEY) {
            throw new Error('GOOGLE_AI_STUDIO_KEY not configured')
        }

        console.log('🚀 Starting Pomelli Campaign Generation')
        console.log(`Campaign: "${campaignName}"`)
        console.log(`Prompt: "${userPrompt}"`)
        console.log(`Brand: ${brandDNA.company_name}`)

        // ========================================================================
        // STEP 1: CAMPAIGN PLANNING (Gemini 3 Pro - Text Mode)
        // ========================================================================
        console.log('📋 Step 1: Planning campaign with Gemini 3 Pro...')

        const plan = await generateCampaignPlan(userPrompt, brandDNA, GOOGLE_AI_KEY)
        console.log('✓ Campaign plan generated')

        // ========================================================================
        // STEP 2: PARALLEL IMAGE GENERATION (3x Gemini 3 Pro Image)
        // ========================================================================
        console.log('🎨 Step 2: Generating 3 images in parallel...')

        const [storyImage, feedImage, infoImage] = await Promise.all([
            generateImage(plan.storyPrompt, '9:16', 'story', brandDNA, referenceImageBase64, GOOGLE_AI_KEY),
            generateImage(plan.feedPrompt, '1:1', 'feed', brandDNA, referenceImageBase64, GOOGLE_AI_KEY),
            generateImage(plan.infoPrompt, '1:1', 'info', brandDNA, null, GOOGLE_AI_KEY) // No reference for text-heavy slide
        ])

        console.log('✓ All 3 images generated')

        // ========================================================================
        // STEP 3: STORAGE UPLOAD + DATABASE INSERT
        // ========================================================================
        console.log('📦 Step 3: Uploading to storage and saving to database...')

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        const timestamp = Date.now()
        const brandSlug = brandDNA.company_name.replace(/\s+/g, '-').toLowerCase()

        // Upload images to Supabase Storage
        const storyUrl = await uploadImage(supabase, storyImage, `${brandSlug}-${timestamp}-story.jpg`)
        const feedUrl = await uploadImage(supabase, feedImage, `${brandSlug}-${timestamp}-feed.jpg`)
        const infoUrl = await uploadImage(supabase, infoImage, `${brandSlug}-${timestamp}-info.jpg`)

        console.log('✓ Images uploaded to storage')

        // Get user ID from auth header (optional - allow anonymous usage)
        const authHeader = req.headers.get('Authorization')
        const token = authHeader?.replace('Bearer ', '')

        let userId: string = '00000000-0000-0000-0000-000000000000' // Valid UUID for anonymous users
        if (token && !token.startsWith('ey')) { // Simple check to differentiate anon key from JWT
            try {
                const { data: { user } } = await supabase.auth.getUser(token)
                if (user?.id) userId = user.id
            } catch (error) {
                console.log('Auth check failed, using anonymous mode:', error)
            }
        }

        console.log('Campaign generation for user:', userId)

        // Insert campaign into database
        const { data: campaign, error: dbError } = await supabase
            .from('campaigns')
            .insert({
                user_id: userId,
                brand_profile_id: brandDNA.id || null,
                campaign_name: campaignName,
                user_prompt: userPrompt,
                story_image_url: storyUrl,
                feed_image_url: feedUrl,
                info_image_url: infoUrl,
                caption: plan.caption,
                hashtags: plan.hashtags,
                reference_image_url: referenceImageBase64 ? 'uploaded' : null
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            throw new Error(`Failed to save campaign: ${dbError.message}`)
        }

        console.log('✓ Campaign saved to database')
        console.log(`🎉 Campaign "${campaignName}" generated successfully!`)

        // Return success response
        const response: CampaignResponse = {
            success: true,
            campaign: {
                id: campaign.id,
                storyImageUrl: storyUrl,
                feedImageUrl: feedUrl,
                infoImageUrl: infoUrl,
                caption: plan.caption,
                hashtags: plan.hashtags
            }
        }

        return new Response(
            JSON.stringify(response),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('❌ Campaign generation error:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                details: 'Failed to generate campaign. Check Edge Function logs.'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

// ============================================================================
// STEP 1: CAMPAIGN PLANNING FUNCTION
// ============================================================================

async function generateCampaignPlan(
    userPrompt: string,
    brandDNA: BrandDNA,
    apiKey: string
): Promise<CampaignPlan> {
    const planningPrompt = `You are a Social Media Creative Director for ${brandDNA.company_name}.

BRAND CONTEXT:
- Industry: ${brandDNA.industry || 'General Business'}
- Primary Color: ${brandDNA.primary_color}
- Secondary Color: ${brandDNA.secondary_color}
- Font Style: ${brandDNA.fonts?.[0]?.family || 'Modern Sans-Serif'}
- Brand Voice: ${brandDNA.tone || 'Professional'} ${brandDNA.brand_voice_keywords ? '(' + brandDNA.brand_voice_keywords.join(', ') + ')' : ''}

USER REQUEST: "${userPrompt}"

CREATE A COHESIVE 3-PIECE INSTAGRAM CAMPAIGN:

1. STORY PROMPT (9:16 vertical):
   - Bold, eye-catching typography announcing the offer
   - "Coming Soon" / "Tonight Only" style urgency
   - Use brand primary color as dramatic accent
   - Minimal text, maximum impact
   
2. FEED PROMPT (1:1 square):
   - Professional product photography (studio lighting or dramatic outdoor scene)
   - Product/subject as the hero
   - Minimal text overlays (let the image sell)
   - Brand colors integrated naturally into composition
   
3. INFO PROMPT (1:1 square):
   - Typography-heavy layout (70% text, 30% background)
   - Clearly list the offer details in readable format
   - Professional menu/flyer aesthetic
   - Strong contrast for readability
   - Brand colors in background or accents

4. CAPTION + HASHTAGS:
   - Write a scroll-stopping Instagram caption (2-3 sentences max)
   - Hook: Start with an attention-grabbing question or statement
   - Value: Clearly communicate what's being offered
   - CTA: End with a clear call-to-action
   - Include 8-12 relevant, niche-specific hashtags (mix of popular and targeted)

Return JSON format:
{
  "storyPrompt": "Detailed image generation prompt for Story",
  "feedPrompt": "Detailed image generation prompt for Feed",
  "infoPrompt": "Detailed image generation prompt for Info",
  "caption": "Instagram caption text",
  "hashtags": ["#hashtag1", "#hashtag2", ...]
}`

    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: planningPrompt }] }],
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048
                }
            })
        }
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Campaign planning failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    let planText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!planText) {
        throw new Error('No campaign plan generated')
    }

    // Strip markdown code blocks if Gemini 3 returns ```json...```
    planText = planText.replace(/```json\n?|```\n?/g, '').trim()

    return JSON.parse(planText)
}

// ============================================================================
// STEP 2: IMAGE GENERATION FUNCTION
// ============================================================================

async function generateImage(
    prompt: string,
    aspectRatio: string,
    type: 'story' | 'feed' | 'info',
    brandDNA: BrandDNA,
    referenceImageBase64: string | null | undefined,
    apiKey: string
): Promise<string> {
    const systemPrompt = `You are a professional Brand Designer and Photographer for ${brandDNA.company_name}.

BRAND GUIDELINES:
- Primary Color: ${brandDNA.primary_color}
- Secondary Color: ${brandDNA.secondary_color}
- Font Style: ${brandDNA.fonts?.[0]?.family || 'Modern Sans-Serif'}

FORMAT: ${aspectRatio} aspect ratio (${type === 'story' ? 'VERTICAL' : 'SQUARE'})

TASK: ${prompt}

QUALITY REQUIREMENTS:
- Professional photography-grade lighting and composition
- Perfect text spelling (CRITICAL - no typos)
- No AI artifacts or unrealistic elements
- Brand colors integrated tastefully, not overwhelming
- High contrast for readability
- ${type === 'info' ? 'Text must be CRYSTAL CLEAR and easily readable' : 'Photorealistic, magazine-quality aesthetic'}

${referenceImageBase64 && type !== 'info' ? 'A reference photo is provided. Use it to match product details, composition, and authenticity.' : ''}`

    const contentParts: any[] = [
        { text: systemPrompt },
        { text: `Generate: ${prompt}` }
    ]

    // Add reference image for story and feed (not info - it's text-heavy)
    if (referenceImageBase64 && type !== 'info') {
        contentParts.push({
            inline_data: {
                mime_type: 'image/jpeg',
                data: referenceImageBase64
            }
        })
    }

    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{ parts: contentParts }],
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ],
                generationConfig: {
                    temperature: 0.95,
                    topK: 50,
                    topP: 0.98,
                    maxOutputTokens: 8192
                    // Note: Images come back in parts array as inlineData or inline_data
                }
            })
        }
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Image generation failed (${type}): ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Debug logging to see exact response structure
    console.log(`[GEMINI_DEBUG] ${type} response keys:`, Object.keys(data))
    console.log(`[GEMINI_DEBUG] ${type} candidates:`, data.candidates?.length)
    if (data.candidates?.[0]?.content?.parts) {
        console.log(`[GEMINI_DEBUG] ${type} parts:`, data.candidates[0].content.parts.map((p: any) => Object.keys(p)))
    }

    // Try to find image data in multiple possible formats
    const parts = data.candidates?.[0]?.content?.parts || []
    let imageData = parts.find((part: any) => part.inline_data || part.inlineData)

    if (!imageData) {
        console.error(`[GEMINI_ERROR] ${type} - No image part found. Full response:`, JSON.stringify(data).substring(0, 500))
        throw new Error(`No image generated for ${type}`)
    }

    // Extract base64 - try multiple possible property paths
    const inlineObj = imageData.inline_data || imageData.inlineData
    const base64 = inlineObj?.data || inlineObj?.bytes || inlineObj?.imageData

    if (!base64) {
        console.error(`[GEMINI_ERROR] ${type} - Image part found but no data. Keys:`, Object.keys(inlineObj || {}))
        throw new Error(`No image data found for ${type}`)
    }

    console.log(`[GEMINI_SUCCESS] ${type} - Image data length:`, base64.length)
    return base64 // Return base64 string
}

// ============================================================================
// STEP 3: STORAGE UPLOAD FUNCTION
// ============================================================================

async function uploadImage(
    supabase: any,
    base64Data: string,
    filename: string
): Promise<string> {
    // Convert base64 to Uint8Array
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('generated-posts')
        .upload(filename, buffer, {
            contentType: 'image/jpeg',
            upsert: false
        })

    if (uploadError) {
        console.error(`Upload error for ${filename}:`, uploadError)
        throw new Error(`Failed to upload ${filename}: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('generated-posts')
        .getPublicUrl(filename)

    return publicUrl
}
