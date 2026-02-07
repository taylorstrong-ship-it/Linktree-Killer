'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Fingerprint, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ReviewGuardHero from '@/components/dashboard/ReviewGuardHero'

interface BrandProfile {
    id: string
    brand_name: string
    industry?: string
    vibe?: string
    primary_color?: string
}

export default function DashboardHub() {
    const router = useRouter()
    const [profile, setProfile] = useState<BrandProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            const supabase = createClient()

            try {
                // Get current user
                const { data: { user }, error: userError } = await supabase.auth.getUser()

                if (userError || !user) {
                    router.push('/login')
                    return
                }

                // Fetch brand profile
                const { data: brandProfile, error: profileError } = await supabase
                    .from('brand_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (profileError || !brandProfile) {
                    router.push('/onboarding')
                    return
                }

                setProfile(brandProfile)
            } catch (err) {
                console.error('Failed to load profile:', err)
                router.push('/onboarding')
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading your creative studio...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-[#121212] font-sans selection:bg-[#FF6B35]/30 selection:text-[#FF6B35]">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-2000"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Command Center: Review Guard Hero */}
                <ReviewGuardHero />

                {/* Spacer */}
                <div className="h-12" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{profile.brand_name}</span>.
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Your Creative Studio is ready.
                    </p>
                </motion.div>

                {/* Quick Action Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {/* Card 1: Taylor Content (Primary) */}
                    <Link href="/dashboard/content-generator">
                        <div className="group relative bg-white/5 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-8 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 cursor-pointer h-full">
                            {/* Gradient Border Glow */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>

                            <div className="relative">
                                {/* Icon */}
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    Taylor Content
                                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                </h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    Generate social posts, stories, and ads in seconds.
                                </p>

                                {/* Badge */}
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                    <span className="text-xs font-medium text-orange-400">Primary Tool</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Card 2: My Brand DNA (Secondary) */}
                    <Link href="/onboarding">
                        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer h-full">
                            <div className="relative">
                                {/* Icon */}
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Fingerprint className="w-7 h-7 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    My Brand DNA
                                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                </h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    Adjust your voice, vibe, and visual identity.
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Card 3: Campaign Manager (Coming Soon) */}
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 opacity-50 cursor-not-allowed h-full">
                        <div className="relative">
                            {/* Icon */}
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 mb-4">
                                <Calendar className="w-7 h-7 text-zinc-600" />
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Campaign Manager
                            </h3>
                            <p className="text-zinc-500 leading-relaxed">
                                Coming Soon.
                            </p>

                            {/* Coming Soon Badge */}
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <span className="text-xs font-medium text-zinc-500">Q2 2026</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats (Optional Enhancement) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <p className="text-zinc-500 text-sm mb-1">Brand Vibe</p>
                        <p className="text-white text-xl font-bold">{profile.vibe || 'Not set'}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <p className="text-zinc-500 text-sm mb-1">Industry</p>
                        <p className="text-white text-xl font-bold">{profile.industry || 'Not set'}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <p className="text-zinc-500 text-sm mb-1">Brand Color</p>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full border-2 border-white/20"
                                style={{ backgroundColor: profile.primary_color || '#FF6B35' }}
                            />
                            <p className="text-white text-xl font-bold">{profile.primary_color || '#FF6B35'}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
