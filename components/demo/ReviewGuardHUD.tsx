'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Scan, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

// Threat Scenarios
const THREATS = {
    badFood: {
        id: 'bad-food',
        label: 'Bad Food',
        review: 'The pizza was stone cold when it arrived. Completely unacceptable for the price.',
        sentiment: 'NEGATIVE',
        topic: 'FOOD_QUALITY',
        threatLevel: 'HIGH',
        response: `We're truly sorry to hear your pizza didn't meet our standards. Temperature is critical to us, and we'd love to make this right. Please contact us directly so we can send you a fresh, hot pizza on the house. Your satisfaction matters deeply to our family.`
    },
    rudeService: {
        id: 'rude-service',
        label: 'Rude Service',
        review: 'The waitstaff completely ignored us for 20 minutes. When we finally got attention, they were dismissive and rude.',
        sentiment: 'NEGATIVE',
        topic: 'SERVICE',
        threatLevel: 'CRITICAL',
        response: `This is absolutely not the warm, family-oriented service we pride ourselves on. We sincerely apologize for this experience. Our team is being retrained immediately, and we'd be honored if you'd give us another chance to show you the hospitality we're known for. Please reach out to us directly.`
    },
    longWait: {
        id: 'long-wait',
        label: 'Long Wait',
        review: 'Waited 45 minutes for our order. No apology, no explanation. Just terrible.',
        sentiment: 'NEGATIVE',
        topic: 'WAIT_TIME',
        threatLevel: 'HIGH',
        response: `We deeply apologize for the extended wait. That's far below our standards, and you deserved better communication. We're reviewing our kitchen workflow to prevent this. Please allow us to make it up to you with a complimentary meal on your next visit. Thank you for your patience.`
    }
};

type ThreatKey = keyof typeof THREATS;
type AnimationPhase = 'idle' | 'threat' | 'scanning' | 'injecting' | 'countering' | 'resolved';

