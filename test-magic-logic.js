import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testScrape(url) {
    console.log(`\n🧪 Testing Magic Scrape on: ${url}`);

    try {
        // 1. Fetch
        console.log('  1. Fetching HTML...');
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        const html = await response.text();
        console.log(`     -> Fetched ${html.length} chars`);

        // 2. Clean
        console.log('  2. Cleaning HTML...');
        const $ = cheerio.load(html);
        $('script').remove();
        $('style').remove();
        $('svg').remove();
        const bodyText = $('body').text().replace(/\s+/g, ' ').substring(0, 100);
        console.log(`     -> Body snippet: "${bodyText}..."`);

        // 3. Analyze
        console.log('  3. Asking OpenAI (Mocking the prompt)...');

        // We strictly replicate the prompt from magic-scrape.ts
        const prompt = `
      You are a Brand Expert. Analyze this HTML content from ${url}.
      Return a strict JSON object with:
      - username: A clean handle derived from the URL or title.
      - title: The display name.
      - bio: A witty, inviting bio (max 100 chars).
      - theme_color: The single most dominant brand hex color.
      - avatar_url: The best URL for a profile picture.
      - social_links: An array of { platform: 'instagram' | 'tiktok' | 'youtube' | 'generic', url: string, label: string }.
    `;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a precise JSON extractor.' },
                { role: 'user', content: prompt + `\n\nHTML Snippet:\n${html.substring(0, 5000)}` }, // truncation for test
            ],
            response_format: { type: 'json_object' },
        });

        const data = JSON.parse(completion.choices[0].message.content);
        console.log('\n✨ SUCCESS! Extracted Data:');
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('\n❌ FAILED:', error.message);
    }
}

// Run test
testScrape('https://github.com/supabase');
