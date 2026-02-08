'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, PhoneOff, Loader2, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface BrandDNA {
    business_name?: string;
    company_name?: string;
    tone?: string;
    business_intel?: {
        archetype?: string;
        vibe_keywords?: string[];
        signature_items?: string[];
        policies?: Record<string, string>;
        price_range?: string;
        insider_tips?: string[];
        [key: string]: any;
    };
    [key: string]: any;
}

interface NeuralUplinkProps {
    brandDNA: BrandDNA;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'disconnecting' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Safe Mode Refactor
// ─────────────────────────────────────────────────────────────────────────────

export default function NeuralUplink({ brandDNA }: NeuralUplinkProps) {
    console.log('🔧 [NeuralUplink] Component Render - Safe Mode Active');

    // ✅ STATE: No useEffect - Pure client state only
    const [status, setStatus] = useState<CallStatus>('idle');
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [vapiInstance, setVapiInstance] = useState<any>(null);

    const isCallActive = status === 'active';

    // ─────────────────────────────────────────────────────────────────────────
    // 🔥 MANUAL TRIGGER ONLY: handleConnect
    // ─────────────────────────────────────────────────────────────────────────

    const handleConnect = async () => {
        console.log('Step 1: Button Clicked ✅');

        try {
            // 🛡️ If call is active, just hang up
            if (status === 'active' && vapiInstance) {
                console.log('Step 2: Ending Active Call');
                setStatus('disconnecting');
                vapiInstance.stop();
                setVapiInstance(null);
                setStatus('idle');
                setVolumeLevel(0);
                setTranscript('');
                return;
            }

            // 🛡️ Prevent double-clicks
            if (status !== 'idle') {
                console.log('⚠️ [NeuralUplink] Call already in progress, ignoring');
                return;
            }

            // ────────────────────────────────────────────────────────────────
            // Step 2: Initialize Vapi SDK (LAZY LOAD)
            // ────────────────────────────────────────────────────────────────

            console.log('Step 2: Vapi Init Started 🚀');
            setStatus('connecting');
            setError(null);

            // Dynamic import - only loads when user clicks
            const { default: Vapi } = await import('@vapi-ai/web');
            const apiKey = process.env.NEXT_PUBLIC_VAPI_KEY;

            if (!apiKey) {
                throw new Error('Vapi API key not configured in environment');
            }

            console.log('Step 3: Vapi SDK Loaded ✅');
            const vapi = new Vapi(apiKey);
            setVapiInstance(vapi);

            // ────────────────────────────────────────────────────────────────
            // Step 3: Event Listeners
            // ────────────────────────────────────────────────────────────────

            vapi.on('call-start', () => {
                console.log('Step 4: Call Started ✅');
                setStatus('active');
                setError(null);
            });

            vapi.on('call-end', () => {
                console.log('Step 5: Call Ended 📴');
                setStatus('idle');
                setVolumeLevel(0);
                setTranscript('');
            });

            vapi.on('volume-level', (volume: number) => {
                setVolumeLevel(volume);
            });

            vapi.on('message', (message: any) => {
                if (message.type === 'transcript' && message.transcript) {
                    console.log('💬 [Transcript]', message.transcript);
                    setTranscript(message.transcript);
                }
            });

            vapi.on('error', (error: any) => {
                console.error('❌ [Vapi Error]', error);
                setStatus('error');
                setError(error.message || 'Unknown Vapi error');
            });

            // ────────────────────────────────────────────────────────────────
            // Step 4: Start Call with Brand DNA
            // ────────────────────────────────────────────────────────────────

            const businessName = brandDNA.business_name || brandDNA.company_name || 'this business';
            const tone = brandDNA.tone || 'professional and helpful';
            const archetype = brandDNA.business_intel?.archetype || 'The Guide';
            const intel = brandDNA.business_intel || {};

            // Smart voice selection
            const voiceId = tone.toLowerCase().includes('energetic') ? 'aria' :
                tone.toLowerCase().includes('warm') ? 'bella' : 'emma';

            console.log(`Step 4: Starting Call - Voice: ${voiceId}, Archetype: ${archetype}`);

            vapi.start({
                name: `${businessName} AI Assistant`,
                model: {
                    provider: 'google',
                    model: 'gemini-2.0-flash-exp',
                    systemPrompt: `You are the AI voice assistant for ${businessName}, a business with the archetype "${archetype}".

Your personality: ${tone}

Brand Intelligence:
${archetype ? `- Archetype: ${archetype}` : ''}
${intel.vibe_keywords ? `- Vibe: ${intel.vibe_keywords.join(', ')}` : ''}
${intel.signature_items ? `- Signature Items: ${intel.signature_items.join(', ')}` : ''}
${intel.price_range ? `- Price Range: ${intel.price_range}` : ''}
${intel.insider_tips ? `\nInsider Tips:\n${intel.insider_tips.map((tip: string) => `- ${tip}`).join('\n')}` : ''}
${intel.policies ? `\nPolicies:\n${Object.entries(intel.policies).map(([key, value]) => `- ${key}: ${value}`).join('\n')}` : ''}

Your role:
- Embody the brand's personality and values
- Help customers with questions about products, services, pricing, and policies
- Use your brand knowledge to provide specific, helpful answers
- Speak naturally and conversationally, matching the ${tone} tone
- If you don't know something, say so honestly - never make up information

Keep responses concise (under 30 seconds)`,
                },
                voice: {
                    provider: 'elevenlabs',
                    voiceId: voiceId,
                },
            });

            console.log('Step 5: Call Request Sent ✅');

        } catch (err: any) {
            console.error('❌ [FATAL ERROR]', err);
            setStatus('error');
            setError(err.message || 'Failed to initialize Vapi');
            alert(`Vapi Error: ${err.message}`);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 🎨 VISUALS FIRST: Render HTML/CSS Immediately
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="relative w-full max-w-5xl mx-auto">
            {/* Title Section */}
            <div className="text-center mb-12">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white mb-3"
                >
                    Taylored Voice Agent
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/60"
                >
                    AI-powered voice assistant trained on your brand DNA
                </motion.p>
            </div>

            {/* Main Cockpit */}
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 overflow-hidden">

                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                {/* Status Badge - Show Archetype when Active */}
                <AnimatePresence>
                    {isCallActive && brandDNA.business_intel?.archetype && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full"
                        >
                            <p className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                                {brandDNA.business_intel.archetype}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-6 left-6 right-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Central Orb + Waveform */}
                <div className="relative flex flex-col items-center justify-center min-h-[400px]">

                    {/* Gold Orb (Pulsing Brain Node) */}
                    <motion.div
                        className="relative mb-16"
                        animate={{
                            scale: isCallActive ? [1, 1.05, 1] : 1,
                        }}
                        transition={{
                            duration: 2,
                            repeat: isCallActive ? Infinity : 0,
                            ease: 'easeInOut',
                        }}
                    >
                        {/* Outer Glow Ring */}
                        <div
                            className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${isCallActive
                                ? 'bg-gradient-to-br from-green-500/40 to-emerald-500/40'
                                : 'bg-gradient-to-br from-orange-500/30 to-amber-500/30'
                                }`}
                            style={{ transform: 'scale(1.8)' }}
                        />

                        {/* Core Orb */}
                        <div
                            className={`relative w-32 h-32 rounded-full border-4 transition-all duration-300 ${isCallActive
                                ? 'border-green-400 bg-gradient-to-br from-green-500 to-emerald-600'
                                : 'border-orange-400 bg-gradient-to-br from-orange-500 to-amber-600'
                                } shadow-2xl flex items-center justify-center`}
                        >
                            {status === 'connecting' && (
                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                            )}
                            {status === 'idle' && (
                                <Mic className="w-12 h-12 text-white" />
                            )}
                            {isCallActive && (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.8, 1, 0.8],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <Mic className="w-12 h-12 text-white" />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Real-Time Waveform Visualization */}
                    <div className="flex items-center justify-center gap-1.5 h-24 mb-12">
                        {Array.from({ length: 40 }).map((_, i) => {
                            const baseHeight = 4;
                            const maxHeight = 80;
                            const waveOffset = Math.sin((i / 40) * Math.PI * 2 + Date.now() / 1000) * 0.3;
                            const volumeMultiplier = isCallActive ? volumeLevel + waveOffset : 0.1;
                            const height = Math.max(baseHeight, volumeMultiplier * maxHeight);

                            return (
                                <motion.div
                                    key={i}
                                    className={`w-1 rounded-full transition-all duration-75 ${isCallActive ? 'bg-green-400' : 'bg-white/20'
                                        }`}
                                    initial={{ height: baseHeight }}
                                    animate={{
                                        height: `${height}px`,
                                    }}
                                    transition={{
                                        duration: 0.1,
                                        ease: 'easeOut',
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Transcript Stream */}
                    <AnimatePresence mode="wait">
                        {transcript && isCallActive && (
                            <motion.div
                                key={transcript}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
                            >
                                <p className="text-white/90 text-center leading-relaxed">
                                    {transcript}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Status Text */}
                    {!transcript && (
                        <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-white/40 text-sm text-center"
                        >
                            {status === 'idle' && 'Ready to assist'}
                            {status === 'connecting' && 'Establishing neural link...'}
                            {status === 'active' && 'Listening...'}
                            {status === 'disconnecting' && 'Ending call...'}
                        </motion.p>
                    )}
                </div>

                {/* Control Button */}
                <div className="flex justify-center mt-8">
                    <motion.button
                        onClick={handleConnect}
                        disabled={status === 'connecting' || status === 'disconnecting'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${isCallActive
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white'
                            } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3`}
                    >
                        {status === 'connecting' && (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Connecting...
                            </>
                        )}
                        {status === 'disconnecting' && (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Ending Call...
                            </>
                        )}
                        {status === 'idle' && (
                            <>
                                <Mic className="w-5 h-5" />
                                Start Voice Call
                            </>
                        )}
                        {isCallActive && (
                            <>
                                <PhoneOff className="w-5 h-5" />
                                End Call
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-6 text-center">
                <p className="text-white/40 text-sm">
                    Powered by Vapi.ai • Gemini 2.0 Flash • ElevenLabs
                </p>
            </div>
        </div>
    );
}
