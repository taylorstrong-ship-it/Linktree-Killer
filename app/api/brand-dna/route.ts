/**
 * 🤖 AI-Assisted Maintenance Guide 🤖
 * 
 * **File:** app/api/brand-dna/route.ts
 * **Purpose:** This API endpoint is the core of the brand scraping functionality.
 * 
 * **Key Logic:**
 * 1. **Receives URL:** It accepts a POST request with a URL in the JSON body.
 * 2. **Initial Scrape:** It uses Firecrawl to scrape the initial content of the provided URL.
 * 3. **Deep Scrape (CTA Detection):** It then performs a "deep scrape" to find Call-to-Action (CTA) buttons by looking for common patterns and keywords (e.g., "Book Now", "Shop", "Contact").
 * 4. **Logo Extraction:** It attempts to find a logo by checking for `og:image`, `apple-touch-icon`, and `favicon` meta tags.
 * 5. **Data Aggregation:** It combines all the extracted information (metadata, CTAs, logo, colors) into a single `dna` object.
 * 6. **Response:** It returns a JSON response with `success: true` and the `dna` object.
 * 
 * **Common Issues to Check:**
 * - **Firecrawl API Key:** Ensure the `FIRECRAWL_API_KEY` environment variable is set and valid.
 * - **Scraping Failures:** The target website might be blocking scrapers or have an unusual structure. Check the Firecrawl logs for errors.
 * - **CTA Detection Logic:** The regex and keyword matching in the `extractCTAButtons` function might need to be adjusted for different types of websites.
 * - **Logo Not Found:** The website may not have standard meta tags for its logo.
 */

import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';
import OpenAI from 'openai';
import { z } from 'zod';
import * as cheerio from 'cheerio';

// Hunter Schema v3 - Smart CTA Button Detection
const BrandDNASchema = z.object({
    businessName: z.string().min(1, 'Business name is required'),
    tagline: z.string().default(''),
    industry: z.enum(['Salon', 'Restaurant', 'Service', 'General', 'E-commerce']),
    vibe: z.enum(['Luxury', 'Industrial', 'Boho', 'Minimalist', 'Casual', 'High Energy']),
    colors: z.object({
        primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').or(z.literal('')).transform(v => v || '#000000'),
        secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').or(z.literal('')).transform(v => v || '#FFAD7A'),
    }),
    description: z.string().max(150, 'Description must be 150 chars or less'),
    services: z.array(z.string()).min(1, 'At least one service is required'),
    contact: z.object({
        phone: z.string().default(''),
        address: z.string().default(''),
        email: z.string().email().or(z.literal('')).default(''),
    }).default({ phone: '', address: '', email: '' }),
    links: z.object({
        booking_url: z.string().url('Booking URL must be valid'),
        instagram: z.string().url().or(z.literal('')).optional(),
        facebook: z.string().url().or(z.literal('')).optional(),
    }),
    // NEW: Auto-detected CTA buttons from the website
    cta_buttons: z.array(z.object({
        title: z.string().min(1, 'Button title required'),
        url: z.string().url('Button URL must be valid'),
        type: z.enum(['primary', 'secondary']).default('secondary'),
    })).default([]),
    voice_setup: z.object({
        tone: z.string().min(1, 'Voice tone is required'),
        welcome_message: z.string().min(1, 'Welcome message is required'),
    }),
});

type BrandDNA = z.infer<typeof BrandDNASchema>;

