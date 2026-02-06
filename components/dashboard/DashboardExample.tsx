/**
 * EXAMPLE: Dashboard Integration
 * 
 * This shows how to integrate SocialPreviewWidget into your dashboard.
 * Use this as a reference when implementing.
 */

'use client';

import { useState, useEffect } from 'react';
import SocialPreviewWidget from '@/components/dashboard/SocialPreviewWidget';

export default function DashboardExample() {
    const [brandData, setBrandData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch brand data on mount (replace with your actual data source)
    useEffect(() => {
        const loadBrandData = async () => {
            try {
                // Example: Fetch from localStorage or Supabase
                const stored = localStorage.getItem('brand_dna');
                if (stored) {
                    setBrandData(JSON.parse(stored));
                } else {
                    // Fallback demo data
                    setBrandData({
                        businessName: 'Acme Fitness Studio',
                        logo_url: 'https://example.com/logo.png',
                        vibe: 'Bold & Energetic',
                        primaryColor: '#FF6B35',
                        industry: 'Fitness',
                    });
                }
            } catch (error) {
                console.error('Failed to load brand data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBrandData();
    }, []);

    const handleEditPage = () => {
        // Save any dashboard state before routing
        const dashboardState = {
            lastView: 'social-preview',
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem('dashboard_state', JSON.stringify(dashboardState));

        console.log('Navigating to generator...');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <p className="text-zinc-500">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Dashboard
                    </h1>
                    <p className="text-zinc-400">
                        Your brand's command center
                    </p>
                </div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Stats & Analytics */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Brand Overview
                            </h2>
                            <div className="space-y-3 text-zinc-300">
                                <p><strong>Business:</strong> {brandData?.businessName}</p>
                                <p><strong>Vibe:</strong> {brandData?.vibe}</p>
                                <p><strong>Industry:</strong> {brandData?.industry}</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Quick Stats
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-[#FF6B35]">24</p>
                                    <p className="text-zinc-500 text-sm">Posts</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-[#00FF41]">1.2k</p>
                                    <p className="text-zinc-500 text-sm">Engagements</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Social Preview Widget */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4">
                                AI-Powered Preview
                            </h2>
                            <p className="text-zinc-400 text-sm mb-6">
                                Your brand's social presence, visualized in real-time
                            </p>
                        </div>

                        {/* THE WIDGET */}
                        <SocialPreviewWidget
                            brandData={brandData}
                            handleEditPage={handleEditPage}
                        />

                        <p className="text-zinc-500 text-xs text-center">
                            Preview generates automatically. Click "Remix This" to customize.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
