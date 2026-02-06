'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        // Handle the auth callback
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Check if user has completed onboarding
                const { data: profile } = await supabase
                    .from('brand_profiles')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .single();

                if (profile) {
                    // User has profile, go to dashboard
                    router.push('/dashboard');
                } else {
                    // New user, needs onboarding
                    router.push('/onboarding');
                }
            }
        });
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400">Completing sign in...</p>
            </div>
        </div>
    );
}
