import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface BrandDNA {
    business_name?: string;
    tone?: string;
    business_intel?: Record<string, any>;
    [key: string]: any;
}

interface RequestBody {
    message: string;
    brandDNA: BrandDNA;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
    console.warn('⚠️  GOOGLE_AI_API_KEY not configured');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // Validate API key
        if (!API_KEY) {
            return NextResponse.json(
                { error: 'Neural link offline - API key not configured' },
                { status: 503 }
            );
        }

        // Parse request body
        const body: RequestBody = await request.json();
        const { message, brandDNA } = body;

        // Validate inputs
        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid message' },
                { status: 400 }
            );
        }

        if (!brandDNA || typeof brandDNA !== 'object') {
            return NextResponse.json(
                { error: 'Missing or invalid brandDNA' },
                { status: 400 }
            );
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-flash-preview', // Latest 2026 model (replaces 2.0-flash)
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 100,
            },
        });

        // Construct dynamic system prompt
        const systemPrompt = buildSystemPrompt(brandDNA);

        // Generate response
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I am ready to assist.' }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({
            success: true,
            response: responseText,
        });

    } catch (error: any) {
        console.error('❌ Agent API Error:', error);

        return NextResponse.json(
            {
                error: 'Neural link temporarily unstable',
                details: error?.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(brandDNA: BrandDNA): string {
    const businessName = brandDNA.business_name || 'this business';
    const tone = brandDNA.tone || 'professional and helpful';
    const intel = brandDNA.business_intel || {};

    return `You are the AI Voice Assistant for ${businessName}.

YOUR PERSONALITY:
- Tone: ${tone}
- Mission: Answer customer questions accurately and concisely
- Style: Conversational, direct, and helpful

BUSINESS INTELLIGENCE:
${JSON.stringify(intel, null, 2)}

INSTRUCTIONS:
- Answer questions in 1-2 sentences maximum
- Be conversational and natural
- If you don't have specific information, acknowledge it honestly
- Never make up information not in the business intelligence
- Keep responses brief and actionable`;
}
