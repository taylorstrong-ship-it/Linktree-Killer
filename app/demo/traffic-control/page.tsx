import ReviewGuardHero from '@/components/dashboard/ReviewGuardHero';

export const metadata = {
    title: 'Traffic Control Demo | Taylored AI Solutions',
    description: 'Review Guard traffic control demonstration',
};

export default function TrafficControlDemoPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8">
            <div className="max-w-6xl mx-auto">
                <ReviewGuardHero />

                <div className="mt-8 p-6 rounded-xl border border-white/10 bg-white/5">
                    <h3 className="text-xl font-bold text-white mb-3">How It Works</h3>
                    <div className="space-y-2 text-gray-400 text-sm">
                        <p>• <strong className="text-amber-400">1-Star Reviews:</strong> Intercepted and sent to owner as private drafts for approval</p>
                        <p>• <strong className="text-green-400">5-Star Reviews:</strong> Automatically published to Google with AI-generated response</p>
                        <p>• <strong className="text-blue-400">The Brain:</strong> Decision node analyzes sentiment and routes accordingly</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
