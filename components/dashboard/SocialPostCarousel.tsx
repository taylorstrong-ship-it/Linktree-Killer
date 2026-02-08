'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SocialPost {
    type: string;
    caption: string;
    visual_description: string;
    cta: string;
    hashtags: string[];
    // NEW: Visual assets
    original_image_url?: string;
    enhanced_image_url?: string;
}

interface Props {
    posts: SocialPost[];
}

export function SocialPostCarousel({ posts }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!posts || posts.length === 0) {
        return null;
    }

    const next = () => setCurrentIndex((i) => (i + 1) % posts.length);
    const prev = () => setCurrentIndex((i) => (i - 1 + posts.length) % posts.length);

    const currentPost = posts[currentIndex];

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Main Image */}
            <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden relative group">
                {currentPost.enhanced_image_url || currentPost.original_image_url ? (
                    <img
                        src={currentPost.enhanced_image_url || currentPost.original_image_url}
                        alt={currentPost.visual_description}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <div className="text-center px-6">
                            <p className="text-sm font-medium mb-2">{currentPost.visual_description}</p>
                            <p className="text-xs text-zinc-700">Image will be generated</p>
                        </div>
                    </div>
                )}

                {/* Navigation Arrows - Always Visible */}
                {posts.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm hover:bg-red-600/90 border border-white/10 p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                            aria-label="Previous post"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>

                        <button
                            onClick={next}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm hover:bg-red-600/90 border border-white/10 p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                            aria-label="Next post"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </>
                )}
            </div>

            {/* Post Content */}
            <div className="mt-4 space-y-3">
                {/* Caption */}
                <p className="text-sm text-zinc-300 leading-relaxed">{currentPost.caption}</p>

                {/* CTA */}
                {currentPost.cta && (
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-400">
                        {currentPost.cta}
                        <span className="text-red-500">→</span>
                    </div>
                )}

                {/* Hashtags */}
                {currentPost.hashtags && currentPost.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {currentPost.hashtags.map((tag) => (
                            <span key={tag} className="text-xs text-zinc-500">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Dots Indicator */}
            {posts.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {posts.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition ${idx === currentIndex ? 'bg-red-500' : 'bg-zinc-700 hover:bg-zinc-600'
                                }`}
                            aria-label={`View post ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
