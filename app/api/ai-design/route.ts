import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

// 🚀 CRITICAL: Use Edge Runtime for 60s timeout (vs 10s default serverless)
export const runtime = 'edge';
export const maxDuration = 60; // Vercel Pro: up to 60s for Edge Functions

const MODEL_NAME = "gemini-3-flash-preview"; // Latest 2026 model (PhD-level reasoning)

// ─────────────────────────────────────────────────────────────────────────────
// SECURE API HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        console.log("🎨 ============ AI DESIGN API CALLED ============");

        // 🛡️ SECURITY LAYER: Referer Check (Production Only)
        if (process.env.NODE_ENV === "production") {
            const referer = req.headers.get("referer") || "";
            const allowedHost = process.env.NEXT_PUBLIC_APP_URL || "vercel.app";

            const isAllowed = referer.includes(allowedHost) ||
                referer.includes("vercel.app") ||
                referer.includes("taylored");

            if (!isAllowed) {
                console.error("🚫 Unauthorized referer:", referer);
                return NextResponse.json({ error: "Unauthorized Source" }, { status: 403 });
            }

            console.log("✅ Referer validated");
        }

        // STEP 1: Validate API Key
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;

        if (!apiKey) {
            console.error("❌ Missing API Key");
            return NextResponse.json({ error: "Server Misconfiguration" }, { status: 500 });
        }

        console.log("✅ API Key validated");

        // STEP 2: Parse Request
        const { image, brandDNA, campaign } = await req.json();

        console.log("📥 Request Details:");
        console.log(`   Campaign: "${campaign}"`);
        console.log(`   Industry: ${brandDNA?.industry || 'N/A'}`);
        console.log(`   Vibe: ${brandDNA?.vibe || 'N/A'}`);
        console.log(`   Image: ${image ? (image.startsWith('http') ? 'Remote URL' : 'Base64') : 'None'}`);

        // STEP 3: REAL REMIX - Fetch & Convert Image
        let imagePart = null;

        if (image && image.startsWith("http")) {
            try {
                console.log("⬇️ Fetching image for Remix:", image);
                const imgRes = await fetch(image);

                if (imgRes.ok) {
                    const buffer = await imgRes.arrayBuffer();
                    const base64 = Buffer.from(buffer).toString("base64");
                    const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

                    imagePart = {
                        inlineData: {
                            data: base64,
                            mimeType: mimeType
                        }
                    };

                    console.log("✅ Image fetched and converted to Base64");
                    console.log(`   Size: ${Buffer.from(buffer).length} bytes`);
                    console.log(`   MIME: ${mimeType}`);
                }
            } catch (fetchError: any) {
                console.warn("⚠️ Image fetch failed, falling back to text-only generation");
                console.warn("   Error:", fetchError.message);
            }
        } else if (image && image.startsWith("data:")) {
            const matches = image.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                imagePart = {
                    inlineData: {
                        data: matches[2],
                        mimeType: matches[1]
                    }
                };
                console.log("✅ Base64 image parsed");
            }
        }

        // STEP 4: Initialize Gemini
        console.log(`🤖 Initializing Gemini: ${MODEL_NAME}`);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // STEP 5: Build Dynamic Prompt (The "Sales Demo" Magic)
        const industry = brandDNA?.industry || "Business";
        const vibe = brandDNA?.vibe || "Premium";
        const primaryColor = brandDNA?.primaryColor || "#FF6B35";

        const prompt = `Role: Expert social media designer for a ${industry} brand.

Task: Create a viral Instagram advertisement that stops the scroll.

${imagePart ? "Visual Foundation: Use the attached photo as the core asset. Significantly improve the lighting to look professional and premium." : "Visual Creation: Generate a high-end, photorealistic image representing this industry with cinematic quality."}

Campaign Text: Render "${campaign}" clearly and legibly with modern typography.

Brand Aesthetic: ${vibe}
Industry Context: ${industry}
Primary Color: ${primaryColor}

Style Requirements:
- Professional, engaging, ${vibe.toLowerCase()}
- Magazine-quality composition
- Instagram-optimized (1080x1080px)
- Eye-catching and scroll-stopping

Create an image that drives engagement and conversions.`;

        console.log("📝 Art Director prompt constructed");
        console.log(`   Strategy: ${imagePart ? "Image-to-Image Remix" : "Text-to-Image Generation"}`);

        // STEP 6: Generate with Gemini
        const parts: any[] = [{ text: prompt }];
        if (imagePart) parts.push(imagePart);

        console.log("🎨 Generating Sales Demo...");
        const startTime = Date.now();

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig: {
                responseMimeType: "image/png",
            },
        });

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`✅ Gemini generation completed in ${duration}s`);

        // STEP 7: Extract Response
        const response = await result.response;

        // Check for safety blocks
        if (response.promptFeedback?.blockReason) {
            console.error("❌ Content blocked by safety filters");
            return NextResponse.json(
                {
                    success: false,
                    error: "Content blocked - please adjust campaign text",
                },
                { status: 400 }
            );
        }

        // STEP 8: Extract Generated Image
        const candidates = response.candidates;

        if (!candidates || candidates.length === 0) {
            throw new Error("No image generated");
        }

        const candidate = candidates[0];
        const contentParts = candidate.content?.parts;

        if (!contentParts || contentParts.length === 0) {
            throw new Error("Invalid response format");
        }

        const inlineData = contentParts[0].inlineData;

        if (!inlineData || !inlineData.data) {
            console.error("❌ No image data in response");
            console.error("Response:", JSON.stringify(candidate, null, 2));
            throw new Error("No image data in response");
        }

        const generatedMimeType = inlineData.mimeType || "image/png";
        const generatedBase64 = inlineData.data;
        const imageDataUri = `data:${generatedMimeType};base64,${generatedBase64}`;

        console.log("✅ Image extracted successfully");
        console.log(`   Size: ${generatedBase64.length} characters`);
        console.log(`   Preview: ${imageDataUri.substring(0, 50)}...`);
        console.log("🎉 ============ SUCCESS ============");

        // STEP 9: Return Success
        return NextResponse.json({
            success: true,
            image: imageDataUri,
        });

    } catch (error: any) {
        console.error("❌ ============ ERROR ============");
        console.error("Type:", error.constructor.name);
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);

        // Graceful error messages
        let errorMessage = "Generation Failed";
        let statusCode = 500;

        if (error.message?.includes("API key") || error.message?.includes("401")) {
            errorMessage = "Invalid API Key";
            statusCode = 401;
        } else if (error.message?.includes("quota") || error.message?.includes("429")) {
            errorMessage = "High Demand - Try Again";
            statusCode = 429;
        } else if (error.message?.includes("timeout")) {
            errorMessage = "Request Timed Out";
            statusCode = 408;
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: statusCode }
        );
    }
}
