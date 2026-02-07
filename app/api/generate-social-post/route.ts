import { NextRequest, NextResponse } from 'next/server'

interface GenerateRequest {
    imageUrl: string
    prompt: string
    brandDNA: {
        company_name?: string
        colors?: {
            primary?: string
            secondary?: string
            accent?: string
        }
        business_type?: string
    }
    format?: 'instagram_post' | 'instagram_story' | 'facebook_post'
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json()
        const { imageUrl, prompt, brandDNA, format = 'instagram_post' } = body

        // Validate required fields
        if (!imageUrl || !prompt) {
            return NextResponse.json(
                { error: 'Image URL and prompt are required' },
                { status: 400 }
            )
        }

        console.log('🎨 Generating social posts:', { prompt, format, brand: brandDNA.company_name })

        // Call Gemini Vision API to generate 5 variations
        const variations = await generateWithGemini({
            imageUrl,
            prompt,
            brandDNA,
            format,
            count: 5
        })

        console.log(`✅ Generated ${variations.length} variations`)

        return NextResponse.json({ variations })

    } catch (error) {
        console.error('❌ Generation failed:', error)
        return NextResponse.json(
            { error: 'Failed to generate posts' },
            { status: 500 }
        )
    }
}

async function generateWithGemini(params: {
    imageUrl: string
    prompt: string
    brandDNA: any
    format: string
    count: number
}) {
    const { imageUrl, prompt, brandDNA, format, count } = params

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
        throw new Error('Missing GOOGLE_AI_API_KEY')
    }

    // Format specifications
    const formatSpecs = {
        instagram_post: { width: 1080, height: 1080, ratio: '1:1' },
        instagram_story: { width: 1080, height: 1920, ratio: '9:16' },
        facebook_post: { width: 1200, height: 630, ratio: '1.91:1' }
    }

    const spec = formatSpecs[format as keyof typeof formatSpecs]

    // Fetch image as base64
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Generate variations in parallel
    const generationPromises = Array.from({ length: count }, async (_, idx) => {
        const styleVariations = [
            'Modern and clean with bold text overlay',
            'Elegant with subtle brand accent',
            'Bold and energetic with dynamic composition',
            'Minimal with focus on the product',
            'Playful with creative text placement'
        ]

        const promptText = `Create a professional ${format.replace('_', ' ')} (${spec.ratio}) for social media.

BRAND CONTEXT:
- Business Name: ${brandDNA.company_name || 'Brand'}
- Business Type: ${brandDNA.business_type || 'Restaurant'}
- Primary Color: ${brandDNA.colors?.primary || '#FF6B35'}
- Accent Color: ${brandDNA.colors?.accent || '#00FF41'}

CONTENT:
"${prompt}"

STYLE REQUIREMENT:
${styleVariations[idx]}

DESIGN SPECIFICATIONS:
1. Use the provided product image as the main focal point
2. Apply brand colors (${brandDNA.colors?.primary}, ${brandDNA.colors?.accent}) in text overlays, backgrounds, or accents
3. Add compelling headline text based on the prompt
4. Include a subtle call-to-action
5. Ensure text is readable with proper contrast
6. Keep it professional and on-brand
7. ${spec.width}x${spec.height}px dimensions

OUTPUT:
Generate a complete social media post design that combines the product image with brand-aligned graphics and text.`

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [
                            { text: promptText },
                            {
                                inline_data: {
                                    mime_type: mimeType, data: base64Image
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            }
        )

        if (!response.ok) {
            console.error(`Variation ${idx + 1} failed:`, await response.text())
            throw new Error(`Gemini API failed for variation ${idx + 1}`)
        }

        const result = await response.json()
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Extract caption from response
        const caption = extractCaption(generatedText, prompt)

        // For MVP, return the original image with metadata
        // TODO: In Phase 2, actually generate composite images
        return {
            id: `v${idx + 1}-${Date.now()}`,
            imageUrl: imageUrl, // Using original for MVP
            layout: styleVariations[idx],
            caption,
            metadata: {
                prompt,
                style: styleVariations[idx],
                format,
                brandColors: brandDNA.colors
            }
        }
    })

    return await Promise.all(generationPromises)
}

function extractCaption(geminiResponse: string, originalPrompt: string): string {
    // Parse Gemini's response to extract a clean caption
    // Look for caption-like content in the response

    // Simple heuristic: take first few lines that look like social copy
    const lines = geminiResponse.split('\n').filter(l => l.trim())

    // Find lines that could be a caption (not too long, not code/technical)
    const captionCandidates = lines.filter(line =>
        line.length > 10 &&
        line.length < 200 &&
        !line.includes('```') &&
        !line.toLowerCase().startsWith('design') &&
        !line.toLowerCase().startsWith('specification')
    )

    if (captionCandidates.length > 0) {
        return captionCandidates.slice(0, 3).join('\n\n')
    }

    // Fallback: generate simple caption from prompt
    return `${originalPrompt}\n\n✨ Limited time offer\n\n#${originalPrompt.split(' ')[0]}`
}
