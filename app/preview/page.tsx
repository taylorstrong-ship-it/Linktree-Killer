'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Fingerprint, ArrowRight, Lock } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function PreviewPage() {
    const router = useRouter();
    const [brandData, setBrandData] = useState<any>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load brandDNA from localStorage
        const storedData = localStorage.getItem('taylored_brand_data');
        if (storedData) {
            setBrandData(JSON.parse(storedData));
        } else {
            // No data, redirect back to homepage
            router.push('/');
        }
        setLoading(false);
    }, [router]);

    const handleClaim = () => {
        setShowAuthModal(true);
    };

    const handleAuthSuccess = () => {
        // After successful auth, redirect to dashboard
        router.push('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-white/60 animate-pulse">Loading preview...</div>
            </div>
        );
    }

    if (!brandData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">
                            <span className="text-white">Taylored</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600"> AI</span>
                        </h1>
                    </div>
                    <button
                        onClick={handleClaim}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 
                                 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                    >
                        Claim Your Space
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Your Taylored Preview
                    </h2>
                    <p className="text-white/60 text-lg">
                        We've analyzed <span className="text-orange-500 font-semibold">{brandData.title}</span> and created your custom brand presence
                    </p>
                </motion.div>

                {/* Preview Grid */}
                <div className="grid lg:grid-cols-2 gap-8 mb-24">
                    {/* Link in Bio Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Sparkles className="w-5 h-5 text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-bold">Your Link in Bio</h3>
                        </div>
                        
                        {/* Mini Preview */}
                        <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                            {/* Avatar */}
                            {brandData.avatar_url && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={brandData.avatar_url}
                                        alt={brandData.title}
                                        className="w-20 h-20 rounded-full border-2"
                                        style={{ borderColor: brandData.theme_color }}
                                    />
                                </div>
                            )}
                            
                            {/* Title & Bio */}
                            <div className="text-center mb-6">
                                <h4 className="text-xl font-bold mb-2">{brandData.title}</h4>
                                <p className="text-white/60 text-sm">{brandData.bio}</p>
                            </div>

                            {/* Links */}
                            <div className="space-y-2">
                                {brandData.links.slice(0, 3).map((link: any, i: number) => (
                                    <div
                                        key={i}
                                        className="p-3 bg-white/5 rounded-lg text-center text-sm border border-white/10"
                                    >
                                        {link.title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleClaim}
                            className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg 
                                     font-medium transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            <Lock className="w-4 h-4" />
                            Unlock Full Builder
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                    </motion.div>

                    {/* Social Card Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Fingerprint className="w-5 h-5 text-purple-500" />
                            </div>
                            <h3 className="text-2xl font-bold">Your Brand DNA</h3>
                        </div>

                        {/* Brand Stats */}
                        <div className="space-y-4">
                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                <div className="text-white/60 text-sm mb-1">Brand Colors</div>
                                <div className="flex gap-2">
                                    {brandData.brand_colors.map((color: string, i: number) => (
                                        <div
                                            key={i}
                                            className="w-12 h-12 rounded-lg border-2 border-white/20"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                <div className="text-white/60 text-sm mb-1">Typography</div>
                                <div className="flex flex-wrap gap-2">
                                    {brandData.fonts.map((font: string, i: number) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-white/5 rounded-full text-sm border border-white/10"
                                        >
                                            {font}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                <div className="text-white/60 text-sm mb-1">Primary Action</div>
                                <div className="text-white font-medium">
                                    {brandData.links[0]?.title || 'Get Started'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleClaim}
                            className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg 
                                     font-medium transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            <Lock className="w-4 h-4" />
                            Generate Social Posts
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                    </motion.div>
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <div className="inline-block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl">
                        <h3 className="text-3xl font-bold mb-4">
                            Ready to claim your Taylored space?
                        </h3>
                        <p className="text-white/60 mb-6">
                            Sign up now to save your brand profile, generate unlimited content, and launch your custom link-in-bio.
                        </p>
                        <button
                            onClick={handleClaim}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 
                                     rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 
                                     shadow-lg shadow-orange-500/25"
                        >
                            Claim Your Taylored Space →
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Sticky Claim Button (Mobile) */}
            <div className="fixed bottom-6 right-6 lg:hidden z-50">
                <button
                    onClick={handleClaim}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 
                             rounded-full font-bold shadow-xl shadow-orange-500/50 transition-all duration-200 hover:scale-110 
                             flex items-center gap-2"
                >
                    <Sparkles className="w-5 h-5" />
                    Claim Now
                </button>
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal 
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            )}
        </div>
    );
}
