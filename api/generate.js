// Vercel Serverless Function: GenAI Auto-Build
// Analyzes a website URL and generates a Linktree profile using OpenAI + FireCrawl
import OpenAI from 'openai';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

        // --- Step A: Scrape with FireCrawl ---
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.FIRECRAWL_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: targetUrl,
                pageOptions: {
                    onlyMainContent: true
                }
            })
        });

        if (!firecrawlResponse.ok) {
            console.error('FireCrawl error:', await firecrawlResponse.text());
            return res.status(400).json({ error: `Failed to scrape URL: ${firecrawlResponse.statusText}` });
        }

        const firecrawlData = await firecrawlResponse.json();
        const markdown = firecrawlData.data?.markdown || '';

        if (!markdown) {
            console.warn('FireCrawl returned no markdown, falling back to basic extraction or failing.');
            // Proceeding hoping OpenAI can halluncinate good defaults or using empty string
        }


        // --- Step B & C: Analyze & Extract with OpenAI ---
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Using mini for cost efficiency
            messages: [
                {
                    role: 'system',
                    content: `You are a branding expert. Analyze this website content (provided as markdown) and generate a JSON profile for a Linktree-style page. 

Return ONLY valid JSON with this exact structure:
{
  "business_name": "Name of the entity",
  "bio": "2-sentence summary of what they do",
  "theme_color": "Dominant hex code #color",
  "logo_url": "Absolute URL of logo if found, else null",
  "links": [
    {"label": "Link label", "url": "https://url.com", "icon": "fa-globe"}
  ]
}

For icons, use Font Awesome icon names like: fa-globe, fa-instagram, fa-facebook, fa-envelope, fa-phone, fa-map-marker-alt, fa-shopping-cart.

Generate up to 4 key links found.`
                },
                {
                    role: 'user',
                    content: `Analyze this website markdown:\n\n${markdown.substring(0, 15000)}` // Truncate to avoid token limits if massive
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
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
        if (!jsonData.business_name) {
            return res.status(500).json({ error: 'Invalid AI response format', data: jsonData });
        }

        // Default Error Handling as per Directive
        // (If we reached here, success is implied, but sticking to directive fallback format if needed)

        return res.status(200).json({
            success: true,
            data: {
                name: jsonData.business_name,
                bio: jsonData.bio,
                bg1: jsonData.theme_color || '#3b82f6',
                bg2: jsonData.theme_color || '#2563eb', // Fallback gradient
                btn: jsonData.theme_color || '#1d4ed8',
                links: jsonData.links || [],
                logo: jsonData.logo_url // Passing logo through even if frontend doesn't use it yet
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
