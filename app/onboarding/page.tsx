'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Building2, Zap, Target, Palette, ArrowRight, Loader2 } from 'lucide-react';

const VIBE_OPTIONS = [
    { value: 'professional', label: '💼 Professional', description: 'Clean, corporate, trustworthy' },
    { value: 'creative', label: '🎨 Creative', description: 'Bold, artistic, imaginative' },
    { value: 'minimal', label: '⚪ Minimal', description: 'Simple, elegant, refined' },
    { value: 'bold', label: '⚡ Bold', description: 'Loud, confident, attention-grabbing' },
    { value: 'playful', label: '🎪 Playful', description: 'Fun, energetic, approachable' },
    { value: 'luxury', label: '💎 Luxury', description: 'Premium, sophisticated, exclusive' },
];

const INDUSTRY_OPTIONS = [
    'Technology', 'E-commerce', 'Healthcare', 'Finance', 'Education',
    'Real Estate', 'Food & Beverage', 'Fashion', 'Fitness', 'Consulting',
    'Marketing', 'Entertainment', 'Manufacturing', 'Non-Profit', 'Other'
];

const COLOR_PRESETS = [
    { name: 'Brand Orange', value: '#FF6B35' },
    { name: 'Electric Blue', value: '#3B82F6' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Amber', value: '#F59E0B' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();

    const [brandName, setBrandName] = useState('');
    const [industry, setIndustry] = useState('');
    const [vibe, setVibe] = useState('');
    const [adHook, setAdHook] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#FF6B35');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Check if user is authenticated
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            }
        }
        checkAuth();
    }, [router, supabase]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error: insertError } = await supabase
                .from('brand_profiles')
                .insert({
                    user_id: user.id,
                    brand_name: brandName,
                    industry,
                    vibe,
                    ad_hook: adHook,
                    primary_color: primaryColor,
                });

            if (insertError) throw insertError;

            // Success! Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Onboarding error:', err);
            setError(err.message || 'Failed to complete onboarding. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const isStepValid = () => {
        if (step === 1) return brandName.trim() && industry;
        if (step === 2) return vibe;
        if (step === 3) return adHook.trim();
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,107,53,0.15),transparent_50%)]" />

            <div className="relative w-full max-w-2xl">
                {/* Progress Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Sparkles className="w-8 h-8 text-orange-500" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                            Taylor Your Brand
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        Step {step} of 3 • Let's capture your brand essence
                    </p>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-6 max-w-md mx-auto">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 rounded-full flex-1 transition-all ${s <= step ? 'bg-orange-500' : 'bg-zinc-800'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Onboarding Card */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Step 1: Brand Basics */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                                        <Building2 className="w-4 h-4 text-orange-500" />
                                        Brand Name
                                    </label>
                                    <input
                                        type="text"
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        placeholder="Acme Corp"
                                        required
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl 
                                                 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 
                                                 focus:ring-orange-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                                        <Target className="w-4 h-4 text-orange-500" />
                                        Industry
                                    </label>
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl 
                                                 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 
                                                 focus:border-transparent transition-all"
                                    >
                                        <option value="">Select your industry...</option>
                                        {INDUSTRY_OPTIONS.map((ind) => (
                                            <option key={ind} value={ind}>{ind}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Vibe Selection */}
                        {step === 2 && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-4">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                    Brand Vibe
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {VIBE_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setVibe(option.value)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${vibe === option.value
                                                    ? 'border-orange-500 bg-orange-500/10'
                                                    : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                                                }`}
                                        >
                                            <div className="font-semibold text-white mb-1">
                                                {option.label}
                                            </div>
                                            <div className="text-xs text-zinc-400">
                                                {option.description}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Hook & Color */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                                        <Sparkles className="w-4 h-4 text-orange-500" />
                                        Your Hook (What makes you unforgettable?)
                                    </label>
                                    <textarea
                                        value={adHook}
                                        onChange={(e) => setAdHook(e.target.value)}
                                        placeholder="Best NYC pizza... Premium organic skincare... AI-powered analytics..."
                                        rows={3}
                                        required
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl 
                                                 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 
                                                 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                                        <Palette className="w-4 h-4 text-orange-500" />
                                        Primary Color
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {COLOR_PRESETS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setPrimaryColor(color.value)}
                                                className={`w-12 h-12 rounded-lg border-2 transition-all ${primaryColor === color.value
                                                        ? 'border-white scale-110'
                                                        : 'border-zinc-700 hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl 
                                             hover:bg-zinc-700 transition-all"
                                >
                                    Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step + 1)}
                                    disabled={!isStepValid()}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold 
                                             py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all 
                                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                                             shadow-lg shadow-orange-500/20"
                                >
                                    <span>Continue</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading || !isStepValid()}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold 
                                             py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all 
                                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                                             shadow-lg shadow-orange-500/20"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Tayloring your brand...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Complete Setup</span>
                                            <Sparkles className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
