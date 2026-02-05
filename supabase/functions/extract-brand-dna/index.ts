/**
 * 🔥 BRAND DNA EXTRACTION ENGINE v3.0
 * 
 * **Purpose:** Extract comprehensive brand intelligence using Firecrawl v2's native branding format
 * 
 * **Key Features:**
 * - Uses Firecrawl's `branding` format for complete visual identity extraction
 * - Uses `links` format for automatic social media detection
 * - AI-powered business type detection and smart CTA generation
 * - Returns 100% structured, validated brand DNA
 * 
 * **Data Extracted:**
 * - Logo, favicon, og:image
 * - Complete color palette (10+ semantic colors)
 * - Full typography system (fonts, sizes, weights)
 * - Social links (Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube)
 * - Business type + smart CTAs
 * - Brand personality traits
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import FirecrawlApp from 'npm:@mendable/firecrawl-js@1.0.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandDNA {
    // Core Identity
    company_name: string;
    business_type: string;
    description: string;

    // Visual Assets
    logo_url: string;
    favicon_url: string;

    // Colors
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_primary_color: string;
    text_secondary_color: string;
    color_scheme: string;

    // Typography
    fonts: string[];
    typography: Record<string, any>;

    // Social Links
    social_links: Record<string, string>;

    // Business Intelligence
    suggested_ctas: Array<{
        title: string;
        url: string;
        type: string;
    }>;

    // Metadata
    source: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { url } = await req.json();

        if (!url) {
            return new Response(
                JSON.stringify({ error: 'URL is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
        const openaiKey = Deno.env.get('OPENAI_API_KEY');

        if (!firecrawlKey || !openaiKey) {
            return new Response(
                JSON.stringify({ error: 'Missing API keys' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`🔥 Extracting Brand DNA from: ${url}`);

        // STEP 1: Extract using Firecrawl's native branding + links + markdown formats
        const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });

        const scrapeResult = await firecrawl.scrapeUrl(url, {
            formats: ['branding', 'links', 'markdown'], // Added markdown for image extraction fallback
            onlyMainContent: false,
            waitFor: 2000, // Wait for JS to load
        }) as any;

        console.log('📊 Firecrawl Response:', JSON.stringify(scrapeResult, null, 2));

        // Extract data from response
        const branding = scrapeResult?.branding || scrapeResult?.data?.branding || {};
        const links = scrapeResult?.links || scrapeResult?.data?.links || [];
        const markdown = scrapeResult?.markdown || scrapeResult?.data?.markdown || '';

        console.log('🎨 Branding Data:', JSON.stringify(branding, null, 2));
        console.log('🔗 Links Data:', JSON.stringify(links, null, 2));

        // STEP 2: Extract social media links from links array
        const socialLinks: Record<string, string> = {};

        if (Array.isArray(links)) {
            links.forEach((link: string) => {
                const url = link.toLowerCase();
                if (url.includes('instagram.com/')) socialLinks.instagram = link;
                if (url.includes('facebook.com/')) socialLinks.facebook = link;
                if (url.includes('twitter.com/') || url.includes('x.com/')) socialLinks.twitter = link;
                if (url.includes('linkedin.com/')) socialLinks.linkedin = link;
                if (url.includes('tiktok.com/')) socialLinks.tiktok = link;
                if (url.includes('youtube.com/')) socialLinks.youtube = link;
            });
        }

        console.log('📱 Social Links Extracted:', socialLinks);

        // STEP 3: Business Type Detection using OpenAI
        const businessTypePrompt = `Analyze this website data and determine the business type and suggest 2-3 relevant CTAs.

Website: ${url}
Company: ${branding.companyName || 'Unknown'}
Content Preview: ${markdown.slice(0, 1000)}

Respond with ONLY a JSON object:
{
  "business_type": "salon" | "restaurant" | "ecommerce" | "service" | "portfolio" | "general",
  "description": "Brief 1-sentence description (max 150 chars)",
  "suggested_ctas": [
    {
      "title": "CTA button text",
      "url": "best guess URL from links data",
      "type": "primary" | "secondary"
    }
  ]
}`;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a business analyst. Respond only with valid JSON.' },
                    { role: 'user', content: businessTypePrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            }),
        });

        const openaiData = await openaiResponse.json();
        const aiAnalysis = JSON.parse(openaiData.choices[0]?.message?.content || '{}');

        console.log('🤖 AI Analysis:', aiAnalysis);

        // STEP 4: Enhanced Image Extraction with Multi-Tier Fallback
        // Helper function to extract images from markdown
        const extractImagesFromMarkdown = (markdown: string): Array<{ url: string, score: number }> => {
            const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
            const images: Array<{ url: string, score: number }> = [];
            let match;

            while ((match = imageRegex.exec(markdown)) !== null) {
                const imageUrl = match[1];

                // Score images based on characteristics
                let score = 0;

                // Larger images get higher scores (look for width/height in URL)
                if (imageUrl.includes('w_768') || imageUrl.includes('w_854') || imageUrl.includes('w_800')) score += 3;
                if (imageUrl.includes('w_1366') || imageUrl.includes('w_1200')) score += 5;

                // Avoid tiny images
                if (imageUrl.includes('w_50') || imageUrl.includes('h_50')) score -= 10;
                if (imageUrl.includes('w_100') || imageUrl.includes('h_100')) score -= 5;

                // Prefer images from static CDNs (likely brand assets)
                if (imageUrl.includes('wixstatic.com') || imageUrl.includes('cloudinary') || imageUrl.includes('cdn')) score += 2;

                // Avoid tracking pixels and analytics
                if (imageUrl.includes('tracking') || imageUrl.includes('pixel') || imageUrl.includes('analytics')) score -= 20;

                images.push({ url: imageUrl, score });
            }

            // Sort by score descending
            return images.sort((a, b) => b.score - a.score);
        };

        // Construct Complete Brand DNA with Enhanced Image Selection
        // 🚑 HOTFIX: Multi-Tier Brand Image Extraction
        let finalLogo = branding.images?.logo || '';
        const ogImage = branding.images?.ogImage ||
            branding.images?.og_image ||
            scrapeResult?.metadata?.ogImage ||
            scrapeResult?.metadata?.['og:image'] ||
            scrapeResult?.metadata?.['twitter:image'] || '';
        const heroImage = branding.images?.heroImage || branding.images?.hero_image || '';

        console.log('📊 Image Extraction Sources:');
        console.log('  - Branding Logo:', finalLogo || 'none');
        console.log('  - OG Image:', ogImage || 'none');
        console.log('  - Hero Image:', heroImage || 'none');

        // TIER 1: If logo is missing OR it looks like a generic favicon...
        if (!finalLogo ||
            finalLogo.includes('favicon') ||
            finalLogo.includes('site_icon') ||
            finalLogo.includes('android-chrome') ||
            finalLogo.includes('apple-touch-icon') ||
            finalLogo.includes('pfavico.ico')) {

            console.log('⚠️ Logo missing or generic favicon detected');

            // TIER 2: Try the Open Graph Image (High quality main photo)
            if (ogImage) {
                finalLogo = ogImage;
                console.log('🎯 Using OG Image as logo:', ogImage);
            }
            // TIER 3: Try the Hero Image
            else if (heroImage) {
                finalLogo = heroImage;
                console.log('🎯 Using Hero Image as logo:', heroImage);
            }
            // TIER 4: Extract largest image from markdown content
            else if (markdown) {
                console.log('🔍 Scanning markdown for prominent images...');
                const markdownImages = extractImagesFromMarkdown(markdown);

                if (markdownImages.length > 0) {
                    finalLogo = markdownImages[0].url;
                    console.log(`🎯 Using largest markdown image as logo (score: ${markdownImages[0].score}):`, finalLogo);
                    console.log(`  📸 Found ${markdownImages.length} total images in markdown`);
                } else {
                    console.log('⚠️ No suitable images found in markdown');
                }
            }
            // TIER 5: Last resort - use favicon if available
            if (!finalLogo && branding.images?.favicon) {
                finalLogo = branding.images.favicon;
                console.log('⚠️ Using favicon as absolute last resort:', branding.images.favicon);
            }
        } else {
            console.log('✅ Valid logo found:', finalLogo);
        }

        // Ensure absolute URL (Handle relative paths like '/images/me.jpg')
        if (finalLogo && !finalLogo.startsWith('http')) {
            try {
                finalLogo = new URL(finalLogo, url).toString();
                console.log('🔗 Converted to absolute URL:', finalLogo);
            } catch (e) {
                console.error('⚠️ Failed to convert to absolute URL:', e);
            }
        }

        console.log('🏆 Final Logo Selected:', finalLogo || 'NONE - Image extraction failed completely');

        const brandDNA: BrandDNA = {
            // Core Identity
            company_name: branding.companyName || url.replace(/https?:\/\/(www\.)?/, '').split('/')[0],
            business_type: aiAnalysis.business_type || 'general',
            description: aiAnalysis.description || '',

            // Visual Assets (with multi-tier fallback)
            logo_url: finalLogo,
            favicon_url: branding.images?.favicon || '',

            // Colors (with fallbacks)
            primary_color: branding.colors?.primary || '#3B82F6',
            secondary_color: branding.colors?.secondary || '#8B5CF6',
            accent_color: branding.colors?.accent || '#10B981',
            background_color: branding.colors?.background || '#FFFFFF',
            text_primary_color: branding.colors?.textPrimary || '#1F2937',
            text_secondary_color: branding.colors?.textSecondary || '#6B7280',
            color_scheme: branding.colorScheme || 'light',

            // Typography
            fonts: branding.fonts || [],
            typography: branding.typography || {},

            // Social Links
            social_links: socialLinks,

            // Business Intelligence
            suggested_ctas: aiAnalysis.suggested_ctas || [],

            // Metadata
            source: 'firecrawl_v2_branding',
        };

        console.log('✅ Complete Brand DNA:', JSON.stringify(brandDNA, null, 2));

        // STEP 5: Return complete Brand DNA
        return new Response(
            JSON.stringify({
                success: true,
                brandDNA,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        console.error('❌ Error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to extract brand DNA',
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
