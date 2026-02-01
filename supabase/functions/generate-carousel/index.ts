// PostGenerator 2.0: Carousel Generation Edge Function
// Generates multiple slides for Instagram carousels

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TEMPLATES = {
    'tall-portrait': { width: 1080, height: 1440, ratio: '3:4' },
    'portrait': { width: 1080, height: 1350, ratio: '4:5' },
    'square': { width: 1080, height: 1080, ratio: '1:1' },
    'story': { width: 1080, height: 1920, ratio: '9:16' },
    'social': { width: 1200, height: 630, ratio: '16:9' }
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { brandKit, template, slides, styleProfile } = await req.json()

        if (!brandKit || !template || !slides || !Array.isArray(slides)) {
            throw new Error('Missing required fields: brandKit, template, slides')
        }

        if (slides.length < 2 || slides.length > 7) {
            throw new Error('Carousel must have 2-7 slides')
        }

        const templateConfig = TEMPLATES[template]
        if (!templateConfig) {
            throw new Error(`Invalid template: ${template}`)
        }

        console.log(`Generating ${slides.length}-slide carousel with template: ${template}`)

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Get user ID from JWT
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            throw new Error('Unauthorized')
        }

        const imageUrls = []

        // Generate each slide
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i]
            const slideNumber = i + 1

            console.log(`Generating slide ${slideNumber}/${slides.length}`)

            // Get primary/secondary colors (with fallback black if needed to avoid hex encode error)
            const primaryColor = brandKit.primary_color?.replace('#', '') || '000000'
            const secondaryColor = brandKit.secondary_color?.replace('#', '') || 'ffffff'

            // For now, use placeholder images
            // TODO: Replace with actual image generation using nano banana pro or canvas
            const mockImageUrl = `https://placehold.co/${templateConfig.width}x${templateConfig.height}/${primaryColor}/${secondaryColor}/png?text=${encodeURIComponent(slide.headline)}&font=montserrat`

            imageUrls.push(mockImageUrl)

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        return new Response(
            JSON.stringify({
                success: true,
                imageUrls,
                slideCount: slides.length,
                template
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Carousel generation error:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to generate carousel'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
