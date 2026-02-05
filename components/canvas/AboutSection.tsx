'use client';

import { motion } from 'framer-motion';

export function AboutSection() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[600px] h-[600px] bg-[#FF6B35]/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl relative z-10"
            >
                {/* Glass container */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-12
                        shadow-[0_0_40px_rgba(255,107,53,0.1)]">

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif italic text-white/90 mb-8
                         text-center leading-tight">
                        THE ANTI-LINKTREE <span className="text-[#FF6B35]">MANIFESTO</span>
                    </h2>

                    <div className="space-y-6 text-lg sm:text-xl text-white/70 font-sans leading-relaxed">
                        <p className="text-2xl sm:text-3xl text-white/90 font-bold text-center">
                            Stop linking. Start converting.
                        </p>

                        <p>
                            We don't just host your links.<br />
                            We <span className="text-[#FF6B35] font-semibold">extract your DNA</span>.
                        </p>

                        <p>
                            While others give you a glorified bookmark page,<br />
                            we <span className="text-[#FF6B35] font-semibold">vibe-heist</span> your brand's essence and weaponize it<br />
                            into conversion machines powered by AI.
                        </p>

                        <div className="my-8 space-y-3 pl-4 border-l-4 border-[#FF6B35]/30">
                            <p className="flex items-start gap-3">
                                <span className="text-[#00FF41] text-2xl">✓</span>
                                <span>Scanner that reads your site's soul</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <span className="text-[#00FF41] text-2xl">✓</span>
                                <span>Builders that match YOUR aesthetic (not ours)</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <span className="text-[#00FF41] text-2xl">✓</span>
                                <span>AI that sounds like you (not ChatGPT)</span>
                            </p>
                        </div>

                        <p className="text-center text-2xl sm:text-3xl text-white/90 font-bold pt-6">
                            This isn't a Linktree.<br />
                            This is <span className="text-[#FF6B35]">Taylored AI Solutions</span>.
                        </p>

                        <p className="text-center text-4xl pt-4">🍳</p>
                        <p className="text-center text-sm text-white/40 uppercase tracking-widest">
                            Let him cook.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
