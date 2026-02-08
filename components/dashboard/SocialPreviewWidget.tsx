'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowRight, Utensils, ShoppingBag, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface VisualSocialPost {
    image_url?: string;
    enhanced_image_url?: string;
    caption: string;
    hashtags: string[];
}

interface BrandData {
    businessName: string;
    logo_url?: string;
    hero_image?: string;
    brand_images?: string[];  // 🖼️ ACTUAL product/gallery photos
    vibe?: string;
    primaryColor?: string;
    industry?: string;
    bio?: string; // Brand tagline/description for smart headlines
    suggested_ctas?: any[]; // 🔗 Smart CTA suggestions from brand DNA
    visual_social_posts?: VisualSocialPost[]; // 🎯 Pre-generated posts from extraction
}

interface SocialPreviewWidgetProps {
    brandData: BrandData;
    handleEditPage?: () => void;
    initialPosts?: VisualSocialPost[]; // 🎯 Pre-generated posts from Brand DNA extraction
}

type GenerationState = 'idle' | 'loading' | 'success' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

// Carousel post variation type
interface PostVariation {
    image: string;
    caption: string;
    hashtags: string[];
    theme: string;
}

export default function SocialPreviewWidget({
    brandData,
    handleEditPage,
    initialPosts,
}: SocialPreviewWidgetProps) {
    const [state, setState] = useState<GenerationState>('success'); // ✨ IRONCLAD: Always start successful
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false); // 🎯 Background AI enhancement flag
    const [enhancementSucceeded, setEnhancementSucceeded] = useState(false); // 🟢 Green dot indicator
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Kept for backwards compat, never displayed
    const [vibe, setVibe] = useState<string>('Modern');
    const [campaign, setCampaign] = useState<string>('Get Started Today');
    const router = useRouter();

    // 🛡️ LOOP BREAKER: Prevent infinite re-renders from initialPosts
    const hasLoadedRef = useRef(false);

    // 🎠 CAROUSEL STATE
    const [activeSlide, setActiveSlide] = useState(0);
    const [postVariations, setPostVariations] = useState<PostVariation[]>([]);

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECT 1: Check for pre-generated posts ONCE on mount
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        // 🎯 PRIORITY 1: Check for pre-generated visual posts from Brand DNA extraction
        // 🛡️ CRITICAL: Only runs ONCE on mount to prevent infinite loop
        if (initialPosts && initialPosts.length > 0 && !hasLoadedRef.current) {
            const firstPost = initialPosts[0];
            const preGeneratedImage = firstPost.enhanced_image_url || firstPost.image_url;

            if (preGeneratedImage) {
                console.log('🎨 [Smart Data Flow] Using pre-generated visual post from extraction');
                console.log('   Caption:', firstPost.caption?.substring(0, 50) + '...');
                console.log('   Hashtags:', firstPost.hashtags?.join(' '));

                setGeneratedImage(preGeneratedImage);
                setState('success');
                setEnhancementSucceeded(true);
                hasLoadedRef.current = true; // 🛡️ STOP THE LOOP

                // Hide success indicator after 2 seconds
                setTimeout(() => setEnhancementSucceeded(false), 2000);
            }
        }
    }, []); // ✅ EMPTY DEPS = Runs ONCE on mount only

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECT 2: Generate posts if no pre-generated content available
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        // 🛡️ Skip if we already loaded pre-generated content
        if (hasLoadedRef.current) {
            console.log('⏭️ [Smart Data Flow] Skipping generation - using pre-generated content');
            return;
        }

        // 🛡️ GUARD CLAUSE: Wait for real brandData to arrive from database
        if (!brandData || Object.keys(brandData).length === 0) {
            console.log('⏸️ [Optimistic UI] Waiting for brandData to arrive...');
            return;
        }

        console.log('✅ [Ironclad UI] No pre-generated posts, proceeding with smart generation...');

        // 🧠 INTELLIGENT IMAGE SELECTION: Pick the BEST product photo
        // - Filter out logos
        // - Prefer food/product keywords
        // - Use brand_images array (actual product photos) over hero_image
        const selectBestProductImage = () => {
            console.log('🎯 [Smart Selection] Analyzing brand images...');

            // Try brand_images array first (actual product/gallery photos)
            if (brandData.brand_images && brandData.brand_images.length > 0) {
                console.log(`  📸 Found ${brandData.brand_images.length} brand images`);

                const rankedImages = brandData.brand_images
                    .map((url: string, index: number) => {
                        let score = 100;
                        const urlLower = url.toLowerCase();

                        // ❌ Filter out logos
                        const isLogo =
                            urlLower.includes('logo') ||
                            urlLower.includes('favicon') ||
                            urlLower.includes('icon') ||
                            url === brandData.logo_url;

                        if (isLogo) {
                            console.log(`  ⚠️ Skipping logo: ${url.substring(url.lastIndexOf('/') + 1)}`);
                            return { url, score: 0 };
                        }

                        // ✅ Prefer larger images
                        if (urlLower.includes('w_1920') || urlLower.includes('w_2500')) score += 50;
                        if (urlLower.includes('w_1366') || urlLower.includes('w_1200')) score += 40;

                        // ✅ Prefer food/product keywords
                        if (urlLower.includes('food') || urlLower.includes('dish') ||
                            urlLower.includes('pasta') || urlLower.includes('pizza')) score += 35;
                        if (urlLower.includes('product') || urlLower.includes('item')) score += 25;

                        // ✅ First images usually better
                        if (index === 0) score += 15;
                        if (index === 1) score += 10;

                        return { url, score };
                    })
                    .filter((img: any) => img.score > 0)
                    .sort((a: any, b: any) => b.score - a.score);

                if (rankedImages.length > 0) {
                    const bestImage = rankedImages[0].url;
                    console.log(`  ✅ BEST IMAGE: ${bestImage.substring(bestImage.lastIndexOf('/') + 1)} (score: ${rankedImages[0].score})`);
                    return bestImage;
                }
            }

            // Fallback: hero_image (but only if NOT logo)
            if (brandData.hero_image && brandData.hero_image !== brandData.logo_url) {
                console.log('  📸 Fallback: Using hero_image (not logo)');
                return brandData.hero_image;
            }

            // Last resort: logo or placeholder
            console.log('  ⚠️ No product photos found, using logo');
            return brandData.logo_url || '/images/placeholder.jpg';
        };

        const bestProductImage = selectBestProductImage();

        // 🎯 STEP 1: NEVER FAIL INITIAL STATE - Always have an image
        setGeneratedImage(bestProductImage); // NEVER null or undefined
        setState('success');
        console.log('🖼️ [Ironclad UI] Displaying best product image:', bestProductImage?.substring(0, 60) + '...');

        // 🎯 STEP 2: BACKGROUND UPGRADE - Start AI enhancement after initial render
        const generatePreview = async () => {
            try {
                setIsUpgrading(true); // Show "✨ Enhancing..." badge

                // Use the same intelligent selection
                const imageSource = bestProductImage;

                if (!imageSource) {
                    console.warn('⚠️ [Ironclad UI] No image source available, using placeholder');
                    setGeneratedImage('/images/placeholder.jpg'); // Fallback to placeholder
                    setIsUpgrading(false);
                    return;
                }

                // Determine if this is a URL or already base64
                const isUrl = imageSource.startsWith('http://') || imageSource.startsWith('https://');

                // 🎨 DYNAMIC VIBE SELECTION: Choose vibe based on industry
                const industry = (brandData.industry || '').toLowerCase(); // Declare here for function-wide scope
                let smartVibe = brandData.vibe;

                if (!smartVibe) {
                    // Intelligent default based on industry
                    if (industry.includes('beauty') ||
                        industry.includes('fashion') ||
                        industry.includes('food') ||
                        industry.includes('art') ||
                        industry.includes('hair') ||
                        industry.includes('salon')) {
                        smartVibe = 'Elegant';  // Creative industries get sophisticated vibe
                    } else {
                        smartVibe = 'Energetic';  // Others get dynamic, high-energy vibe
                    }
                }


                // 🎯 REAL CTA FROM BRAND DNA: Use their actual suggested CTAs or industry-specific fallbacks
                const suggestedCtas = (brandData as any).suggested_ctas || [];
                // Note: industry already declared at line 88

                const actualCTA = suggestedCtas[0]?.title ||
                    (industry.match(/food|restaurant/i) ? 'Order Online' :
                        industry.match(/beauty|salon|hair/i) ? 'Book Appointment' :
                            industry.match(/ecommerce|retail|shop/i) ? 'Shop Now' :
                                'Learn More');

                // Simple campaign text for text overlay (not a generic "Expert Solutions")
                const campaign = `${actualCTA} - ${brandData.businessName}`;

                // Store for generator bridge
                setVibe(smartVibe);
                setCampaign(campaign);


                // 🎬 SMART SCENE ROUTER: Industry-specific visual templates
                // Note: industry already declared at line 88
                const brandName = brandData.businessName || 'Brand';

                // 🔍 FUZZY KEYWORD DETECTION: Regex patterns for flexible matching
                let scenePrompt = '';
                let noSuitsRule = '';


                // Determine if this is a corporate industry (allowed to have office scenes)
                const isCorporate = industry.match(/finance|law|consulting|agency|tech|software|saas|b2b|enterprise/i);

                // 🍕 FOOD & RESTAURANT - Fuzzy match for all food-related keywords
                if (industry.match(/food|restaurant|pizza|cafe|dining|bistro|italian|kitchen|bar|grill|eatery|deli|bakery|cuisine|culinary|chef/i)) {
                    scenePrompt = `A mouth-watering, CLOSE-UP food photography shot of delicious ${brandName} dishes beautifully plated. MACRO SHOT with shallow depth of field. Steam gently rising. Warm, appetizing lighting (golden hour style). A small elegant card displays 'Order Now'. Professional food styling. Food photography style, appetizing, rustic wooden table or marble surface. Instagram foodie aesthetic.`;
                    noSuitsRule = 'Do NOT show people in suits. Do NOT show meetings. Do NOT show generic office supplies.';

                    // 💇 BEAUTY & SALON - Fuzzy match for beauty-related keywords
                } else if (industry.match(/beauty|hair|salon|spa|lash|aesthetic|skin|makeup|nails|barber|stylist/i)) {
                    scenePrompt = `A stunning, photorealistic lifestyle shot inside a modern ${smartVibe.toLowerCase()} salon. Soft ring-light focus. A happy client showing off a fresh hairstyle, looking confident. In the background, a mirror or elegant neon sign clearly displays '${brandName}'. Professional salon atmosphere with premium products visible. Natural lighting. Instagram aesthetic.`;
                    noSuitsRule = 'Do NOT show people in suits. Do NOT show meetings. Do NOT show generic office supplies.';

                    // 💼 TECH & SaaS - Corporate allowed
                } else if (industry.match(/tech|saas|software|app|startup|developer|digital|platform|cloud/i)) {
                    scenePrompt = `A sleek, futuristic workspace featuring a premium laptop screen prominently displaying the ${brandName} logo glowing. ${smartVibe === 'Minimalist' ? 'Clean white lighting with minimal distractions' : 'Cyberpunk-inspired lighting with subtle neon accents'}. Modern tech setup. Professional developer/designer workspace. High-end aesthetic.`;

                    // 👗 FASHION - Fuzzy match
                } else if (industry.match(/fashion|clothing|apparel|boutique|style|wear|accessories|jewelry/i)) {
                    scenePrompt = `A high-fashion lifestyle shot featuring a confident model wearing stylish ${brandName} pieces. Urban or studio setting. Professional fashion photography lighting. A subtle sign or tag displays '${brandName}' or 'Shop Now'. Magazine-quality aesthetic. Influencer-style content.`;
                    noSuitsRule = 'Do NOT show people in suits. Do NOT show meetings. Do NOT show generic office supplies.';

                    // 💪 FITNESS - Fuzzy match
                } else if (industry.match(/fitness|gym|wellness|yoga|personal training|health|workout|athletic/i)) {
                    scenePrompt = `An energetic, motivational fitness scene showing an athlete in action at a premium facility. Dynamic lighting. The ${brandName} logo visible on equipment or apparel. Inspiring atmosphere. Professional sports photography quality. Instagram fitness aesthetic.`;
                    noSuitsRule = 'Do NOT show people in suits. Do NOT show meetings. Do NOT show generic office supplies.';

                    // ⚖️ CORPORATE (Finance, Law, Consulting) - Office scenes allowed
                } else if (industry.match(/finance|law|consulting|legal|accounting|advisory|insurance/i)) {
                    scenePrompt = `A professional, modern office environment. ${smartVibe} aesthetic. The ${brandName} logo prominently displayed. Clean, corporate atmosphere. High-end business aesthetic.`;

                } else {
                    // Default: High-quality lifestyle product shot (NO suits by default)
                    scenePrompt = `A high-quality lifestyle product shot featuring ${brandName} branding in a real-world, professional setting. Natural lighting. Premium aesthetic. People interacting with the product/service. Authentic, candid moment. Influencer-quality content.`;
                    noSuitsRule = 'Do NOT show people in suits. Do NOT show meetings. Do NOT show generic office supplies.';
                }

                // 🎯 ENRICHED CAMPAIGN PROMPT with Anti-Bore Filter & Embedded CTA
                const enrichedCampaign = `${campaign}. ${scenePrompt}

EMBEDDED CTA REQUIREMENT: Naturally render the text 'Link in Bio' or 'Book Now' or '${brandName}' somewhere visible in the scene (on a sign, card, screen, or branded element).

${noSuitsRule ? noSuitsRule + '\n\n' : ''}ANTI-BORE FILTER - Do NOT generate:
- Generic notebooks, journals, or diaries
- Flat lays with office supplies
- Generic stock photos of books or papers
- Boring desk setups

REQUIREMENTS:
- The image MUST look like a candid, high-budget influencer photo
- Focus on REAL people or REAL products in action
- Professional photography quality
- Scroll-stopping visual impact
- Instagram-worthy aesthetic`;

                console.log('🎨 [AI Design] Starting generation via Supabase Edge Function...');
                console.log('   Image source:', imageSource?.substring(0, 50) + '...');
                console.log('   Smart Vibe:', smartVibe, '| Industry:', brandData.industry);
                console.log('   Enriched Campaign:', enrichedCampaign);

                // 🖼️ BEAUTIFIER MODE: Check for real brand image from hero extraction
                const heroImage = (brandData as any).heroImage || (brandData as any).hero_image;
                if (heroImage) {
                    console.log('🎯 [BEAUTIFIER MODE] Using real brand image:', heroImage.substring(0, 60) + '...');
                } else {
                    console.log('📝 [STANDARD MODE] No hero image found, using text-to-image generation');
                }

                // 🔥 5-MINUTE CONNECTION: Raw fetch with AbortController for full timeout control
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.warn('⏱️ [Timeout] 5-minute limit reached, aborting request...');
                    controller.abort();
                }, 300000); // 300,000ms = 5 minutes

                console.log('⏰ [Connection] Starting 5-minute timeout window for Gemini 3 Pro rendering...');

                // 🍕 CRITICAL LOGIC: For restaurants, use REAL food photos, don't generate new ones
                // The Edge Function has intelligent selection in PATH B (lines 401-502) that will:
                // 1. Analyze brand_images array
                // 2. Pick the BEST product photo (not logo)
                // 3. Use it as reference for composition
                // 4. Apply professional retouching (lighting, color grading, composition)
                //
                // By NOT sending sourceImageUrl, we trigger PATH B which uses the real scraped photos
                const isRestaurant = brandData.industry?.match(/food|restaurant|cafe|bistro|dining|pizza|italian|kitchen/i);

                const payload = {
                    image: imageSource,
                    isUrl: isUrl,
                    brandDNA: {
                        name: brandData.businessName,
                        primaryColor: brandData.primaryColor || '#FF6B35',
                        vibe: smartVibe,
                        industry: brandData.industry || 'Business',
                        bio: brandData.bio || '', // 🎯 CRITICAL FIX: Enables brand story in AI generation
                        description: brandData.bio || '', // Fallback for description field
                        logo_url: brandData.logo_url, // 🎨 Logo for brand integration
                        brand_images: brandData.brand_images || [], // 📸 Product images for visual ref
                    },
                    campaign: campaign,  // 🎯 CLEAN HEADLINE: "Order Now", "Book Now", etc.
                    userInstructions: enrichedCampaign,  // 🎨 BEAUTIFICATION GUIDANCE: Scene description for visual enhancement
                    // 🍕 RESTAURANT FIX: Don't send sourceImageUrl for food businesses
                    // This forces Edge Function to use PATH B (brand_images intelligent selection)
                    // which uses REAL food photos from the scraped site
                    sourceImageUrl: isRestaurant ? undefined : (bestProductImage || undefined),
                };

                console.log(`🎯 [Image Strategy] ${isRestaurant ? 'USING REAL FOOD PHOTOS from brand_images' : 'Using sourceImageUrl for enhancement'}`);
                console.log(`📸 [Payload] brand_images count: ${brandData.brand_images?.length || 0}`);

                // Get Supabase URL from environment or construct it
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                if (!supabaseUrl || !supabaseAnonKey) {
                    console.error('❌ [Config] Missing Supabase credentials');
                    throw new Error('Supabase configuration missing');
                }

                let response: Response;
                try {
                    response = await fetch(`${supabaseUrl}/functions/v1/generate-campaign-asset`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${supabaseAnonKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId); // Clear timeout on successful response
                    console.log('✅ [Connection] Request completed within timeout window');
                } catch (fetchError: any) {
                    clearTimeout(timeoutId);

                    if (fetchError.name === 'AbortError') {
                        console.warn('⏱️ [Timeout] Request aborted after 5 minutes');
                        throw new Error('Generation timed out after 5 minutes');
                    }

                    console.error('❌ [Fetch Error]', fetchError);
                    throw fetchError;
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ [HTTP Error]', response.status, errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();

                console.log('📡 [AI Design] Supabase function response:', {
                    hasData: !!data,
                    success: data?.success
                });

                if (!data) {
                    throw new Error('No response from function');
                }

                console.log('📦 [AI Design] Response data:', {
                    success: data.success,
                    hasImage: !!data.image,
                    duration: data.metadata?.duration
                });

                if (data.success && data.image) {
                    console.log(`✅ [AI Design] Generation successful! (${data.metadata?.duration}s)`);

                    // 🔧 FRONTEND FIX: Ensure Base64 strings are formatted as Data URIs
                    let imageToDisplay = data.image;

                    // If it's a raw Base64 string (doesn't start with 'http' or 'data:'), format it
                    if (!imageToDisplay.startsWith('http') && !imageToDisplay.startsWith('data:')) {
                        console.log('🔧 [Image Fix] Converting raw Base64 to data URI...');
                        imageToDisplay = `data:image/png;base64,${imageToDisplay}`;
                    }

                    // Debug logging
                    console.log('🖼️ [Image Preview]', {
                        originalLength: data.image.length,
                        formattedPrefix: imageToDisplay.substring(0, 50),
                        isDataUri: imageToDisplay.startsWith('data:'),
                        isUrl: imageToDisplay.startsWith('http')
                    });

                    setGeneratedImage(imageToDisplay);
                    setIsUpgrading(false); // ✨ Hide "Enhancing..." badge
                    setEnhancementSucceeded(true); // 🟢 Show green dot
                    setState('success');

                    // Hide green dot after 2 seconds
                    setTimeout(() => setEnhancementSucceeded(false), 2000);
                } else {
                    throw new Error(data.error || 'Failed to generate image');
                }
            } catch (error) {
                // 🤫 IRONCLAD: Silence errors, keep original image visible
                console.log('Generation delayed:', error); // For us, not the user
                setIsUpgrading(false); // Stop the sparkle

                // DO NOT set error message (it's never displayed anyway)
                // DO NOT clear generatedImage (keep the heroImage showing)
                // DO NOT change state (stay on 'success')
            }
        };

        generatePreview();
    }, [brandData]); // ✅ REMOVED initialPosts dependency - it's checked once on mount, no need to watch for changes

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* iPhone 15 Pro Container */}
            <IPhoneMockup>
                <InstagramPostUI
                    brandName={brandData.businessName}
                    avatar={brandData.logo_url}
                    state={state}
                    generatedImage={generatedImage}
                    errorMessage={errorMessage}
                    vibe={vibe}
                    campaign={campaign}
                    onRemix={handleEditPage}
                    isUpgrading={isUpgrading}
                    enhancementSucceeded={enhancementSucceeded}
                    brandData={brandData}
                    router={router}
                />
            </IPhoneMockup>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTAGRAM POST UI
