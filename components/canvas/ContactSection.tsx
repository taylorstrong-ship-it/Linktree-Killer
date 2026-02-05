'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function ContactSection() {
    const [displayText, setDisplayText] = useState('');
    const fullEmail = 'hello@tayloredsolutions.ai';

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i <= fullEmail.length) {
                setDisplayText(fullEmail.slice(0, i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[600px] h-[600px] bg-[#00FF41]/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl relative z-10 text-center"
            >
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif italic text-white/90 mb-6">
                    Let's <span className="text-[#FF6B35]">Talk</span>
                </h2>

                <p className="text-xl sm:text-2xl text-white/60 mb-12 font-sans">
                    Ferrari-grade AI solutions, no slop.
                </p>

                {/* Terminal-style email with typewriter effect */}
                <div className="bg-black/60 backdrop-blur-md border border-[#00FF41]/30 rounded-2xl p-8 sm:p-12
                        shadow-[0_0_40px_rgba(0,255,65,0.15)] font-mono">
                    <div className="text-sm text-[#00FF41]/60 mb-4 text-left">
                        $ contact --email
                    </div>

                    <a
                        href={`mailto:${fullEmail}`}
                        className="text-2xl sm:text-3xl md:text-4xl text-[#00FF41] hover:text-[#00FF41]/80 
                       transition-colors inline-flex items-center gap-1"
                        style={{ textShadow: '0 0 10px rgba(0,255,65,0.5)' }}
                    >
                        {displayText}
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-[3px] h-[1.2em] bg-[#00FF41] ml-1"
                        >
                            ▌
                        </motion.span>
                    </a>

                    <div className="text-sm text-[#00FF41]/40 mt-8 text-left">
                        &gt; Ready when you are.
                    </div>
                </div>

                {/* Social proof hint */}
                <p className="text-white/30 text-sm mt-8 font-sans">
                    Trusted by brands that refuse to settle for templates.
                </p>
            </motion.div>
        </div>
    );
}
