// Vercel Serverless Function: GenAI Auto-Build
// Analyzes a website URL and generates a Linktree profile using OpenAI

import OpenAI from 'openai';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL format
        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        // Fetch the website HTML
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            return res.status(400).json({ error: `Failed to fetch URL: ${response.statusText}` });
        }

        const html = await response.text();

        // Extract text content using cheerio
        const $ = cheerio.load(html);

        // Remove script and style elements
        $('script, style, nav, footer, header').remove();

        // Extract main content
        const title = $('title').text() || $('h1').first().text() || '';
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        const h1Text = $('h1').first().text() || '';
        const h2Text = $('h2').first().text() || '';
        const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 5).join(' ');
        
        // Extract links
        const links = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && text && href.startsWith('http') && links.length < 10) {
                links.push({ label: text, url: href });
            }
        });

        // Combine all text content
        const websiteContent = `
Title: ${title}
Description: ${metaDescription}
Heading: ${h1Text}
Subheading: ${h2Text}
Content: ${paragraphs}
Links found: ${links.map(l => `${l.label} -> ${l.url}`).join(', ')}
        `.trim();

        // Call OpenAI API
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Using mini for cost efficiency, can upgrade to gpt-4o
            messages: [
                {
                    role: 'system',
                    content: `You are a branding expert. Analyze this website content and generate a JSON profile for a Linktree-style page. 

Return ONLY valid JSON with this exact structure:
{
  "business_name": "Creative business name based on the website",
  "bio": "Short, punchy bio with 1-2 emojis (max 100 chars)",
  "theme_color": "#hexcode (choose a color that matches the brand)",
  "links": [
    {"label": "Link label", "url": "https://url.com", "icon": "fa-globe"}
  ]
}

For icons, use Font Awesome icon names like: fa-globe, fa-instagram, fa-facebook, fa-envelope, fa-phone, fa-map-marker-alt, fa-shopping-cart, fa-calendar, fa-music, fa-video, fa-image, fa-link

Generate 3-5 relevant links based on the content.`
                },
                {
                    role: 'user',
                    content: `Analyze this website:\n\n${websiteContent}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = completion.choices[0].message.content.trim();

        // Parse JSON response (handle markdown code blocks)
        let jsonData;
        try {
            // Remove markdown code blocks if present
            const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || [null, aiResponse];
            jsonData = JSON.parse(jsonMatch[1] || aiResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponse);
            return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
        }

        // Validate and return the response
        if (!jsonData.business_name || !jsonData.bio) {
            return res.status(500).json({ error: 'Invalid AI response format', data: jsonData });
        }

        return res.status(200).json({
            success: true,
            data: {
                name: jsonData.business_name,
                bio: jsonData.bio,
                bg1: jsonData.theme_color || '#3b82f6',
                bg2: jsonData.theme_color || '#2563eb',
                btn: jsonData.theme_color || '#1d4ed8',
                links: jsonData.links || []
            }
        });

    } catch (error) {
        console.error('Error in generate API:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
}
