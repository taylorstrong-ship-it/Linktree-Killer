'use client'

import React from 'react'
import LivingBackground from './LivingBackground'
import CompareSlider from './CompareSlider'
import NewsletterForm from './NewsletterForm'

interface Link {
    title: string
    url: string
}

interface PhonePreviewProps {
    title: string
    description: string
    avatar_url: string
    background_image: string
    background_type: 'mesh' | 'video'
    video_background_url: string
    font_style: 'modern' | 'elegant' | 'brutal'  // NEW: Typography Engine
    theme_color: string
    accent_color: string  // NEW: Living Gradients secondary color
    animation_speed: 'slow' | 'medium' | 'fast'
    animation_type: 'drift' | 'pulse' | 'swirl' | 'lava'
    texture_overlay: 'none' | 'noise' | 'grid' | 'lines'  // NEW: Texture overlays
    enable_spotlight: boolean  // NEW: Cursor spotlight effect
    lead_gen_enabled: boolean
    newsletter_active?: boolean  // NEW: Newsletter signup enabled
    newsletter_heading?: string  // NEW: Newsletter heading text
    profile_id?: string  // NEW: Profile ID for linking subscribers
    links: Link[]
    social_spotlight_url?: string
    showcase?: { before: string; after: string }
}

export default function PhonePreview({
    title,
    description,
    avatar_url,
    background_image,
    background_type,
    video_background_url,
    font_style,  // NEW
    theme_color,
    accent_color,  // NEW
    animation_speed,
    animation_type,
    texture_overlay,  // NEW
    enable_spotlight,  // NEW
    lead_gen_enabled,
    newsletter_active,  // NEW
    newsletter_heading,  // NEW
    profile_id,  // NEW
    links,
    social_spotlight_url,
    showcase
}: PhonePreviewProps) {
    // State for cursor tracking (for spotlight effect)
    const [cursorX, setCursorX] = React.useState(0)
    const [cursorY, setCursorY] = React.useState(0)

    // Track mouse/touch position for spotlight
    React.useEffect(() => {
        if (!enable_spotlight) return

        const handleMouseMove = (e: MouseEvent) => {
            setCursorX(e.clientX)
            setCursorY(e.clientY)
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                setCursorX(e.touches[0].clientX)
                setCursorY(e.touches[0].clientY)
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('touchmove', handleTouchMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('touchmove', handleTouchMove)
        }
    }, [enable_spotlight])

    // Helper function to convert hex color to rgba with alpha
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Get font family based on selected font style
    const getFontFamily = (style: 'modern' | 'elegant' | 'brutal') => {
        switch (style) {
            case 'modern':
                return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            case 'elegant':
                return "'Playfair Display', Georgia, serif"
            case 'brutal':
                return "'Space Mono', 'Courier New', monospace"
        }
    }

    // Generate texture overlay styles based on selection
    const getTextureStyle = (texture: 'none' | 'noise' | 'grid' | 'lines'): React.CSSProperties => {
        switch (texture) {
            case 'noise':
                // Base64 noise pattern
                return {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    opacity: 0.2,
                    mixBlendMode: 'overlay' as const,
                }
            case 'grid':
                // Radial gradient dot pattern
                return {
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3,
                }
            case 'lines':
                // Repeating linear-gradient TV scanlines
                return {
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
                    backgroundSize: '100% 2px',
                    opacity: 0.5,
                }
            default:
                return {}
        }
    }

    // Generate complementary colors for mesh gradient
    const getMeshColors = (baseColor: string) => {
        // Extract RGB from hex
        const r = parseInt(baseColor.slice(1, 3), 16)
        const g = parseInt(baseColor.slice(3, 5), 16)
        const b = parseInt(baseColor.slice(5, 7), 16)

        // Create 3 color variations
        return [
            baseColor,
            `rgb(${Math.min(r + 40, 255)}, ${Math.max(g - 20, 0)}, ${Math.min(b + 60, 255)})`,
            `rgb(${Math.max(r - 30, 0)}, ${Math.min(g + 50, 255)}, ${Math.max(b - 40, 0)})`,
            `rgb(${Math.min(r + 20, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 80, 255)})`
        ]
    }

    const meshColors = getMeshColors(theme_color || '#3b82f6')

    // Spotlight background style
    const spotlightStyle: React.CSSProperties = enable_spotlight ? {
        background: `radial-gradient(600px circle at ${cursorX}px ${cursorY}px, rgba(255,255,255,0.1), transparent 40%)`
    } : {}

    return (
        <div
            className="w-full h-full relative overflow-hidden"
            style={{
                fontFamily: getFontFamily(font_style),
                ...spotlightStyle
            }}
        >
            {/* BACKGROUND LAYER - Behind everything */}
            <div className="absolute inset-0 z-0">
                {background_type === 'mesh' ? (
                    /* Living Gradients Background */
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                        <LivingBackground
                            primaryColor={theme_color || '#3b82f6'}
                            secondaryColor={accent_color || '#8b5cf6'}
                            animationSpeed={animation_speed}
                            animationType={animation_type}
                        />
                        {/* Backdrop blur overlay for readability */}
                        <div className="absolute inset-0 backdrop-blur-sm" />
                    </>
                ) : (
                    /* Video Background */
                    <>
                        {video_background_url && (
                            <video
                                src={video_background_url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-black/40" />
                    </>
                )}
            </div>

            {/* TEXTURE OVERLAY - Above background, below content */}
            {texture_overlay !== 'none' && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={getTextureStyle(texture_overlay)}
                />
            )}

            {/* CONTENT LAYER - Above background */}
            <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto pt-16">
                {/* Profile Section */}
                <div className="flex flex-col items-center px-6 pb-8">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center mb-4">
                        {avatar_url ? (
                            <img
                                src={avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg className="w-12 h-12 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        )}
                    </div>

                    {/* Title and Bio */}
                    <h1 className="text-2xl font-bold text-white text-center mb-2 drop-shadow-lg">
                        {title || 'My Link Page'}
                    </h1>
                    <p className="text-sm text-white/90 text-center mb-6 drop-shadow-md">
                        {description || 'Welcome to my page!'}
                    </p>

                    {/* Connect Button */}
                    {lead_gen_enabled && (
                        <button className="mb-6 px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg">
                            <i className="fa-solid fa-user-plus mr-2"></i>
                            Connect
                        </button>
                    )}

                    {/* Showcase Slider - Before/After Comparison */}
                    {showcase && showcase.before && showcase.after && (
                        <div className="w-full mb-6">
                            <CompareSlider
                                imageBefore={showcase.before}
                                imageAfter={showcase.after}
                            />
                        </div>
                    )}

                    {/* Social Spotlight */}
                    {social_spotlight_url && (
                        <div className="w-full mb-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
                            <div className="flex items-center gap-3 mb-3">
                                <i className="fa-brands fa-instagram text-pink-400 text-xl"></i>
                                <span className="text-sm font-semibold text-white">Featured Post</span>
                            </div>
                            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg p-8 text-center backdrop-blur-sm border border-white/10">
                                <i className="fa-solid fa-heart text-pink-300 text-4xl mb-3"></i>
                                <p className="text-xs text-white/80">Social content preview</p>
                            </div>
                        </div>
                    )}

                    {/* Newsletter Signup Form - NEW! */}
                    {newsletter_active && profile_id && (
                        <NewsletterForm
                            heading={newsletter_heading || 'Join my newsletter'}
                            profileId={profile_id}
                            theme_color={theme_color}
                        />
                    )}

                    {/* Links - Glass + Glow Style */}
                    <div className="w-full space-y-3">
                        {links && links.length > 0 ? (
                            links.map((link, index) => (
                                link.title && link.url ? (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block w-full py-4 px-6 rounded-2xl text-center font-semibold text-white transition-all duration-300 shadow-xl hover:scale-105 bg-white/10 backdrop-blur-md border border-white/20 hover:border-opacity-60"
                                        style={{
                                            '--glow-color': theme_color || '#3b82f6'
                                        } as React.CSSProperties}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = theme_color || '#3b82f6'
                                            e.currentTarget.style.boxShadow = `0 0 20px ${hexToRgba(theme_color || '#3b82f6', 0.6)}`
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        {link.title}
                                    </a>
                                ) : null
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/60 text-sm">
                                Add links to see them here
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CSS Animation for blob movement */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 15s infinite ease-in-out;
                }
            `}</style>
        </div>
    )
}
