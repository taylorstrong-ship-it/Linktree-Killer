'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import InstagramPreview from '@/components/generator/InstagramPreview'
import { Sparkles, Zap, TrendingUp } from 'lucide-react'

interface BrandDNA {
    company_name?: string
    business_name?: string
    logo_url?: string
    og_image?: string
    hero_image?: string
    primary_color?: string
    secondary_color?: string
    brand_personality?: string[]
}

export default function GeneratorPage() {
    const searchParams = useSearchParams()

    const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    // Form state - Initialize from URL params if bridge from dashboard
    const [prompt, setPrompt] = useState(searchParams.get('prompt') || '')
    const [vibe, setVibe] = useState<'professional' | 'energetic' | 'minimal'>(
        (searchParams.get('vibe')?.toLowerCase() as 'professional' | 'energetic' | 'minimal') || 'professional'
    )
    const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'linkedin'>('instagram')

    // Generated content state - Pre-load from dashboard if remixing
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(searchParams.get('image') || undefined)
    const [generatedCaption, setGeneratedCaption] = useState('')

    // Load Brand DNA on mount (Smart Fallback: localStorage → Supabase)
    useEffect(() => {
        async function loadBrandDNA() {
            try {
                console.log('🔍 Loading Brand DNA...')

                // STEP 1: Check localStorage (Guest Mode - Primary source)
                const localData = localStorage.getItem('taylored_brand_data')
                if (localData) {
                    const parsed = JSON.parse(localData)
                    console.log('✅ Brand DNA loaded from localStorage')
                    setBrandDNA(parsed)
                    setLoading(false)
                    return
                }

                // STEP 2: Check Supabase (Authenticated users)
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    console.log('🔐 Authenticated user detected, fetching from Supabase...')
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (data && !error) {
                        console.log('✅ Brand DNA loaded from Supabase')
                        // Transform profile data to Brand DNA format
                        const transformedDNA: BrandDNA = {
                            company_name: data.title,
                            business_name: data.title,
                            logo_url: data.avatar_url,
                            primary_color: data.theme_color,
                            secondary_color: data.accent_color
                        }
                        setBrandDNA(transformedDNA)
                        setLoading(false)
                        return
                    }
                }

                // STEP 3: No data found - user needs to scan
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

    // Load Remix data if coming from SocialPreviewWidget
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const isRemix = searchParams.get('remix') === 'true'

        if (isRemix) {
            console.log('🎨 Remix mode activated - loading saved preview data...')

            // Load the saved social preview image from localStorage
            const savedImage = localStorage.getItem('social_preview_draft')
            if (savedImage) {
                setGeneratedImageUrl(savedImage)
                console.log('✅ Loaded remix image from localStorage')
            }

            // Set a default prompt for remix
            const brandName = brandDNA?.company_name || brandDNA?.business_name || 'Your Brand'
            setPrompt(`Remix this design for ${brandName}`)
        }
    }, [brandDNA])

    async function handleGenerate() {
        if (!prompt.trim()) {
            alert('Please enter a prompt')
            return
        }

        if (!brandDNA) {
            alert('Please scan your brand first')
            window.location.href = '/'
            return
        }

        setGenerating(true)

        try {
            // TODO: Replace with actual API call to your generation endpoint
            // For now, simulate the generation process
            console.log('🎨 Generating content...', { prompt, vibe, platform, brandDNA })

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Mock generated content
            setGeneratedImageUrl('https://picsum.photos/1080/1080?random=' + Date.now())
            setGeneratedCaption(`🚀 ${prompt}\n\n✨ Generated with AI\n\n#${brandDNA.company_name?.replace(/\s+/g, '')} #${vibe}`)

        } catch (err) {
            console.error('Generation failed:', err)
            alert('Failed to generate content. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-[#FF6B35]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-[#FF6B35] rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-400 font-sans">Loading generator...</p>
                </div>
            </div>
        )
    }

    // No Brand DNA - Show CTA
    if (!brandDNA) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
                <div className="max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-[#FF6B35]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Scan Your Brand First</h1>
                        <p className="text-gray-400">
                            We need your brand DNA to create content that feels authentically yours.
                        </p>
                    </div>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        <Zap className="w-5 h-5" />
                        Start Brand Scan
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] bg-gradient-to-br from-[#050505] via-slate-900 to-[#050505]">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#00FF41] flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Post Generator</h1>
                                <p className="text-xs text-gray-500">Powered by {brandDNA.company_name || 'Your Brand'}</p>
                            </div>
                        </div>
                        <a
                            href="/"
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content - Command Center Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column: Command Center (60% on desktop) */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Brand Context Card */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                {brandDNA.logo_url && (
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5">
                                        <img
                                            src={brandDNA.logo_url}
                                            alt={brandDNA.company_name || 'Brand'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-white font-semibold">{brandDNA.company_name || 'Your Brand'}</h2>
                                    <p className="text-gray-500 text-sm">Brand DNA Loaded</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex items-center gap-2 text-[#00FF41] text-sm">
                                        <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></div>
                                        Active
                                    </div>
                                </div>
                            </div>

                            {/* Brand Personality Tags */}
                            {brandDNA.brand_personality && brandDNA.brand_personality.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {brandDNA.brand_personality.slice(0, 3).map((trait, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400"
                                        >
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Prompt Input */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <label className="block mb-3">
                                <span className="text-white font-semibold mb-2 block">What are you promoting?</span>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., New product launch, behind-the-scenes, customer testimonial..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none"
                                    rows={4}
                                />
                            </label>
                        </div>

                        {/* Vibe Selector */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4">Content Vibe</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {(['professional', 'energetic', 'minimal'] as const).map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setVibe(v)}
                                        className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${vibe === v
                                            ? 'bg-[#FF6B35] text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Platform Selector */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4">Target Platform</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {(['instagram', 'tiktok', 'linkedin'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${platform === p
                                            ? 'bg-[#FF6B35] text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !prompt.trim()}
                            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#00FF41] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#FF6B35]/20"
                        >
                            {generating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="w-5 h-5" />
                                    Generate Content
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column: Live Preview (40% on desktop) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-8">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></div>
                                Live Preview
                            </h3>
                            <InstagramPreview
                                brandDNA={brandDNA}
                                generatedImageUrl={generatedImageUrl}
                                caption={generatedCaption}
                                isLoading={generating}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
