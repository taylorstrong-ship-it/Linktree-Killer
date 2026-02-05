'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AboutModal from './AboutModal';
import ContactModal from './ContactModal';

/**
 * 🖍️ FLOATING NAVIGATION HUD
 * "Liquid Chalk on Glass" aesthetic with Brand Orange neon glow
 * Desktop: Vertical labels on left/right edges
 * Mobile (<768px): Bottom left/right corners
 */
export default function FloatingNav() {
    const [showAbout, setShowAbout] = useState(false);
    const [showContact, setShowContact] = useState(false);

    return (
        <>
            {/* LEFT LABEL: ABOUT */}
            <motion.button
                onClick={() => setShowAbout(true)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="fixed z-10 group cursor-pointer
                           /* Desktop: Mid-left edge, vertical */
                           left-4 top-1/2 -translate-y-1/2
                           /* Mobile: Bottom left corner, horizontal */
                           max-md:left-4 max-md:bottom-4 max-md:top-auto max-md:translate-y-0"
                style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed'
                }}
            >
                {/* Glass Tile */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 rounded-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Liquid Chalk Text */}
                <div className="flex items-center gap-2 max-md:flex-row md:flex-col">
                    <span
                        className="text-2xl md:text-3xl font-bold tracking-wider
                                   text-[#FF6B35]
                                   max-md:rotate-0 md:rotate-0"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            textShadow: `
                                0 0 10px #FF6B35,
                                0 0 20px #FF6B35,
                                0 0 30px #FF6B35
                            `
                        }}
                    >
                        ABOUT US
                    </span>

                    {/* Hand-drawn Arrow with Flicker */}
                    <motion.svg
                        animate={{
                            opacity: [0.7, 1, 0.8, 1, 0.7],
                            filter: [
                                'drop-shadow(0 0 8px #FF6B35)',
                                'drop-shadow(0 0 12px #FF6B35)',
                                'drop-shadow(0 0 8px #FF6B35)',
                                'drop-shadow(0 0 15px #FF6B35)',
                                'drop-shadow(0 0 8px #FF6B35)'
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        className="text-[#FF6B35] max-md:rotate-180 md:rotate-90"
                    >
                        {/* Hand-drawn curved arrow pointing inward */}
                        <path
                            d="M 5 20 Q 15 15, 25 20"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path
                            d="M 20 15 L 25 20 L 20 25"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </motion.svg>
                </div>
            </motion.button>

            {/* RIGHT LABEL: CONTACT */}
            <motion.button
                onClick={() => setShowContact(true)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="fixed z-10 group cursor-pointer
                           /* Desktop: Mid-right edge, vertical */
                           right-4 top-1/2 -translate-y-1/2
                           /* Mobile: Bottom right corner, horizontal */
                           max-md:right-4 max-md:bottom-4 max-md:top-auto max-md:translate-y-0"
                style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed'
                }}
            >
                {/* Glass Tile */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 rounded-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Liquid Chalk Text */}
                <div className="flex items-center gap-2 max-md:flex-row md:flex-col">
                    <span
                        className="text-2xl md:text-3xl font-bold tracking-wider
                                   text-[#FF6B35]
                                   max-md:rotate-0 md:rotate-0"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            textShadow: `
                                0 0 10px #FF6B35,
                                0 0 20px #FF6B35,
                                0 0 30px #FF6B35
                            `
                        }}
                    >
                        CONTACT
                    </span>

                    {/* Hand-drawn Arrow with Flicker */}
                    <motion.svg
                        animate={{
                            opacity: [0.8, 1, 0.7, 1, 0.8],
                            filter: [
                                'drop-shadow(0 0 8px #FF6B35)',
                                'drop-shadow(0 0 15px #FF6B35)',
                                'drop-shadow(0 0 8px #FF6B35)',
                                'drop-shadow(0 0 12px #FF6B35)',
                                'drop-shadow(0 0 8px #FF6B35)'
                            ]
                        }}
                        transition={{
                            duration: 2.3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.3
                        }}
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        className="text-[#FF6B35] max-md:rotate-0 md:-rotate-90"
                    >
                        {/* Hand-drawn curved arrow pointing inward */}
                        <path
                            d="M 35 20 Q 25 25, 15 20"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path
                            d="M 20 15 L 15 20 L 20 25"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </motion.svg>
                </div>
            </motion.button>

            {/* MODALS */}
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
            <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
        </>
    );
}
