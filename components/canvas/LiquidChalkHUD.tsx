'use client';

import { motion } from 'framer-motion';

interface LiquidChalkHUDProps {
    viewState: 'home' | 'about' | 'contact';
    onNavigate: (target: 'home' | 'about' | 'contact') => void;
}

export function LiquidChalkHUD({ viewState, onNavigate }: LiquidChalkHUDProps) {
    return (
        <>
            {/* LEFT ARROW: WHO WE ARE (hidden on About) */}
            {viewState !== 'about' && (
                <button
                    onClick={() => onNavigate('about')}
                    className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-[60]
                     flex flex-col items-center gap-3 group cursor-pointer
                     sm:bottom-auto sm:flex-col
                     max-sm:bottom-8 max-sm:top-auto max-sm:translate-y-0 max-sm:flex-row max-sm:left-4"
                >
                    {/* Glass Tile */}
                    <div className="absolute inset-0 -inset-x-4 -inset-y-8 sm:-inset-y-12
                          bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl -z-10
                          max-sm:-inset-x-6 max-sm:-inset-y-4" />

                    {/* Arrow (vertical on desktop, horizontal on mobile) */}
                    <motion.svg
                        width="40"
                        height="40"
                        viewBox="0 0 100 100"
                        className="text-[#FF6B35] sm:block max-sm:rotate-0"
                        animate={{ opacity: [1, 0.7, 1, 0.8, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <path d="M 80 50 L 20 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        <path d="M 35 35 L 20 50 L 35 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
                    </motion.svg>

                    {/* Text (vertical on desktop) */}
                    <span
                        className="text-xl sm:text-2xl font-bold tracking-wider
                       sm:[writing-mode:vertical-rl] sm:[text-orientation:mixed]
                       max-sm:text-base"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            color: '#FF6B35',
                            textShadow: '0 0 10px #FF6B35, 0 0 20px #FF6B35, 0 0 30px #FF6B35'
                        }}
                    >
                        WHO WE ARE
                    </span>
                </button>
            )}

            {/* RIGHT ARROW: GET IN TOUCH (hidden on Contact) */}
            {viewState !== 'contact' && (
                <button
                    onClick={() => onNavigate('contact')}
                    className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-[60]
                     flex flex-col items-center gap-3 group cursor-pointer
                     sm:bottom-auto sm:flex-col
                     max-sm:bottom-8 max-sm:top-auto max-sm:translate-y-0 max-sm:flex-row max-sm:right-4"
                >
                    {/* Glass Tile */}
                    <div className="absolute inset-0 -inset-x-4 -inset-y-8 sm:-inset-y-12
                          bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl -z-10
                          max-sm:-inset-x-6 max-sm:-inset-y-4" />

                    {/* Arrow */}
                    <motion.svg
                        width="40"
                        height="40"
                        viewBox="0 0 100 100"
                        className="text-[#FF6B35] max-sm:rotate-0"
                        animate={{ opacity: [1, 0.7, 1, 0.8, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                        <path d="M 20 50 L 80 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        <path d="M 65 35 L 80 50 L 65 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
                    </motion.svg>

                    {/* Text */}
                    <span
                        className="text-xl sm:text-2xl font-bold tracking-wider
                       sm:[writing-mode:vertical-rl] sm:[text-orientation:mixed]
                       max-sm:text-base"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            color: '#FF6B35',
                            textShadow: '0 0 10px #FF6B35, 0 0 20px #FF6B35, 0 0 30px #FF6B35'
                        }}
                    >
                        GET IN TOUCH
                    </span>
                </button>
            )}

            {/* BACK BUTTON (visible on About & Contact) */}
            {viewState !== 'home' && (
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => onNavigate('home')}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-[60]
                     flex items-center gap-3 px-6 py-3 cursor-pointer
                     bg-white/5 backdrop-blur-sm border border-white/10 rounded-full
                     hover:bg-white/10 transition-all"
                >
                    <motion.svg
                        width="24"
                        height="24"
                        viewBox="0 0 100 100"
                        className="text-[#FF6B35]"
                        animate={{ x: [-2, 2, -2] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <path d="M 70 50 L 30 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 45 35 L 30 50 L 45 65" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
                    </motion.svg>

                    <span
                        className="text-lg sm:text-xl font-bold"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            color: '#FF6B35',
                            textShadow: '0 0 10px #FF6B35, 0 0 20px #FF6B35'
                        }}
                    >
                        HOME
                    </span>
                </motion.button>
            )}
        </>
    );
}
