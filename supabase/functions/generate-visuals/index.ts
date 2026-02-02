import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface GenerateVisualsRequest {
    userPrompt: string
    referenceImageBase64?: string
    vibe: 'industrial' | 'luxury' | 'street'
    brandDNA: {
        company_name: string
        primary_color: string
        secondary_color: string
        fonts?: Array<{ family: string; role: string }>
    }
}

const VIBE_MODIFIERS = {
    industrial: 'Metal textures, concrete, dramatic shadows, industrial lighting, rustic materials',
    luxury: 'Minimal composition, gold accents, studio lighting, premium feel, elegant simplicity',
    street: 'Graffiti aesthetic, neon signs, flash photography, urban energy, raw authenticity'
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        // Parse request
        const { userPrompt, referenceImageBase64, vibe, brandDNA }: GenerateVisualsRequest = await req.json()

        // Validate input
        if (!userPrompt || !vibe || !brandDNA) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: userPrompt, vibe, brandDNA' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get Google AI Studio API key
        const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY')
        if (!GOOGLE_AI_KEY) {
            throw new Error('GOOGLE_AI_STUDIO_KEY not configured')
        }

        const fontFamily = brandDNA.fonts?.[0]?.family || 'Modern Sans-Serif'
        const vibeModifier = VIBE_MODIFIERS[vibe] || VIBE_MODIFIERS.industrial

        const systemPrompt = `You are an expert Brand Designer for ${brandDNA.company_name}.

Brand Guidelines:
- Primary Color: ${brandDNA.primary_color}
- Secondary Color: ${brandDNA.secondary_color}
- Font Style: ${fontFamily}
- Aesthetic Vibe: ${vibe}

Task: Generate a photorealistic, AGENCY-QUALITY Instagram post (1080x1080px) that features:
- The promotional text: "${userPrompt}"
- Text must be PERFECTLY SPELLED and integrated naturally into the scene (neon sign, menu board, product label, overlay)
- Use the brand colors prominently and tastefully in the composition
- Lighting must be professional-grade (studio quality or dramatic outdoor lighting)
- Style: ${vibeModifier}
- The final image should look like it was shot by a professional photographer and designed by an expert graphic designer

${referenceImageBase64 ? 'A reference photo is provided. Use it as the foundation for composition, product placement, and scene authenticity. Match the product exactly.' : 'Create an original composition that is scroll-stopping and sale-driving.'}

CRITICAL: This must look REAL. No AI artifacts. Perfect text spelling. Professional color grading.`

        // Build request for Gemini 3 Pro Image API
        // Using gemini-3-pro-image-preview for MAXIMUM quality and reasoning capability
        const model = 'gemini-3-pro-image-preview'
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

        // Build content parts
        const contentParts: any[] = [
            { text: systemPrompt },
            { text: `Generate this promotional visual: ${userPrompt}` }
        ]

        // Add reference image if provided
        if (referenceImageBase64) {
            contentParts.push({
                inline_data: {
                    mime_type: 'image/jpeg',
                    data: referenceImageBase64
                }
            })
        }

        console.log('Calling Gemini 3 Pro Image API')
        console.log('Prompt:', userPrompt)
        console.log('Vibe:', vibe)
        console.log('Brand:', brandDNA.company_name)

        // Call Gemini API with MAXIMUM quality settings
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GOOGLE_AI_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: contentParts }],
                generationConfig: {
                    temperature: 0.95, // High creativity while maintaining coherence
                    topK: 50,
                    topP: 0.98,
                    candidateCount: 4, // Request 4 variations for client choice
                    response_mime_type: 'image/jpeg', // Native image generation
                    maxOutputTokens: 8192 // Maximum quality output
                }
            })
        })

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error('Gemini API error:', errorText)
            throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
        }

        const geminiData = await geminiResponse.json()
        console.log('Gemini 3 Pro response received')

        // Extract image data from candidates
        const candidates = geminiData.candidates
        if (!candidates || candidates.length === 0) {
            throw new Error('No image variations generated from Gemini API')
        }

        // Initialize Supabase client for Storage uploads
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Process each candidate and upload to Storage
        const imageUrls: string[] = []
        const timestamp = Date.now()

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i]
            const imageData = candidate.content?.parts?.[0]?.inline_data

            if (!imageData || !imageData.data) {
                console.warn(`Candidate ${i} has no image data, skipping`)
                continue
            }

            // Convert Base64 to Blob
            const base64Data = imageData.data
            const mimeType = imageData.mime_type || 'image/jpeg'
            const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

            // Generate unique filename
            const filename = `${brandDNA.company_name.replace(/\s+/g, '-').toLowerCase()}-${timestamp}-v${i + 1}.jpg`
            const filepath = `${filename}`

            // Upload to Supabase Storage (generated-posts bucket)
            const { error: uploadError } = await supabase.storage
                .from('generated-posts')
                .upload(filepath, buffer, {
                    contentType: mimeType,
                    upsert: false
                })

            if (uploadError) {
                console.error(`Upload error for variation ${i}:`, uploadError)
                continue
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('generated-posts')
                .getPublicUrl(filepath)

            imageUrls.push(publicUrl)
            console.log(`✓ Uploaded variation ${i + 1}: ${publicUrl}`)
        }

        if (imageUrls.length === 0) {
            throw new Error('Failed to upload any generated images to Storage')
        }

        // Return success response with image URLs
        const response = {
            success: true,
            imageUrls,
            count: imageUrls.length,
            userPrompt,
            vibe,
            brandName: brandDNA.company_name,
            message: `Generated ${imageUrls.length} agency-quality variations`
        }
        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )

    } catch (error) {
        console.error('Error in generate-visuals:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                details: 'Failed to generate visuals. Check Edge Function logs for details.'
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )
    }
})
