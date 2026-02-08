import { NextResponse } from 'next/server';
import { VapiClient } from '@vapi-ai/server-sdk';

export const maxDuration = 60;

const vapi = new VapiClient({ token: process.env.VAPI_PRIVATE_KEY || '' });

export async function POST(req: Request) {
    try {
        const { businessName, voiceTone, knowledgeBase, industry } = await req.json();

        if (!businessName) {
            return NextResponse.json({ error: "Missing business data" }, { status: 400 });
        }

        // 1. SELECT THE PERSONA (Voice based on industry)
        let voiceId = "cjVigAj5msChv8d432"; // Sarah (Generic/Friendly)
        if (industry === "Salon") voiceId = "EXAVITQu4vr4xnSDxMaL"; // Bella (Soft/Classy)
        if (industry === "Gym") voiceId = "nPczCjz8gwM73zELiGte"; // Male (Strong)

        // 2. THE "KILLER" PROMPT (Sales-focused AI brain)
        const systemPrompt = `You are the AI Receptionist for ${businessName}.
TONE: ${voiceTone} (Warm, Professional, Efficient).
CONTEXT: ${knowledgeBase}.

YOUR MISSION:
You are currently being demonstrated to the business owner. Your goal is to prove you can capture revenue they usually miss.

KEY TALKING POINTS:
- If they ask "What are you?" -> "I'm your always-on receptionist. I answer calls instantly so you never miss a client while your hands are full."
- If they ask "Why do I need this?" -> "Because one missed color appointment is $200 walking out the door. I make sure that never happens."
- If they ask about booking -> "I can take their name, number, and preferred time right now, then text you the details."

BEHAVIOR:
- Keep answers short (1-2 sentences).
- Sound natural, not robotic.
- Be confident.
- Focus on solving the "hands full" problem.`;

        console.log(`🎙️ Training killer sales AI for ${businessName}...`);

        const assistant = await vapi.assistants.create({
            model: {
                provider: "openai",
                model: "gpt-4o", // Latest flagship model (upgraded from gpt-4-turbo)
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    }
                ]
            },
            voice: { provider: "11labs", voiceId },
            firstMessage: `Hi! I'm the new automated assistant for ${businessName}. I'm ready to catch the calls you miss. Want to try booking an appointment?`
        });

        console.log(`✅ Killer AI created: ${assistant.id}`);

        return NextResponse.json({ assistantId: assistant.id });
    } catch (e: any) {
        console.error("Train error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
