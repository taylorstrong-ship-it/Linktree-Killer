/**
 * PostGenerator - Image Generation Edge Function (REAL IMPLEMENTATION)
 * 
 * This implementation uses Deno Canvas to generate social media posts
 * with client brand colors and logo watermarking.
 * 
 * API Contract:
 * POST /functions/v1/generate-post
 * Headers: Authorization: Bearer {jwt}
 * Body: { brandKit, textContent, template }
 * Response: { success, imageUrl, timestamp }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createCanvas, loadImage } from 'https://deno.land/x/canvas@v1.4.1/mod.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Template dimensions (width x height)
const TEMPLATES = {
    'portrait': { width: 1080, height: 1350 },       // 4:5 Instagram Feed
    'square': { width: 1080, height: 1080 },         // 1:1 Instagram Feed
    'story': { width: 1080, height: 1920 },          // 9:16 Stories, Reels
    'tall-portrait': { width: 1080, height: 1440 },  // 3:4 Instagram Feed
    'social': { width: 1200, height: 630 },          // 16:9 Facebook, LinkedIn
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Parse request body
        const { brandKit, textContent, template } = await req.json()

        // Validate required fields
        if (!brandKit || !textContent || !template) {
            return new Response(
                JSON.stringify({
                    error: 'Missing required fields',
                    required: ['brandKit', 'textContent', 'template']
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Validate brand kit
        if (!brandKit.primary_color || !brandKit.secondary_color) {
            return new Response(
                JSON.stringify({ error: 'Brand kit must include primary_color and secondary_color' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Validate text content
        if (!textContent.headline) {
            return new Response(
                JSON.stringify({ error: 'Text content must include headline' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Validate template
        if (!TEMPLATES[template]) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid template',
                    validTemplates: Object.keys(TEMPLATES)
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('Generating post:', { template, headline: textContent.headline })

        // Get template dimensions
        const { width, height } = TEMPLATES[template]

        // Create canvas
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        // Fill background with client's primary color
        ctx.fillStyle = brandKit.primary_color
        ctx.fillRect(0, 0, width, height)

        // Calculate text area (leave 15% margin on sides, 10% top/bottom)
        const marginX = width * 0.15
        const marginY = height * 0.10
        const textAreaWidth = width - (marginX * 2)
        const textAreaY = marginY

        // Text styling (use client's secondary color for text)
        ctx.fillStyle = brandKit.secondary_color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        // Calculate font sizes based on canvas dimensions
        const headlineFontSize = Math.floor(width / 15)
        const bodyFontSize = Math.floor(width / 25)
        const ctaFontSize = Math.floor(width / 22)

        let currentY = textAreaY

        // Render headline
        if (textContent.headline) {
            ctx.font = `bold ${headlineFontSize}px Inter, sans-serif`
            const lines = wrapText(ctx, textContent.headline, textAreaWidth)
            lines.forEach((line) => {
                ctx.fillText(line, width / 2, currentY)
                currentY += headlineFontSize * 1.2
            })
            currentY += headlineFontSize * 0.5 // Extra spacing after headline
        }

        // Render body
        if (textContent.body) {
            ctx.font = `${bodyFontSize}px Inter, sans-serif`
            const lines = wrapText(ctx, textContent.body, textAreaWidth)
            lines.forEach((line) => {
                ctx.fillText(line, width / 2, currentY)
                currentY += bodyFontSize * 1.4
            })
            currentY += bodyFontSize * 0.8 // Extra spacing after body
        }

        // Render CTA (if provided)
        if (textContent.cta) {
            ctx.font = `bold ${ctaFontSize}px Inter, sans-serif`

            // Create CTA button background
            const ctaWidth = ctx.measureText(textContent.cta).width + 60
            const ctaHeight = ctaFontSize * 2
            const ctaX = (width - ctaWidth) / 2
            const ctaY = currentY + 20

            // Draw button (use inverse colors for contrast)
            ctx.fillStyle = brandKit.secondary_color
            ctx.fillRect(ctaX, ctaY, ctaWidth, ctaHeight)

            // Draw CTA text
            ctx.fillStyle = brandKit.primary_color
            ctx.fillText(textContent.cta, width / 2, ctaY + (ctaHeight - ctaFontSize) / 2)
        }

        // Render logo watermark (bottom-right corner, 15% of canvas width)
        if (brandKit.logo_url) {
            try {
                const logo = await loadImage(brandKit.logo_url)
                const logoMaxWidth = width * 0.15
                const logoMaxHeight = height * 0.15

                // Calculate logo dimensions maintaining aspect ratio
                let logoWidth = logo.width()
                let logoHeight = logo.height()
                const aspectRatio = logoWidth / logoHeight

                if (logoWidth > logoMaxWidth) {
                    logoWidth = logoMaxWidth
                    logoHeight = logoWidth / aspectRatio
                }
                if (logoHeight > logoMaxHeight) {
                    logoHeight = logoMaxHeight
                    logoWidth = logoHeight * aspectRatio
                }

                // Position at bottom-right with padding
                const logoPadding = width * 0.05
                const logoX = width - logoWidth - logoPadding
                const logoY = height - logoHeight - logoPadding

                ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
            } catch (logoError) {
                console.warn('Failed to load logo, skipping watermark:', logoError.message)
                // Continue without logo - not a fatal error
            }
        }

        // Convert canvas to PNG buffer
        const buffer = canvas.toBuffer('image/png')

        // Upload to Supabase Storage
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const filename = `post-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated-posts')
            .upload(filename, buffer, {
                contentType: 'image/png',
                cacheControl: '3600',
            })

        if (uploadError) {
            throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('generated-posts')
            .getPublicUrl(filename)

        console.log('Post generated successfully:', publicUrl)

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                imageUrl: publicUrl,
                timestamp: new Date().toISOString(),
                metadata: {
                    template,
                    dimensions: { width, height },
                    format: 'png'
                }
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error generating post:', error)

        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error',
                details: error.stack
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})

/**
 * Helper function to wrap text into multiple lines
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {string[]} Array of text lines
 */
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
        } else {
            currentLine = testLine
        }
    }

    if (currentLine) {
        lines.push(currentLine)
    }

    return lines
}
