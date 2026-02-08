'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SwipeablePostCarousel from './SwipeablePostCarousel';
import type { BrandDNA } from '@/lib/type-guards';

interface InstantContentGeneratorProps {
    brandDNA: BrandDNA;
}

export default function InstantContentGenerator({
    brandDNA,
}: InstantContentGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    // Extract data from Brand DNA
    const brandName = brandDNA.company_name || 'Your Brand';
    const industry = brandDNA.business_type || brandDNA.industry || 'Business';
    const primaryColor = brandDNA.primary_color || '#FFAD7A';
    const visualPosts = brandDNA.visual_social_posts;
    const brandImages = brandDNA.brand_images || [];
    const deepSoul = brandDNA.business_intel;

    // Simulate generation state on mount
    useEffect(() => {
        setIsGenerating(true);
        const timer = setTimeout(() => setIsGenerating(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Check if we have visual posts to display
    const hasVisualPosts = visualPosts && visualPosts.length > 0;

    return (
        <div className="w-full">
            {/* Layout: Split on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls Section */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                            Instagram Content Generator
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            AI-powered visual posts tailored to <span className="text-white font-semibold">{brandName}</span>
                        </p>
                    </div>

                    {/* Brand Context */}
                    <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-white font-semibold text-sm">Brand Context</h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 text-sm">Industry</span>
                                <span className="text-white text-sm font-medium">{industry}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 text-sm">Brand Color</span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-5 h-5 rounded-full border border-white/20"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                    <span className="text-white text-sm font-mono">{primaryColor}</span>
                                </div>
                            </div>

                            {deepSoul?.atmosphere && (
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400 text-sm">Atmosphere</span>
                                    <span className="text-white text-sm font-medium">{deepSoul.atmosphere}</span>
                                </div>
                            )}

                            {deepSoul?.archetype && (
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400 text-sm">Archetype</span>
                                    <span className="text-white text-sm font-medium">{deepSoul.archetype}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 text-sm">Status</span>
                                <div className="flex items-center gap-2">
                                    {isGenerating ? (
                                        <>
                                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                            <span className="text-orange-400 text-sm font-medium">Tayloring...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                                            <span className="text-green-400 text-sm font-medium">Ready</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deep Soul Intelligence Card */}
                    {deepSoul && (
                        <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                <span className="text-lg">🧠</span> Deep Soul Intelligence
                            </h3>

                            {deepSoul.signature_items && deepSoul.signature_items.length > 0 && (
                                <div>
                                    <p className="text-zinc-400 text-xs mb-2">Signature Items:</p>
                                    <div className="space-y-1">
                                        {deepSoul.signature_items.slice(0, 3).map((item, idx) => (
                                            <p key={idx} className="text-white text-sm">• {item}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {deepSoul.insider_tips && deepSoul.insider_tips.length > 0 && (
                                <div>
                                    <p className="text-zinc-400 text-xs mb-2">Insider Tips:</p>
                                    <div className="space-y-1">
                                        {deepSoul.insider_tips.map((tip, idx) => (
                                            <p key={idx} className="text-white/80 text-xs italic">💡 {tip}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-4">
                        <p className="text-orange-200/80 text-sm">
                            <span className="font-semibold text-orange-300">Pro Tip:</span> Use the arrows to browse {hasVisualPosts ? visualPosts.length : 3} different post variations. Each uses real brand photos and Deep Soul intelligence.
                        </p>
                    </div>
                </div>

                {/* Preview Card Section */}
                <div className="flex items-start justify-center lg:pt-12">
                    {hasVisualPosts ? (
                        <SwipeablePostCarousel
                            posts={visualPosts}
                            brandImages={brandImages}
                            brandName={brandName}
                            primaryColor={primaryColor}
                        />
                    ) : (
                        <div className="text-center py-12 px-6 bg-white/5 border border-white/10 rounded-2xl max-w-md">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">📸</span>
                                </div>
                                <h3 className="text-white font-semibold mb-2">No Visual Posts Yet</h3>
                                <p className="text-white/60 text-sm">
                                    Visual social posts will appear here once Brand DNA extraction completes with real photos.
                                </p>
                            </div>

                            {brandImages.length > 0 && (
                                <p className="text-white/40 text-xs mt-4">
                                    Found {brandImages.length} brand image{brandImages.length === 1 ? '' : 's'} • Generating posts...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
