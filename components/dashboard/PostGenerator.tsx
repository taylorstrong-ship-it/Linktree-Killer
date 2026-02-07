'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/packages/config/supabase-client';
import SocialCardMockup from './SocialCardMockup';

// Types
type Format = '1:1' | '9:16';
type SourceMode = 'generate' | 'enhance';
type Vibe = 'Professional' | 'Witty' | 'Urgent' | 'Luxury' | 'Friendly';

interface BrandDNA {
    brandName: string;
    logoUrl?: string;
    heroImage?: string;
    og_image?: string;              // 🆕 OpenGraph image (social optimized)
    colorPalette?: string[];
    vibe?: string;
    tagline?: string;
    industry?: string;              // 🎯 Enable industry-aware routing
    suggested_ctas?: Array<{        // 🎯 Extract actual CTAs from scanner
        title: string;
        url: string;
        type: string;
    }>;
}

interface GeneratedContent {
    imageBase64: string;
    caption: string;
    hashtags: string;
}

const VIBE_OPTIONS: Vibe[] = ['Professional', 'Witty', 'Urgent', 'Luxury', 'Friendly'];

// "Let Him Cook" loading messages
const LOADING_MESSAGES = [
    'INITIALIZING BRAND DNA...',
    'TAYLORING YOUR PHOTO...',
    'LET HIM COOK...',
    'APPLYING FINAL POLISH...',
];

// Quick Idea Chips for context suggestions
const QUICK_IDEA_CHIPS = [
    '🏷️ Limited Time Deal',
    '🆕 New Arrival',
    '📅 Save the Date',
    '👋 Meet the Team',
];

// ====================================================================
// 🛡️ FALLBACK BRAND DATA (Prevents "Brand DNA required" errors)
// ====================================================================
const FALLBACK_BRAND: BrandDNA = {
    brandName: "Taylored Demo Brand",
    tagline: "Premium Quality, Unmatched Style",
    vibe: "Professional",
    colorPalette: ["#FF4500", "#000000", "#FFFFFF"],
};

