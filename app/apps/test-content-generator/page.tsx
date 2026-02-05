import InstantContentGenerator from '@/components/dashboard/InstantContentGenerator';

export default function TestContentGeneratorPage() {
    return (
        <div className="min-h-screen bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white">
                        🎨 Component Test Suite
                    </h1>
                    <p className="text-zinc-400">
                        Testing InstantContentGenerator + SocialCardMockup
                    </p>
                </div>

                {/* Test Instance */}
                <InstantContentGenerator
                    brandName="Taylored Solutions"
                    industry="AI Marketing"
                    primaryColor="#FF6B35"
                />

                {/* Test Info */}
                <div className="mt-12 p-6 bg-zinc-900/50 border border-white/10 rounded-2xl">
                    <h3 className="text-white font-semibold mb-4">Test Checklist</h3>
                    <ul className="space-y-2 text-sm text-zinc-300">
                        <li>✅ Click tabs to see typewriter effect (15ms/char)</li>
                        <li>✅ Watch shimmer animation during generation</li>
                        <li>✅ Click heart icon to see scale + color animation</li>
                        <li>✅ Click copy button in caption area</li>
                        <li>✅ Verify toast notification appears</li>
                        <li>✅ Check responsive layout (resize browser)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
