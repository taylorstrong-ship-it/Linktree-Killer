'use client';

import { Megaphone, Sparkles, TrendingUp } from 'lucide-react';

export default function AdCampaignGenerator() {
    return (
        <div className="w-full bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                    <Megaphone className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-xl">Ad Generator</h3>
                    <p className="text-indigo-200/60 text-sm">Campaigns Ready</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                <h4 className="text-white font-medium text-lg">Taylor High-Convert Creatives</h4>
                <p className="text-slate-400 text-sm max-w-xs">
                    Uses your Brand DNA to instantly create Facebook & Instagram ads that match your vibe.
                </p>
            </div>

            <div className="mt-auto space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-xs text-indigo-300/80 justify-center mb-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>Conversion Optimized</span>
                </div>
                <button className="w-full bg-white text-indigo-950 font-bold py-3 px-4 rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/20 active:scale-95">
                    Taylor Creatives
                </button>
            </div>
        </div>
    );
}
