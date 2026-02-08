import { NextResponse } from 'next/server';
import { Firecrawl } from '@mendable/firecrawl-js';
import OpenAI from 'openai';
import { VapiClient } from '@vapi-ai/server-sdk';

export const maxDuration = 60; // Allow 60 seconds for scraping

export async function POST(req: Request) {
    // Initialize clients inside the function to avoid build-time execution
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_KEY });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const vapi = new VapiClient({ token: process.env.VAPI_PRIVATE_KEY || '' });
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ success: false, error: "No URL provided" });

        // 1. SCRAPE
        console.log(`🔥 Scraping ${url}...`);
        const scrapeResult = await firecrawl.scrape(url, {
            formats: ['markdown']
        });

        if (!scrapeResult) throw new Error("Scrape failed");
        const rawText = scrapeResult.markdown || '';

        // 2. ANALYZE
        console.log(`🧠 Analyzing Brand...`);
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Extract JSON from this website text:
          {
            "businessName": "String",
            "industry": "Restaurant/Salon/Gym/General",
            "primaryColor": "Hex Code (guess based on vibe, default #000000)",
            "knowledgeBase": "Concise summary of hours, services, prices. Max 300 chars.",
            "voiceTone": "Adjective (e.g. Friendly, High-end, Energetic)",
            "introMessage": "A short, natural phone greeting (e.g. 'Thanks for calling [Name]...')"
          }`
                },
                { role: "user", content: rawText.substring(0, 15000) }
            ],
            response_format: { type: "json_object" }
        });

        const brandData = JSON.parse(completion.choices[0].message.content || '{}');

        // 3. CREATE VOICE AGENT
        console.log(`🎙️ Creating Agent...`);

        // Choose voice based on industry
        let voiceId = "cjVigAj5msChv8d432"; // Sarah (Generic)
        if (brandData.industry === "Salon") voiceId = "EXAVITQu4vr4xnSDxMaL"; // Bella (Soft/Classy)
        if (brandData.industry === "Gym") voiceId = "nPczCjz8gwM73zELiGte"; // Male (Strong)

        const assistant = await vapi.assistants.create({
            model: {
                provider: "openai",
                model: "gpt-4o", // Latest flagship model (upgraded from gpt-4-turbo)
                messages: [
                    {
                        role: "system",
                        content: `You are the receptionist for ${brandData.businessName}. Tone: ${brandData.voiceTone}. Context: ${brandData.knowledgeBase}. Goal: Be helpful, short answers, get the booking.`
                    }
                ]
            },
            voice: { provider: "11labs", voiceId: voiceId },
            firstMessage: brandData.introMessage,
        });

        return NextResponse.json({
            success: true,
            assistantId: assistant.id,
            brandData: brandData
        });

    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