// Waterfall Strategy System Prompt - Stage 2 Smart CTA Detection
const BRAND_STRATEGIST_PROMPT = `You are a Brand DNA Architect and Smart CTA Hunter.
Analyze the website content (Markdown) AND its structure to extract the brand identity AND detect call-to-action buttons.

CRITICAL: You must use a "Waterfall" approach to find contact info and links.
1. **Search JSON-LD:** Look for a <script type="application/ld+json"> block. Trust data found here over visible text for phone, address, and social links (under "sameAs").
2. **Search Footer & Contact Sections:** Look for links in the footer or pages named "Contact".
3. **Infer from Text:** Only if the above fail, try to find phone numbers or handles in the plain text.

🎯 **NEW: SMART CTA BUTTON DETECTION**
Detect 2-4 primary call-to-action buttons based on industry:

**Salon/Spa:**
- Look for "Book Now", "Schedule Appointment", "Reserve", "Book Online"
- Common platforms: Squarespace Scheduling, Acuity, Vagaro, Square Appointments
- Primary button = Booking link

**Restaurant/Food:**
- Look for "Order Online", "View Menu", "Reserve Table", "Order Pickup"
- Common platforms: Toast, Square, DoorDash, UberEats, OpenTable
- Primary button = Order/Reserve link

**E-commerce:**
- Look for "Shop Now", "Browse Products", "View Collection", "Order Now"
- Common platforms: Shopify, WooCommerce, Square Online
- Primary button = Shop/Products link

**Service Business:**
- Look for "Get Quote", "Contact Us", "Request Service", "Learn More"
- Primary button = Contact/Quote form

IMPORTANT: If you cannot find a field, return an empty string "" (NOT null). Never return null values.

JSON SCHEMA:
{
  "businessName": "String",
  "tagline": "String (Catchy & Short)",
  "industry": "Salon" | "Restaurant" | "Service" | "General" | "E-commerce",
  "vibe": "Luxury" | "Industrial" | "Boho" | "Minimalist" | "Casual" | "High Energy",
  "colors": {
      "primary": "Hex Code (Best guess from logo/header)",
      "secondary": "Hex Code"
  },
  "description": "Short SEO-friendly summary (max 150 chars)",
  "avatar_url": "Use the pre-extracted 'logoUrl' from context if provided, otherwise empty string",
  "services": ["List top 3-5 distinct services"],
  "links": {
      "booking_url": "The explicit URL to book/order (e.g. square.site, vagaro.com).",
      "instagram": "Full URL to Instagram profile (empty string if not found)",
      "facebook": "Full URL to Facebook profile (empty string if not found)"
  },
  "cta_buttons": [
      {
          "title": "Button text (e.g. 'Book Now', 'Order Online')",
          "url": "Full URL to the action (booking page, menu, shop, etc.)",
          "type": "primary" (for main CTA) or "secondary" (for supporting CTAs)
      }
  ],
  "contact": {
      "phone": "String (e.g. +1-555-555-5555, empty string if not found)",
      "address": "String (Full Address, empty string if not found)",
      "email": "String (empty string if not found)"
  },
  "voice_setup": {
      "tone": "Friendly" | "Professional" | "Energetic",
      "welcome_message": "A perfect 1-sentence phone greeting."
      }
}`;

// Helper: Extract JSON-LD structured data
function extractJsonLd(html: string): any[] {
    const $ = cheerio.load(html);
    const jsonLdBlocks: any[] = [];

    $('script[type="application/ld+json"]').each((_, element) => {
        try {
            const content = $(element).html();
            if (content) {
                const parsed = JSON.parse(content);
                jsonLdBlocks.push(parsed);
            }
        } catch (e) {
            // Skip invalid JSON-LD
        }
    });

    return jsonLdBlocks;
}

// Helper: Extract Open Graph tags
function extractOpenGraphTags(html: string): Record<string, string> {
    const $ = cheerio.load(html);
    const ogTags: Record<string, string> = {};

    $('meta[property^="og:"]').each((_, element) => {
        const property = $(element).attr('property');
        const content = $(element).attr('content');
        if (property && content) {
            const key = property.replace('og:', '');
            ogTags[key] = content;
        }
    });

    return ogTags;
}

// Helper: Extract social and review links from footer
function extractFooterLinks(html: string): { socials: Record<string, string>; reviews: string[] } {
    const $ = cheerio.load(html);
    const socials: Record<string, string> = {};
    const reviews: string[] = [];

    // Look for links in footer, nav, and throughout the page
    $('a[href]').each((_, element) => {
        const href = $(element).attr('href') || '';
        const url = href.toLowerCase();

        // Social platforms
        if (url.includes('facebook.com/')) socials.facebook = href;
        if (url.includes('instagram.com/')) socials.instagram = href;
        if (url.includes('linkedin.com/')) socials.linkedin = href;
        if (url.includes('twitter.com/') || url.includes('x.com/')) socials.twitter = href;

        // Review platforms
        if (url.includes('yelp.com') || url.includes('google.com/maps') || url.includes('tripadvisor')) {
            reviews.push(href);
        }
    });

    return { socials, reviews };
}

