'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SocialCardMockup from './SocialCardMockup';
import type { BrandDNA } from '@/lib/type-guards';

interface SwipeablePostCarouselProps {
    posts: BrandDNA['visual_social_posts'];
    brandImages: string[];
    brandName: string;
    primaryColor?: string;
}

export default function SwipeablePostCarousel({
    posts,
    brandImages,
    brandName,
    primaryColor = '#FFAD7A'
}: SwipeablePostCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right

    // Fallback if no posts provided
    const displayPosts = posts && posts.length > 0 ? posts : [];

    if (displayPosts.length === 0) {
        return (
            <div className="text-center py-12 px-6 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-white/60 text-sm">
                    No visual posts available. Generate some first!
                </p>
            </div>
        );
    }

    const handlePrevious = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev === 0 ? displayPosts.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev === displayPosts.length - 1 ? 0 : prev + 1));
    };

    const currentPost = displayPosts[activeIndex];

    // Determine image to display (enhanced > original > brand image fallback)
    const displayImage = currentPost.enhanced_image_url ||
        currentPost.original_image_url ||
        brandImages[activeIndex % brandImages.length] ||
        undefined;

    // Slide animations
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    return (
        <div className="relative w-full">
            {/* Main Carousel Container */}
            <div className="relative overflow-hidden rounded-2xl">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={activeIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        className="flex justify-center"
                    >
                        <SocialCardMockup
                            postData={{
                                brandName,
                                avatarUrl: displayImage,
                                caption: currentPost.caption,
                                timestamp: 'Just now',
                                mediaPlaceholderType: 'static',
                                imageUrl: displayImage,
                            }}
                            isLoading={false}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
                <button
                    onClick={handlePrevious}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
                    aria-label="Previous post"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={handleNext}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
                    aria-label="Next post"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex items-center justify-center gap-2 mt-6">
                {displayPosts.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > activeIndex ? 1 : -1);
                            setActiveIndex(index);
                        }}
                        className="group relative"
                        aria-label={`Go to post ${index + 1}`}
                    >
                        <div
                            className={`
                                w-2 h-2 rounded-full transition-all duration-300
                                ${index === activeIndex
                                    ? 'bg-white scale-125'
                                    : 'bg-white/30 hover:bg-white/50'
                                }
                            `}
                        />

                        {/* Tooltip showing post number */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {index + 1}/{displayPosts.length}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Post Type Label */}
            <div className="text-center mt-4">
                <span className="text-white/40 text-xs uppercase tracking-wider">
                    {currentPost.type || 'Social Post'} • {activeIndex + 1}/{displayPosts.length}
                </span>
            </div>
        </div>
    );
}
