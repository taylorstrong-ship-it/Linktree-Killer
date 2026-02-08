import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        const targetUrl = url.trim().startsWith('http') ? url : `https://${url}`;

        // 1. SETUP KEYS
        const firecrawlKey = process.env.FIRECRAWL_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        // 2. DEFINE THE OUTPUT STRUCTURE (The Golden Record)
        let record = {
            name: "Brand Name",
            description: "Welcome to my page",
            industry: "Brand", // Default fallback
            vibe: "Modern",
            colors: { primary: "#000000", background: "#ffffff" },
            links: [] as any[],
            image: ""
        };

        let markdown = "";

        // 3. EXECUTE SCAN (Firecrawl Preferred)
        if (firecrawlKey) {
            try {
                const fcResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: targetUrl, pageOptions: { onlyMainContent: false } })
                });

                if (fcResponse.ok) {
                    const fcData = await fcResponse.json();
                    markdown = fcData.data.markdown;
                    record.image = fcData.data.metadata.ogImage || "";
                    record.name = fcData.data.metadata.title || "";
                    record.description = fcData.data.metadata.description || "";
                }
            } catch (e) {
                console.error("Firecrawl skipped.");
            }
        }

        // 4. FALLBACK (If Firecrawl failed or no key, fetch raw HTML)
        if (!markdown) {
            const res = await fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const html = await res.text();
            const $ = cheerio.load(html);
            record.name = $('title').text().split('|')[0].trim();
            record.description = $('meta[name="description"]').attr('content') || "";
            record.image = $('meta[property="og:image"]').attr('content') || "";
            markdown = $('body').text().substring(0, 3000); // Feed raw text to AI
        }

        // 5. THE BRAIN (OpenAI - Enforcing "Industry" detection)
        if (openaiKey && markdown) {
            const openai = new OpenAI({ apiKey: openaiKey });
            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `You are a Brand Expert. Analyze the content.
              Rules:
              1. "industry": Be specific (e.g., "Hair Salon", "SaaS", "Pet Services"). DO NOT use generic terms like "Business".
              2. "colors": Extract the dominant hex code.
              3. "links": Find social/booking links.

              Return JSON ONLY:
              {
                "name": "Clean Brand Name",
                "description": "Short bio (max 120 chars)",
                "industry": "Specific Niche",
                "vibe": "One word (e.g. Luxury)",
                "colors": { "primary": "#hex", "background": "#hex" },
                "links": [ { "label": "Instagram", "url": "...", "type": "instagram" } ]
              }`
                        },
                        { role: "user", content: `URL: ${targetUrl}\nContent: ${markdown.substring(0, 4000)}` }
                    ],
                    model: "gpt-4o-mini", // Latest cost-effective model (upgraded from gpt-3.5-turbo)
                    response_format: { type: "json_object" }
                });

                const aiData = JSON.parse(completion.choices[0].message.content || '{}');

                // Merge AI data (AI wins)
                record.name = aiData.name || record.name;
                record.description = aiData.description || record.description;
                record.industry = aiData.industry || "Brand"; // This fixes the "Business detected" issue
                record.colors = aiData.colors || record.colors;
                record.links = aiData.links || [];

            } catch (e) {
                console.error("AI Analysis failed", e);
            }
        }

        return NextResponse.json(record);

    } catch (error) {
        return NextResponse.json({ error: 'Scan Failed' }, { status: 500 });
    }
}
