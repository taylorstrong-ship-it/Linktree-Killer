// PostGenerator 2.0: Brand DNA Extraction Edge Function
// Extracts logo, colors, fonts from website using Brandfetch API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
        const { url } = await req.json()

        if (!url) {
            throw new Error('URL is required')
        }

        // Normalize URL (remove protocol if present)
        const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')

        console.log(`Extracting brand DNA for: ${domain}`)

        // Try Brandfetch API first
        const brandfetchKey = Deno.env.get('BRANDFETCH_API_KEY')

        if (brandfetchKey) {
            try {
                const brandfetchResponse = await fetch(
                    `https://api.brandfetch.io/v2/brands/${domain}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${brandfetchKey}`
                        }
                    }
                )

                if (brandfetchResponse.ok) {
                    const brandfetchData = await brandfetchResponse.json()

                    // Extract data from Brandfetch response
                    const brandDNA = {
                        company_name: brandfetchData.name || domain,
                        logo_url: brandfetchData.logos?.[0]?.formats?.[0]?.src || null,
                        primary_color: brandfetchData.colors?.[0]?.hex || '#3B82F6',
                        secondary_color: brandfetchData.colors?.[1]?.hex || '#10B981',
                        fonts: brandfetchData.fonts?.map((f: any) => f.name) || [],
                        source: 'brandfetch'
                    }

                    return new Response(
                        JSON.stringify({ success: true, brandDNA }),
                        {
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                            status: 200
                        }
                    )
                }
            } catch (brandfetchError) {
                console.error('Brandfetch API error:', brandfetchError)
                // Fall through to custom scraper
            }
        }

        // Fallback: Custom scraper
        console.log('Using fallback scraper')

        const pageResponse = await fetch(`https://${domain}`)
        const html = await pageResponse.text()

        // Extract logo (common patterns)
        const logoPatterns = [
            /<meta property="og:image" content="([^"]+)"/,
            /<link rel="icon" href="([^"]+)"/,
            /<img[^>]*class="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i,
        ]

        let logo_url = null
        for (const pattern of logoPatterns) {
            const match = html.match(pattern)
            if (match) {
                logo_url = match[1]
                if (!logo_url.startsWith('http')) {
                    logo_url = `https://${domain}${logo_url}`
                }
                break
            }
        }

        // Extract primary color from theme-color meta tag
        const colorMatch = html.match(/<meta name="theme-color" content="([^"]+)"/)
        const primary_color = colorMatch ? colorMatch[1] : '#3B82F6'

        const brandDNA = {
            company_name: domain,
            logo_url,
            primary_color,
            secondary_color: '#10B981', // Default secondary
            fonts: [],
            source: 'scraper'
        }

        return new Response(
            JSON.stringify({ success: true, brandDNA }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Brand DNA extraction error:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to extract brand DNA'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
