'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart, TrendingUp, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BrandData {
    company_name?: string;
    title?: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    brand_personality?: string;
    suggested_ctas?: Array<{ title: string; url: string; category?: string }>;
    description?: string;
    avatar_url?: string;
    theme_color?: string;
    brand_colors?: string[];
    links?: Array<{ title: string; url: string }>;
}

interface BrandDashboardProps {
    brandData: BrandData;
}

export default function BrandDashboard({ brandData }: BrandDashboardProps) {
    const router = useRouter();

    // Extract colors with fallbacks
    const primaryColor = brandData.primary_color || brandData.theme_color || brandData.brand_colors?.[0] || '#FFAD7A';
    const secondaryColor = brandData.secondary_color || brandData.brand_colors?.[1] || '#FF6B35';
    const brandName = brandData.company_name || brandData.title || 'Your Brand';
    const logoUrl = brandData.logo_url || brandData.avatar_url;

    // Extract campaign suggestions
    const suggestedCtas = brandData.suggested_ctas || brandData.links || [];

    // Safely extract personality as a string (handle both string and object types)
    const getPersonalityString = (data: any): string => {
        if (!data) return 'Professional';
        if (typeof data === 'string') return data;
        if (typeof data === 'object' && data.role) return data.role;
        if (typeof data === 'object' && data.family) return data.family;
        return 'Professional';
    };
    const personality = getPersonalityString(brandData.brand_personality);

    // Safe string extraction helper for any field
    const safeString = (value: any, fallback: string = ''): string => {
        if (!value) return fallback;
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value.title) return String(value.title);
        if (typeof value === 'object' && value.name) return String(value.name);
        return fallback;
    };

    // Generate campaign cards
    const campaignCards = [
        {
            id: 1,
            icon: TrendingUp,
            title: suggestedCtas[0]?.title ? `Promote ${safeString(suggestedCtas[0].title, 'Product')}` : 'Sales Campaign',
            description: safeString(suggestedCtas[0]?.url, 'Drive conversions with targeted messaging'),
            prompt: `Create a compelling social media post promoting ${safeString(suggestedCtas[0]?.title, 'our latest offer')}. Make it ${personality.toLowerCase()} and attention-grabbing with clear call-to-action.`,
            gradient: 'from-green-500/20 to-emerald-500/20',
            borderColor: 'border-green-500/30',
            iconColor: 'text-green-400'
        },
        {
            id: 2,
            icon: Heart,
            title: `Showcase ${personality}`,
            description: 'Brand personality content',
            prompt: `Create an engaging social media post that showcases our ${personality.toLowerCase()} brand personality. Highlight our values and what makes us unique.`,
            gradient: 'from-purple-500/20 to-pink-500/20',
            borderColor: 'border-purple-500/30',
            iconColor: 'text-purple-400'
        },
        {
            id: 3,
            icon: Zap,
            title: 'Morning Update',
            description: 'Generic engagement post',
            prompt: `Create a fresh morning update post for our social media. Keep it ${personality.toLowerCase()}, engaging, and perfect for starting the day. Include ${brandName} branding.`,
            gradient: 'from-blue-500/20 to-cyan-500/20',
            borderColor: 'border-blue-500/30',
            iconColor: 'text-blue-400'
        }
    ];

    // Determine animation speed based on personality
    const breathingDuration = personality.toLowerCase().includes('energy') || personality.toLowerCase().includes('bold') ? 2 : 4;

    const handleEditPage = () => {
        router.push('/builder');
    };

    const handleCampaignClick = (prompt: string) => {
        const encodedPrompt = encodeURIComponent(prompt);
        router.push(`/apps/post-generator?prompt=${encodedPrompt}`);
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] py-24 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-7xl font-sans font-bold text-white tracking-tighter">
                        Ready to <span style={{ color: primaryColor }}>Launch.</span>
                    </h2>
                    <p className="mt-6 text-xl text-white/50 font-sans max-w-2xl mx-auto">
                        We've synthesized your brand into a deployment-ready ecosystem.
                    </p>
                </motion.div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                    {/* LEFT COLUMN: Bio Link Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="lg:sticky lg:top-32"
                    >
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Taylored Link in Bio</h3>
                            <p className="text-white/40 text-sm">Your instant brand hub</p>
                        </div>

                        <div className="relative group cursor-pointer" onClick={handleEditPage}>
                            {/* Breathing Glow Effect */}
                            <motion.div
                                className="absolute -inset-6 rounded-[3rem] blur-2xl"
                                style={{
                                    background: `radial-gradient(circle, ${primaryColor}40, ${secondaryColor}40)`
                                }}
                                animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: breathingDuration,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />

                            {/* Phone Mockup */}
                            <div className="relative transform transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1">
                                <div className="bg-[#111] p-4 rounded-[3rem] border-8 border-[#333] shadow-2xl">
                                    {/* Phone Screen */}
                                    <div className="bg-gradient-to-b from-gray-900 to-black rounded-[2rem] overflow-hidden aspect-[9/19.5] relative">
                                        {/* Status Bar */}
                                        <div className="flex justify-between items-center px-6 py-3 text-white text-xs">
                                            <span>9:41</span>
                                            <div className="flex gap-1">
                                                <div className="w-4 h-3 bg-white/60 rounded-sm"></div>
                                                <div className="w-4 h-3 bg-white/60 rounded-sm"></div>
                                                <div className="w-4 h-3 bg-white/60 rounded-sm"></div>
                                            </div>
                                        </div>

                                        {/* Profile Content */}
                                        <div className="flex flex-col items-center px-6 py-8">
                                            {/* Avatar */}
                                            {logoUrl ? (
                                                <img
                                                    src={logoUrl}
                                                    alt={brandName}
                                                    className="w-20 h-20 rounded-full object-cover mb-4 ring-2"
                                                    style={{ ['--tw-ring-color' as any]: primaryColor }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-20 h-20 rounded-full mb-4 ring-2 flex items-center justify-center text-white font-bold text-2xl"
                                                    style={{ backgroundColor: primaryColor, ['--tw-ring-color' as any]: primaryColor }}
                                                >
                                                    {brandName[0]}
                                                </div>
                                            )}

                                            {/* Brand Name */}
                                            <h4 className="text-white font-bold text-lg mb-2">{brandName}</h4>
                                            <p className="text-gray-400 text-xs text-center mb-6 line-clamp-2">
                                                {typeof brandData.description === 'string' ? brandData.description : 'Your brand description here'}
                                            </p>

                                            {/* Links Preview */}
                                            <div className="w-full space-y-3">
                                                {suggestedCtas.slice(0, 3).map((cta, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-full px-4 py-3 rounded-xl text-white text-sm font-medium text-center transition-all"
                                                        style={{
                                                            backgroundColor: `${primaryColor}${idx === 0 ? 'FF' : 'CC'}`,
                                                            opacity: idx === 0 ? 1 : 0.8
                                                        }}
                                                    >
                                                        {safeString(cta?.title, `Link ${idx + 1}`)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={handleEditPage}
                            className="mt-8 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                        >
                            <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Edit My Page
                        </button>
                    </motion.div>

                    {/* RIGHT COLUMN: Campaign Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="text-center lg:text-left mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Taylored Content Creator</h3>
                            <p className="text-white/40 text-sm">Ready-to-run campaign strategies</p>
                        </div>

                        <div className="space-y-6">
                            {campaignCards.map((card, index) => {
                                const Icon = card.icon;
                                return (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                        onClick={() => handleCampaignClick(card.prompt)}
                                        className={`bg-gradient-to-br ${card.gradient} border ${card.borderColor} rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden`}
                                    >
                                        {/* Hover Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                        <div className="relative flex items-start gap-4">
                                            <div className={`p-3 rounded-xl bg-black/20 ${card.iconColor}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-bold text-lg mb-1">{card.title}</h4>
                                                <p className="text-white/50 text-sm mb-4">{card.description}</p>
                                                <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span>AI-Powered • Ready to Launch</span>
                                                </div>
                                            </div>
                                            <div className={`${card.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="text-center pt-12">
                            <button
                                onClick={() => { router.push('/'); }}
                                className="text-white/30 hover:text-white transition-colors font-sans text-sm uppercase tracking-widest border-b border-transparent hover:border-white pb-1"
                            >
                                Reset Matrix & Decrypt New Target
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
