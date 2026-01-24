'use client';

import { useState, useRef } from 'react';
import { Wand2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { scrapeProfileFromUrl, type ScrapedProfile } from '@/app/actions/magic-scrape';

interface MagicImporterProps {
    onImport: (data: ScrapedProfile) => void;
}

const LOADING_STEPS = [
    'Connecting to the neural network...',
    'Scanning pixel data for brand colors...',
    'Recognizing face in high-res...',
    'Analyzing bio for vibe check...',
    'Extracting social dna...',
    'Constructing digital identity...',
];

export function MagicImporter({ onImport }: MagicImporterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);

    // Use a ref for the interval to clear it easily
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startLoadingAnimation = () => {
        setLoadingStep(0);
        intervalRef.current = setInterval(() => {
            setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
        }, 1500);
    };

    const stopLoadingAnimation = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handleImport = async () => {
        if (!url) return;

        // Basic URL validation
        if (!url.startsWith('http')) {
            setError('Please enter a valid URL (start with http:// or https://)');
            return;
        }

        setIsLoading(true);
        setError(null);
        startLoadingAnimation();

        try {
            const data = await scrapeProfileFromUrl(url);
            console.log('Magic Import Success:', data);
            onImport(data);
            setIsOpen(false);
            setUrl('');
        } catch (err: any) {
            console.error('Import failed:', err);
            // Friendly error message
            if (err.message.includes('403')) {
                setError("This site is blocking our magic scanners. Try a different social link!");
            } else {
                setError(err.message || 'The magic fizzled out. Start typing manually?');
            }
        } finally {
            setIsLoading(false);
            stopLoadingAnimation();
        }
    };

    return (
        <div className="mb-8 p-1">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 p-[1px] shadow-xl transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-fuchsia-500/20"
                >
                    <div className="relative flex h-14 w-full items-center justify-center rounded-xl bg-slate-950 px-6 transition-all group-hover:bg-slate-950/80">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-indigo-600/20 blur-xl transition-all group-hover:opacity-100 opacity-0" />
                        <Sparkles className="mr-2 h-5 w-5 text-fuchsia-400 animate-pulse" />
                        <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-lg font-bold text-transparent">
                            Magic Import from URL
                        </span>
                        <div className="ml-2 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-xs font-medium text-fuchsia-300 border border-fuchsia-500/30">
                            BETA
                        </div>
                    </div>
                </button>
            ) : (
                <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-slate-900/80 p-6 backdrop-blur-xl transition-all animate-in fade-in slide-in-from-top-4">
                    {/* Glow effect */}
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center">
                                <Wand2 className="mr-2 h-5 w-5 text-violet-400" />
                                Paste your Linktree or Social URL
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://linktr.ee/yourname"
                                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all font-mono text-sm"
                                disabled={isLoading}
                                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                            />
                            <button
                                onClick={handleImport}
                                disabled={isLoading || !url}
                                className="flex items-center justify-center rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Import'
                                )}
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-3 flex items-center gap-2 text-red-400 text-sm animate-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        {/* Loading State Animation */}
                        {isLoading && (
                            <div className="mt-6 flex flex-col items-center justify-center py-4 space-y-3 animate-in fade-in">
                                <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 animate-progress origin-left"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <p className="text-sm font-medium text-fuchsia-300 animate-pulse">
                                    {LOADING_STEPS[loadingStep]}
                                </p>
                            </div>
                        )}

                        <p className="mt-4 text-xs text-slate-500 text-center">
                            Our AI will visit the site, extract colors, photos, and write a bio for you.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
