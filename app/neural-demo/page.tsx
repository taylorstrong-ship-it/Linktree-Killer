'use client';

import { useState, useEffect } from 'react';
import NeuralUplink from '@/components/dashboard/NeuralUplink';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_BRAND_DNA = {
    // Core Identity
    company_name: 'Taylored AI Solutions',
    business_type: 'AI Software & Automation',
    industry: 'Technology',
    description: 'High-performance AI software for businesses',

    // Visual Assets
    logo_url: '',
    brand_images: [],

    // Colors
    primary_color: '#F59E0B',

    // Additional context
    tone: 'Professional and innovative',
    business_intel: {
        services: [
            'AI-powered social media automation',
            'Brand DNA extraction',
            'Custom AI agent development',
            'Voice AI integration',
        ],
        hours: 'Available 24/7 via AI assistants',
        specialization: 'High-performance AI software for businesses',
        contact: 'Automated demos available on demand',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function NeuralDemoPage() {
    const [brandDNA, setBrandDNA] = useState(DEMO_BRAND_DNA);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Try to load from localStorage
        const stored = localStorage.getItem('brandDNA');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setBrandDNA(parsed);
            } catch (e) {
                console.warn('Failed to parse stored brandDNA');
            }
        }
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Initializing Neural Link...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 pt-12">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Neural Uplink Demo
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Experience real-time AI assistance powered by your Brand DNA.
                        Ask questions via voice or text and watch the agents respond instantly.
                    </p>
                </div>

                {/* Demo Instructions */}
                <div className="max-w-4xl mx-auto mb-12 p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-3">Try These Questions:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-black/50 border border-gray-800">
                            <p className="text-sm text-gray-300">"What services do you offer?"</p>
                        </div>
                        <div className="p-3 rounded-lg bg-black/50 border border-gray-800">
                            <p className="text-sm text-gray-300">"Are you available 24/7?"</p>
                        </div>
                        <div className="p-3 rounded-lg bg-black/50 border border-gray-800">
                            <p className="text-sm text-gray-300">"Tell me about your AI automation"</p>
                        </div>
                        <div className="p-3 rounded-lg bg-black/50 border border-gray-800">
                            <p className="text-sm text-gray-300">"How can I contact you?"</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Neural Uplink Component */}
            <div className="max-w-7xl mx-auto px-4">
                <NeuralUplink brandDNA={brandDNA} />
            </div>

            {/* Footer Info */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-800/30">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-2">
                                Powered by Gemini 2.0 Flash
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                This demo uses the latest 2026 AI architecture for ultra-low latency responses.
                                All answers are generated in real-time based on your actual Brand DNA data.
                            </p>
                            <p className="text-gray-500 text-xs mt-3">
                                Voice features require Chrome browser • Chat works in all modern browsers
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
