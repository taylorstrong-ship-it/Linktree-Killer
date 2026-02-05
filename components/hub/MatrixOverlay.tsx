'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OPENER = "Initializing Taylored AI Solutions Protocol...";
const COOK_PHASE = [
    "🔥 LET HIM COOK...",
    "🎨 YOINKING THE HEX CODES...",
    "👀 LOOKING RESPECTFULLY...",
    "🧬 STEALING BRAND DNA...",
    "📂 DECRYPTING ASSETS...",
    "💎 INJECTING THE VIBE..."
];
const FINISHER = "✅ ACCESS GRANTED.";

interface MatrixOverlayProps {
    isScanning: boolean;
    onComplete: () => void;
    brandColor?: string;  // Dynamic color from DNA
    logoUrl?: string;     // Logo for watermark
    logs?: { text: string, color: string }[]; // External logs with colors
}

export default function MatrixOverlay({ isScanning, onComplete, brandColor, logoUrl, logs: externalLogs }: MatrixOverlayProps) {
    const [terminalColor, setTerminalColor] = useState('#FF6B35'); // Brand Orange
    const [showFlash, setShowFlash] = useState(false);

    // Reset on scan start
    useEffect(() => {
        if (!isScanning) {
            setTerminalColor('#FF6B35'); // Reset to Brand Orange
            setShowFlash(false);
        }
    }, [isScanning]);



    // Use external logs or empty array
    const displayLogs = externalLogs || [];



    return (
        <AnimatePresence>
            {isScanning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1 } }}
                    className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono overflow-hidden"
                >
                    {/* White Flash Effect */}
                    {showFlash && (
                        <motion.div
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="absolute inset-0 bg-white z-50 pointer-events-none"
                        />
                    )}

                    {/* Matrix Rain Effect (Simplified CSS version) */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,95,31,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,95,31,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    {/* Scanning Line - Dynamic Color */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-2 z-10"
                        style={{
                            backgroundColor: terminalColor,
                            boxShadow: `0 0 20px ${terminalColor}80`
                        }}
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Logo Watermark - Removed for new sequence */}

                    <div className="relative z-20 w-full max-w-2xl p-8">
                        <div
                            className="border bg-black/80 backdrop-blur-md p-6 rounded-sm transition-all duration-500"
                            style={{
                                borderColor: `${terminalColor}30`,
                                boxShadow: `0 0 30px ${terminalColor}20`
                            }}
                        >
                            <h2
                                className="font-bold mb-4 tracking-widest text-sm animate-pulse transition-colors duration-500"
                                style={{ color: terminalColor }}
                            >
                                SYSTEM TERMINAL &gt; SCANNERS: ONLINE
                            </h2>

                            <div
                                className="space-y-2 font-mono text-sm h-64 overflow-y-auto flex flex-col-reverse scrollbar-none"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                <style jsx>{`
                                    .scrollbar-none::-webkit-scrollbar { display: none; }
                                `}</style>

                                {displayLogs.slice().reverse().map((log, i) => {
                                    // Determine color based on log color property
                                    const logColor = log.color === 'green' ? '#00FF41' : '#FF6B35'; // Brand Orange
                                    const isGreen = log.color === 'green';
                                    const isLastLog = i === 0; // Last log gets the cursor

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`font-mono text-lg my-1 ${isGreen ? 'font-extrabold' : 'font-bold'}`}
                                            style={{
                                                color: logColor,
                                                textShadow: `0 0 ${isGreen ? '10px' : '5px'} ${logColor}`
                                            }}
                                        >
                                            <span
                                                className="mr-2"
                                                style={{
                                                    color: `${logColor}60`,
                                                    opacity: 0.7,
                                                    textShadow: `0 0 3px ${logColor}60`
                                                }}
                                            >
                                                [{new Date().toLocaleTimeString()}]
                                            </span>
                                            {log.text}
                                            {isLastLog && (
                                                <motion.span
                                                    animate={{ opacity: [1, 0] }}
                                                    transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                                                    className="ml-1"
                                                    style={{ color: logColor }}
                                                >
                                                    █
                                                </motion.span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        <div
                            className="mt-4 flex justify-between text-xs font-mono uppercase transition-colors duration-500"
                            style={{ color: `${terminalColor}60` }}
                        >
                            <span>Cpu: 98%</span>
                            <span>Ram: 42%</span>
                            <span>Encryption: 256-bit</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
