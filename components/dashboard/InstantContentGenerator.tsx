'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SocialCardMockup from './SocialCardMockup';

type PostType = 'promo' | 'value' | 'lifestyle';

interface InstantContentGeneratorProps {
    brandName: string;
    industry: string;
    primaryColor: string;
}

interface CaptionData {
    title: string;
    body: string;
    hashtags: string[];
}

export default function InstantContentGenerator({
    brandName,
    industry,
    primaryColor,
}: InstantContentGeneratorProps) {
    const [activeTab, setActiveTab] = useState<PostType>('promo');
    const [isGenerating, setIsGenerating] = useState(false);
    const [displayedCaption, setDisplayedCaption] = useState('');
    const [fullCaption, setFullCaption] = useState('');

    // Generate post content based on type
    const generatePost = (type: PostType, brand: string): CaptionData => {
        const posts: Record<PostType, CaptionData> = {
            promo: {
                title: '🚨 Flash Sale Alert!',
                body: `${brand} is dropping prices for 24h only. Get premium quality at unbeatable prices. Don't miss out on this exclusive opportunity to elevate your game.`,
                hashtags: ['Sale', 'LimitedTime', brand.replace(/\s/g, ''), 'Exclusive'],
            },
            value: {
                title: '💡 Pro Tip',
                body: `Here's what sets ${brand} apart: We don't just deliver products, we deliver transformations. Every detail is crafted with precision to help you succeed.`,
                hashtags: ['Value', 'Quality', industry, 'ProTips'],
            },
            lifestyle: {
                title: '✨ Living the Dream',
                body: `This is what ${brand} is all about. Elevating your everyday moments into extraordinary experiences. Join thousands who've already made the switch.`,
                hashtags: ['Lifestyle', brand.replace(/\s/g, ''), 'Inspiration', 'Community'],
            },
        };

        return posts[type];
    };

    // Typewriter effect
    useEffect(() => {
        const caption = generatePost(activeTab, brandName);
        const fullText = `${caption.title}\n\n${caption.body}\n\n${caption.hashtags.map(tag => `#${tag}`).join(' ')}`;

        setFullCaption(fullText);
        setDisplayedCaption('');
        setIsGenerating(true);

        let currentIndex = 0;
        const typeInterval = setInterval(() => {
            if (currentIndex < fullText.length) {
                setDisplayedCaption(fullText.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsGenerating(false);
                clearInterval(typeInterval);
            }
        }, 15); // 15ms delay per character

        return () => clearInterval(typeInterval);
    }, [activeTab, brandName]);

    const tabs: { id: PostType; label: string; icon: string }[] = [
        { id: 'promo', label: 'Promo', icon: '🚨' },
        { id: 'value', label: 'Value', icon: '💡' },
        { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
    ];

    return (
        <div className="w-full">
            {/* Layout: Split on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls Section */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                            Instant Content Generator
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            AI-powered social posts tailored to <span className="text-white font-semibold">{brandName}</span>
                        </p>
                    </div>

                    {/* Segmented Control */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl">
                        <div className="grid grid-cols-3 gap-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                    ${activeTab === tab.id
                                            ? 'bg-white/10 text-white shadow-lg'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                        }
                  `}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}

                                    {/* Active indicator */}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
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

                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 text-sm">Status</span>
                                <div className="flex items-center gap-2">
                                    {isGenerating ? (
                                        <>
                                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                            <span className="text-orange-400 text-sm font-medium">Generating...</span>
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

                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-4">
                        <p className="text-orange-200/80 text-sm">
                            <span className="font-semibold text-orange-300">Pro Tip:</span> Click the copy button on the preview card to grab the caption for Instagram/LinkedIn.
                        </p>
                    </div>
                </div>

                {/* Preview Card Section */}
                <div className="flex items-start justify-center lg:pt-12">
                    <SocialCardMockup
                        postData={{
                            brandName,
                            avatarUrl: undefined, // Will show initial
                            caption: displayedCaption || 'Generating your perfect post...',
                            timestamp: 'Just now',
                            mediaPlaceholderType: isGenerating ? 'shimmer' : 'static',
                        }}
                        isLoading={isGenerating}
                    />
                </div>
            </div>
        </div>
    );
}
