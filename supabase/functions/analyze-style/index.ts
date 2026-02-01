// PostGenerator 2.0: Style Analysis Edge Function
// Analyzes example social media posts using Gemini Vision API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { images } = await req.json()

        if (!images || !Array.isArray(images) || images.length < 3 || images.length > 5) {
            throw new Error('Please provide 3-5 images for analysis')
        }

        const geminiKey = Deno.env.get('GEMINI_API_KEY')

        if (!geminiKey) {
            throw new Error('Gemini API key not configured')
        }

        console.log(`Analyzing ${images.length} images with Gemini Vision`)

        // Analyze each image with Gemini
        const analyses = []

        for (let i = 0; i < images.length; i++) {
            const base64Image = images[i].replace(/^data:image\/\w+;base64,/, '')

            const prompt = `Analyze this social media post image and extract the following information in JSON format:
{
  "dominant_colors": ["#HEX1", "#HEX2", "#HEX3"], // Top 3 colors
  "text_placement": "center" | "top" | "bottom" | "left" | "right",
  "text_weight": "light" | "regular" | "bold",
  "text_alignment": "left" | "center" | "right",
  "layout_pattern": "text-over-image" | "split-screen" | "bordered" | "gradient-background",
  "visual_style": "minimalist" | "bold" | "playful" | "professional" | "modern",
  "has_logo": true | false,
  "logo_position": "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
}

Provide only the JSON object, no additional text.`

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: "image/jpeg",
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                    })
                }
            )

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`)
            }

            const data = await response.json()
            const analysisText = data.candidates[0].content.parts[0].text

            // Extract JSON from response (Gemini sometimes wraps in markdown)
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                analyses.push(JSON.parse(jsonMatch[0]))
            }
        }

        // Aggregate results
        const allColors = analyses.flatMap(a => a.dominant_colors || [])
        const colorCounts: Record<string, number> = {}

        allColors.forEach(color => {
            colorCounts[color] = (colorCounts[color] || 0) + 1
        })

        const dominant_colors = Object.entries(colorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([color]) => color)

        // Find most common patterns
        const getMostCommon = (key: string) => {
            const values = analyses.map(a => a[key]).filter(Boolean)
            const counts: Record<string, number> = {}
            values.forEach(v => counts[v] = (counts[v] || 0) + 1)
            return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || null
        }

        const text_placement = getMostCommon('text_placement')
        const layout_pattern = getMostCommon('layout_pattern')
        const visual_style = getMostCommon('visual_style')

        // Determine brand voice based on visual style
        const brandVoiceMap: Record<string, string> = {
            'minimalist': 'clean and refined',
            'bold': 'confident and impactful',
            'playful': 'fun and energetic',
            'professional': 'authoritative and trustworthy',
            'modern': 'innovative and forward-thinking'
        }

        const styleProfile = {
            dominant_colors,
            text_style: {
                placement: text_placement,
                weight: getMostCommon('text_weight'),
                alignment: getMostCommon('text_alignment')
            },
            layout_pattern,
            visual_style,
            brand_voice: brandVoiceMap[visual_style] || 'authentic and engaging',
            logo_usage: {
                present: analyses.some(a => a.has_logo),
                position: getMostCommon('logo_position')
            }
        }

        return new Response(
            JSON.stringify({ success: true, styleProfile }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Style analysis error:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to analyze style'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
