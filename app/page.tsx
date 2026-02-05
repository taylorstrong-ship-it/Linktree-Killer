/**
 * 🤖 AI-Assisted Maintenance Guide 🤖
 * 
 * **File:** app/page.tsx
 * **Purpose:** This is the main landing page of the application.
 * 
 * **Key Logic:**
 * 1. **URL Input:** Captures the user's website URL from an input field.
 * 2. **API Call:** On form submission, it calls the `/api/brand-dna` endpoint.
 * 3. **State Management:** Uses `useState` to manage the URL, scanning state, and returned brand data.
 * 4. **Error Handling:** If the API call fails, it falls back to a pre-defined mock data set (`simulationData`).
 * 5. **Redirection:** On success, it stores the brand data in `localStorage` and redirects the user to the `/builder` page.
 * 
 * **Common Issues to Check:**
 * - **API Failures:** Check the `handleScan` function and the `/api/brand-dna` endpoint for errors.
 * - **State Not Updating:** Ensure `setBrandData` and `setIsScanning` are being called correctly.
 * - **Redirection Problems:** Verify `router.push('/builder')` is working as expected.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ChevronDown, Smartphone, Palette, Type, Fingerprint } from 'lucide-react';
import MatrixOverlay from '@/components/hub/MatrixOverlay';
import BioLinkBuilder from '@/components/hub/BioLinkBuilder';
import AdCampaignGenerator from '@/components/hub/AdCampaignGenerator';
import BrandDashboard from '@/components/dashboard/BrandDashboard';
import AuthModal from '@/components/AuthModal';
import { safeFontString, safeColorString } from '@/lib/type-guards';
import { WorldContainer } from '@/components/canvas/WorldContainer';
import { WorldSection } from '@/components/canvas/InfiniteCanvasWorld';
import { AboutSection } from '@/components/canvas/AboutSection';
import { ContactSection } from '@/components/canvas/ContactSection';

// --- HYBRID DNA INTERFACE (STORY MODE) ---

export default function Home() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [brandData, setBrandData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false); // STABILITY PATCH: Login modal state
    const [logs, setLogs] = useState<{ text: string, color: string }[]>([]); // Terminal logs with colors
    const [scannedImage, setScannedImage] = useState<string | null>(null); // Final reveal image

    // Scroll listener for reveal effects could go here, but IntersectionObserver 
    // or framer-motion's whileInView is cleaner.

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();

        // SYSTEM OVERRIDE: SMART URL SANITIZATION
        let targetUrl = url.trim();
        if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
            setUrl(targetUrl); // Update UI
        }

        // 🔗 Log sanitized URL
        console.log('🔗 Sanitized URL:', targetUrl);

        if (!targetUrl) return;

        setBrandData(null);
        setScanComplete(false);
        setIsScanning(true);
        setScanComplete(false);
        setLogs([]); // Clear previous logs
        setScannedImage(null); // Clear previous image

        // 🎬 VIBE HEIST SCRIPT - Loop in Brand Orange
        const vibeHeistScript = [
            '🔰 Taylored AI Solutions Protocol initiated...',
            '🏎️ Going 0-100 FAST...',
            '🕵️♂️ Yoinking hex codes from the mainframe...',
            '🧬 Stealing Brand DNA (don\'t tell anyone)...',
            '🎨 Extracting the vibe...',
            '🍳 Let him cook...'
        ];

        // Start with first message
        const currentLogs: { text: string, color: string }[] = [
            { text: vibeHeistScript[0], color: 'orange' }
        ];
        setLogs([...currentLogs]);

        let messageIndex = 1;
        let loopInterval: NodeJS.Timeout | null = null;

        // Start looping through messages every 600ms
        loopInterval = setInterval(() => {
            if (messageIndex < vibeHeistScript.length) {
                currentLogs.push({ text: vibeHeistScript[messageIndex], color: 'orange' });
            } else {
                // Loop back to start (skip first message since it's the protocol init)
                messageIndex = 1;
                currentLogs.push({ text: vibeHeistScript[messageIndex], color: 'orange' });
            }
            messageIndex++;

            // Keep only last 5 messages for scrolling effect
            const visibleLogs = currentLogs.slice(-5);
            setLogs([...visibleLogs]);
        }, 600);

        try {
            console.log('📡 Calling Supabase Edge Function (Direct) - Bypassing Vercel timeout');

            // 🚑 FIX: Call Supabase Edge Function DIRECTLY (60s timeout instead of Vercel's 10s)
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

            const response = await fetch(`${supabaseUrl}/functions/v1/extract-brand-dna`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: targetUrl }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Edge Function Error:', errorText);
                throw new Error(`Edge Function returned ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Brand DNA extraction failed');
            }

            // Stop the loop!
            if (loopInterval) {
                clearInterval(loopInterval);
            }

            // Extract Brand DNA from response
            const dna = result.brandDNA;

            // STABILITY PATCH: Sanitize fonts and colors before localStorage
            // Transform Brand DNA response to match Builder expectations
            const transformedData = {
                username: dna.company_name.toLowerCase().replace(/\s+/g, ''),
                title: dna.company_name,
                bio: dna.description,
                description: dna.description,
                theme_color: safeColorString(dna.primary_color, '#3b82f6'),
                brand_colors: [
                    safeColorString(dna.primary_color, '#3b82f6'),
                    safeColorString(dna.secondary_color, '#8b5cf6'),
                    safeColorString(dna.accent_color, '#6366f1')
                ],
                // STABILITY FIX: Apply safeFontString to prevent [object Object] crashes
                fonts: dna.fonts.length > 0
                    ? dna.fonts.map((f: any) => safeFontString(f, 'Inter'))
                    : ['Inter'],
                avatar_url: dna.logo_url || dna.favicon_url || '',
                // CRITICAL: Builder expects 'links', map from suggested_ctas
                links: dna.suggested_ctas.map((cta: any) => ({
                    title: cta.title,
                    url: cta.url
                })),
                // Keep full DNA for future use
                dna: dna
            };

            console.log('✅ Brand DNA extracted:', transformedData);

            // CRITICAL FIX: Save to localStorage immediately so builder can access it
            localStorage.setItem('taylored_brand_data', JSON.stringify(transformedData));
            console.log('💾 Saved to localStorage:', transformedData);

            // 🎯 INJECT REAL DATA IN SUCCESS GREEN
            const greenLogs: { text: string, color: string }[] = [];

            await new Promise(resolve => setTimeout(resolve, 300));
            greenLogs.push({ text: `> TARGET_ACQUIRED: ${dna.company_name.toUpperCase()}`, color: 'green' });
            setLogs([...greenLogs]);

            await new Promise(resolve => setTimeout(resolve, 400));
            greenLogs.push({ text: `> INDUSTRY_MATCH: ${dna.business_type}`, color: 'green' });
            setLogs([...greenLogs]);

            await new Promise(resolve => setTimeout(resolve, 400));
            greenLogs.push({
                text: `> DNA_EXTRACTED: ${dna.brand_colors?.length || transformedData.brand_colors.length} colors found`,
                color: 'green'
            });
            setLogs([...greenLogs]);

            await new Promise(resolve => setTimeout(resolve, 400));
            const ctaTitles = transformedData.links.slice(0, 3).map((l: any) => l.title).join(', ');
            greenLogs.push({
                text: `> CTAS_DETECTED: ${transformedData.links.length} (${ctaTitles})`,
                color: 'green'
            });
            setLogs([...greenLogs]);

            // 🎬 PHASE 3: THE REVEAL (Optional)
            await new Promise(resolve => setTimeout(resolve, 800));
            const revealImage = dna.og_image || dna.logo_url;
            if (revealImage) {
                setScannedImage(revealImage);
                await new Promise(resolve => setTimeout(resolve, 2500));
                setScannedImage(null);
            }

            // Pause 1.5s to let user see the captured data
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 🎯 SHOW BRAND DASHBOARD
            setBrandData(transformedData);
            setIsScanning(false);
            setScanComplete(true);

        } catch (err: any) {
            console.error('⚠️ API Failed. Activating Simulation Mode...', err);

            // Stop the loop if it's still running
            if (loopInterval) {
                clearInterval(loopInterval);
            }

            // 🎬 SIMULATION MODE: Show same sequence with mock data
            const simulationData = {
                username: 'neuralcoffee',
                title: 'Neural Coffee Co.',
                bio: 'Artisan coffee roasted by AI. Where machine learning meets morning rituals. ☕🤖',
                theme_color: '#1a1a1a',
                avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=neuralcoffee&backgroundColor=d4e79e',
                fonts: ['Playfair Display', 'Inter'],
                brand_colors: ['#1a1a1a', '#FFAD7A', '#8b7355', '#ffffff'],
                links: [
                    { title: 'Menu', url: 'https://neuralcoffee.com/menu' },
                    { title: 'Order Online', url: 'https://neuralcoffee.com/order' },
                    { title: 'Follow Us', url: 'https://instagram.com/neuralcoffee' }
                ]
            };

            // Inject mock data in Success Green
            const simLogs: { text: string, color: string }[] = [];

            await new Promise(resolve => setTimeout(resolve, 300));
            simLogs.push({ text: `> TARGET_ACQUIRED: NEURAL COFFEE CO.`, color: 'green' });
            setLogs([...simLogs]);

            await new Promise(resolve => setTimeout(resolve, 400));
            simLogs.push({ text: `> INDUSTRY_MATCH: Coffee & AI`, color: 'green' });
            setLogs([...simLogs]);

            await new Promise(resolve => setTimeout(resolve, 400));
            simLogs.push({ text: `> DNA_EXTRACTED: 4 colors found`, color: 'green' });
            setLogs([...simLogs]);

            await new Promise(resolve => setTimeout(resolve, 400));
            simLogs.push({ text: `> CTAS_DETECTED: 3 (Menu, Order Online, Follow Us)`, color: 'green' });
            setLogs([...simLogs]);

            await new Promise(resolve => setTimeout(resolve, 800));
            if (simulationData.avatar_url) {
                setScannedImage(simulationData.avatar_url);
                await new Promise(resolve => setTimeout(resolve, 2500));
                setScannedImage(null);
            }

            // Pause to let user see the data
            await new Promise(resolve => setTimeout(resolve, 1500));

            localStorage.setItem('taylored_brand_data', JSON.stringify(simulationData));
            setBrandData(simulationData);
            setIsScanning(false);
            setScanComplete(true);
        }
    };

    const handleMatrixComplete = () => {
        console.log('🎬 Matrix animation complete, checking for data...');

        // If we already have data, show it immediately
        if (brandData) {
            console.log('✅ Data ready! Showing results...');
            setIsScanning(false);
            setScanComplete(true);
        } else {
            console.log('⏳ Animation done, waiting for API...');
            // Animation finished but API still loading - poll for data
            const checkInterval = setInterval(() => {
                if (brandData) {
                    console.log('✅ Data arrived! Showing results...');
                    clearInterval(checkInterval);
                    setIsScanning(false);
                    setScanComplete(true);
                }
            }, 500); // Check every 500ms

            // Timeout after 30 seconds to prevent infinite waiting
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!brandData) {
                    console.error('❌ Timeout: API took too long');
                    setIsScanning(false);
                    setError('Request timed out. Please try again.');
                }
            }, 30000);
        }
    };

    const handleLaunch = () => {
        if (brandData) {
            localStorage.setItem('taylored_brand_data', JSON.stringify(brandData));
            router.push('/builder');
        }
    };

    return (
        <div className="min-h-screen lava-background text-white selection:bg-[#FFAD7A]/30 selection:text-[#FFAD7A] font-serif">

            <MatrixOverlay isScanning={isScanning} onComplete={handleMatrixComplete} logs={logs} />

            {/* 🎬 PHASE 3: IMAGE REVEAL OVERLAY */}
            <AnimatePresence>
                {scannedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <img
                                src={scannedImage}
                                alt="Brand Identity"
                                className="max-w-md max-h-md rounded-lg border-4 border-green-500 shadow-[0_0_40px_rgba(0,255,65,0.6)]"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="mt-8 text-center"
                        >
                            <motion.p
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-green-500 font-mono text-2xl font-bold tracking-widest"
                                style={{ textShadow: '0 0 10px rgba(0,255,65,0.8)' }}
                            >
                                IDENTITY CONFIRMED
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STABILITY PATCH: Auth Modal for Direct Login */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={(userId) => {
                        console.log('✅ Login successful:', userId);
                        setShowAuthModal(false);
                        router.push('/builder');
                    }}
                    prefilledEmail=""
                    initialMode="login"
                />
            )}

            {/* HEADER - Minimal */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="w-8 h-8 bg-[#FFAD7A] rounded-lg flex items-center justify-center font-bold text-lg text-[#121212] shadow-lg shadow-[#FFAD7A]/20">T</div>
                    <span className="font-bold tracking-tight font-sans"><span className="text-[#FFAD7A]">Taylored AI Solutions</span> Hub</span>
                </div>
                {/* STABILITY PATCH: Ferrari-Aesthetic Login Button */}
                <button
                    onClick={() => setShowAuthModal(true)}
                    className="pointer-events-auto group relative overflow-hidden
                               px-4 py-2 rounded-lg
                               bg-[#DC0000]/10 hover:bg-[#DC0000]/20
                               border border-[#DC0000]/30 hover:border-[#DC0000]/60
                               text-white font-sans font-medium text-sm
                               transition-all duration-300
                               shadow-lg shadow-[#DC0000]/10 hover:shadow-[#DC0000]/30"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login
                    </span>
                    {/* Ferrari red glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#DC0000]/0 via-[#DC0000]/20 to-[#DC0000]/0 
                                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
            </header>

            <main className="w-full">
                <WorldContainer>
                    {/* LEFT SECTION: CONTACT (x: -100vw) - Revealed when panning RIGHT */}
                    <WorldSection className="lava-background">
                        <ContactSection />
                    </WorldSection>

                    {/* CENTER SECTION: HOME/SCANNER (x: 0) - Default view */}
                    <WorldSection className="lava-background">
                        {/* HERO: INPUT MODE */}
                        {!scanComplete ? (
                            <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
                                {/* Ambient Background */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

                                <div className="relative z-10 text-center space-y-6 sm:space-y-8 max-w-4xl w-full">
                                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif italic tracking-tight text-white/90 leading-tight px-4">
                                        AI, <span className="italic text-[#FFAD7A]">Taylored</span> to Your Exact Vibe.
                                    </h1>
                                    <p className="text-base sm:text-lg md:text-xl text-white/40 font-sans font-light max-w-2xl mx-auto leading-relaxed px-6">
                                        Everyone's got access to <span className="text-[#FFAD7A] font-medium">AI</span>. What you need are <span className="text-[#FFAD7A] font-medium">Taylored AI Solutions</span> that don't sound like generic <span className="text-[#FFAD7A] font-medium">AI</span> slop.
                                    </p>


                                    <div className="relative w-full max-w-xl mx-auto mt-8 sm:mt-12 px-4">
                                        {/* EXISTING FORM */}
                                        <form onSubmit={handleScan} className="w-full relative group">
                                            <div className="absolute inset-0 bg-[#FFAD7A] rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                                            <div className="relative flex items-center bg-[#1E1E1E] border border-white/10 rounded-2xl p-2 shadow-2xl transition-all animate-pulse-glow">
                                                <Search className="ml-4 w-5 h-5 text-white/30" />
                                                <input
                                                    type="text"
                                                    placeholder="https://your-portfolio.com"
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/20 px-4 py-4 outline-none font-sans"
                                                    value={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isScanning}
                                                    className="bg-[#FFAD7A] text-[#121212] hover:bg-[#FFAD7A] font-sans font-bold py-3 px-6 sm:px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,65,0.5)] hover:shadow-[0_0_30px_rgba(0,255,65,0.8)] text-sm sm:text-base whitespace-nowrap"
                                                >
                                                    {isScanning ? 'Stitching...' : (<><span className="hidden sm:inline">Stitch My Vibe</span><span className="sm:hidden">Stitch Vibe</span></>)}
                                                </button>
                                            </div>
                                        </form>


                                        {/* 🖍️ FAT NEON ARROW (Centered BELOW the Input) */}
                                        <div className="hidden sm:flex absolute top-full left-1/2 -translate-x-1/2 mt-8 pointer-events-none z-10">
                                            <div className="flex flex-col items-center">

                                                {/* 1. The Arrow (Pointing UP towards the box) */}
                                                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="neon-arrow">
                                                    {/* Curved Line pointing UP */}
                                                    <path d="M 70 80 Q 50 50, 50 10" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
                                                    {/* Arrowhead pointing UP */}
                                                    <path d="M 35 25 L 50 10 L 65 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
                                                </svg>

                                                {/* 2. The Text (Below the arrow) */}
                                                <span className="liquid-text text-2xl font-bold mt-2 whitespace-nowrap transform -rotate-2">
                                                    Your Website Here
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {error && <div className="text-red-400 font-sans bg-red-900/20 p-4 rounded-xl inline-block">{error}</div>}
                                </div>
                            </div>
                        ) : (
                            /* --- STORY MODE: SCROLL LAYOUT --- */
                            <div className="flex flex-col w-full">

                                {/* SECTION 1: BUSINESS DNA (The Top Fold) */}
                                <section className="min-h-screen w-full p-6 md:p-12 flex flex-col justify-center relative bg-[#121212] z-10">

                                    {/* DNA Header */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="text-center mb-16"
                                    >
                                        <h2 className="text-4xl md:text-5xl font-serif italic text-white/80">Your Business DNA</h2>
                                        <div className="h-1 w-20 bg-[#FFAD7A] mx-auto mt-6 rounded-full opacity-50"></div>
                                    </motion.div>

                                    {/* THE DNA GRID */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2, duration: 0.8 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full"
                                    >
                                        {/* CARD 1: IDENTITY */}
                                        <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl p-8 flex flex-col items-center justify-center text-center aspect-square md:aspect-auto">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-[#FFAD7A] blur-2xl opacity-10 rounded-full"></div>
                                                {brandData?.avatar_url ? (
                                                    <img src={brandData.avatar_url} alt="Logo" className="w-24 h-24 rounded-full border-2 border-[#FFAD7A]/20 relative z-10 object-cover" />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
                                                        <Fingerprint className="w-10 h-10 text-white/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-bold mt-6 font-sans text-white">{brandData?.title || 'Brand Identity'}</h3>
                                            <span className="mt-3 px-3 py-1 bg-[#FFAD7A]/10 text-[#FFAD7A] text-xs font-sans uppercase tracking-widest rounded-full border border-[#FFAD7A]/20">
                                                Identity Confirmed
                                            </span>
                                        </div>

                                        {/* CARD 2: TYPOGRAPHY */}
                                        <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden aspect-square md:aspect-auto">
                                            <div className="absolute top-4 left-4 text-[#FFAD7A]/20">
                                                <Type className="w-6 h-6" />
                                            </div>
                                            <h1 className="text-9xl font-serif text-[#FFAD7A] opacity-90">Aa</h1>
                                            <p className="mt-4 text-white/40 font-sans text-sm uppercase tracking-widest">
                                                {(() => {
                                                    const font = brandData?.fonts?.[0];
                                                    return typeof font === 'string' ? font : (font?.family || 'Modern Sans');
                                                })()}
                                            </p>
                                        </div>

                                        {/* CARD 3: PALETTE */}
                                        <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl p-8 flex flex-col items-center justify-center relative aspect-square md:aspect-auto">
                                            <div className="absolute top-4 right-4 text-[#FFAD7A]/20">
                                                <Palette className="w-6 h-6" />
                                            </div>
                                            <div className="flex -space-x-4">
                                                {(() => {
                                                    // STABILITY FIX C1: Type guard for brand_colors (prevents Font Bug-type errors)
                                                    const colors = Array.isArray(brandData?.brand_colors)
                                                        ? brandData.brand_colors.map((c: any) =>
                                                            typeof c === 'string' ? c : (c?.hex || c?.value || '#333')
                                                        )
                                                        : ['#333', '#555', '#777'];
                                                    return colors.slice(0, 3).map((color: string, i: number) => (
                                                        <div
                                                            key={i}
                                                            className="w-20 h-20 rounded-full border-4 border-[#1E1E1E] shadow-xl relative group cursor-pointer"
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded font-mono">
                                                                {color}
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                            <p className="mt-8 text-white/40 font-sans text-sm uppercase tracking-widest">Color Physics</p>
                                        </div>

                                        {/* BOTTOM CARD: THE HOOK */}
                                        <div className="md:col-span-3 bg-[#1E1E1E] border border-[#333] rounded-2xl p-10 text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFAD7A]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                            <p className="text-2xl md:text-3xl font-serif text-white/90 italic leading-relaxed">
                                                "{brandData?.bio || 'No slogan detected. The brand remains mysterious.'}"
                                            </p>
                                        </div>

                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1, duration: 1 }}
                                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce"
                                    >
                                        <span className="text-[#FFAD7A] text-xs uppercase tracking-widest mb-2 font-sans">Deploy</span>
                                        <ChevronDown className="text-white/50" />
                                    </motion.div>
                                </section>

                                {/* SECTION 2: BRAND DASHBOARD (The Dashboard) */}
                                <BrandDashboard brandData={brandData} />

                            </div>
                        )
                        }
                    </WorldSection>

                    {/* RIGHT SECTION: ABOUT (x: 100vw) - Revealed when panning LEFT */}
                    <WorldSection className="lava-background">
                        <AboutSection />
                    </WorldSection>
                </WorldContainer>
            </main >
        </div >
    );
}
