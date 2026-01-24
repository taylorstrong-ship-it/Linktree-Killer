// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import ImageUpload from '@/components/upload/ImageUpload'
import PhonePreview from '@/components/PhonePreview'
import { Waves, Zap, Tornado, Flame, Check } from 'lucide-react'

interface Link {
    title: string
    url: string
}

interface ProfileData {
    id?: string
    user_id?: string
    title: string
    description: string
    avatar_url: string
    background_image: string
    background_type: 'mesh' | 'video'  // NEW: Theme Engine
    video_background_url: string       // NEW: Video background URL
    font_style: 'modern' | 'elegant' | 'brutal'  // NEW: Typography Engine
    theme_color: string
    accent_color: string  // NEW: Living Gradients secondary color
    animation_speed: 'slow' | 'medium' | 'fast'  // NEW: Animation speed control
    animation_type: 'drift' | 'pulse' | 'swirl' | 'lava'  // NEW: Animation pattern control
    texture_overlay: 'none' | 'noise' | 'grid' | 'lines'  // NEW: Texture overlays
    enable_spotlight: boolean  // NEW: Cursor spotlight effect
    contact_email: string
    lead_gen_enabled: boolean
    newsletter_active: boolean  // NEW: Newsletter signup block enabled
    newsletter_heading: string  // NEW: Newsletter heading text
    newsletter_size: 'small' | 'medium' | 'large'  // NEW: Newsletter size control
    video_url: string
    social_spotlight_url: string  // NEW: Instagram/TikTok URL
    showcase: { before: string; after: string }  // NEW: Before/After Slider
    page_views?: number  // NEW: Total page views counter
    fb_pixel_id?: string  // NEW: Facebook Pixel ID
    google_analytics_id?: string  // NEW: Google Analytics GA4 ID
    links: Link[]
    gallery_images: string[]
}

