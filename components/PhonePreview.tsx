'use client'

import React from 'react'
import LivingBackground from './LivingBackground'
import CompareSlider from './CompareSlider'
import NewsletterForm from './NewsletterForm'
import { PATTERNS } from '@/app/builder/patterns'

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
    font_style: 'modern' | 'elegant' | 'brutal'
    theme_color: string
    accent_color: string
    animation_speed: 'slow' | 'medium' | 'fast'
    animation_type: 'drift' | 'pulse' | 'swirl' | 'lava'
    texture_overlay: 'none' | 'noise' | 'grid' | 'lines'
    enable_spotlight: boolean
    lead_gen_enabled: boolean
    newsletter_active?: boolean
    newsletter_heading?: string
    profile_id?: string
    links: Link[]
    social_spotlight_url?: string
    showcase?: { before: string; after: string }
    activePattern?: string
}

export default function PhonePreview({
    title,
    description,
    avatar_url,
    background_image,
    background_type,
    video_background_url,
    font_style,
    theme_color,
    accent_color,
    animation_speed,
    animation_type,
    texture_overlay,
    enable_spotlight,
    lead_gen_enabled,
    newsletter_active,
    newsletter_heading,
    profile_id,
    links,
    social_spotlight_url,
    showcase,
    activePattern = 'none'
}: PhonePreviewProps) {
    const [cursorX, setCursorX] = React.useState(0)
    const [cursorY, setCursorY] = React.useState(0)

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

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

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

    const getTextureStyle = (texture: 'none' | 'noise' | 'grid' | 'lines'): React.CSSProperties => {
        switch (texture) {
            case 'noise':
                return {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    opacity: 0.2,
                    mixBlendMode: 'overlay',
                }
            case 'grid':
                return {
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3,
                }
            case 'lines':
                return {
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
                    backgroundSize: '100% 2px',
                    opacity: 0.5,
                }
            default:
                return {}
        }
    }

    const spotlightStyle: React.CSSProperties = enable_spotlight ? {
        background: `radial-gradient(600px circle at ${cursorX}px ${cursorY}px, rgba(255,255,255,0.1), transparent 40%)`
    } : {}

    const getSocialIcon = (url: string) => {
        if (!url) return null;
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('instagram.com')) return { icon: 'fa-instagram', color: '#E1306C', label: 'Instagram' };
        if (lowerUrl.includes('tiktok.com')) return { icon: 'fa-tiktok', color: '#000000', label: 'TikTok' };
        if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return { icon: 'fa-x-twitter', color: '#000000', label: 'X' };
        if (lowerUrl.includes('facebook.com')) return { icon: 'fa-facebook', color: '#1877F2', label: 'Facebook' };
        if (lowerUrl.includes('youtube.com')) return { icon: 'fa-youtube', color: '#FF0000', label: 'YouTube' };
        if (lowerUrl.includes('linkedin.com')) return { icon: 'fa-linkedin', color: '#0077B5', label: 'LinkedIn' };
        if (lowerUrl.includes('twitch.tv')) return { icon: 'fa-twitch', color: '#9146FF', label: 'Twitch' };
        if (lowerUrl.includes('github.com')) return { icon: 'fa-github', color: '#181717', label: 'GitHub' };
        if (lowerUrl.includes('snapchat.com')) return { icon: 'fa-snapchat', color: '#FFFC00', label: 'Snapchat' };
        if (lowerUrl.includes('whatsapp.com')) return { icon: 'fa-whatsapp', color: '#25D366', label: 'WhatsApp' };
        // FIX: Use exact domain matching to prevent craft.me from matching t.me
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            const domain = urlObj.hostname.toLowerCase().replace('www.', '');
            if (domain === 't.me' || domain === 'telegram.org' || domain === 'telegram.me') return { icon: 'fa-telegram', color: '#0088cc', label: 'Telegram' };
        } catch (e) { }
        // Only check substring for other socials after Telegram check
        if (lowerUrl.includes('t.me/') || lowerUrl.includes('telegram.org') || lowerUrl.startsWith('https://t.me')) return { icon: 'fa-telegram', color: '#0088cc', label: 'Telegram' };
        if (lowerUrl.includes('spotify.com')) return { icon: 'fa-spotify', color: '#1DB954', label: 'Spotify' };
        if (lowerUrl.includes('soundcloud.com')) return { icon: 'fa-soundcloud', color: '#ff5500', label: 'SoundCloud' };
        return null;
    };

    return (
        <div
            className="w-full h-full relative overflow-hidden"
            style={{
                fontFamily: getFontFamily(font_style),
                ...spotlightStyle
            }}
        >
            {/* BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0">
                {background_type === 'mesh' ? (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                        <LivingBackground
                            primaryColor={theme_color || '#3b82f6'}
                            secondaryColor={accent_color || '#8b5cf6'}
                            animationSpeed={animation_speed}
                            animationType={animation_type}
                        />
                        <div className="absolute inset-0 backdrop-blur-sm" />
                    </>
                ) : (
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
                        <div className="absolute inset-0 bg-black/40" />
                    </>
                )}
            </div>

            {/* CONTEXT-AWARE PATTERN OVERLAY */}
            {activePattern !== 'none' && PATTERNS[activePattern as keyof typeof PATTERNS] && (
                <div
                    className="absolute inset-0 z-[5] pointer-events-none"
                    style={{
                        backgroundImage: PATTERNS[activePattern as keyof typeof PATTERNS],
                        backgroundBlendMode: 'overlay',
                        opacity: 0.05,
                        backgroundRepeat: 'repeat'
                    }}
                />
            )}

            {/* TEXTURE OVERLAY */}
            {texture_overlay !== 'none' && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={getTextureStyle(texture_overlay)}
                />
            )}

            {/* CONTENT LAYER */}
            <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto pt-16">
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

                    {/* Showcase Slider */}
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

                    {/* Newsletter */}
                    {newsletter_active && profile_id && (
                        <NewsletterForm
                            heading={newsletter_heading || 'Join my newsletter'}
                            profileId={profile_id}
                            theme_color={theme_color}
                        />
                    )}

                    {/* Social Icons (Top Row - Fixed) */}
                    <div className="flex flex-wrap justify-center gap-4 mb-4 shrink-0">
                        {links && links.filter(link => getSocialIcon(link.url)).map((link, index) => {
                            const social = getSocialIcon(link.url);
                            if (!social) return null;
                            return (
                                <a
                                    key={`social-${index}`}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
                                    style={{ color: social.color }}
                                    title={link.title || social.label}
                                >
                                    <i className={`fa-brands ${social.icon} text-2xl`}></i>
                                </a>
                            );
                        })}
                    </div>

                    {/* Action Buttons (Scrollable Stack) */}
                    <div className="w-full space-y-3 overflow-y-auto max-h-[400px] pb-12 px-1 scrollbar-hide">
                        {links && links.length > 0 ? (
                            links.filter(link => !getSocialIcon(link.url)).map((link, index) => (
                                link.title && link.url && (
                                    <a
                                        key={`action-${index}`}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block w-full py-3.5 px-6 rounded-xl text-center font-bold text-white transition-all duration-300 shadow-md hover:scale-105 bg-blue-500 hover:bg-blue-600 active:scale-95"
                                    >
                                        {link.title}
                                    </a>
                                )
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/60 text-sm">
                                Add links to see them here
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
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
