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

        // Build system prompt with brand DNA
        const fontFamily = brandDNA.fonts?.[0]?.family || 'Modern Sans-Serif'
        const vibeModifier = VIBE_MODIFIERS[vibe] || VIBE_MODIFIERS.industrial

        const systemPrompt = `You are an expert Brand Designer for ${brandDNA.company_name}.

Brand Guidelines:
- Primary Color: ${brandDNA.primary_color}
- Secondary Color: ${brandDNA.secondary_color}
- Font Style: ${fontFamily}
- Aesthetic Vibe: ${vibe}

Task: Generate a photorealistic Instagram post (1080x1080px) that features:
- The promotional text: "${userPrompt}"
- Text must be LEGIBLE and integrated naturally into the scene (like a neon sign, menu board, overlay, or product label)
- Use the brand colors prominently in the design
- Style: ${vibeModifier}
- High quality, professional photography aesthetic

${referenceImageBase64 ? 'A reference photo is provided. Use it as inspiration for composition, product placement, or scene setting.' : 'Create an original composition that matches the brand aesthetic.'}

Make it eye-catching and scroll-stopping for social media.`

        // Build request for Gemini 3 API
        const model = 'gemini-2.0-flash-exp' // Using Flash for cost efficiency (can upgrade to gemini-3-pro-image-preview if needed)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

        // Build content parts
        const contentParts: any[] = [
            { text: systemPrompt },
            { text: `Generate this promotional post: ${userPrompt}` }
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

        console.log('Calling Gemini API with model:', model)
        console.log('Prompt:', userPrompt)
        console.log('Vibe:', vibe)

        // Call Gemini API
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GOOGLE_AI_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: contentParts }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    candidateCount: 1 // Note: Gemini 2.0 Flash doesn't support multiple candidates yet
                }
            })
        })

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error('Gemini API error:', errorText)
            throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
        }

        const geminiData = await geminiResponse.json()
        console.log('Gemini response received')

        // Extract text response (Gemini 2.0 Flash returns text, not images directly)
        // For actual image generation, we'll need to use a different approach or model
        // For now, return a placeholder response structure
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!generatedText) {
            throw new Error('No content generated from Gemini API')
        }

        // TODO: Replace this with actual image generation once we have the correct Gemini Image model
        // For now, we'll return a structured response that the frontend can handle
        const response = {
            success: true,
            message: 'AI generation complete. Note: Image generation requires Gemini Image model upgrade.',
            generatedText,
            userPrompt,
            vibe,
            brandDNA,
            imageUrls: [] // Will be populated once image generation is implemented
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
