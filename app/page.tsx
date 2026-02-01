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

// --- HYBRID DNA INTERFACE (STORY MODE) ---

export default function Home() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [brandData, setBrandData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

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
        setError(null);
        setIsScanning(true);

        try {
            console.log('📡 Calling Brand DNA API:', targetUrl);

            // Call the new /api/brand-dna endpoint with CTA detection
            const response = await fetch('/api/brand-dna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl }),
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Brand DNA extraction failed');
            }

            // Transform Brand DNA response to match Builder expectations
            const transformedData = {
                username: result.dna.businessName.toLowerCase().replace(/\s+/g, ''),
                title: result.dna.businessName,
                bio: result.dna.description,
                description: result.dna.description, // Builder checks both bio and description
                theme_color: result.dna.colors.primary,
                brand_colors: [result.dna.colors.primary, result.dna.colors.secondary],
                fonts: ['Inter'], // Default for now
                avatar_url: '', // Will be added in next update
                // CRITICAL: Builder expects 'links', not 'social_links'
                links: result.dna.cta_buttons.map((btn: any) => ({
                    title: btn.title,
                    url: btn.url
                })),
                // Keep full DNA for future use (social extraction, etc.)
                dna: result.dna
            };

            console.log('✅ Brand DNA extracted:', transformedData);
            setBrandData(transformedData);
        } catch (err: any) {
            console.error('⚠️ API Failed. Activating Simulation Mode...', err);

            // SIMULATION CORE: Offline Mode Fallback
            setTimeout(() => {
                console.log('⚠️ API Blocked. Switching to Simulation Data.');

                // INJECT COMPLETE MOCK DATA
                const simulationData = {
                    username: 'neuralcoffee',
                    title: 'Neural Coffee Co.',
                    bio: 'Artisan coffee roasted by AI. Where machine learning meets morning rituals. ☕🤖',
                    theme_color: '#1a1a1a',
                    avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=neuralcoffee&backgroundColor=d4e79e',
                    fonts: ['Playfair Display', 'Inter'],
                    brand_colors: ['#1a1a1a', '#FFAD7A', '#8b7355', '#ffffff'],
                    social_links: [
                        { platform: 'instagram' as const, url: 'https://instagram.com/neuralcoffee', label: 'Follow on Instagram' },
                        { platform: 'tiktok' as const, url: 'https://tiktok.com/@neuralcoffee', label: 'TikTok' },
                        { platform: 'generic' as const, url: 'https://neuralcoffee.com/menu', label: 'View Menu' }
                    ]
                };

                setBrandData(simulationData);
                setIsScanning(false);
                setError(null); // Clear error to show success
            }, 3000); // 3s delay to simulate "Let Him Cook"
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

            <MatrixOverlay isScanning={isScanning} onComplete={handleMatrixComplete} />

            {/* HEADER - Minimal */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="w-8 h-8 bg-[#FFAD7A] rounded-lg flex items-center justify-center font-bold text-lg text-[#121212] shadow-lg shadow-[#FFAD7A]/20">T</div>
                    <span className="font-bold tracking-tight font-sans"><span className="text-[#FFAD7A]">Taylored AI Solutions</span> Hub</span>
                </div>
            </header>

            <main className="w-full">

                {/* HERO: INPUT MODE */}
                {!scanComplete ? (
                    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
                        {/* Ambient Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

                        <div className="relative z-10 text-center space-y-8 max-w-4xl">
                            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight text-white/90">
                                AI, <span className="italic text-[#FFAD7A]">Taylored</span> to Your Exact Vibe.
                            </h1>
                            <p className="text-xl text-white/40 font-sans font-light max-w-2xl mx-auto">
                                Everyone's got access to <span className="text-[#FFAD7A] font-medium">AI</span>. What you need are <span className="text-[#FFAD7A] font-medium">Taylored AI</span> solutions that don't sound like generic <span className="text-[#FFAD7A] font-medium">AI</span> slop.
                            </p>


                            <div className="relative w-full max-w-xl mx-auto mt-12">
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
                                            className="bg-[#FFAD7A] text-[#121212] hover:bg-[#FFAD7A] font-sans font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,65,0.5)] hover:shadow-[0_0_30px_rgba(0,255,65,0.8)]"
                                        >
                                            {isScanning ? 'Stitching...' : 'Stitch My Vibe'}
                                        </button>
                                    </div>
                                </form>


                                {/* 🖍️ FAT NEON ARROW (Centered BELOW the Input) */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-8 pointer-events-none z-10">
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
                                        {brandData?.fonts?.[0] || 'Modern Sans'}
                                    </p>
                                </div>

                                {/* CARD 3: PALETTE */}
                                <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl p-8 flex flex-col items-center justify-center relative aspect-square md:aspect-auto">
                                    <div className="absolute top-4 right-4 text-[#FFAD7A]/20">
                                        <Palette className="w-6 h-6" />
                                    </div>
                                    <div className="flex -space-x-4">
                                        {(brandData?.brand_colors || ['#333', '#555', '#777']).slice(0, 3).map((color: string, i: number) => (
                                            <div
                                                key={i}
                                                className="w-20 h-20 rounded-full border-4 border-[#1E1E1E] shadow-xl relative group cursor-pointer"
                                                style={{ backgroundColor: color }}
                                            >
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded font-mono">
                                                    {color}
                                                </div>
                                            </div>
                                        ))}
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

                        {/* SECTION 2: THE INSTANT RESULT (Scroll Reveal) */}
                        <section className="min-h-screen w-full bg-[#0a0a0a] relative z-20 py-24 px-6">
                            <div className="max-w-7xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    className="text-center mb-24"
                                >
                                    <h2 className="text-5xl md:text-7xl font-sans font-bold text-white tracking-tighter">Ready to <span className="text-[#FFAD7A]">Launch.</span></h2>
                                    <p className="mt-6 text-xl text-white/50 font-sans max-w-2xl mx-auto">
                                        We've synthesized your assets into a deployment-ready ecosystem.
                                    </p>
                                </motion.div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-start">

                                    {/* LEFT: PHONE PREVIEW (Sticky) */}
                                    <div className="lg:sticky lg:top-32 flex justify-center">
                                        <div className="relative group" onClick={handleLaunch}>
                                            <div className="absolute -inset-4 bg-[#FFAD7A] rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                            <div className="relative transform transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1 cursor-pointer">
                                                {/* Reusing BioLinkBuilder but wrapping it to isolate the phone visual if possible, 
                                                    or just rendering it. The component might have its own layout. 
                                                    Let's use the component but constrain it. */}
                                                <div className="bg-[#111] p-4 rounded-[3rem] border-8 border-[#333] shadow-2xl">
                                                    <BioLinkBuilder brandData={brandData} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: AD CREATIVES + ACTIONS */}
                                    <div className="space-y-12">
                                        <div className="bg-[#1E1E1E] border border-[#333] rounded-3xl p-8">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="p-3 bg-[#FFAD7A]/10 rounded-xl text-[#FFAD7A]">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold font-sans text-white">Campaign Generator</h3>
                                                    <p className="text-white/40 text-sm">AI-Generated Social Assets</p>
                                                </div>
                                            </div>
                                            <AdCampaignGenerator />
                                        </div>

                                        {/* FINAL CTA */}
                                        <div className="text-center py-12">
                                            <button
                                                onClick={() => { setScanComplete(false); setUrl(''); window.scrollTo(0, 0); }}
                                                className="text-white/30 hover:text-white transition-colors font-sans text-sm uppercase tracking-widest border-b border-transparent hover:border-white pb-1"
                                            >
                                                Reset Matrix & Decrypt New Target
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </section>

                    </div>
                )
                }
            </main >
        </div >
    );
}
