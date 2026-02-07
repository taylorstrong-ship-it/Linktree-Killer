'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Copy, Check, Bookmark, Download } from 'lucide-react';

interface PostData {
    brandName: string;
    avatarUrl?: string;
    caption: string;
    imageUrl?: string; // The generated/enhanced image
    originalImageUrl?: string; // The original user upload (for comparison)
    timestamp?: string;
    showComparison?: boolean; // Enable before/after slider
    mediaPlaceholderType?: 'shimmer' | 'static'; // Animation type for loading state
}

interface SocialCardMockupProps {
    postData: PostData;
    isLoading?: boolean;
    onCaptionChange?: (newCaption: string) => void;
}

export default function SocialCardMockup({ postData, isLoading = false, onCaptionChange }: SocialCardMockupProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [caption, setCaption] = useState(postData.caption);

    const triggerHaptic = () => {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        triggerHaptic();
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        triggerHaptic();
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(caption);
            setIsCopied(true);
            triggerHaptic();
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy caption:', err);
        }
    };

    const handleDownload = async () => {
        try {
            const imageToDownload = postData.imageUrl;
            if (!imageToDownload) return;

            const response = await fetch(imageToDownload);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${postData.brandName.replace(/\s+/g, '_')}_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            triggerHaptic();
        } catch (err) {
            console.error('Failed to download image:', err);
        }
    };

    const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newCaption = e.target.value;
        setCaption(newCaption);
        if (onCaptionChange) {
            onCaptionChange(newCaption);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full mx-auto"
        >
            {/* Container: Instagram-style card with shadow */}
            <div className="relative bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {postData.avatarUrl ? (
                                <img
                                    src={postData.avatarUrl}
                                    alt={postData.brandName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-semibold text-xs">
                                    {postData.brandName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Brand Name */}
                        <h3 className="font-semibold text-white text-sm">{postData.brandName}</h3>
                    </div>

                    {/* Menu Icon */}
                    <button className="text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                        </svg>
                    </button>
                </div>

                {/* Media Area with Comparison Slider */}
                <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                    {isLoading ? (
                        <DiagonalShimmer />
                    ) : postData.imageUrl ? (
                        <>
                            {/* Main Image */}
                            <motion.img
                                src={showOriginal && postData.originalImageUrl ? postData.originalImageUrl : postData.imageUrl}
                                alt="Generated content"
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />

                            {/* Comparison Controls (if original exists) */}
                            {postData.showComparison && postData.originalImageUrl && (
                                <div className="absolute inset-0 flex items-end justify-center p-4">
                                    <motion.button
                                        onPointerDown={() => setShowOriginal(true)}
                                        onPointerUp={() => setShowOriginal(false)}
                                        onPointerLeave={() => setShowOriginal(false)}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full text-white text-sm font-medium shadow-xl"
                                    >
                                        {showOriginal ? '👀 Original' : '👆 Press to Compare'}
                                    </motion.button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-zinc-600 text-sm">Preview will appear here</span>
                        </div>
                    )}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        {/* Like Button */}
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
                                    className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`}
                                />
                            </motion.div>
                        </motion.button>

                        {/* Comment */}
                        <button className="focus:outline-none">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </button>

                        {/* Share */}
                        <button className="focus:outline-none">
                            <Share2 className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Download Button */}
                        {postData.imageUrl && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDownload}
                                className="focus:outline-none"
                            >
                                <Download className="w-5 h-5 text-white" />
                            </motion.button>
                        )}

                        {/* Bookmark */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleBookmark}
                            className="focus:outline-none"
                        >
                            <Bookmark
                                className={`w-6 h-6 ${isBookmarked ? 'text-white fill-white' : 'text-white'}`}
                            />
                        </motion.button>
                    </div>
                </div>

                {/* Caption Area */}
                <div className="p-3 space-y-2">
                    {/* Likes */}
                    <p className="text-white text-sm font-medium">
                        Liked by <span className="font-semibold">you</span> and <span className="font-semibold">others</span>
                    </p>

                    {/* Editable Caption with Copy Button */}
                    <div className="relative">
                        <textarea
                            value={caption}
                            onChange={handleCaptionChange}
                            className="w-full pr-10 bg-transparent text-white text-sm leading-relaxed resize-none focus:outline-none"
                            rows={3}
                            placeholder="Write your caption..."
                            style={{ fontSize: '16px' }} // Prevents iOS zoom
                        />

                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className="absolute top-1 right-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none"
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

                    {/* Timestamp */}
                    {postData.timestamp && (
                        <p className="text-zinc-500 text-xs uppercase">{postData.timestamp}</p>
                    )}
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {isCopied && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800/90 border border-white/10 rounded-full backdrop-blur-xl"
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
                className="absolute inset-0"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255,107,53,0.1) 50%, transparent 100%)',
                    backgroundSize: '200% 200%',
                }}
            />
        </div>
    );
}
