'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import ImageSelector from '@/components/studio/ImageSelector'
import VariationCarousel from '@/components/studio/VariationCarousel'
import { Sparkles, Wand2, CheckCircle } from 'lucide-react'

interface BrandDNA {
    company_name?: string
    business_name?: string
    logo_url?: string
    og_image?: string
    hero_image?: string
    primary_color?: string
    secondary_color?: string
    accent_color?: string
    brand_personality?: string[]
    business_type?: string
    brand_images?: string[]
}

interface Variation {
    id: string
    imageUrl: string
    layout: string
    caption?: string
}

function GeneratorPageContent() {
    const searchParams = useSearchParams()

    const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    // Content Studio state
    const [selectedImage, setSelectedImage] = useState<string>('')
    const [imageSource, setImageSource] = useState<'upload' | 'brand'>('brand')
    const [prompt, setPrompt] = useState('')
    const [variations, setVariations] = useState<Variation[]>([])

    // Load Brand DNA on mount
    useEffect(() => {
        async function loadBrandDNA() {
            try {
                console.log('🔍 Loading Brand DNA...')

                // Check localStorage first
                const localData = localStorage.getItem('taylored_brand_data')
                if (localData) {
                    const parsed = JSON.parse(localData)
                    console.log('✅ Brand DNA loaded from localStorage')
                    setBrandDNA(parsed)
                    setLoading(false)
                    return
                }

                // Fallback to Supabase for authenticated users
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    console.log('🔐 Fetching from Supabase...')
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (data && !error) {
                        const transformedDNA: BrandDNA = {
                            company_name: data.title,
                            business_name: data.title,
                            logo_url: data.avatar_url,
                            primary_color: data.theme_color,
                            secondary_color: data.accent_color,
                            brand_images: []
                        }
                        setBrandDNA(transformedDNA)
                        setLoading(false)
                        return
                    }
                }

                console.log('⚠️ No Brand DNA found')
                setBrandDNA(null)
                setLoading(false)
            } catch (err) {
                console.error('Error loading Brand DNA:', err)
                setLoading(false)
            }
        }

        loadBrandDNA()
    }, [])

    async function handleGenerate() {
        if (!selectedImage) {
            alert('Please select or upload an image first')
            return
        }

        if (!prompt.trim()) {
            alert('Please enter what you want to promote')
            return
        }

        if (!brandDNA) {
            alert('Brand DNA not loaded. Please scan your website first.')
            window.location.href = '/'
            return
        }

        setGenerating(true)
        setVariations([])

        try {
            console.log('🎨 Generating post via Edge Function...', { prompt, image: selectedImage })

            // Call Supabase Edge Function
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-social-post`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({
                        user_image_url: selectedImage,
                        caption_text: prompt,
                        brand_dna: {
                            company_name: brandDNA.company_name || brandDNA.business_name,
                            colors: {
                                primary: brandDNA.primary_color || '#FF6B35',
                                secondary: brandDNA.secondary_color || '#1a1a1a',
                                accent: brandDNA.accent_color || '#00FF41'
                            },
                            typography: {
                                heading: 'Bold Sans-serif',
                                body: 'Clean Sans-serif'
                            },
                            business_type: brandDNA.business_type || 'Restaurant'
                        },
                        format: 'instagram_post'
                    })
                }
            )

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Generation failed:', errorText)
                throw new Error(`Edge Function returned ${response.status}`)
            }

            const result = await response.json()
            console.log('✅ Generated:', result)

            // Edge Function returns single image, create variation
            const variation: Variation = {
                id: `v1-${Date.now()}`,
                imageUrl: result.image_url,
                layout: 'AI Enhanced',
                caption: result.caption || prompt
            }

            setVariations([variation])

        } catch (err) {
            console.error('❌ Generation error:', err)
            alert('Failed to generate post. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    function handleDownload(variation: Variation) {
        console.log('📥 Downloaded:', variation.id)
    }

    function handleRegenerate() {
        handleGenerate()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-[#FF6B35] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your brand...</p>
                </div>
            </div>
        )
    }

    if (!brandDNA) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Brand DNA Required</h2>
                    <p className="text-gray-400 mb-6">Please scan your website first to extract your brand identity.</p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#00FF41] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        Scan Your Brand
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#00FF41] flex items-center justify-center">
                                <Wand2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Content Studio</h1>
                                <p className="text-sm text-gray-500">
                                    {brandDNA.company_name || brandDNA.business_name || 'Your Brand'}
                                    <CheckCircle className="inline w-3 h-3 ml-1 text-[#00FF41]" />
                                </p>
                            </div>
                        </div>
                        <a
                            href="/"
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Controls */}
                    <div className="space-y-6">
                        {/* Image Selection */}
                        <ImageSelector
                            brandImages={brandDNA.brand_images || []}
                            onImageSelected={(url, source) => {
                                setSelectedImage(url)
                                setImageSource(source)
                            }}
                            selectedImage={selectedImage}
                        />

                        {/* Prompt Input */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">What's the Special?</h3>
                                    <p className="text-gray-500 text-sm">Type your promotion or message</p>
                                </div>
                            </div>

                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 50% off rigatoni tonight!"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-[#FF6B35] focus:outline-none resize-none"
                                rows={3}
                            />

                            <button
                                onClick={handleGenerate}
                                disabled={!selectedImage || !prompt.trim() || generating}
                                className="w-full mt-4 bg-gradient-to-r from-[#FF6B35] to-[#00FF41] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Generating Magic...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate 5 Posts (~10s)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview / Variations */}
                    <div>
                        {variations.length > 0 ? (
                            <VariationCarousel
                                variations={variations}
                                onDownload={handleDownload}
                                onRegenerate={handleRegenerate}
                            />
                        ) : (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center h-full flex items-center justify-center">
                                <div className="max-w-md">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Create</h3>
                                    <p className="text-gray-400 text-sm">
                                        Select an image and type your message to generate 5 professional Instagram posts
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function GeneratorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white/20 border-t-[#FF6B35] rounded-full animate-spin"></div>
            </div>
        }>
            <GeneratorPageContent />
        </Suspense>
    )
}
