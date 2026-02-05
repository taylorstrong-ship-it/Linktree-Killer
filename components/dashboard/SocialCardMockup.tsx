'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Copy, Check } from 'lucide-react';

interface PostData {
    brandName: string;
    avatarUrl?: string;
    caption: string;
    timestamp: string;
    mediaPlaceholderType?: 'shimmer' | 'static';
}

interface SocialCardMockupProps {
    postData: PostData;
    isLoading?: boolean;
}

export default function SocialCardMockup({ postData, isLoading = false }: SocialCardMockupProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(postData.caption);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy caption:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-sm mx-auto"
        >
            {/* Container: 4:5 aspect ratio */}
            <div className="relative bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <div className="aspect-[4/5]">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {postData.avatarUrl ? (
                                <img
                                    src={postData.avatarUrl}
                                    alt={postData.brandName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-semibold text-sm">
                                    {postData.brandName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Brand Name & Timestamp */}
                        <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm">{postData.brandName}</h3>
                            <p className="text-zinc-500 text-xs">{postData.timestamp}</p>
                        </div>
                    </div>

                    {/* Media Placeholder: 4:5 aspect ratio */}
                    <div className="relative aspect-[4/5] bg-zinc-800/50 overflow-hidden">
                        {isLoading || postData.mediaPlaceholderType === 'shimmer' ? (
                            <DiagonalShimmer />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-zinc-600 text-sm">Media Preview</span>
                            </div>
                        )}
                    </div>

                    {/* Footer/Actions */}
                    <div className="p-4 space-y-3">
                        {/* Action Icons */}
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLike}
                                className="focus:outline-none"
                            >
                                <motion.div
                                    animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Heart
                                        className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                                            }`}
                                    />
                                </motion.div>
                            </motion.button>

                            <button className="focus:outline-none">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </button>

                            <button className="focus:outline-none">
                                <Share2 className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Caption with Copy Button */}
                        <div className="relative">
                            <p className="text-zinc-300 text-sm leading-relaxed pr-8">
                                {postData.caption}
                            </p>

                            {/* Copy Button - Absolute positioned */}
                            <button
                                onClick={handleCopy}
                                className="absolute top-0 right-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 
                          border border-white/10 transition-colors focus:outline-none focus:ring-2 
                          focus:ring-white/20"
                                title="Copy caption"
                            >
                                <AnimatePresence mode="wait">
                                    {isCopied ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 180 }}
                                        >
                                            <Check className="w-4 h-4 text-green-400" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <Copy className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {isCopied && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800/90 
                        border border-white/10 rounded-full backdrop-blur-xl"
                        >
                            <p className="text-white text-xs font-medium whitespace-nowrap">
                                Caption copied to clipboard
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Diagonal Shimmer Component (Linear-style skeleton loader)
function DiagonalShimmer() {
    return (
        <div className="relative w-full h-full bg-zinc-800/50 overflow-hidden">
            <motion.div
                className="absolute inset-0 -translate-x-full"
                animate={{
                    translateX: ['100%', '100%'],
                    translateY: ['-100%', '100%'],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                    width: '200%',
                    height: '200%',
                }}
            />
        </div>
    );
}
