'use client'

import { useState } from 'react'
import { Download, RefreshCw, Check } from 'lucide-react'

interface Variation {
    id: string
    imageUrl: string
    layout: string
    caption?: string
}

interface VariationCarouselProps {
    variations: Variation[]
    onDownload: (variation: Variation) => void
    onRegenerate?: () => void
}

export default function VariationCarousel({ variations, onDownload, onRegenerate }: VariationCarouselProps) {
    const [selectedIdx, setSelectedIdx] = useState(0)
    const [downloading, setDownloading] = useState<string | null>(null)

    async function handleDownload(variation: Variation) {
        setDownloading(variation.id)

        try {
            // Download the image
            const response = await fetch(variation.imageUrl)
            const blob = await response.blob()

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `taylored-post-${variation.id}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            onDownload(variation)
        } catch (err) {
            console.error('Download failed:', err)
            alert('Download failed. Please try again.')
        } finally {
            setDownloading(null)
        }
    }

    if (variations.length === 0) {
        return null
    }

    const selectedVariation = variations[selectedIdx]

    return (
        <div className="space-y-6">
            {/* Main Preview */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-white font-semibold">Your Generated Posts</h3>
                        <p className="text-gray-500 text-sm">{variations.length} variations created</p>
                    </div>
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Regenerate
                        </button>
                    )}
                </div>

                {/* Selected Image Preview */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black mb-4">
                    <img
                        src={selectedVariation.imageUrl}
                        alt={`Variation ${selectedIdx + 1}`}
                        className="w-full h-full object-contain"
                    />

                    {/* Layout Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg text-xs text-gray-300">
                        {selectedVariation.layout}
                    </div>
                </div>

                {/* Caption */}
                {selectedVariation.caption && (
                    <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-4">
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedVariation.caption}
                        </p>
                    </div>
                )}

                {/* Download Button */}
                <button
                    onClick={() => handleDownload(selectedVariation)}
                    disabled={downloading === selectedVariation.id}
                    className="w-full bg-gradient-to-r from-[#FF6B35] to-[#00FF41] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                    {downloading === selectedVariation.id ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Download PNG
                        </>
                    )}
                </button>
            </div>

            {/* Variation Thumbnails */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                <div className="grid grid-cols-5 gap-3">
                    {variations.map((variation, idx) => (
                        <button
                            key={variation.id}
                            onClick={() => setSelectedIdx(idx)}
                            className={`
                                relative aspect-square rounded-lg overflow-hidden
                                transition-all group
                                ${selectedIdx === idx
                                    ? 'ring-2 ring-[#00FF41] ring-offset-2 ring-offset-[#0a0a0a]'
                                    : 'hover:ring-2 hover:ring-[#FF6B35] hover:ring-offset-2 hover:ring-offset-[#0a0a0a] opacity-60 hover:opacity-100'
                                }
                            `}
                        >
                            <img
                                src={variation.imageUrl}
                                alt={`Variation ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Selection Indicator */}
                            {selectedIdx === idx && (
                                <div className="absolute inset-0 bg-[#00FF41]/10 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-[#00FF41] flex items-center justify-center">
                                        <Check className="w-4 h-4 text-black" />
                                    </div>
                                </div>
                            )}

                            {/* Variation Number */}
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center">
                                <span className="text-[10px] text-white font-medium">{idx + 1}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