// Helper: Resolve relative image URLs to absolute URLs
function resolveImageUrl(url: string, baseUrl: string): string {
    if (!url) return '';

    // Already absolute
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Handle protocol-relative URLs (//cdn.example.com/image.png)
    if (url.startsWith('//')) {
        return 'https:' + url;
    }

    // Resolve relative URL
    try {
        const base = new URL(baseUrl);
        const resolved = new URL(url, base.origin);
        return resolved.href;
    } catch {
        return '';
    }
}

// Helper: Extract logo/avatar using waterfall approach
function extractLogo(html: string, baseUrl: string): string {
    const $ = cheerio.load(html);

    // 1. Check og:image (most reliable for brand logo)
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
        console.log('📸 Logo found: og:image');
        return resolveImageUrl(ogImage, baseUrl);
    }

    // 2. Check apple-touch-icon (iOS bookmark icon - usually company logo)
    const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr('href') ||
        $('link[rel="apple-touch-icon-precomposed"]').attr('href');
    if (appleTouchIcon) {
        console.log('📸 Logo found: apple-touch-icon');
        return resolveImageUrl(appleTouchIcon, baseUrl);
    }

    // 3. Check favicon (last resort)
    const favicon = $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href');
    if (favicon) {
        console.log('📸 Logo found: favicon');
        return resolveImageUrl(favicon, baseUrl);
    }

    console.log('⚠️ No logo found');
    return '';
}

// Helper: Extract CTA buttons from HTML based on industry
function extractCTAButtons(html: string, industry: string): { title: string; url: string; type: string }[] {
    const $ = cheerio.load(html);
    const buttons: { title: string; url: string; type: string }[] = [];

    // Define industry-specific keywords
    const keywords: Record<string, string[]> = {
        'Salon': ['book now', 'schedule', 'appointment', 'reserve', 'book online', 'book appointment'],
        'Restaurant': ['order online', 'order now', 'view menu', 'reserve', 'delivery', 'pickup'],
        'E-commerce': ['shop now', 'browse', 'products', 'collection', 'store', 'buy now'],
        'Service': ['get quote', 'contact', 'request', 'learn more', 'get started'],
        'General': ['learn more', 'contact', 'get started'],
    };

    const industryKeywords = keywords[industry] || keywords['General'];

    // Search for buttons and links with CTA keywords
    $('a, button').each((_, element) => {
        const $el = $(element);
        const text = $el.text().trim().toLowerCase();
        const href = $el.attr('href') || '';

        // Skip empty or anchor-only links
        if (!href || href.startsWith('#') || href === '/' || href === '') return;

        // Check if text matches any industry keywords
        const matchedKeyword = industryKeywords.find(keyword => text.includes(keyword));

        if (matchedKeyword) {
            // Determine if this is a primary CTA (usually first match)
            const isPrimary = buttons.length === 0;

            // Make URL absolute if relative
            let absoluteUrl = href;
            if (href.startsWith('/')) {
                // Would need base URL - for now, skip relative URLs
                return;
            }

            buttons.push({
                title: $el.text().trim(),
                url: absoluteUrl,
                type: isPrimary ? 'primary' : 'secondary',
            });
        }
    });

    // Also check for common booking platform URLs
    const bookingPlatforms = [
        { pattern: /acuity-scheduling|squarespace\.com.*scheduling/, title: 'Book Appointment' },
        { pattern: /vagaro\.com/, title: 'Book Now' },
        { pattern: /square\.site.*appointments/, title: 'Schedule Appointment' },
        { pattern: /toast\.com|toasttab/, title: 'Order Online' },
        { pattern: /shopify\.com|myshopify\.com/, title: 'Shop Now' },
        { pattern: /opentable\.com/, title: 'Reserve Table' },
    ];

    $('a[href]').each((_, element) => {
        const href = $(element).attr('href') || '';
        const matchedPlatform = bookingPlatforms.find(p => p.pattern.test(href));

        if (matchedPlatform && !buttons.some(b => b.url === href)) {
            buttons.push({
                title: $(element).text().trim() || matchedPlatform.title,
                url: href,
                type: buttons.length === 0 ? 'primary' : 'secondary',
            });
        }
    });

    // Limit to 4 buttons max
    return buttons.slice(0, 4);
}