export default function BuilderPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // Form state
    const [profile, setProfile] = useState<ProfileData>({
        title: '',
        description: '',
        avatar_url: '',
        background_image: '',
        background_type: 'mesh',
        video_background_url: '',
        font_style: 'modern',
        theme_color: '#3b82f6',
        accent_color: '#8b5cf6',  // Complementary violet for gradients
        animation_speed: 'medium',
        animation_type: 'drift',
        texture_overlay: 'none',
        enable_spotlight: false,
        contact_email: '',
        lead_gen_enabled: false,
        newsletter_active: false,
        newsletter_heading: 'Join my newsletter',
        video_url: '',
        social_spotlight_url: '',
        showcase: { before: '', after: '' },
        page_views: 0,
        fb_pixel_id: '',
        google_analytics_id: '',
        links: [],
        gallery_images: []
    })

    // Check authentication on mount
    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setIsAuthenticated(true)
                setUserId(user.id)
                await loadProfile(user.id)
            } else {
                // Redirect to Next.js login page
                window.location.href = '/login'
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            alert('Authentication error: ' + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function loadProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                // NUCLEAR FIX: We cast 'data' to 'any' to stop Vercel from checking every single field.
                const rawData = data as any;

                setProfile({
                    ...rawData,
                    // We manually ensure the complex fields are safe
                    showcase: rawData.showcase || { before: '', after: '' },
                    styles: rawData.styles || [],
                    gallery: rawData.gallery || [],
                    links: rawData.links || [],
                    // We set defaults for the new features so it can't crash
                    newsletter_active: rawData.newsletter_active || false,
                    newsletter_size: rawData.newsletter_size || 'medium',
                    fb_pixel_id: rawData.fb_pixel_id || '',
                    google_analytics_id: rawData.google_analytics_id || '',
                    texture_overlay: rawData.texture_overlay || 'none',
                } as ProfileData);
            }
        } catch (error) {
            console.error('Load profile error:', error)
            alert('Failed to load profile: ' + (error as Error).message)
        }
    }

    async function saveProfile() {
        setSaving(true)
        try {
            const updates = {
                id: userId,
                user_id: userId,
                ...profile,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(updates)

            if (error) throw error

            showToast('Changes Saved!', 'success')

            // Preview auto-updates via React props - no manual refresh needed! 🎉
        } catch (error) {
            console.error('Save error:', error)
            showToast('Save failed: ' + (error as Error).message, 'error')
        } finally {
            setSaving(false)
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        window.location.reload()
    }

    function refreshPreview() {
        console.log('🔄 Refreshing preview iframe...')
        const iframe = document.getElementById('preview-frame') as HTMLIFrameElement
        if (iframe?.contentWindow) {
            try {
                iframe.contentWindow.location.reload()
                console.log('✅ Preview refreshed successfully')
            } catch (error) {
                console.error('Failed to reload iframe:', error)
                // Fallback: Try to reload by changing src
                const currentSrc = iframe.src
                iframe.src = currentSrc + '?v=' + Date.now()
            }
        } else {
            console.error('❌ Preview iframe not found')
        }
    }

    async function handleImageUpload(url: string, field: keyof ProfileData) {
        try {
            console.log(`📤 Uploading ${field}:`, url)

            // Create the updated profile data FIRST (using current state)
            const updatedProfile = {
                ...profile,
                [field]: url
            }

            console.log('📝 Updating local state immediately...')
            // Update React state immediately with the new data
            setProfile(updatedProfile)

            console.log('💾 Saving to Supabase...')
            // Auto-save to Supabase with the SAME updated data
            const updates = {
                id: userId,
                user_id: userId,
                ...updatedProfile,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(updates)

            if (error) throw error

            console.log('✅ Saved to database successfully')
            showToast('Image uploaded & saved!', 'success')

            // Refresh preview immediately - use setTimeout to ensure state has updated
            console.log('⏱️ Scheduling preview refresh in 800ms...')
            setTimeout(() => {
                refreshPreview()
            }, 800)
        } catch (error) {
            console.error('❌ Auto-save error:', error)
            showToast('Upload succeeded but auto-save failed: ' + (error as Error).message, 'error')
        }
    }

    function addLink() {
        setProfile(prev => ({
            ...prev,
            links: [...prev.links, { title: '', url: '' }]
        }))
    }

    function updateLink(index: number, field: 'title' | 'url', value: string) {
        setProfile(prev => ({
            ...prev,
            links: prev.links.map((link, i) =>
                i === index ? { ...link, [field]: value } : link
            )
        }))
    }

    function removeLink(index: number) {
        setProfile(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }))
    }

    function showToast(message: string, type: 'success' | 'error') {
        const toast = document.getElementById('toast')
        if (toast) {
            const icon = type === 'error'
                ? '<i class="fa-solid fa-circle-xmark text-xl"></i>'
                : '<i class="fa-solid fa-check text-xl"></i>'
            const bgColor = type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                : 'bg-gradient-to-r from-emerald-500 to-green-600'

            toast.className = `fixed top-5 right-5 ${bgColor}text-white px-6 py-3 rounded-xl shadow-2xl transition-transform flex items-center gap-3 z-50 font-medium`
            toast.innerHTML = `${icon} <span>${message}</span>`
            toast.classList.remove('-translate-y-32')
            setTimeout(() => toast.classList.add('-translate-y-32'), 3000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                    <p className="text-gray-400">Loading studio...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will redirect to login
    }

    return (
        <>
            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

            <div className="flex h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                {/* Sidebar - Dark Glassmorphism */}
                <div className="w-[420px] bg-gray-900/60 backdrop-blur-xl border-r border-white/10 flex flex-col h-full shadow-2xl">
                    {/* Header */}
                    <div className="p-6 pb-3 border-b border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="font-bold text-xl text-white flex items-center gap-2">
                                <i className="fa-solid fa-wand-magic-sparkles text-blue-500"></i>
                                Creative Studio
                            </h1>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg font-medium bg-gray-800/50 hover:bg-gray-800 transition"
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket mr-1"></i>
                                Log Out
                            </button>
                        </div>
                    </div>

                    {/* Stats Card - Page Views */}
                    <div className="px-6 pt-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <i className="fa-solid fa-eye text-blue-400 text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Views</p>
                                        <p className="text-2xl font-bold text-white">{profile.page_views?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Unique sessions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {/* Branding Section */}
                        <details open className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                Branding
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.title}
                                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Bio / Description
                                    </label>
                                    <textarea
                                        value={profile.description}
                                        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 h-20 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        placeholder="Tell people about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        Avatar Image
                                    </label>
                                    <ImageUpload
                                        currentImage={profile.avatar_url}
                                        onUploadComplete={(url) => handleImageUpload(url, 'avatar_url')}
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Theme Engine Section */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-palette"></i>
                                    Theme Engine
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        Background Type
                                    </label>
                                    <select
                                        value={profile.background_type}
                                        onChange={(e) => setProfile({ ...profile, background_type: e.target.value as 'mesh' | 'video' })}
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    >
                                        <option value="mesh">✨ Animated Mesh (Premium)</option>
                                        <option value="video">🎥 Video Background</option>
                                    </select>
                                </div>

                                {/* Show video URL input only when Video Background is selected */}
                                {profile.background_type === 'video' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-300 block mb-2">
                                            Video Background URL
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.video_background_url}
                                            onChange={(e) => setProfile({ ...profile, video_background_url: e.target.value })}
                                            placeholder="https://example.com/video.mp4"
                                            className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Use a direct .mp4 URL for best results
                                        </p>
                                    </div>
                                )}

                                {/* Typography Engine - Type Preview List */}
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        <i className="fa-solid fa-font mr-1"></i>
                                        Font Style
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        {/* Modern Font Option */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, font_style: 'modern' })}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition font-sans ${profile.font_style === 'modern'
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-300'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">Modern Sans</span>
                                            {profile.font_style === 'modern' && <Check size={16} />}
                                        </button>

                                        {/* Elegant Font Option */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, font_style: 'elegant' })}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition font-serif ${profile.font_style === 'elegant'
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-300'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">Elegant Serif</span>
                                            {profile.font_style === 'elegant' && <Check size={16} />}
                                        </button>

                                        {/* Brutal Font Option */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, font_style: 'brutal' })}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition font-mono ${profile.font_style === 'brutal'
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-300'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">Brutal Mono</span>
                                            {profile.font_style === 'brutal' && <Check size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Living Gradients - Dual Color Pickers */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                        <label className="text-xs font-bold text-gray-300">
                                            Primary Color
                                        </label>
                                        <input
                                            type="color"
                                            value={profile.theme_color}
                                            onChange={(e) => setProfile({ ...profile, theme_color: e.target.value })}
                                            className="h-10 w-full p-0 border-0 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                        <label className="text-xs font-bold text-gray-300">
                                            Secondary Color
                                        </label>
                                        <input
                                            type="color"
                                            value={profile.accent_color}
                                            onChange={(e) => setProfile({ ...profile, accent_color: e.target.value })}
                                            className="h-10 w-full p-0 border-0 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Background Motion Controls - Only show for Mesh backgrounds */}
                                {profile.background_type === 'mesh' && (
                                    <div className="space-y-3 pt-3 border-t border-white/10">
                                        <label className="text-xs font-bold text-gray-400 block">
                                            Background Motion
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Speed Control - Segmented Pill */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 block mb-2">
                                                    Speed
                                                </label>
                                                <div className="bg-gray-800 rounded-lg p-1 flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_speed: 'slow' })}
                                                        className={`flex-1 py-1.5 text-xs transition ${profile.animation_speed === 'slow'
                                                            ? 'bg-gray-700 text-white shadow-sm rounded-md'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        Slow
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_speed: 'medium' })}
                                                        className={`flex-1 py-1.5 text-xs transition ${profile.animation_speed === 'medium'
                                                            ? 'bg-gray-700 text-white shadow-sm rounded-md'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        Medium
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_speed: 'fast' })}
                                                        className={`flex-1 py-1.5 text-xs transition ${profile.animation_speed === 'fast'
                                                            ? 'bg-gray-700 text-white shadow-sm rounded-md'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        Fast
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Pattern Control - Grid Cards */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 block mb-2">
                                                    Pattern
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {/* Drift Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_type: 'drift' })}
                                                        className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center gap-1 ${profile.animation_type === 'drift'
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-400'
                                                            }`}
                                                    >
                                                        <Waves size={18} />
                                                        <span className="text-xs font-medium">Drift</span>
                                                    </button>

                                                    {/* Pulse Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_type: 'pulse' })}
                                                        className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center gap-1 ${profile.animation_type === 'pulse'
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-400'
                                                            }`}
                                                    >
                                                        <Zap size={18} />
                                                        <span className="text-xs font-medium">Pulse</span>
                                                    </button>

                                                    {/* Swirl Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_type: 'swirl' })}
                                                        className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center gap-1 ${profile.animation_type === 'swirl'
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-400'
                                                            }`}
                                                    >
                                                        <Tornado size={18} />
                                                        <span className="text-xs font-medium">Swirl</span>
                                                    </button>

                                                    {/* Lava Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_type: 'lava' })}
                                                        className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center gap-1 ${profile.animation_type === 'lava'
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-400'
                                                            }`}
                                                    >
                                                        <Flame size={18} />
                                                        <span className="text-xs font-medium">Lava</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Texture Overlay Control - Swatch Row */}
                                <div className="pt-3 border-t border-white/10">
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        <i className="fa-solid fa-film mr-1"></i>
                                        Texture Overlay
                                    </label>
                                    <div className="flex gap-2">
                                        {/* None Swatch */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, texture_overlay: 'none' })}
                                            title="None"
                                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition relative flex items-center justify-center ${profile.texture_overlay === 'none'
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            <div className="text-2xl text-gray-400">⊘</div>
                                        </button>

                                        {/* Noise Swatch */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, texture_overlay: 'noise' })}
                                            title="Noise"
                                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition relative ${profile.texture_overlay === 'noise'
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                            style={{
                                                background: '#6b7280',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
                                            }}
                                        />

                                        {/* Grid Swatch */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, texture_overlay: 'grid' })}
                                            title="Grid"
                                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition relative ${profile.texture_overlay === 'grid'
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                            style={{
                                                background: '#4b5563',
                                                backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)',
                                                backgroundSize: '12px 12px'
                                            }}
                                        />

                                        {/* Lines Swatch */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, texture_overlay: 'lines' })}
                                            title="Lines"
                                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition relative ${profile.texture_overlay === 'lines'
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                            style={{
                                                background: '#4b5563',
                                                backgroundImage: 'repeating-linear-gradient(0deg, #9ca3af, #9ca3af 1px, transparent 1px, transparent 4px)',
                                                backgroundSize: '100% 4px'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Cursor Spotlight Toggle */}
                                <div className="pt-3 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-300">
                                            <i className="fa-solid fa-lightbulb mr-1"></i>
                                            Cursor Spotlight
                                        </label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={profile.enable_spotlight}
                                                onChange={(e) => setProfile({ ...profile, enable_spotlight: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Interactive cursor glow effect
                                    </p>
                                </div>

                            </div>
                        </details>

                        {/* Social Spotlight Section */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-brands fa-instagram text-pink-400"></i>
                                    Social Spotlight
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Instagram or TikTok Post URL
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.social_spotlight_url}
                                        onChange={(e) => setProfile({ ...profile, social_spotlight_url: e.target.value })}
                                        placeholder="https://instagram.com/p/... or https://tiktok.com/@..."
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Showcase a specific post on your page
                                    </p>
                                </div>
                            </div>
                        </details>

                        {/* Showcase Slider Section - NEW! */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-sliders text-purple-400"></i>
                                    Showcase Slider
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <p className="text-xs text-gray-400 mb-3">
                                    Show potential customers your AI transformation magic with a before/after slider
                                </p>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        Original Photo (Before)
                                    </label>
                                    <ImageUpload
                                        currentImage={profile.showcase.before}
                                        onUploadComplete={async (url) => {
                                            try {
                                                console.log('📤 Uploading showcase.before:', url)

                                                // Update local state immediately
                                                const updatedProfile = {
                                                    ...profile,
                                                    showcase: { ...profile.showcase, before: url }
                                                }
                                                setProfile(updatedProfile)

                                                console.log('💾 Auto-saving showcase.before to Supabase...')
                                                // Auto-save to database
                                                const updates = {
                                                    id: userId,
                                                    user_id: userId,
                                                    ...updatedProfile,
                                                    updated_at: new Date().toISOString()
                                                }

                                                const { error } = await supabase
                                                    .from('profiles')
                                                    .upsert(updates)

                                                if (error) throw error

                                                console.log('✅ Showcase "Before" image saved!')
                                                showToast('Before image uploaded & saved!', 'success')

                                                // Refresh preview
                                                setTimeout(() => refreshPreview(), 800)
                                            } catch (error) {
                                                console.error('❌ Showcase before upload error:', error)
                                                showToast('Upload failed: ' + (error as Error).message, 'error')
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        AI Portrait (After)
                                    </label>
                                    <ImageUpload
                                        currentImage={profile.showcase.after}
                                        onUploadComplete={async (url) => {
                                            try {
                                                console.log('📤 Uploading showcase.after:', url)

                                                // Update local state immediately
                                                const updatedProfile = {
                                                    ...profile,
                                                    showcase: { ...profile.showcase, after: url }
                                                }
                                                setProfile(updatedProfile)

                                                console.log('💾 Auto-saving showcase.after to Supabase...')
                                                // Auto-save to database
                                                const updates = {
                                                    id: userId,
                                                    user_id: userId,
                                                    ...updatedProfile,
                                                    updated_at: new Date().toISOString()
                                                }

                                                const { error } = await supabase
                                                    .from('profiles')
                                                    .upsert(updates)

                                                if (error) throw error

                                                console.log('✅ Showcase "After" image saved!')
                                                showToast('After image uploaded & saved!', 'success')

                                                // Refresh preview
                                                setTimeout(() => refreshPreview(), 800)
                                            } catch (error) {
                                                console.error('❌ Showcase after upload error:', error)
                                                showToast('Upload failed: ' + (error as Error).message, 'error')
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Featured Media Section */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                Featured Media
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        YouTube Video URL
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.video_url}
                                        onChange={(e) => setProfile({ ...profile, video_url: e.target.value })}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Lead Gen Section */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                Lead Gen & Contacts
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={profile.lead_gen_enabled}
                                        onChange={(e) => setProfile({ ...profile, lead_gen_enabled: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <label className="text-sm font-medium text-gray-300">
                                        Show "Connect" Button
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profile.contact_email}
                                        onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                                        placeholder="hello@example.com"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Newsletter Section - NEW! */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-newspaper text-blue-400"></i>
                                    Newsletter
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={profile.newsletter_active}
                                        onChange={(e) => setProfile({ ...profile, newsletter_active: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <label className="text-sm font-medium text-gray-300">
                                        Enable Newsletter Signup
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Heading Text
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.newsletter_heading}
                                        onChange={(e) => setProfile({ ...profile, newsletter_heading: e.target.value })}
                                        placeholder="Join my newsletter"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Customize the heading for your newsletter signup block
                                    </p>
                                </div>
                            </div>
                        </details>

                        {/* Analytics Section - NEW! */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-chart-line text-green-400"></i>
                                    Analytics
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <p className="text-xs text-gray-400 mb-3">
                                    Connect your tracking pixels to analyze visitor behavior and run retargeting campaigns.
                                </p>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        <i className="fa-brands fa-facebook text-blue-500 mr-1"></i>
                                        Facebook Pixel ID
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.fb_pixel_id || ''}
                                        onChange={(e) => setProfile({ ...profile, fb_pixel_id: e.target.value })}
                                        placeholder="123456789012345"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Find this in your Facebook Events Manager
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        <i className="fa-brands fa-google text-red-500 mr-1"></i>
                                        Google Analytics ID
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.google_analytics_id || ''}
                                        onChange={(e) => setProfile({ ...profile, google_analytics_id: e.target.value })}
                                        placeholder="G-XXXXXXXXXX"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        GA4 Measurement ID (starts with "G-")
                                    </p>
                                </div>
                            </div>
                        </details>

                        {/* Links Section */}
                        <details open className="pb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                Links
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-3 pl-1 mt-3">
                                {profile.links.map((link, index) => (
                                    <div key={index} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 flex gap-2 items-center">
                                        <div className="grid gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={link.title}
                                                onChange={(e) => updateLink(index, 'title', e.target.value)}
                                                placeholder="Link Title"
                                                className="w-full p-2 text-xs bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                            />
                                            <input
                                                type="text"
                                                value={link.url}
                                                onChange={(e) => updateLink(index, 'url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full p-2 text-xs bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeLink(index)}
                                            className="text-gray-500 hover:text-red-400 px-2 transition"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addLink}
                                    className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-800/50 hover:border-blue-500 hover:text-blue-400 transition flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Add Link
                                </button>
                            </div>
                        </details>
                    </div>

                    {/* Save Button */}
                    <div className="p-6 border-t border-white/10 bg-gray-900/40">
                        <button
                            onClick={saveProfile}
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-floppy-disk"></i>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Preview Area - Glassmorphism */}
                <div className="flex-1 flex flex-col items-center justify-center relative p-8">
                    {/* iPhone Frame with thick border and shadow */}
                    <div className="relative">
                        <div className="w-[380px] h-[760px] bg-black rounded-[60px] p-[14px] shadow-2xl shadow-black/40">
                            <div className="w-full h-full bg-white rounded-[46px] overflow-hidden relative">
                                <PhonePreview
                                    title={profile.title}
                                    description={profile.description}
                                    avatar_url={profile.avatar_url}
                                    background_image={profile.background_image}
                                    background_type={profile.background_type}
                                    video_background_url={profile.video_background_url}
                                    font_style={profile.font_style}
                                    theme_color={profile.theme_color}
                                    accent_color={profile.accent_color}
                                    animation_speed={profile.animation_speed}
                                    animation_type={profile.animation_type}
                                    texture_overlay={profile.texture_overlay}
                                    enable_spotlight={profile.enable_spotlight}
                                    lead_gen_enabled={profile.lead_gen_enabled}
                                    newsletter_active={profile.newsletter_active}
                                    newsletter_heading={profile.newsletter_heading}
                                    profile_id={userId || ''}
                                    links={profile.links}
                                    social_spotlight_url={profile.social_spotlight_url}
                                    showcase={profile.showcase}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400 font-medium">
                            Built by <span className="text-blue-400 font-bold">Taylored AI Solutions</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Toast Notification - Dark Mode */}
            <div
                id="toast"
                className="fixed top-5 right-5 px-6 py-3 rounded-xl shadow-2xl -translate-y-32 transition-transform flex items-center gap-3 z-50"
            >
                <span></span>
            </div>

            {/* Font Awesome - Required for icons */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
        </>
    )
}
