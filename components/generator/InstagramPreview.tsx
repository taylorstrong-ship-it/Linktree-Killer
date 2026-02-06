'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Copy, Heart, MessageCircle, Send, Bookmark } from 'lucide-react'

interface BrandDNA {
    company_name?: string
    business_name?: string
    logo_url?: string
    og_image?: string
    hero_image?: string
}

interface InstagramPreviewProps {
    brandDNA: BrandDNA | null
    generatedImageUrl?: string
    caption?: string
    isLoading?: boolean
}

type TabType = 'post' | 'story' | 'caption'

export default function InstagramPreview({
    brandDNA,
    generatedImageUrl,
    caption = '',
    isLoading = false
}: InstagramPreviewProps) {
    const [activeTab, setActiveTab] = useState<TabType>('post')
    const [copied, setCopied] = useState(false)

    // Extract Brand DNA fields with fallbacks
    const handle = brandDNA?.business_name || brandDNA?.company_name || 'yourbrand'
    const avatar = brandDNA?.logo_url || brandDNA?.og_image || brandDNA?.hero_image

    const handleCopyCaption = async () => {
        if (!caption) return

        try {
            await navigator.clipboard.writeText(caption)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-4">
                {(['post', 'story', 'caption'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === tab
                            ? 'bg-[#FF6B35] text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Phone Mockup Container */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 shadow-2xl">
                {/* Instagram Header */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 border-2 border-[#FF6B35]">
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt={handle}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#00FF41] flex items-center justify-center text-white font-bold">
                                {handle.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{handle}</p>
                        <p className="text-gray-500 text-xs">Sponsored</p>
                    </div>
                    <button className="text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                        </svg>
                    </button>
                </div>

                {/* Content Area */}
                <div className="relative bg-black/50 rounded-xl overflow-hidden mb-3">
                    {activeTab === 'caption' ? (
                        // Caption View
                        <div className="p-6 min-h-[400px]">
                            {caption ? (
                                <div className="space-y-4">
                                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                                        {caption}
                                    </p>
                                    <button
                                        onClick={handleCopyCaption}
                                        className="mt-4 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    No caption generated yet
                                </div>
                            )}
                        </div>
                    ) : (
                        // Image View (Post or Story)
                        <>
                            {isLoading ? (
                                // Skeleton Loader with Diagonal Shimmer
                                <div className="relative bg-gradient-to-br from-white/5 to-white/10 overflow-hidden"
                                    style={{
                                        aspectRatio: activeTab === 'post' ? '1/1' : '9/16'
                                    }}
                                >
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                        style={{
                                            transform: 'translateX(-100%) rotate(-45deg)',
                                            animation: 'shimmer 2s ease-in-out infinite'
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-gray-500 text-sm">Tayloring...</div>
                                    </div>
                                </div>
                            ) : generatedImageUrl ? (
                                // Generated Image with Fade-in
                                <div className="relative animate-in fade-in duration-1000"
                                    style={{
                                        aspectRatio: activeTab === 'post' ? '1/1' : '9/16'
                                    }}
                                >
                                    <Image
                                        src={generatedImageUrl}
                                        alt="Generated content"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                // Placeholder
                                <div className="relative bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center"
                                    style={{
                                        aspectRatio: activeTab === 'post' ? '1/1' : '9/16'
                                    }}
                                >
                                    <div className="text-center p-6">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            Click Taylor to create your {activeTab}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Instagram Footer (Mock UI) */}
                {activeTab !== 'caption' && (
                    <div className="space-y-3">
                        {/* Action Buttons */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-4">
                                <Heart className="w-6 h-6 text-white cursor-pointer hover:text-[#FF6B35] transition-colors" />
                                <MessageCircle className="w-6 h-6 text-white cursor-pointer hover:text-[#FF6B35] transition-colors" />
                                <Send className="w-6 h-6 text-white cursor-pointer hover:text-[#FF6B35] transition-colors" />
                            </div>
                            <Bookmark className="w-6 h-6 text-white cursor-pointer hover:text-[#FF6B35] transition-colors" />
                        </div>

                        {/* Caption Preview (truncated) */}
                        {caption && (
                            <div className="px-1">
                                <p className="text-white text-sm">
                                    <span className="font-semibold">{handle}</span>{' '}
                                    <span className="text-gray-300">
                                        {caption.length > 80 ? caption.slice(0, 80) + '...' : caption}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Shimmer Keyframe Animation */}
            <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(-45deg);
          }
          100% {
            transform: translateX(200%) rotate(-45deg);
          }
        }
      `}</style>
        </div>
    )
}
