'use client';

import dynamic from 'next/dynamic';
import { BrandDNA } from '@/types/brand';

// 🛡️ NUCLEAR FIX: Dynamic import with SSR disabled
// This prevents Vapi from EVER running on the server
const NeuralUplinkClient = dynamic(
    () => import('./NeuralUplinkClient'),
    {
        ssr: false, // 🔥 THIS KILLS THE SERVER HANG
        loading: () => (
            <div className="relative w-full max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-3">Taylored Voice Agent</h2>
                    <p className="text-white/60">Loading neural interface...</p>
                </div>
            </div>
        )
    }
);

interface NeuralUplinkProps {
    brandDNA: BrandDNA;
}

export default function NeuralUplink({ brandDNA }: NeuralUplinkProps) {
    return <NeuralUplinkClient brandDNA={brandDNA} />;
}
