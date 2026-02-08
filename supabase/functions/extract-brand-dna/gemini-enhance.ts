/**
 * 🎨 ENHANCE IMAGE WITH GEMINI 3 + ADD DESIGN ELEMENTS
 * 
 * Takes a brand's actual product photo and:
 * 1. Enhances quality (lighting, color, sharpness)
 * 2. Adds design overlays (text, CTA, branding)
 * 3. Returns Instagram-ready post
 */
async function enhanceImageWithDesign(
    imageUrl: string,
    brandName: string,
    brandColors: { primary: string; secondary: string },
    postConcept: {
        caption: string;
        cta: string;
    },
    industry: string,
    geminiKey: string
): Promise<{ enhanced_url: string; success: boolean }> {
    console.log('🎨 Enhancing image with Gemini 3...');

    try {
        // Step 1: Fetch source image as Base64
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64 = btoa(String.fromCharCode(...uint8Array));
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        console.log(`  ✅ Image fetched: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`);

        // Step 2: Build Gemini prompt
        const systemRole = `You are an Elite Creative Director creating Instagram posts for ${industry} businesses.
        
MISSION: Transform the provided product photo into a scroll-stopping Instagram post (1080x1080).

STEPS:
1. **ENHANCE THE IMAGE:**
   - Apply professional ${industry} photography enhancement
   - Improve lighting, color balance, and sharpness
   - ${industry.toLowerCase().includes('food') ? 'Increase appetite appeal - vivid colors, depth of field' : ''}
   - ${industry.toLowerCase().includes('salon') || industry.toLowerCase().includes('hair') ? 'Emphasize texture, shine, and professional styling' : ''}
   - Keep the subject authentic - DO NOT replace or hallucinate new elements

2. **ADD DESIGN OVERLAYS:**
   - Brand Name: "${brandName}" (top center, elegant typography)
   - Caption: "${postConcept.caption}" (creative placement, high legibility)
   - CTA Button: "${postConcept.cta}" (pill-shaped, color: ${brandColors.primary})
   - Make text overlays look professionally integrated, not slapped on
   
3. **COMPOSITION:**
   - Instagram 1:1 ratio (1080x1080)
   - Safe zones: 15% top/bottom clear space
   - Text should interact with the image naturally

OUTPUT: A single, cohesive Instagram post ready to publish.`;

        // Step 3: Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    data: base64,
                                    mimeType: mimeType
                                }
                            },
                            {
                                text: systemRole
                            }
                        ],
                    }],
                    generationConfig: {
                        responseModalities: ["IMAGE"]
                    }
                }),
            }
        );

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('❌ Gemini API error:', errorText);
            throw new Error(`Gemini API failed: ${geminiResponse.status}`);
        }

        const result = await geminiResponse.json();

        // Step 4: Extract enhanced image
        const candidate = result.candidates?.[0];
        const contentParts = candidate?.content?.parts || [];
        const inlineData = contentParts[0]?.inlineData;

        if (!inlineData || !inlineData.data) {
            throw new Error('No image data in Gemini response');
        }

        const enhancedBase64 = inlineData.data;
        const enhancedMimeType = inlineData.mimeType || 'image/png';
        const enhancedDataUri = `data:${enhancedMimeType};base64,${enhancedBase64}`;

        console.log('  ✅ Image enhanced successfully');

        return {
            enhanced_url: enhancedDataUri,
            success: true
        };
    } catch (error) {
        console.error('⚠️ Image enhancement failed:', error);
        // Fallback to original image
        return {
            enhanced_url: imageUrl,
            success: false
        };
    }
}

// Example usage in the main pipeline:
// After Claude generates social concepts:
/*
const selectedImages = selectTopImages(brandImages, aiAnalysis.business_type, 3);
const geminiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY') || Deno.env.get('GEMINI_API_KEY');

if (geminiKey && selectedImages.length > 0) {
    console.log('🎨 Enhancing social post images with Gemini 3...');
    
    const visualPosts = await Promise.all(
        socialExamples.slice(0, selectedImages.length).map(async (concept, idx) => {
            const imageUrl = selectedImages[idx];
            
            const enhanced = await enhanceImageWithDesign(
                imageUrl,
                branding.companyName || 'Unknown',
                {
                    primary: branding.colors.primary,
                    secondary: branding.colors.secondary || branding.colors.primary
                },
                {
                    caption: concept.caption,
                    cta: concept.cta
                },
                aiAnalysis.business_type,
                geminiKey
            );
            
            return {
                ...concept,
                original_image_url: imageUrl,
                enhanced_image_url: enhanced.enhanced_url
            };
        })
    );
    
    // Store in brandDNA.visual_social_posts
}
*/
