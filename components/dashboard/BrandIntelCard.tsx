'use client';

import { motion } from 'framer-motion';
import { Star, CheckCircle, Instagram, Facebook, TrendingUp, Sparkles } from 'lucide-react';
import type { BrandDNA } from '@/lib/type-guards';

interface BrandIntelCardProps {
    brandDNA: BrandDNA;
}

export default function BrandIntelCard({ brandDNA }: BrandIntelCardProps) {
    const intel = brandDNA.business_intel;
    const socials = brandDNA.social_links;

    // Extract Instagram handle from URL
    const extractHandle = (url: string): string => {
        const match = url.match(/instagram\.com\/([^/?]+)/);
        return match ? match[1] : url;
    };

    // Check if we have any intel to show
    const hasSignatureItems = intel?.signature_items && intel.signature_items.length > 0;
    const hasArchetype = !!intel?.archetype;
    const hasPriceRange = !!intel?.price_range;
    const hasAtmosphere = !!intel?.atmosphere;
    const hasInsiderTips = intel?.insider_tips && intel.insider_tips.length > 0;
    const hasSocials = socials && Object.keys(socials).length > 0;

    // Don't render if no intel
    const hasAnyIntel = hasSignatureItems || hasArchetype || hasPriceRange || hasAtmosphere || hasInsiderTips || hasSocials;
    if (!hasAnyIntel) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Brand Intelligence
                </h2>
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <span className="text-green-400 text-xs font-medium">AI Verified</span>
                </div>
            </div>

            {/* Social Media Section */}
            {hasSocials && (
                <div className="mb-6 pb-6 border-b border-white/5">
                    <p className="text-zinc-400 text-xs mb-3">Social Presence</p>
                    <div className="space-y-2">
                        {socials?.instagram && !socials.instagram.includes('wix.com') && !socials.instagram.includes('template') && (
                            <a
                                href={socials.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 group hover:bg-white/5 p-2 rounded-lg transition-colors"
                            >
                                <Instagram className="w-4 h-4 text-pink-500" />
                                <span className="text-white text-sm group-hover:text-pink-400 transition-colors">
                                    @{extractHandle(socials.instagram)}
                                </span>
                                <CheckCircle className="w-3 h-3 text-green-400 ml-auto" />
                            </a>
                        )}
                        {socials?.facebook && !socials.facebook.includes('wix.com') && !socials.facebook.includes('template') && (
                            <a
                                href={socials.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 group hover:bg-white/5 p-2 rounded-lg transition-colors"
                            >
                                <Facebook className="w-4 h-4 text-blue-500" />
                                <span className="text-white text-sm group-hover:text-blue-400 transition-colors">Facebook</span>
                                <CheckCircle className="w-3 h-3 text-green-400 ml-auto" />
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Signature Items */}
            {hasSignatureItems && (
                <div className="mb-6">
                    <p className="text-zinc-400 text-xs mb-3 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" />
                        Signature Items
                    </p>
                    <div className="space-y-2">
                        {intel!.signature_items!.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <span className="text-white text-sm leading-tight">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Insider Tip */}
            {hasInsiderTips && (
                <div className="mb-6 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                    <p className="text-yellow-400 text-xs mb-1 font-medium">💡 Insider Tip</p>
                    <p className="text-white text-sm italic">"{intel!.insider_tips![0]}"</p>
                </div>
            )}

            {/* Quick Facts Grid */}
            {(hasArchetype || hasPriceRange || hasAtmosphere) && (
                <div className="grid grid-cols-2 gap-4">
                    {hasArchetype && (
                        <div>
                            <p className="text-zinc-400 text-xs mb-1">Archetype</p>
                            <p className="text-white text-sm font-medium">{intel!.archetype}</p>
                        </div>
                    )}
                    {hasPriceRange && (
                        <div>
                            <p className="text-zinc-400 text-xs mb-1">Price Range</p>
                            <p className="text-white text-sm font-medium">{intel!.price_range}</p>
                        </div>
                    )}
                    {hasAtmosphere && (
                        <div className="col-span-2">
                            <p className="text-zinc-400 text-xs mb-1">Atmosphere</p>
                            <p className="text-white text-sm font-medium">{intel!.atmosphere}</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
