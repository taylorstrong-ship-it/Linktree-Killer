'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    Lock,
    Globe,
    CheckCircle,
    MessageSquare,
    Star,
    Smartphone,
    TrendingUp,
    CloudUpload,
    Shield
} from 'lucide-react';

type ReviewMode = 'idle' | 'bad-review' | 'good-review';
type AnimationPhase = 'incoming' | 'deciding' | 'routing' | 'resolved';

const SCENARIOS = {
    bad: {
        rating: 1,
        text: "Terrible experience. Food was cold, service was rude. Never coming back.",
        color: '#f59e0b', // Amber
        icon: ShieldAlert,
        status: '⛔ INTERCEPTED // PRIVATE DRAFT',
        outcome: 'Draft saved to owner dashboard for review'
    },
    good: {
        rating: 5,
        text: "Amazing! Best pizza I've ever had. The service was incredible and the atmosphere was perfect!",
        color: '#00ff87', // Neon Green
        icon: Globe,
        status: '✅ AUTO-PUBLISHING TO GOOGLE',
        outcome: 'Reply posted publicly and instantly'
    }
};

export default function ReviewGuardHero() {
    const [mode, setMode] = useState<ReviewMode>('idle');
    const [phase, setPhase] = useState<AnimationPhase>('incoming');
    const [apiLogIndex, setApiLogIndex] = useState(0);

    const scenario = mode === 'bad-review' ? SCENARIOS.bad : SCENARIOS.good;
    const isActive = mode !== 'idle';

    // Animation sequence orchestration
    useEffect(() => {
        if (mode === 'idle') return;

        let timeout: NodeJS.Timeout;

        switch (phase) {
            case 'incoming':
                timeout = setTimeout(() => setPhase('deciding'), 800);
                break;
            case 'deciding':
                timeout = setTimeout(() => setPhase('routing'), 1200);
                break;
            case 'routing':
                timeout = setTimeout(() => setPhase('resolved'), 1000);
                break;
        }

        return () => clearTimeout(timeout);
    }, [phase, mode]);

    // API log typing animation (only for good reviews)
    useEffect(() => {
        if (mode !== 'good-review' || phase !== 'resolved') return;

        setApiLogIndex(0);
        const logInterval = setInterval(() => {
            setApiLogIndex(prev => {
                if (prev >= 2) {
                    clearInterval(logInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, 400); // Show each log line every 400ms

        return () => clearInterval(logInterval);
    }, [mode, phase]);

    const handleSimulate = (reviewMode: 'bad-review' | 'good-review') => {
        setMode(reviewMode);
        setPhase('incoming');
        setApiLogIndex(0);
    };

    const handleReset = () => {
        setMode('idle');
        setPhase('incoming');
        setApiLogIndex(0);
    };

    return (
        <div className="w-full bg-[#0a0a0a] text-white p-6 rounded-2xl border border-white/10">
            {/* Header */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-[#00ff87] to-[#C8A882] bg-clip-text text-transparent">
                    Review Guard: Traffic Control
                </h2>
                <p className="text-gray-400 text-sm">
                    Watch the AI decide what to intercept and what to publish
                </p>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
                <motion.button
                    onClick={() => handleSimulate('bad-review')}
                    disabled={isActive}
                    className="px-6 py-3 rounded-lg border-2 border-red-500 bg-red-500/10 text-red-300 font-mono text-sm uppercase tracking-wider hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: isActive ? 1 : 1.05 }}
                    whileTap={{ scale: isActive ? 1 : 0.95 }}
                >
                    🔴 Simulate 1-Star
                </motion.button>

                <motion.button
                    onClick={() => handleSimulate('good-review')}
                    disabled={isActive}
                    className="px-6 py-3 rounded-lg border-2 border-green-500 bg-green-500/10 text-green-300 font-mono text-sm uppercase tracking-wider hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: isActive ? 1 : 1.05 }}
                    whileTap={{ scale: isActive ? 1 : 0.95 }}
                >
                    🟢 Simulate 5-Star
                </motion.button>

                {isActive && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleReset}
                        className="px-6 py-3 rounded-lg border border-white/20 bg-white/5 text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
                    >
                        Reset
                    </motion.button>
                )}
            </div>

            {/* The Iron Dome Layout */}
            <AnimatePresence mode="wait">
                {isActive ? (
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        {/* LEFT: Incoming Review */}
                        <IncomingPanel
                            rating={scenario.rating}
                            text={scenario.text}
                            phase={phase}
                            color={scenario.color}
                        />

                        {/* CENTER: Decision Node */}
                        <DecisionNode
                            phase={phase}
                            mode={mode}
                            color={scenario.color}
                        />

                        {/* RIGHT: Outcome */}
                        <OutcomePanel
                            phase={phase}
                            mode={mode}
                            status={scenario.status}
                            outcome={scenario.outcome}
                            color={scenario.color}
                            icon={scenario.icon}
                            apiLogIndex={apiLogIndex}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-500">
                            Select a scenario to see the AI routing logic in action
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// LEFT PANEL: Incoming Review
function IncomingPanel({
    rating,
    text,
    phase,
    color
}: {
    rating: number;
    text: string;
    phase: AnimationPhase;
    color: string;
}) {
    return (
        <motion.div
            className="relative rounded-xl border-2 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-4"
            style={{ borderColor: phase === 'incoming' ? color : 'rgba(255,255,255,0.1)' }}
            animate={phase === 'incoming' ? {
                scale: [1, 1.02, 1],
                transition: { duration: 0.5 }
            } : {}}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400">
                    Incoming Review
                </h3>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-3">
                "{text}"
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500">
                <MessageSquare className="w-3 h-3" />
                <span>Google Review</span>
            </div>
        </motion.div>
    );
}

// CENTER PANEL: Decision Node
function DecisionNode({
    phase,
    mode,
    color
}: {
    phase: AnimationPhase;
    mode: ReviewMode;
    color: string;
}) {
    const isBad = mode === 'bad-review';

    return (
        <div className="relative flex items-center justify-center">
            {/* The Brain */}
            <motion.div
                className="relative w-24 h-24 rounded-full border-2 backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center"
                style={{ borderColor: phase === 'deciding' ? color : 'rgba(255,255,255,0.1)' }}
                animate={phase === 'deciding' ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    transition: { duration: 1.2 }
                } : {}}
            >
                {phase === 'deciding' && (
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: color, opacity: 0.2 }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0, 0.2]
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity
                        }}
                    />
                )}

                <TrendingUp className="w-8 h-8" style={{ color }} />
            </motion.div>

            {/* Routing Path Animation */}
            {phase === 'routing' && (
                <motion.div
                    className="absolute w-16 h-1 rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{
                        x: 0,
                        y: 0,
                        opacity: 0
                    }}
                    animate={{
                        x: isBad ? -100 : 100,
                        y: isBad ? -30 : 30,
                        opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1 }}
                />
            )}

            {/* Status Labels */}
            {phase === 'deciding' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-8 text-center"
                >
                    <p className="font-mono text-xs text-gray-400">
                        ANALYZING...
                    </p>
                </motion.div>
            )}
        </div>
    );
}

// RIGHT PANEL: Outcome
function OutcomePanel({
    phase,
    mode,
    status,
    outcome,
    color,
    icon: Icon,
    apiLogIndex
}: {
    phase: AnimationPhase;
    mode: ReviewMode;
    status: string;
    outcome: string;
    color: string;
    icon: any;
    apiLogIndex: number;
}) {
    const isBad = mode === 'bad-review';
    const isGood = mode === 'good-review';
    const showOutcome = phase === 'resolved';

    const apiLogs = [
        '> CONNECTING TO GOOGLE BUSINESS PROFILE API...',
        '> POST /reviews/reply [SUCCESS]',
        '> STATUS: LIVE ON MAPS 🌍'
    ];

    return (
        <motion.div
            className="relative rounded-xl border-2 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-4"
            style={{ borderColor: showOutcome ? color : 'rgba(255,255,255,0.1)' }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: showOutcome ? 1 : 0.3 }}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400">
                    Outcome
                </h3>

                {showOutcome && (
                    <div className="flex items-center gap-2">
                        {/* Google Partner Badge */}
                        {isGood && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 border border-blue-400/30"
                            >
                                <Shield className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] font-mono text-blue-400">API</span>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <Icon className="w-5 h-5" style={{ color }} />
                        </motion.div>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {showOutcome ? (
                    <motion.div
                        key="outcome"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Terminal-Style API Logs for Good Reviews */}
                        {isGood ? (
                            <>
                                {/* API Log Terminal */}
                                <div className="mb-3 px-3 py-2 rounded-lg border border-green-500/30 bg-black/40 backdrop-blur-sm">
                                    <div className="space-y-1">
                                        {apiLogs.slice(0, apiLogIndex + 1).map((log, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.4 }}
                                                className="font-mono text-[10px] text-green-400 flex items-center gap-2"
                                            >
                                                {index === apiLogIndex && apiLogIndex < 2 && (
                                                    <motion.span
                                                        animate={{ opacity: [1, 0] }}
                                                        transition={{ duration: 0.5, repeat: Infinity }}
                                                    >
                                                        ▊
                                                    </motion.span>
                                                )}
                                                <span>{log}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cloud Upload → Checkmark Animation */}
                                {apiLogIndex >= 2 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                        className="flex items-center justify-center gap-3 mb-4"
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key="checkmark"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', stiffness: 200 }}
                                            >
                                                <CheckCircle className="w-16 h-16 text-green-400" strokeWidth={2} />
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* Google Integration Proof */}
                                {apiLogIndex >= 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center gap-2 text-xs text-green-400 justify-center"
                                    >
                                        <div className="w-4 h-4 flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" className="w-full h-full">
                                                <path
                                                    fill="currentColor"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                        </div>
                                        <span>Reply Posted to Google Maps</span>
                                    </motion.div>
                                )}
                            </>
                        ) : (
                            /* Bad Review - Original Layout */
                            <>
                                <div
                                    className="mb-3 px-3 py-2 rounded-lg border text-xs font-mono"
                                    style={{
                                        borderColor: color,
                                        backgroundColor: `${color}20`,
                                        color
                                    }}
                                >
                                    {status}
                                </div>

                                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                    {outcome}
                                </p>

                                <motion.div
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-2 text-xs text-amber-400"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    <span>Sent to Owner for Approval</span>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                    >
                        <Lock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-xs text-gray-500">Awaiting decision...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