// ─────────────────────────────────────────────────────────────────────────────

interface InstagramPostUIProps {
    brandName: string;
    avatar?: string;
    state: GenerationState;
    generatedImage: string | null;
    errorMessage: string | null;
    vibe: string;
    campaign: string;
    onRemix?: () => void;
    isUpgrading: boolean;
    enhancementSucceeded: boolean;
    brandData: BrandData;
    router: any;
}

function InstagramPostUI({
    brandName,
    avatar,
    state,
    generatedImage,
    errorMessage,
    vibe,
    campaign,
    onRemix,
    isUpgrading,
    enhancementSucceeded,
    brandData,
    router,
}: InstagramPostUIProps) {
    return (
        <div className="w-full h-full bg-white dark:bg-zinc-950 flex flex-col">
            {/* Instagram Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 p-[2px]">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt={brandName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                    {brandName.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Handle */}
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold text-black dark:text-white">
                            {brandName.toLowerCase().replace(/\s+/g, '')}
                        </p>
                        <p className="text-xs text-zinc-500">Sponsored</p>
                    </div>
                </div>
                <button className="text-black dark:text-white">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Instagram Post Image */}
            <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-900">
                {/* \u2728 OPTIMISTIC UI: "Enhancing..." Badge */}
                <AnimatePresence>
                    {isUpgrading && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-white/20 rounded-full"
                        >
                            <p className="text-xs text-white font-medium flex items-center gap-1.5">
                                <span className="animate-pulse">\u2728</span>
                                Enhancing with AI...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {state === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            <SkeletonShimmer />
                        </motion.div>
                    )}

                    {state === 'success' && generatedImage && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                        >
                            {/* 🎨 PURE AI SYSTEM - Single Layer */}
                            <div className="relative w-full h-full group overflow-hidden rounded-3xl bg-neutral-900">

                                {/* The AI is now the Designer - Complete ad with embedded text/buttons */}
                                <img
                                    src={generatedImage}
                                    alt="AI Generated Campaign"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Optional: Download button in corner */}
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = generatedImage;
                                        link.download = `${brandData.businessName}-campaign.png`;
                                        link.click();
                                    }}
                                    title="Download Campaign Image"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                </motion.button>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 🟢 Green Dot: Success Indicator (Your Secret Signal) */}
                <AnimatePresence>
                    {enhancementSucceeded && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full shadow-lg"
                            aria-label="Enhancement successful"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Instagram Footer */}
            <div className="flex-1 bg-white dark:bg-zinc-950 px-3 pt-2 pb-4 space-y-2">
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Heart className="w-6 h-6 text-black dark:text-white" />
                        <MessageCircle className="w-6 h-6 text-black dark:text-white" />
                        <Send className="w-6 h-6 text-black dark:text-white" />
                    </div>
                    <Bookmark className="w-6 h-6 text-black dark:text-white" />
                </div>

                {/* Likes Count */}
                <p className="text-sm font-semibold text-black dark:text-white">
                    2,847 likes
                </p>

                {/* Caption */}
                <div className="text-sm text-black dark:text-white">
                    <span className="font-semibold">
                        {brandName.toLowerCase().replace(/\s+/g, '')}{' '}
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                        Ready to launch in seconds. #Taylored #AI #InstantBrand
                    </span>
                </div>

                {/* Time */}
                <p className="text-xs text-zinc-400 uppercase">2 hours ago</p>

                {/* Open Studio Button */}
                <AnimatePresence>
                    {state === 'success' && generatedImage && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ delay: 0.6 }}
                            onClick={() => {
                                // 🎯 COMPLETE BRAND DNA HANDOFF
                                // Fix for localStorage key mismatch: generator reads from 'taylored_brand_data'
                                const completeBrandDNA = {
                                    // Core Identity
                                    company_name: brandData.businessName,
                                    business_name: brandData.businessName,
                                    logo_url: brandData.logo_url,

                                    // Visual Assets - CRITICAL for using real product photos
                                    brand_images: brandData.brand_images || [],
                                    hero_image: brandData.hero_image,

                                    // Branding
                                    primary_color: brandData.primaryColor,
                                    industry: brandData.industry,
                                    bio: brandData.bio,
                                    business_type: brandData.industry,

                                    // Content Strategy
                                    suggested_ctas: brandData.suggested_ctas || [],

                                    // Preview from dashboard widget (for seamless handoff)
                                    preview_image: generatedImage,
                                    preview_prompt: campaign,
                                    preview_vibe: vibe,
                                };

                                // 🔑 Use consistent localStorage key that generator expects
                                localStorage.setItem('taylored_brand_data', JSON.stringify(completeBrandDNA));

                                console.log('✅ [Brand DNA Handoff] Saved complete DNA:', {
                                    company: completeBrandDNA.company_name,
                                    images_count: completeBrandDNA.brand_images?.length,
                                    has_logo: !!completeBrandDNA.logo_url,
                                    has_preview: !!completeBrandDNA.preview_image,
                                    industry: completeBrandDNA.industry,
                                });

                                // Navigate cleanly to generator
                                router.push('/generator');
                            }}
                            className="w-full py-2 rounded-lg mt-2
                          bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]
                          hover:from-[#FF8C42] hover:to-[#FF6B35]
                          text-white font-semibold text-sm
                          transition-all duration-300
                          cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Open Studio
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// IPHONE 15 PRO MOCKUP
// ─────────────────────────────────────────────────────────────────────────────

function IPhoneMockup({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {/* Device Frame */}
            <div
                className="relative mx-auto rounded-[3rem] overflow-hidden
                    bg-zinc-900 border-[8px] border-zinc-800
                    shadow-2xl shadow-black/60"
                style={{ width: '375px', height: '812px' }}
            >
                {/* Notch */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 z-30
                      w-40 h-7 bg-zinc-900 rounded-b-3xl
                      border-l-2 border-r-2 border-b-2 border-zinc-800"
                />

                {/* Screen Content */}
                <div className="relative w-full h-full overflow-auto">
                    {children}
                </div>
            </div>

            {/* Subtle Glow Effect */}
            <div
                className="absolute inset-0 -z-10 blur-3xl opacity-20
                    bg-gradient-to-b from-orange-500/20 via-transparent to-purple-500/10"
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON SHIMMER LOADING
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonShimmer() {
    return (
        <div className="relative w-full h-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            {/* Animated shimmer overlay */}
            <motion.div
                className="absolute inset-0 -translate-x-full"
                animate={{
                    translateX: ['100%', '100%'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
            />

            {/* Static skeleton structure */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-zinc-400 dark:text-zinc-600 text-sm font-medium animate-pulse">
                    Tayloring...
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
