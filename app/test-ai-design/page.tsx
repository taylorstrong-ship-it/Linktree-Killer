'use client';

import { useState } from 'react';
import SocialPreviewWidget from '@/components/dashboard/SocialPreviewWidget';

export default function TestPage() {
    const [testData] = useState({
        businessName: 'Acme Fitness Studio',
        logo_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        vibe: 'Bold & Energetic',
        primaryColor: '#FF6B35',
        industry: 'Fitness',
    });

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        AI Design Test
                    </h1>
                    <p className="text-zinc-400">
                        Testing Gemini 3.0 Pro Image (Nano Banana Pro)
                    </p>
                    <p className="text-zinc-600 text-sm mt-2">
                        Model: <code className="text-emerald-400">gemini-3-pro-image-preview</code>
                    </p>
                </div>

                {/* Test Widget */}
                <div className="flex justify-center">
                    <SocialPreviewWidget
                        brandData={testData}
                        handleEditPage={() => {
                            console.log('Remix clicked!');
                            alert('Remix button works! Routing to /generator?remix=true');
                        }}
                    />
                </div>

                {/* Instructions */}
                <div className="mt-16 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        What to Expect:
                    </h2>
                    <ol className="space-y-2 text-zinc-300 list-decimal list-inside">
                        <li>Component mounts with 500ms delay</li>
                        <li>Radar scan animation appears (green grid + rotating beam)</li>
                        <li>API generates image using Gemini 3.0 Pro</li>
                        <li>Smooth cross-fade to generated image (0.6s)</li>
                        <li>"✨ Remix This" button slides up from bottom</li>
                    </ol>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">
                            Test Data Being Used:
                        </h3>
                        <pre className="text-xs text-zinc-500 bg-black/50 p-3 rounded-lg overflow-x-auto">
                            {JSON.stringify(testData, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
