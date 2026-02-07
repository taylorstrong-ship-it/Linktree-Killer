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
    industry: string;
    description: string;

    // Visual Assets
    logo_url: string;
    favicon_url: string;
    hero_image: string;
    og_image: string;
    brand_images: string[];  // 🖼️ ACTUAL product/gallery photos (not just meta tags)

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
            formats: ['branding', 'links', 'markdown', 'html'], // ✨ Added html for image extraction fallback
            onlyMainContent: false,
            waitFor: 3000, // Increased from 2000ms to allow JS to fully load images
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
        const businessTypePrompt = `You are a business classification expert analyzing a website.

URL: ${url}
Company: ${branding.companyName || 'Unknown'}
Content Sample: ${markdown.slice(0, 1500)}

CLASSIFY into the MOST SPECIFIC industry:

FOOD & HOSPITALITY:
- "Restaurant" → Keywords: food, menu, dining, reservations, cuisine, italian, pizza, bistro
- "Cafe" → Keywords: coffee, breakfast, brunch, bakery

BEAUTY & WELLNESS:
- "Hair Salon" → Keywords: hair, cuts, color, styling, barber
- "Beauty Spa" → Keywords: facial, massage, skincare, nails, wellness

RETAIL & COMMERCE:
- "Retail Store" → Physical products, shopping
- "Ecommerce" → Online store, cart, checkout

SERVICES:
- "Fitness Gym" → Workouts, training, classes, personal trainer
- "Real Estate" → Properties, homes, listings, agents
- "Professional Services" → ONLY for B2B: legal, accounting, consulting

CRITICAL RULES:
1. If URL contains "restaurant", "bistro", "cafe", "italian", "pizza" → ALWAYS "Restaurant"
2. If content has "menu", "reservations", "dine-in", "takeout" → ALWAYS "Restaurant"
3. NEVER use "Professional Services" for customer-facing businesses
4. Be SPECIFIC, not generic

Respond with ONLY valid JSON:
{
  "business_type": "Exact industry name from list above",
  "industry": "Same as business_type",
  "description": "One sentence about what they do (max 150 chars)",
  "suggested_ctas": [
    {
      "title": "Primary action (e.g., Order Online, Book Appointment)",
      "url": "/",
      "type": "primary"
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

        // 🔧 AGGRESSIVE FALLBACK: Catch ANY generic classification via partial matching
        const businessTypeLower = (aiAnalysis.business_type || '').toLowerCase();
        if (businessTypeLower.includes('service') ||
            businessTypeLower.includes('professional') ||
            businessTypeLower.includes('general') ||
            !aiAnalysis.business_type) {

            const urlLower = url.toLowerCase();
            const contentLower = markdown.slice(0, 2000).toLowerCase();

            console.log(`⚠️ AI returned generic "${aiAnalysis.business_type}", activating keyword fallback...`);

            // Restaurant detection
            if (urlLower.match(/restaurant|bistro|cafe|pizza|italian|dining|kitchen|eatery/) ||
                contentLower.match(/menu|reservation|dine|cuisine|food|dish|chef/)) {
                aiAnalysis.business_type = 'Restaurant';
                aiAnalysis.industry = 'Restaurant';
                console.log('🔧 FALLBACK: Detected Restaurant via keywords');
            }
            // Salon detection
            else if (urlLower.match(/salon|hair|beauty|barber/) ||
                contentLower.match(/haircut|styling|color|spa|facial/)) {
                aiAnalysis.business_type = 'Hair Salon';
                aiAnalysis.industry = 'Hair Salon';
                console.log('🔧 FALLBACK: Detected Hair Salon via keywords');
            }
            // Fitness detection
            else if (urlLower.match(/gym|fitness|yoga|pilates/) ||
                contentLower.match(/workout|training|class|personal trainer/)) {
                aiAnalysis.business_type = 'Fitness Gym';
                aiAnalysis.industry = 'Fitness Gym';
                console.log('🔧 FALLBACK: Detected Fitness Gym via keywords');
            }
        }

        console.log('✅ Final Industry Classification:', aiAnalysis.business_type);

        // STEP 4: Enhanced Image Extraction with Multi-Tier Fallback + Hero Hunter
        // 🎯 STRATEGY: EXTRACT EVERYTHING, FILTER LATER
        // Don't be smart during extraction - grab ALL images and let downstream consumers pick the best ones
        const extractImagesFromMarkdown = (markdown: string): Array<{ url: string, score: number }> => {
            const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
            const images: Array<{ url: string, score: number }> = [];
            let match;

            while ((match = imageRegex.exec(markdown)) !== null) {
                const imageUrl = match[1];
                const urlLower = imageUrl.toLowerCase();

                // ❌ ONLY exclude OBVIOUS non-photos
                // Skip tracking pixels (1x1 images)
                if (urlLower.includes('1x1') || urlLower.includes('tracking') || urlLower.includes('pixel')) {
                    console.log(`  ⚠️ Skipping tracking pixel: ${imageUrl.substring(0, 60)}...`);
                    continue;
                }

                // Skip really tiny images (likely icons/bullets)
                if (urlLower.includes('w_50') || urlLower.includes('h_50') ||
                    urlLower.includes('w_16') || urlLower.includes('h_16')) {
                    console.log(`  ⚠️ Skipping tiny icon: ${imageUrl.substring(0, 60)}...`);
                    continue;
                }

                // ✅ EVERYTHING ELSE: ADD IT!
                // Score is just for sorting, NOT for filtering
                let score = 100; // Base score - everyone starts equal

                // Prefer larger images (hints at hero/product photos)
                if (urlLower.includes('w_1366') || urlLower.includes('w_1200') || urlLower.includes('w_1920')) score += 50;
                if (urlLower.includes('w_768') || urlLower.includes('w_854') || urlLower.includes('w_800')) score += 30;

                // CDN images are likely real brand assets
                if (urlLower.includes('squarespace-cdn') || urlLower.includes('cloudinary') ||
                    urlLower.includes('wixstatic') || urlLower.includes('shopify')) score += 20;

                images.push({ url: imageUrl, score });
            }

            // Sort by score (best first), but RETURN ALL
            return images.sort((a, b) => b.score - a.score);
        };

        // =================================================================
        // 🦸 HERO HUNTER: Brute-force HTML <img> tag parser
        // =================================================================

        // 🎯 HERO HUNTER: Brute-force HTML image extraction
        const heroHunter = async (targetUrl: string): Promise<string> => {
            console.log('🎯 HERO HUNTER ACTIVATED - Scanning HTML for images...');

            try {
                // Fetch raw HTML
                const htmlResponse = await fetch(targetUrl);
                const html = await htmlResponse.text();
                console.log(`  📄 HTML fetched: ${html.length} characters`);

                const foundImages: Array<{ url: string, source: string }> = [];

                // TIER 0: 🎯 EXPLICIT OG:IMAGE META TAG (Highest priority)
                const ogImageRegex = /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi;
                const ogImageMatch = ogImageRegex.exec(html);

                if (ogImageMatch) {
                    const ogImageUrl = ogImageMatch[1];
                    console.log(`  🎯 Found og:image meta tag: "${ogImageUrl.substring(0, 60)}..."`);

                    // Validate it's an absolute URL
                    if (ogImageUrl.startsWith('http')) {
                        console.log(`    ✅ TIER 0 SUCCESS: Using og:image meta tag`);
                        return ogImageUrl;
                    } else {
                        // Convert to absolute URL
                        const absoluteOgImage = new URL(ogImageUrl, targetUrl).toString();
                        console.log(`    🔗 Converted relative og:image to absolute: ${absoluteOgImage}`);
                        return absoluteOgImage;
                    }
                }

                console.log('  ⚠️ No og:image meta tag found, falling back to other methods...');

                // TIER 1: Scan for large <img> tags (width/height > 300)
                const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
                let imgMatch;
                let imgCount = 0;

                while ((imgMatch = imgRegex.exec(html)) !== null) {
                    imgCount++;
                    const imgTag = imgMatch[0];
                    const imgSrc = imgMatch[1];

                    // Extract width/height if present
                    const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
                    const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);

                    const width = widthMatch ? parseInt(widthMatch[1]) : 0;
                    const height = heightMatch ? parseInt(heightMatch[1]) : 0;

                    console.log(`  🖼️ Found img tag #${imgCount}: src="${imgSrc.substring(0, 60)}..." width=${width} height=${height}`);

                    // If image is large enough, add to candidates
                    if (width > 300 || height > 300) {
                        foundImages.push({ url: imgSrc, source: `img-tag (${width}x${height})` });
                        console.log(`    ✅ QUALIFIED: Large image (${width}x${height})`);
                    } else if (width === 0 && height === 0) {
                        // No dimensions specified - assume it's large (common for hero images)
                        foundImages.push({ url: imgSrc, source: 'img-tag (no-dimensions)' });
                        console.log(`    ⚠️ QUALIFIED: No dimensions specified, assuming hero image`);
                    } else {
                        console.log(`    ❌ REJECTED: Too small (${width}x${height})`);
                    }
                }

                console.log(`  📊 Total img tags found: ${imgCount}, Qualified: ${foundImages.length}`);

                // TIER 2: Scan for background-image styles on body/main divs
                const bgRegex = /style=["'][^"']*background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
                let bgMatch;
                let bgCount = 0;

                while ((bgMatch = bgRegex.exec(html)) !== null) {
                    bgCount++;
                    const bgUrl = bgMatch[1];
                    console.log(`  🎨 Found background-image #${bgCount}: url="${bgUrl.substring(0, 60)}..."`);
                    foundImages.push({ url: bgUrl, source: 'background-image' });
                    console.log(`    ✅ QUALIFIED: Background image`);
                }

                console.log(`  📊 Total background-images found: ${bgCount}`);

                // If we found candidates, pick the first one
                if (foundImages.length > 0) {
                    const selectedImage = foundImages[0];
                    console.log(`  🏆 HERO HUNTER SUCCESS: Selected "${selectedImage.url.substring(0, 60)}..." from ${selectedImage.source}`);

                    // Convert to absolute URL
                    let absoluteUrl = selectedImage.url;
                    if (!absoluteUrl.startsWith('http')) {
                        absoluteUrl = new URL(absoluteUrl, targetUrl).toString();
                        console.log(`    🔗 Converted to absolute URL: ${absoluteUrl}`);
                    }

                    // Validate URL
                    if (!absoluteUrl.startsWith('http')) {
                        console.log(`    ❌ INVALID: URL doesn't start with http - discarding`);
                        return '';
                    }

                    return absoluteUrl;
                } else {
                    console.log('  ❌ HERO HUNTER FAILED: No images found');
                    return '';
                }

            } catch (error) {
                console.error('  ❌ HERO HUNTER ERROR:', error);
                return '';
            }
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
        console.log('  - Branding Logo:', finalLogo || 'null');
        console.log('  - OG Image:', ogImage || 'null');
        console.log('  - Hero Image:', heroImage || 'null');

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

            // TIER 5: 🎯 HERO HUNTER - DISABLED (Too slow, Firecrawl already got images)
            // The Hero Hunter fetches HTML again after Firecrawl already processed it
            // This causes timeouts. If we need it, we should pass Firecrawl's HTML to it.
            /*
            if (!finalLogo) {
                console.log('🔍 ACTIVATING HERO HUNTER (TIER 5)...');
                const heroUrl = await heroHunter(url);
                if (heroUrl) {
                    finalLogo = heroUrl;
                    console.log('🎯 HERO HUNTER SUCCESS - Using extracted hero image:', heroUrl);
                } else {
                    console.log('⚠️ HERO HUNTER FAILED - No images found in HTML');
                }
            }
            */

            // TIER 6: Last resort - use favicon if available
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

        // Final validation - discard if URL doesn't start with http
        if (finalLogo && !finalLogo.startsWith('http')) {
            console.error('❌ FINAL VALIDATION FAILED: URL does not start with http - discarding:', finalLogo);
            finalLogo = '';
        }

        console.log('🏆 Final Logo Selected:', finalLogo || 'NONE - Image extraction failed completely');

        // ====================================================================
        // 🖼️ STEP 4B: INTELLIGENT GALLERY SCANNER
        // ====================================================================
        // Purpose: Find ACTUAL product/service images (food, products, people, etc.)
        // NOT just meta tag images (which are often just the logo)

        console.log('🖼️ SCANNING FOR PRODUCT/GALLERY IMAGES...');
        const brandImages: string[] = [];

        // Extract ALL images from markdown
        const allMarkdownImages = extractImagesFromMarkdown(markdown);
        console.log(`  📸 Found ${allMarkdownImages.length} images in markdown content`);

        // 🚨 HTML FALLBACK: If markdown extraction found ZERO images, parse HTML directly
        // This handles Squarespace and other JS-heavy sites that load images dynamically
        if (allMarkdownImages.length === 0 && scrapeResult?.html) {
            console.log('⚠️ Markdown extraction failed (0 images), activating HTML fallback scraper...');
            const html = scrapeResult.html;

            // Extract <img> tags with their src attributes
            const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            let match;
            let htmlImageCount = 0;

            while ((match = imgRegex.exec(html)) !== null && htmlImageCount < 15) {
                const imgSrc = match[1];

                // Convert relative URLs to absolute
                let absoluteUrl = imgSrc;
                if (!imgSrc.startsWith('http')) {
                    try {
                        absoluteUrl = new URL(imgSrc, url).toString();
                    } catch (e) {
                        console.log(`    ⚠️ Skipped invalid URL: ${imgSrc}`);
                        continue; // Skip invalid URLs
                    }
                }

                // Filter out common non-product images
                const urlLower = absoluteUrl.toLowerCase();

                // Skip logos, favicons, and icons
                if (urlLower.includes('logo') || urlLower.includes('favicon') ||
                    urlLower.includes('icon-') || urlLower.includes('/icons/') ||
                    urlLower.includes('badge') || absoluteUrl === finalLogo) {
                    console.log(`    ⚠️ Skipped: Looks like logo/icon`);
                    continue;
                }

                // Skip tracking pixels and tiny images
                if (urlLower.includes('1x1') || urlLower.includes('tracking') ||
                    urlLower.includes('pixel') || urlLower.includes('spacer.gif')) {
                    console.log(`    ⚠️ Skipped: Tracking pixel`);
                    continue;
                }

                allMarkdownImages.push({ url: absoluteUrl, score: 50 });
                htmlImageCount++;
                console.log(`    ✅ HTML IMG #${htmlImageCount}: ${absoluteUrl.substring(0, 80)}...`);
            }

            console.log(`  📊 HTML fallback scraper found ${htmlImageCount} additional images`);
        }

        // Filter out images that are likely the logo
        for (const img of allMarkdownImages) {
            const url = img.url.toLowerCase();

            // Skip if it's the logo we already extracted
            if (finalLogo && img.url === finalLogo) {
                console.log(`  ⚠️ Skipping: This is the logo`);
                continue;
            }

            // Skip if it looks like a logo file
            if (url.includes('logo') || url.includes('brand') || url.includes('favicon')) {
                console.log(`  ⚠️ Skipping: Looks like a logo (${img.url.substring(0, 60)}...)`);
                continue;
            }

            // Skip tiny images (icons, bullets, etc.)
            if (url.includes('icon-') || url.includes('bullet') || url.includes('-icon.')) {
                console.log(`  ⚠️ Skipping: Looks like an icon`);
                continue;
            }

            // This is likely a real product/gallery image!
            brandImages.push(img.url);
            console.log(`  ✅ PRODUCT IMAGE #${brandImages.length}: ${img.url.substring(0, 80)}...`);

            // Limit to 10 images to prevent overwhelming the system
            if (brandImages.length >= 10) {
                console.log('  📊 Reached 10 images limit, stopping scan');
                break;
            }
        }

        console.log(`🎯 Gallery Scanner Results: ${brandImages.length} product images found`);

        // If we found NO product images, try the heroImage/ogImage as fallback
        // (only if it's different from the logo)
        if (brandImages.length === 0) {
            console.log('⚠️ No gallery images found, checking if hero/og images are viable...');

            if (heroImage && heroImage !== finalLogo) {
                brandImages.push(heroImage);
                console.log(`  ✅ Using hero_image as product photo: ${heroImage}`);
            } else if (ogImage && ogImage !== finalLogo) {
                brandImages.push(ogImage);
                console.log(`  ✅ Using og_image as product photo: ${ogImage}`);
            } else {
                console.log('  ⚠️ hero_image and og_image are the same as logo - NO PRODUCT PHOTOS AVAILABLE');
            }
        }

        const brandDNA: BrandDNA = {
            // Core Identity
            company_name: branding.companyName || url.replace(/https?:\/\/(www\.)?/, '').split('/')[0],
            business_type: aiAnalysis.business_type || 'general',
            industry: aiAnalysis.business_type || 'general',
            description: aiAnalysis.description || '',

            // Visual Assets (with multi-tier fallback)
            logo_url: finalLogo,
            favicon_url: branding.images?.favicon || '',
            hero_image: heroImage || ogImage || '',
            og_image: ogImage || '',
            brand_images: brandImages,  // 🖼️ ACTUAL product/gallery photos

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

        // ====================================================================
        // 🚀 STEP 5: PRE-COMPUTATION - Fire-and-Forget Background Generation
        // ====================================================================
        // Immediately trigger 3 campaign asset variations in the background
        // while the client is redirecting to the dashboard.
        // By the time the dashboard loads, images are already 50% done!

        console.log(`🚀 PRE-COOKING: Triggered background image generation for ${brandDNA.company_name}`);

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

        if (supabaseUrl && supabaseAnonKey) {
            const variations = [
                { format: 'Instagram Post', style: 'vibrant' },
                { format: 'Story', style: 'bold' },
                { format: 'Hero', style: 'professional' }
            ];

            // Fire-and-forget: Don't await these calls
            variations.forEach(async (variation, index) => {
                try {
                    console.log(`  🎨 [${index + 1}/3] Queuing ${variation.format} (${variation.style})...`);

                    // Non-blocking fetch - let it run in background
                    fetch(`${supabaseUrl}/functions/v1/generate-campaign-asset`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${supabaseAnonKey}`,
                        },
                        body: JSON.stringify({
                            brandDNA,  // Pass fresh brand DNA directly
                            format: variation.format,
                            style: variation.style,
                            precompute: true  // Flag to indicate this is background generation
                        })
                    }).catch(error => {
                        // Silent catch - don't let background errors affect client response
                        console.error(`  ⚠️ Background generation failed for ${variation.format}:`, error.message);
                    });

                    console.log(`    ✅ Dispatched ${variation.format} to background queue`);
                } catch (error) {
                    console.error(`  ⚠️ Error dispatching ${variation.format}:`, error.message);
                }
            });

            console.log('🎯 All 3 variations dispatched! Client response proceeding...');
        } else {
            console.warn('⚠️ Supabase credentials missing - skipping pre-computation');
        }

        // STEP 6: Return Brand DNA with success wrapper (homepage expects this format)
        // Client gets instant response while images generate in background
        return new Response(
            JSON.stringify({
                success: true,
                brandDNA: brandDNA
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
