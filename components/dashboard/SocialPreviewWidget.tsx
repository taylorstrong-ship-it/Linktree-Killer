'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface BrandData {
    businessName: string;
    logo_url?: string;
    hero_image?: string;
    vibe?: string;
    primaryColor?: string;
    industry?: string;
}

interface SocialPreviewWidgetProps {
    brandData: BrandData;
    handleEditPage?: () => void;
}

type GenerationState = 'idle' | 'loading' | 'success' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SocialPreviewWidget({
    brandData,
    handleEditPage,
}: SocialPreviewWidgetProps) {
    const [state, setState] = useState<GenerationState>('loading');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [vibe, setVibe] = useState<string>('Modern');
    const [campaign, setCampaign] = useState<string>('Get Started Today');
    const router = useRouter();

    // ─────────────────────────────────────────────────────────────────────────
    // AUTO-GENERATE ON MOUNT (WITH RACE CONDITION FIX)
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        // 🛡️ GUARD CLAUSE: Wait for real brandData to arrive from database
        // This prevents the race condition where auto-generation fires before data loads
        if (!brandData || Object.keys(brandData).length === 0) {
            console.log('⏸️ [AI Design] Waiting for brandData to arrive...');
            return;
        }

        console.log('✅ [AI Design] BrandData received, starting auto-generation...');

        const generatePreview = async () => {
            try {
                setState('loading');

                // Smart image selection: prioritize hero_image over logo
                const imageSource = brandData.hero_image || brandData.logo_url;

                if (!imageSource) {
                    console.warn('⚠️ [AI Design] No image source available');
                    setState('idle');
                    return;
                }

                // Determine if this is a URL or already base64
                const isUrl = imageSource.startsWith('http://') || imageSource.startsWith('https://');

                // 🎨 DYNAMIC VIBE SELECTION: Choose vibe based on industry
                let smartVibe = brandData.vibe;

                if (!smartVibe) {
                    // Intelligent default based on industry
                    const industry = (brandData.industry || '').toLowerCase();

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

                const campaignMap: Record<string, string> = {
                    'Luxury': 'Exclusive Collection',
                    'Professional': 'Expert Solutions',
                    'Bold': 'Grand Opening',
                    'Minimalist': 'New Arrivals',
                    'Playful': 'Special Offer',
                    'Modern': 'Now Available',
                    'Elegant': 'Limited Edition',
                    'Energetic': 'Fresh Deals',
                    'Creative': 'Creative Showcase',
                };

                const campaign = campaignMap[smartVibe] || 'Get Started Today';

                // Store for generator bridge
                setVibe(smartVibe);
                setCampaign(campaign);


                // 🎬 SMART SCENE ROUTER: Industry-specific visual templates
                const industry = (brandData.industry || '').toLowerCase();
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

                const { data, error } = await supabase.functions.invoke('generate-campaign-asset', {
                    body: {
                        image: imageSource,
                        isUrl: isUrl,
                        brandDNA: {
                            name: brandData.businessName,
                            primaryColor: brandData.primaryColor || '#FF6B35',
                            vibe: smartVibe,
                            industry: brandData.industry || 'Business',
                        },
                        campaign: enrichedCampaign,
                        sourceImageUrl: heroImage || undefined, // 🎨 Enable beautifier if heroImage exists
                    },
                });

                console.log('📡 [AI Design] Supabase function response:', {
                    hasData: !!data,
                    hasError: !!error
                });

                if (error) {
                    console.error('❌ [AI Design] Supabase function error:', error);
                    throw new Error(error.message || 'Function invocation failed');
                }

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
                    setState('success');
                } else {
                    throw new Error(data.error || 'Failed to generate image');
                }
            } catch (error) {
                console.error('❌ [AI Design] Generation failed:', error);

                // 🛡️ SAFETY NET: Use raw heroImage instead of showing error
                const fallbackImage = heroImage || (brandData as any).hero_image;

                if (fallbackImage) {
                    console.log('🖼️ [Fallback] Using raw brand hero image as safety net:', fallbackImage.substring(0, 60) + '...');
                    setGeneratedImage(fallbackImage);
                    setState('success'); // Show it as if generation succeeded
                } else {
                    // Last resort: show error if truly no image available
                    let userMessage = 'Generation failed';

                    if (error instanceof Error) {
                        if (error.message.includes('timeout') || error.message.includes('504')) {
                            userMessage = 'Generation timed out. Please try again.';
                        } else if (error.message.includes('API Error 403')) {
                            userMessage = 'Unauthorized. Please check your API configuration.';
                        } else if (error.message.includes('API Error 429')) {
                            userMessage = 'Rate limit exceeded. Please wait a moment.';
                        } else if (error.message.includes('API Error 500')) {
                            userMessage = 'Server error. Please try again.';
                        } else {
                            userMessage = error.message;
                        }
                    }

                    setErrorMessage(userMessage);
                    setState('error');
                }
            }
        };

        // Trigger generation after mount (with slight delay for smooth UX)
        const timer = setTimeout(generatePreview, 800);
        return () => clearTimeout(timer);
    }, [brandData]);

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
                            <img
                                src={generatedImage}
                                alt="AI-generated post"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    )}

                    {state === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900"
                        >
                            <div className="text-center space-y-2">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Preview unavailable
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                                    {errorMessage}
                                </p>
                            </div>
                        </motion.div>
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
                                // 🎯 CLEAN HANDOFF: Use localStorage instead of URL params to avoid URI_TOO_LONG
                                const campaignData = {
                                    image: generatedImage,
                                    brand: brandData,
                                    prompt: campaign,
                                    vibe: vibe,
                                    timestamp: Date.now(),
                                };

                                localStorage.setItem('cva_pending_campaign', JSON.stringify(campaignData));
                                console.log('✅ [Clean Handoff] Campaign data saved to localStorage');

                                // Navigate cleanly without query params
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
                    Generating...
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