export default function ReviewGuardHUD() {
    const [activeThreat, setActiveThreat] = useState<ThreatKey | null>(null);
    const [phase, setPhase] = useState<AnimationPhase>('idle');
    const [typedResponse, setTypedResponse] = useState('');
    const [scanProgress, setScanProgress] = useState(0);

    const currentThreat = activeThreat ? THREATS[activeThreat] : null;

    // Reset and start new threat simulation
    const handleThreatClick = (threatKey: ThreatKey) => {
        // Reset state
        setPhase('idle');
        setTypedResponse('');
        setScanProgress(0);

        // Start new simulation
        setTimeout(() => {
            setActiveThreat(threatKey);
            setPhase('threat');
        }, 50);
    };

    // Animation sequence orchestration
    useEffect(() => {
        if (!currentThreat) return;

        let timeout: NodeJS.Timeout;

        switch (phase) {
            case 'threat':
                // Phase 1: Threat detected (1s)
                timeout = setTimeout(() => setPhase('scanning'), 1000);
                break;

            case 'scanning':
                // Phase 2: Scanning (1.5s with progress)
                const scanInterval = setInterval(() => {
                    setScanProgress(prev => {
                        if (prev >= 100) {
                            clearInterval(scanInterval);
                            return 100;
                        }
                        return prev + 4; // 100% in ~1.5s
                    });
                }, 60);

                timeout = setTimeout(() => {
                    clearInterval(scanInterval);
                    setPhase('injecting');
                }, 1500);
                break;

            case 'injecting':
                // Phase 3: Brand DNA injection (1.2s)
                timeout = setTimeout(() => setPhase('countering'), 1200);
                break;

            case 'countering':
                // Phase 4: Typewriter effect (30ms per char)
                const response = currentThreat.response;
                let charIndex = 0;

                const typeInterval = setInterval(() => {
                    if (charIndex < response.length) {
                        setTypedResponse(response.slice(0, charIndex + 1));
                        charIndex++;
                    } else {
                        clearInterval(typeInterval);
                        setPhase('resolved');
                    }
                }, 30); // Gaming speed: 30ms/char

                return () => clearInterval(typeInterval);

            case 'resolved':
                // Phase 5: Success state (no timeout, stays until reset)
                break;
        }

        return () => clearTimeout(timeout);
    }, [phase, currentThreat]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#00ff87] to-[#C8A882] bg-clip-text text-transparent">
                        Review Guard: Iron Dome
                    </h1>
                    <p className="text-gray-400 text-lg">
                        AI-Powered Reputation Defense System
                    </p>
                </motion.div>
            </div>

            {/* Threat Simulation Buttons */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-wrap gap-3 justify-center">
                    {(Object.keys(THREATS) as ThreatKey[]).map((key) => (
                        <motion.button
                            key={key}
                            onClick={() => handleThreatClick(key)}
                            className={`
                px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider
                border-2 transition-all
                ${activeThreat === key
                                    ? 'bg-red-500/20 border-red-500 text-red-400'
                                    : 'bg-red-500/10 border-red-500/50 text-red-300 hover:bg-red-500/20 hover:border-red-500'
                                }
              `}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <AlertTriangle className="inline-block w-4 h-4 mr-2" />
                            {THREATS[key].label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Main HUD Display */}
            <AnimatePresence mode="wait">
                {currentThreat && (
                    <motion.div
                        key={activeThreat}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-7xl mx-auto"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LEFT: Threat Card */}
                            <ThreatCard
                                threat={currentThreat}
                                phase={phase}
                                scanProgress={scanProgress}
                            />

                            {/* RIGHT: Defense Card */}
                            <DefenseCard
                                phase={phase}
                                typedResponse={typedResponse}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions (when idle) */}
            {!currentThreat && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-2xl mx-auto text-center mt-20"
                >
                    <ShieldAlert className="w-24 h-24 mx-auto mb-6 text-gray-600" />
                    <p className="text-gray-500 text-lg">
                        Select a threat scenario above to watch the AI defense system in action
                    </p>
                </motion.div>
            )}
        </div>
    );
}

// Threat Detection Card
function ThreatCard({
    threat,
    phase,
    scanProgress
}: {
    threat: typeof THREATS[ThreatKey];
    phase: AnimationPhase;
    scanProgress: number;
}) {
    const borderColor =
        phase === 'resolved' ? 'border-[#00ff87]' :
            phase === 'idle' ? 'border-white/10' :
                'border-red-500';

    return (
        <motion.div
            className={`
        relative rounded-xl border-2 backdrop-blur-xl
        bg-gradient-to-br from-white/5 to-white/[0.02]
        p-6 transition-all duration-300
        ${borderColor}
      `}
            animate={phase === 'threat' ? {
                x: [0, -5, 5, -5, 5, 0],
                transition: { duration: 0.5 }
            } : {}}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <ShieldAlert className={`w-6 h-6 ${phase === 'resolved' ? 'text-[#00ff87]' : 'text-red-500'}`} />
                    <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400">
                        {phase === 'resolved' ? 'Threat Neutralized' : 'Incoming Threat'}
                    </h3>
                </div>

                {phase === 'resolved' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1 bg-[#00ff87]/20 border border-[#00ff87] rounded-full"
                    >
                        <span className="text-xs font-mono text-[#00ff87] uppercase">Resolved</span>
                    </motion.div>
                )}
            </div>

            {/* Review Text */}
            <div className="relative mb-6">
                <p className="text-gray-300 leading-relaxed">
                    "{threat.review}"
                </p>

                {/* Scanning Laser Line */}
                {phase === 'scanning' && (
                    <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00ff87] to-transparent"
                        initial={{ top: 0 }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                    />
                )}
            </div>

            {/* HUD Metadata */}
            <div className="space-y-2 font-mono text-xs">
                <DataRow label="SENTIMENT" value={threat.sentiment} color="text-red-400" />
                <DataRow label="TOPIC" value={threat.topic} color="text-yellow-400" />
                <DataRow label="THREAT_LEVEL" value={threat.threatLevel} color="text-red-400" />

                {phase === 'scanning' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-2"
                    >
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-500">SCANNING...</span>
                            <span className="text-[#00ff87]">{Math.floor(scanProgress)}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#00ff87]"
                                initial={{ width: 0 }}
                                animate={{ width: `${scanProgress}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

// Defense Response Card
function DefenseCard({
    phase,
    typedResponse
}: {
    phase: AnimationPhase;
    typedResponse: string;
}) {
    const showCard = phase !== 'idle' && phase !== 'threat';
    const borderColor = phase === 'resolved' ? 'border-[#00ff87]' : 'border-[#C8A882]';

    return (
        <AnimatePresence>
            {showCard && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`
            relative rounded-xl border-2 backdrop-blur-xl
            bg-gradient-to-br from-white/5 to-white/[0.02]
            p-6 transition-all duration-300
            ${borderColor}
          `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-[#C8A882]" />
                            <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400">
                                AI Counter-Measure
                            </h3>
                        </div>

                        {phase === 'resolved' && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <CheckCircle className="w-6 h-6 text-[#00ff87]" />
                            </motion.div>
                        )}
                    </div>

                    {/* Brand DNA Injection Animation */}
                    {phase === 'injecting' && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="w-32 h-32 rounded-full bg-gradient-to-r from-[#C8A882] to-[#00ff87] opacity-20"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.2, 0.4, 0.2]
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />
                            <div className="absolute text-center">
                                <Scan className="w-12 h-12 mx-auto mb-2 text-[#C8A882] animate-spin" />
                                <p className="font-mono text-xs text-[#C8A882] uppercase tracking-wider">
                                    Injecting Empathy Protocol
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Status Messages */}
                    {phase === 'scanning' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <Scan className="w-8 h-8 mx-auto mb-3 text-[#00ff87] animate-pulse" />
                            <p className="font-mono text-sm text-gray-400">
                                ANALYZING SENTIMENT...
                            </p>
                        </motion.div>
                    )}

                    {phase === 'injecting' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 relative z-10"
                        >
                            <p className="font-mono text-sm text-[#C8A882] mb-2">
                                APPLYING TONE: WARM / ITALIAN
                            </p>
                            <p className="font-mono text-xs text-gray-500">
                                Brand DNA Sequence: Active
                            </p>
                        </motion.div>
                    )}

                    {/* Typewriter Response */}
                    {(phase === 'countering' || phase === 'resolved') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p className="text-gray-300 leading-relaxed mb-4">
                                {typedResponse}
                                {phase === 'countering' && (
                                    <motion.span
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                        className="inline-block w-2 h-4 bg-[#00ff87] ml-1"
                                    />
                                )}
                            </p>

                            {phase === 'resolved' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4 border-t border-white/10"
                                >
                                    <div className="flex items-center justify-center gap-2 text-[#00ff87]">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-mono text-sm uppercase tracking-wider">
                                            Reputation Saved
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Utility: HUD Data Row
function DataRow({
    label,
    value,
    color
}: {
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-500">{label}:</span>
            <span className={`${color} font-semibold`}>{value}</span>
        </div>
    );
}
