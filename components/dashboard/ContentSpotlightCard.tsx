'use client';

import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface ContentSpotlightCardProps {
    imageUrl?: string;
    fallbackUrl?: string;
    brandName: string;
    primaryColor: string;
    description?: string;
}

/**
 * 🎬 Content Spotlight Card
 * 
 * Displays the brand's hero/lifestyle image with Ferrari aesthetic.
 * Uses best_image_url → avatar_url → gradient fallback.
 */
export default function ContentSpotlightCard({
    imageUrl,
    fallbackUrl,
    brandName,
    primaryColor,
    description
}: ContentSpotlightCardProps) {
    const finalImageUrl = imageUrl || fallbackUrl || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative group"
        >
            {/* Card Container */}
            <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl overflow-hidden hover:border-[#444] transition-all duration-500">

                {/* Image Section */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    {/* Ambient Glow */}
                    <div
                        className="absolute inset-0 opacity-20 blur-3xl"
                        style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}
                    />

                    {/* Image with Fallback */}
                    <ImageWithFallback
                        src={finalImageUrl}
                        alt={`${brandName} Content`}
                        brandName={brandName}
                        primaryColor={primaryColor}
                        className="w-full h-full object-cover"
                    />

                    {/* Glassmorphism Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Icon Badge */}
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
                        <ImageIcon className="w-4 h-4 text-white/80" />
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-6 space-y-3">
                    <h4 className="text-white font-bold text-lg font-sans">Brand Content Spotlight</h4>
                    <p className="text-white/50 text-sm font-sans leading-relaxed">
                        {description || 'Your premier visual identity — ready for campaigns, posts, and promotions.'}
                    </p>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 pt-2">
                        <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <span className="text-xs text-white/40 font-sans uppercase tracking-widest">
                            Active Asset
                        </span>
                    </div>
                </div>
            </div>

            {/* Hover Glow */}
            <div
                className="absolute -inset-4 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 -z-10"
                style={{ background: `radial-gradient(circle, ${primaryColor}, transparent)` }}
            />
        </motion.div>
    );
}