// Helper: Extract colors from image using GPT-4o Vision
async function extractColorsFromImage(imageUrl: string, openaiKey: string): Promise<{ primary: string; secondary: string } | null> {
    try {
        const openai = new OpenAI({ apiKey: openaiKey });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Extract the dominant primary and secondary hex colors from this logo/image. Return ONLY a JSON object with format: {"primary": "#XXXXXX", "secondary": "#XXXXXX"}. Return null if colors are unclear or image is not a logo.',
                        },
                        {
                            type: 'image_url',
                            image_url: { url: imageUrl },
                        },
                    ],
                },
            ],
            max_tokens: 100,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content);
        return parsed;
    } catch (error) {
        console.error('Vision API error:', error);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const body = await req.json();
        const { url } = body;

        // Validate URL format
        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { success: false, code: 'INVALID_URL', message: 'Valid URL is required' },
                { status: 400 }
            );
        }

        const urlRegex = /^https?:\/\/.+/i;
        if (!urlRegex.test(url)) {
            return NextResponse.json(
                { success: false, code: 'INVALID_URL_FORMAT', message: 'URL must start with http:// or https://' },
                { status: 400 }
            );
        }

        // Check API keys
        const firecrawlKey = process.env.FIRECRAWL_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!firecrawlKey || !openaiKey) {
            return NextResponse.json(
                {
                    success: false,
                    code: 'CONFIGURATION_ERROR',
                    message: 'Configuration Error: Missing API Keys'
                },
                { status: 500 }
            );
        }

        // PHASE 1: Multi-Layer Extraction
        const dataSources: string[] = [];

        // Step 1: Scrape with Firecrawl (get both Markdown AND HTML)
        const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });

        let scrapedText: string;
        let rawHtml: string;

        try {
            // 1. THE EYES: SCRAPE THE SITE (Updated for Shopify/JSON-LD)
            console.log(`🔥 DNA ENGINE: Scraping ${url}...`);

            const scrapeResult = await firecrawl.scrape(url, {
                formats: ['markdown', 'html'], // REQUEST HTML TO FIND JSON-LD
                onlyMainContent: false, // FALSE keeps the <head> tags we need
                waitFor: 1000 // Waits for Shopify JS to hydrate the DOM
            }) as any;

            scrapedText = scrapeResult?.markdown || scrapeResult?.data?.markdown || '';
            rawHtml = scrapeResult?.html || scrapeResult?.data?.html || '';

            if (!scrapedText || scrapedText.length < 100) {
                return NextResponse.json(
                    {
                        success: false,
                        code: 'INSUFFICIENT_CONTENT',
                        message: 'Unable to extract sufficient content from URL'
                    },
                    { status: 422 }
                );
            }
        } catch (error) {
            console.error('Firecrawl error:', error);
            return NextResponse.json(
                {
                    success: false,
                    code: 'SCRAPE_FAILED',
                    message: 'Failed to scrape URL. Please check the URL and try again.'
                },
                { status: 500 }
            );
        }

        // Step 2: Extract JSON-LD structured data
        const jsonLdData = extractJsonLd(rawHtml);
        if (jsonLdData.length > 0) {
            dataSources.push('json-ld');
        }

        // Step 3: Extract Open Graph metadata
        const ogTags = extractOpenGraphTags(rawHtml);
        if (Object.keys(ogTags).length > 0) {
            dataSources.push('opengraph');
        }

        // Step 4: Extract Footer Social Links + Review Links
        const { socials, reviews } = extractFooterLinks(rawHtml);
        if (Object.keys(socials).length > 0) {
            dataSources.push('footer-links');
        }

        // Step 5: Extract logo/avatar
        const logoUrl = extractLogo(rawHtml, url);
        console.log('🖼️ Logo extracted:', logoUrl || 'None found');
        if (logoUrl) {
            dataSources.push('logo-extraction');
        }

        // Step 6: Extract preliminary CTA buttons from HTML
        const preliminaryCTAs = extractCTAButtons(rawHtml, 'General');
        if (preliminaryCTAs.length > 0) {
            dataSources.push('cta-buttons');
            console.log(`🎯 Found ${preliminaryCTAs.length} preliminary CTA buttons`);
        }

        // Step 7 (Optional): Vision API for Color Extraction from Logo
        let visionColors: { primary: string; secondary: string } | null = null;
        if (logoUrl) {
            visionColors = await extractColorsFromImage(logoUrl, openaiKey);
            if (visionColors) {
                dataSources.push('vision');
            }
        }

        // PHASE 2: Synthesis - Feed all layers to GPT-4o
        const openai = new OpenAI({ apiKey: openaiKey });

        const contextData = {
            rawText: scrapedText.slice(0, 4000),
            jsonLd: jsonLdData,
            openGraph: ogTags,
            visionColors,
            extractedSocials: socials, // Instagram/Facebook for links object
            preliminaryCTAs, // Initial CTA button detection for AI refinement
            logoUrl, // Pre-extracted logo for avatar_url
        };

        let extractedData: BrandDNA;
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: BRAND_STRATEGIST_PROMPT },
                    {
                        role: 'user',
                        content: `Analyze this multi-layer data and extract brand DNA:\n\n${JSON.stringify(contextData, null, 2)}`
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
            });

            const rawJson = completion.choices[0]?.message?.content;
            if (!rawJson) {
                throw new Error('No response from OpenAI');
            }

            const parsedData = JSON.parse(rawJson);

            // PHASE 3: Zero-Hallucination Validation with Zod
            extractedData = BrandDNASchema.parse(parsedData);

            // PHASE 3.5: Stage 3 - Search Agent (Waterfall Backup)
            // If social links are missing or empty, trigger an active search
            console.log('🔍 Checking if Stage 3 needed:', {
                instagram: extractedData.links.instagram,
                instagramTrimmed: extractedData.links.instagram?.trim(),
                facebook: extractedData.links.facebook,
                facebookTrimmed: extractedData.links.facebook?.trim()
            });

            if (!extractedData.links.instagram?.trim() || !extractedData.links.facebook?.trim()) {
                console.log('🔍 Stage 3 activated: Searching for missing social links...');

                try {
                    const searchQuery = `${extractedData.businessName} ${extractedData.contact.address || ''} Instagram Facebook`.trim();

                    const searchResults = await firecrawl.search(searchQuery, {
                        limit: 5,
                        scrapeOptions: {
                            formats: ['markdown']
                        }
                    });

                    // Extract Instagram and Facebook URLs from search results
                    // Firecrawl search returns an array directly
                    if (Array.isArray(searchResults) && searchResults.length > 0) {
                        for (const result of searchResults) {
                            const text = result.markdown || '';

                            // Look for Instagram URL (check for empty string too)
                            if (!extractedData.links.instagram?.trim()) {
                                const instagramMatch = text.match(/https?:\/\/(www\.)?instagram\.com\/[\w.]+/i);
                                if (instagramMatch) {
                                    extractedData.links.instagram = instagramMatch[0];
                                    dataSources.push('search-agent-instagram');
                                    console.log('🎯 Found Instagram:', instagramMatch[0]);
                                }
                            }

                            // Look for Facebook URL (check for empty string too)
                            if (!extractedData.links.facebook?.trim()) {
                                const facebookMatch = text.match(/https?:\/\/(www\.)?facebook\.com\/[\w.]+/i);
                                if (facebookMatch) {
                                    extractedData.links.facebook = facebookMatch[0];
                                    dataSources.push('search-agent-facebook');
                                    console.log('🎯 Found Facebook:', facebookMatch[0]);
                                }
                            }

                            // Break if both found
                            if (extractedData.links.instagram?.trim() && extractedData.links.facebook?.trim()) {
                                break;
                            }
                        }

                        console.log('✅ Stage 3 complete. Found:', {
                            instagram: !!extractedData.links.instagram?.trim(),
                            facebook: !!extractedData.links.facebook?.trim()
                        });
                    }
                } catch (searchError) {
                    console.error('Stage 3 search failed (non-critical):', searchError);
                    // Don't fail the whole request if search fails
                }
            }

        } catch (error) {
            console.error('OpenAI extraction error:', error);

            // Check if it's a Zod validation error (missing critical data)
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    {
                        success: false,
                        code: 'MANUAL_OVERRIDE_REQUIRED',
                        message: 'Context Missing: Unable to extract complete business information',
                        details: error.errors
                    },
                    { status: 422 }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    code: 'EXTRACTION_FAILED',
                    message: 'Failed to analyze content. Please provide data manually.'
                },
                { status: 500 }
            );
        }

        // PHASE 4: Return Golden Record with metadata
        return NextResponse.json({
            success: true,
            dna: extractedData,
            sourceUrl: url,
            scrapedAt: new Date().toISOString(),
            dataSources, // Track which intelligence layers were used
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            {
                success: false,
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
