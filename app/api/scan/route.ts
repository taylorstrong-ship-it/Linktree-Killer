import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// ... imports
import * as cheerio from 'cheerio';

// 🛠️ HELPER: Aggressive Link Extractor
function extractLinks($: any) {
    const links: any[] = [];
    const seenUrls = new Set();

    $('a').each((_: any, element: any) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim(); // Keep case for label
        const textLower = text.toLowerCase();

        if (!href || href.startsWith('#') || href.startsWith('javascript')) return;

        // Normalize URL
        let fullUrl = href;
        if (href.startsWith('/')) {
            // We might not have the base, but we can try to reconstruct or ignore relative if critical
            // For now, let's keep it if we can; logic below checks 'contains' which handles full URLs best
        }

        const urlLower = fullUrl.toLowerCase();
        let type = '';
        let label = text || 'Link'; // Default label

        // RULE A: Social Media (Strict Domain Match)
        if (urlLower.includes('instagram.com')) { type = 'instagram'; label = 'Instagram'; }
        else if (urlLower.includes('facebook.com')) { type = 'facebook'; label = 'Facebook'; }
        else if (urlLower.includes('tiktok.com')) { type = 'tiktok'; label = 'TikTok'; }
        else if (urlLower.includes('linkedin.com')) { type = 'linkedin'; label = 'LinkedIn'; }
        else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) { type = 'twitter'; label = 'X'; }
        else if (urlLower.includes('youtube.com')) { type = 'youtube'; label = 'YouTube'; }

        // RULE B: Booking Engines (Keyword Match)
        else if (
            urlLower.includes('squareup.com') ||
            urlLower.includes('vagaro.com') ||
            urlLower.includes('glossgenius.com') ||
            urlLower.includes('calendly.com') ||
            urlLower.includes('acuityscheduling.com') ||
            urlLower.includes('booksy.com') ||
            urlLower.includes('fresha.com')
        ) {
            type = 'booking';
            label = text || 'Book Now';
        }

        // RULE C: Shopify Stores (Product/Collection Detection)
        else if (
            urlLower.includes('/products/') ||
            urlLower.includes('/collections/') ||
            urlLower.includes('/pages/')
        ) {
            type = 'shop'; // Use 'shop' type or map to 'booking' if you want them red
            label = text || 'Order Now';
        }

        // RULE D: Generic Booking (Text Match)
        else if (textLower.includes('book') || textLower.includes('schedule') || textLower.includes('appointment')) {
            type = 'booking';
            label = text || 'Book Now';
        }

        // Add to list if valid and unique
        if (type && !seenUrls.has(fullUrl)) {
            seenUrls.add(fullUrl);
            links.push({ type, label, url: fullUrl });
        }
    });

    return links;
}

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        const targetUrl = url.trim().startsWith('http') ? url : `https://${url}`;

        console.log(`🔍 [Scan] Extracting Brand DNA for: ${targetUrl}`);

        // 🎯 HYBRID STRATEGY: Try Edge Function first (full brand_images), fallback to simple scrape
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
            try {
                const response = await fetch(`${supabaseUrl}/functions/v1/extract-brand-dna`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`
                    },
                    body: JSON.stringify({ url: targetUrl }),
                    signal: AbortSignal.timeout(30000) // 30s timeout
                });

                if (response.ok) {
                    const brandData = await response.json();
                    console.log(`✅ [Scan] Edge Function success! Found ${brandData.brand_images?.length || 0} brand images`);
                    return NextResponse.json(brandData);
                }
                console.warn(`⚠️ [Scan] Edge Function failed (${response.status}), falling back to simple scrape`);
            } catch (edgeError) {
                console.warn('⚠️ [Scan] Edge Function timeout/error, falling back:', edgeError);
            }
        }

        // FALLBACK: Simple scrape (old logic) but return structure compatible with brand_images
        console.log('📋 [Scan] Using fallback scrape...');
        const firecrawlKey = process.env.FIRECRAWL_API_KEY;

        let record = {
            business_name: "Brand Name",
            business_description: "Welcome",
            industry: "Brand",
            logo_url: "",
            brand_images: [] as string[], // 🎯 NEW: Always return array
        };

        if (firecrawlKey) {
            try {
                const fcResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${firecrawlKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: targetUrl,
                        pageOptions: { onlyMainContent: false, waitFor: 5000 }
                    })
                });

                if (fcResponse.ok) {
                    const fcData = await fcResponse.json();
                    record.logo_url = fcData.data.metadata.ogImage || "";
                    record.business_name = fcData.data.metadata.title || "";
                    record.business_description = fcData.data.metadata.description || "";

                    // 🎯 Add logo as first brand_image
                    if (record.logo_url) {
                        record.brand_images.push(record.logo_url);
                    }
                }
            } catch (e) {
                console.error("Firecrawl failed:", e);
            }
        }

        console.log(`✅ [Scan] Fallback complete. Logo: ${record.logo_url ? 'found' : 'none'}`);
        return NextResponse.json(record);

    } catch (error) {
        console.error('[Scan] Fatal error:', error);
        return NextResponse.json({ error: 'Scan Failed' }, { status: 500 });
    }
}