export default function PostGenerator() {
    const router = useRouter();

    // State
    const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null);
    const [loadingBrand, setLoadingBrand] = useState(true);
    const [format, setFormat] = useState<Format>('1:1');
    const [sourceMode, setSourceMode] = useState<SourceMode>('enhance');
    const [vibe, setVibe] = useState<Vibe>('Professional');
    const [topic, setTopic] = useState('');
    const [userInstructions, setUserInstructions] = useState('');
    const [userImage, setUserImage] = useState<string | null>(null);
    const [userImageFile, setUserImageFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    // ───────────────────────────────────────────────────────────────────────────
    // DUAL-MODE DATA LOADING: localStorage (anonymous) → Supabase (authenticated)
    // ───────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        async function loadBrandProfile() {
            setLoadingBrand(true);

            // 🎯 PRIORITY 1: Check localStorage for anonymous scan data
            const localData = localStorage.getItem('brand_dna') ||
                localStorage.getItem('taylored_brand_data');

            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    console.log('✅ Loading brand data from localStorage (anonymous scanner mode)');
                    console.log('📦 Parsed data:', parsed);

                    setBrandDNA({
                        brandName: parsed.company_name || parsed.title || parsed.brandName || 'Your Brand',
                        logoUrl: parsed.logo_url || parsed.avatar_url,
                        heroImage: parsed.hero_image,           // 🎯 KEY: Best for social posts
                        og_image: parsed.og_image,              // 🎯 KEY: Social fallback
                        vibe: parsed.brand_personality || parsed.vibe || 'Professional',
                        tagline: parsed.tagline || parsed.description,
                        colorPalette: parsed.brand_colors || (parsed.primary_color ? [parsed.primary_color] : []),
                        industry: parsed.industry,              // 🎯 KEY: Enable industry routing
                        suggested_ctas: parsed.suggested_ctas || [], // 🎯 KEY: Real CTAs
                    });

                    console.log('✅ Brand DNA loaded from localStorage');
                    setLoadingBrand(false);
                    return; // Skip Supabase fetch
                } catch (err) {
                    console.warn('⚠️ Failed to parse localStorage, falling back to Supabase:', err);
                }
            }

            // 🎯 PRIORITY 2: Fall back to Supabase for authenticated users
            const supabase = createSupabaseClient() as any;

            try {
                // Get current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    console.log('⚠️ No user authenticated and no localStorage data');
                    setLoadingBrand(false);
                    return;
                }

                // Fetch brand profile
                const { data: profile, error: profileError } = await supabase
                    .from('brand_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (profileError || !profile) {
                    console.error('No brand profile found:', profileError);
                    setLoadingBrand(false);
                    return;
                }

                // Map database fields to BrandDNA interface
                setBrandDNA({
                    brandName: profile.brand_name,
                    logoUrl: profile.logo_url,
                    heroImage: profile.hero_image,
                    og_image: profile.og_image,
                    vibe: profile.vibe,
                    tagline: profile.ad_hook,
                    colorPalette: profile.primary_color ? [profile.primary_color] : undefined,
                    industry: profile.industry,
                    suggested_ctas: profile.suggested_ctas || [],
                });
            } catch (err) {
                console.error('Failed to load brand profile:', err);
                setError('Failed to load your brand profile. Please try again.');
            } finally {
                setLoadingBrand(false);
            }
        }

        loadBrandProfile();
    }, [router]);

    // 🎯 AUTO-START: Generate on mount if brand DNA exists
    useEffect(() => {
        if (!loadingBrand && brandDNA && !generatedContent && !isGenerating) {
            // Auto-trigger generation for "magic trick" UX
            handleTaylorThis();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingBrand, brandDNA]);

    // Cycle loading messages every 3 seconds
    useEffect(() => {
        if (!isGenerating) return;

        const interval = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isGenerating]);

    // Handle file upload
    const handleFileChange = useCallback((file: File) => {
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
            setError('Please upload a .jpg, .jpeg, or .png file');
            return;
        }

        setUserImageFile(file);
        setError(null);

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setUserImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    }, [handleFileChange]);

    // Haptic feedback helper
    const triggerHaptic = () => {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    // Handle Quick Idea Chip click
    const handleChipClick = (chipText: string) => {
        const cleanText = chipText.replace(/^[^\s]+\s/, ''); // Remove emoji prefix
        setUserInstructions((prev) => (prev ? `${prev}, ${cleanText}` : cleanText));
        triggerHaptic();
    };


    // 🎨 INDUSTRY-AWARE BEAUTIFICATION PROMPT GENERATOR
    const generateIndustryPrompt = useCallback((industry?: string, brandName?: string) => {
        if (!industry) return 'Transform this into professional brand photography with cinematic lighting.';

        const ind = industry.toLowerCase();

        if (ind.match(/food|restaurant|pizza|cafe|dining/i)) {
            return `Transform into professional food photography. Enhance lighting to make food incredibly appetizing, Michelin-star quality. Warm, golden-hour lighting. Add elegant text overlay with campaign message.`;
        }

        if (ind.match(/beauty|hair|salon|spa|lash|aesthetic/i)) {
            return `Transform into high-end fashion photography. Soft ring lighting, glossy luxury spa vibe. Natural, healthy skin tones. Add sophisticated text overlay with campaign message.`;
        }

        if (ind.match(/ecommerce|retail|shop|store|product/i)) {
            return `Transform into studio product photography. Crisp professional lighting, clean minimal background. Sharp, eye-catching details. Add modern text overlay.`;
        }

        if (ind.match(/tech|software|saas|app/i)) {
            return `Transform into modern tech workspace. Futuristic glowing elements, cyberpunk lighting accents. Cutting-edge premium aesthetic. Add sleek text overlay.`;
        }

        return `Transform into professional brand photography with cinematic lighting. Vibrant but natural colors. Add elegant text overlay.`;
    }, []);

    // 🎨 CANVAS IMAGE GENERATION (Fixed Text Rendering)
    const generateImage = useCallback(async (brandName: string, primaryColor?: string) => {
        return new Promise<string>((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve('');
                return;
            }

            // Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, primaryColor || '#FF6B35');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 🔧 FIXED TEXT RENDERING
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Brand Name - Smaller font with proper padding
            let fontSize = 48; // Start with 48px instead of huge
            ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;

            // Measure text width and scale down if needed
            const maxWidth = canvas.width - 80; // 40px padding on each side
            let textWidth = ctx.measureText(brandName).width;

            // Scale down font if text is too wide
            while (textWidth > maxWidth && fontSize > 24) {
                fontSize -= 2;
                ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
                textWidth = ctx.measureText(brandName).width;
            }

            // Draw centered text
            const x = canvas.width / 2;
            const y = canvas.height / 2;
            ctx.fillText(brandName, x, y);

            // Convert to base64
            const base64 = canvas.toDataURL('image/png');
            resolve(base64);
        });
    }, []);

    // Generate content (call Edge Function)
    const handleTaylorThis = async () => {
        if (sourceMode === 'generate' && !topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        if (sourceMode === 'enhance' && !userImage) {
            setError('Please upload an image to enhance');
            return;
        }

        // Trigger haptic feedback
        triggerHaptic();

        setIsGenerating(true);
        setError(null);
        setLoadingMessageIndex(0); // Reset to first message

        // ====================================================================
        // 🎯 UNIVERSAL BEAUTIFIER: Smart Image + CTA + Industry Routing
        // ====================================================================
        const effectiveBrand = brandDNA || FALLBACK_BRAND;

        // Critical validation: Ensure brandName exists
        if (!effectiveBrand.brandName) {
            effectiveBrand.brandName = "My Awesome Brand"; // Last resort fallback
        }

        // 🎯 SMART IMAGE SELECTION: Prioritize hero over logo
        const sourceImage = (effectiveBrand as any).heroImage ||        // BEST: Full scene
            (effectiveBrand as any).og_image ||          // GREAT: Social optimized  
            effectiveBrand.logoUrl ||                     // OK: Logo
            userImage ||                                  // User upload
            null;                                         // text-to-image fallback

        // 🎯 EXTRACT REAL CTA: Use their actual website CTAs
        const suggestedCtas = (effectiveBrand as any).suggested_ctas || [];
        const industry = (effectiveBrand as any).industry || '';

        const actualCTA = suggestedCtas[0]?.title ||
            (industry.match(/food|restaurant/i) ? 'Order Now' :
                industry.match(/beauty|salon|hair/i) ? 'Book Now' :
                    industry.match(/ecommerce|retail|shop/i) ? 'Shop Now' :
                        'Learn More');

        // 🎯 INDUSTRY BEAUTIFICATION PROMPT
        const beautificationPrompt = generateIndustryPrompt(industry, effectiveBrand.brandName);

        // 🎯 CAMPAIGN TEXT: Simple headline for text overlay (NOT the beautification instructions)
        // This is what the "Robotic Compositor" will imprint on the image
        const campaignText = topic.trim() ||  // User override from input field
            `${actualCTA} - ${effectiveBrand.brandName}`;  // Default: "Order Now - Millie's Italian"

        console.log('🚀 Universal Beautifier Payload:', {
            mode: sourceImage ? 'image-to-image (BEAUTIFY)' : 'text-to-image',
            brandName: effectiveBrand.brandName,
            industry: industry,
            sourceImage: sourceImage ? sourceImage.substring(0, 60) + '...' : 'none',
            cta: actualCTA,
            campaign: campaignText,
            prompt: beautificationPrompt.substring(0, 100) + '...',
            format,
            vibe
        });

        try {
            const supabase = createSupabaseClient();
            const { data, error: functionError } = await supabase.functions.invoke('generate-campaign-asset', {
                body: {
                    brandDNA: {
                        name: effectiveBrand.brandName,
                        vibe: vibe,
                        industry: industry,
                        primaryColor: effectiveBrand.colorPalette?.[0] || '#FF6B35',
                    },
                    sourceImageUrl: sourceImage,              // 🎯 THEIR ACTUAL IMAGE
                    campaign: campaignText,                   // 🎯 THEIR ACTUAL CTA
                    userInstructions: beautificationPrompt,   // 🎯 INDUSTRY PROMPT
                    format,
                },
            });

            // ====================================================================
            // 🚨 DIAGNOSTIC ERROR HANDLING: Check for backend error responses
            // ====================================================================
            if (functionError) throw functionError;
            if (!data) throw new Error('No data returned from API');

            // Check if the backend returned an error object (diagnostic mode)
            if (data.error) {
                // ====================================================================
                // 🔬 RAW ERROR EXPOSURE FOR DEBUGGING
                // ====================================================================
                console.error('🚨 Backend error detected:', {
                    error: data.error,
                    message: data.message,
                    details: data.details,
                    fullResponse: data
                });
                console.error('📦 Full Backend Response:', JSON.stringify(data, null, 2));

                // Build user-friendly error message with technical details
                const errorType = data.error || 'Unknown Error';
                const errorMessage = data.message || 'No message provided';
                const hint = data.hint || '';
                const statusCode = data.status_code || '';

                // Construct clean error message for UI
                let displayMessage = `⚠️ Generation Failed\n\n${errorMessage}`;

                if (hint) {
                    displayMessage += `\n\n💡 ${hint}`;
                }

                if (statusCode) {
                    displayMessage += `\n\n📊 Status: ${statusCode}`;
                }

                setError(displayMessage);

                // Show native alert with error details
                alert(displayMessage);

                return; // Don't try to process the response further
            }

            setGeneratedContent({
                imageBase64: data.image || data.imageBase64,  // Backend returns 'image' field
                caption: data.caption || campaignText,         // Fallback to our campaign text
                hashtags: data.hashtags || [],                 // Optional
            });
        } catch (err: any) {
            // ====================================================================
            // 🔬 RAW EXCEPTION EXPOSURE FOR DEBUGGING
            // ====================================================================
            console.error('❌ Generation exception:', err);
            console.error('📦 Full Exception Object:', {
                name: err.name,
                message: err.message,
                stack: err.stack,
                raw: err
            });

            // Build user-friendly exception message
            const errorMessage = err.message || 'An unexpected error occurred';
            const displayMessage = `⚠️ Generation Failed\n\n${errorMessage}\n\n💡 Check the console for technical details`;

            setError(displayMessage);

            // Show native alert
            alert(displayMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 relative">
            {/* Loading Skeleton */}
            {loadingBrand ? (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Loading your brand...
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            Tayloring your creative studio
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="max-w-2xl mx-auto mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-1">
                            Taylored Content Generator
                        </h1>
                        <p className="text-gray-400 text-sm">Your AI-powered creative studio.</p>
                    </div>

                    {/* MOBILE-FIRST VERTICAL STACK */}
                    <div className="max-w-2xl mx-auto flex flex-col space-y-6">

                        {/* Format Switch - iOS Segmented Control */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">Format</label>
                            <div className="relative h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-1 flex">
                                <motion.div
                                    layoutId="formatHighlight"
                                    className="absolute h-[calc(100%-8px)] bg-gradient-to-r from-orange-500 to-red-500 rounded-md shadow-lg"
                                    initial={false}
                                    animate={{
                                        left: format === '1:1' ? '4px' : 'calc(50% + 2px)',
                                        width: 'calc(50% - 6px)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                                <button
                                    onClick={() => {
                                        setFormat('1:1');
                                        triggerHaptic();
                                    }}
                                    className="relative z-10 flex-1 font-semibold text-sm transition-colors"
                                >
                                    Post (1:1)
                                </button>
                                <button
                                    onClick={() => {
                                        setFormat('9:16');
                                        triggerHaptic();
                                    }}
                                    className="relative z-10 flex-1 font-semibold text-sm transition-colors"
                                >
                                    Story (9:16)
                                </button>
                            </div>
                        </div>

                        {/* Source Switch - iOS Segmented Control */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">Source</label>
                            <div className="relative h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-1 flex">
                                <motion.div
                                    layoutId="sourceHighlight"
                                    className="absolute h-[calc(100%-8px)] bg-gradient-to-r from-orange-500 to-red-500 rounded-md shadow-lg"
                                    initial={false}
                                    animate={{
                                        left: sourceMode === 'enhance' ? '4px' : 'calc(50% + 2px)',
                                        width: 'calc(50% - 6px)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                                <button
                                    onClick={() => {
                                        setSourceMode('enhance');
                                        triggerHaptic();
                                    }}
                                    className="relative z-10 flex-1 font-semibold text-sm transition-colors"
                                >
                                    Taylor My Photo
                                </button>
                                <button
                                    onClick={() => {
                                        setSourceMode('generate');
                                        triggerHaptic();
                                    }}
                                    className="relative z-10 flex-1 font-semibold text-sm transition-colors"
                                >
                                    Taylor Fresh Idea
                                </button>
                            </div>
                        </div>

                        {/* Conditional: Upload Zone OR Topic Input (Photo-First) */}
                        <AnimatePresence mode="wait">
                            {sourceMode === 'enhance' ? (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Upload Image</label>
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative h-48 border-2 border-dashed rounded-lg transition-all cursor-pointer backdrop-blur-xl ${isDragging
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center justify-center h-full px-4">
                                            {userImageFile ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="text-center"
                                                >
                                                    <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-300 font-medium">{userImageFile.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Ready to Taylor</p>
                                                </motion.div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                                                    <p className="text-base text-gray-300 font-medium mb-1">Drop your photo here</p>
                                                    <p className="text-sm text-gray-500 italic">Upload a rough phone pic. We'll make it pro.</p>
                                                    <p className="text-xs text-gray-600 mt-3">.jpg, .jpeg, .png</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Context Input - What's the hook? */}
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-300 mb-3">What's the hook?</label>
                                        <input
                                            type="text"
                                            value={userInstructions}
                                            onChange={(e) => setUserInstructions(e.target.value)}
                                            placeholder="e.g., Friday Special $9, New Summer Look, Open House..."
                                            className="w-full h-14 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                            style={{ fontSize: '16px' }} // Prevents iOS auto-zoom
                                        />
                                    </div>

                                    {/* Quick Idea Chips */}
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500 mb-2">Quick Ideas:</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                            {QUICK_IDEA_CHIPS.map((chip) => (
                                                <motion.button
                                                    key={chip}
                                                    onClick={() => handleChipClick(chip)}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex-shrink-0 h-10 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm text-gray-300 hover:border-orange-500/50 hover:text-orange-500 transition-all whitespace-nowrap"
                                                >
                                                    {chip}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="topic"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Topic</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Enter your content topic..."
                                        className="w-full h-14 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-base"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Vibe Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">Vibe</label>
                            <select
                                value={vibe}
                                onChange={(e) => setVibe(e.target.value as Vibe)}
                                className="w-full h-14 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer text-base"
                            >
                                {VIBE_OPTIONS.map((v) => (
                                    <option key={v} value={v} className="bg-zinc-900">
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Error Display */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm backdrop-blur-xl">
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* THE "TAYLOR THIS!" BUTTON - MASSIVE & TAPPABLE */}
                        <motion.button
                            onClick={handleTaylorThis}
                            disabled={isGenerating}
                            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
                            className="w-full h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xl rounded-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-xl shadow-orange-500/30"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Tayloring...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    <span>Taylor This!</span>
                                </>
                            )}
                        </motion.button>

                        {/* Social Card Preview - BELOW BUTTON (Mobile-First) */}
                        <div className="w-full max-w-md mx-auto">
                            <SocialCardMockup
                                postData={{
                                    brandName: brandDNA?.brandName || 'Your Brand',
                                    avatarUrl: brandDNA?.logoUrl || brandDNA?.heroImage,
                                    caption: generatedContent?.caption || 'Your taylored content will appear here...',
                                    imageUrl: generatedContent?.imageBase64,
                                    originalImageUrl: sourceMode === 'enhance' ? userImage : undefined,
                                    timestamp: 'Just now',
                                    showComparison: sourceMode === 'enhance' && !!userImage && !!generatedContent,
                                }}
                                isLoading={isGenerating}
                                onCaptionChange={(newCaption) => {
                                    if (generatedContent) {
                                        setGeneratedContent({ ...generatedContent, caption: newCaption });
                                    }
                                }}
                            />
                        </div>

                        {/* Hashtags - Only show if generated */}
                        <AnimatePresence>
                            {generatedContent && generatedContent.hashtags && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full max-w-md mx-auto"
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Hashtags</label>
                                    <textarea
                                        value={generatedContent.hashtags}
                                        onChange={(e) =>
                                            setGeneratedContent({ ...generatedContent, hashtags: e.target.value })
                                        }
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                        style={{ fontSize: '16px' }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* "LET HIM COOK" LOADING OVERLAY */}
                    <AnimatePresence>
                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                            >
                                <motion.div
                                    animate={{
                                        boxShadow: [
                                            '0 0 20px rgba(255, 107, 53, 0.5)',
                                            '0 0 60px rgba(255, 107, 53, 0.8)',
                                            '0 0 20px rgba(255, 107, 53, 0.5)',
                                        ]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    className="bg-black border-2 border-orange-500 rounded-lg p-8 max-w-md w-full mx-4"
                                >
                                    <div className="text-center space-y-6">
                                        <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto" />
                                        <motion.p
                                            key={loadingMessageIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-orange-500 text-lg font-mono font-bold tracking-wider"
                                        >
                                            {LOADING_MESSAGES[loadingMessageIndex]}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}
