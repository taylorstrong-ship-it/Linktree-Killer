/**
 * 🤖 AI-Assisted Maintenance Guide 🤖
 * 
 * **File:** app/[username]/page.tsx
 * **Purpose:** This is the public-facing link-in-bio page for a user.
 * 
 * **Key Logic:**
 * 1. **Dynamic Routing:** It uses the `[username]` parameter from the URL to fetch the correct profile.
 * 2. **Data Fetching:** It fetches the profile data directly from the Supabase `profiles` table using the username.
 * 3. **Rendering:** It renders the user's avatar, title, description, and a list of links.
 * 4. **404 Handling:** If no profile is found for the given username, it displays a "User not found" message.
 * 
 * **Common Issues to Check:**
 * - **Profile Not Found:** Ensure the username exists in the `profiles` table and that the RLS (Row Level Security) policies allow public access.
 * - **Links Not Displaying:** Check that the `profile.links` array is being fetched and mapped correctly.
 * - **Styling Issues:** Verify that the theme colors and font styles are being applied correctly from the profile data.
 */

import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';

// 1. Setup Supabase for Server Component
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Define the Page Props (Next.js 15: params is now a Promise)
interface Props {
    params: Promise<{ username: string }>;
}

// 3. Dynamic Metadata (Sets the browser tab title)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params; // Next.js 15: await params
    const { data } = await supabase
        .from('profiles')
        .select('title, description')
        .eq('username', username)
        .single();

    return {
        title: data?.title || 'Taylored Link',
        description: data?.description || 'Check out my links',
    };
}

// 4. The Main Page Component
export default async function PublicProfile({ params }: Props) {
    const { username } = await params; // Next.js 15: await params

    // Fetch the user's profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    // If no user found, show 404
    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-3xl font-bold mb-4">User not found 😕</h1>
                <p className="text-slate-400 mb-8">This handle hasn't been claimed yet.</p>
                <Link
                    href="/builder"
                    className="px-6 py-3 bg-blue-600 rounded-full font-medium hover:bg-blue-500 transition"
                >
                    Claim "{username}"
                </Link>
            </div>
        );
    }

    // --- REUSE THE PHONE PREVIEW LOGIC (BUT FULL SCREEN) ---
    // Note: We are essentially "re-building" the view here to ensure it matches.
    // In a perfect world, we would extract <ProfileView /> to a shared component.
    // For now, we render the structure directly to ensure it works immediately.

    return (
        <div className="min-h-screen w-full relative overflow-hidden text-white">
            {/* Analytics Tracker - Invisible, handles page views and pixel injection */}
            <AnalyticsTracker
                profileId={profile.id}
                fbPixel={profile.fb_pixel_id}
                googleAnalytics={profile.google_analytics_id}
            />

            {/* 1. Background Layer */}
            <BackgroundLayer profile={profile} />

            {/* 2. Content Container */}
            <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col p-6">

                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mt-12 mb-8">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 mb-4 shadow-xl">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-700 animate-pulse" />
                        )}
                    </div>
                    <h1 className={`text-2xl font-bold mb-1 ${getFont(profile.font_style)}`}>{profile.title}</h1>
                    <p className="text-slate-200 opacity-90">{profile.description}</p>
                </div>

                {/* Newsletter (If enabled) */}
                {profile.newsletter_active && (
                    <div className="mb-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                        <h3 className="font-medium mb-3">{profile.newsletter_heading || "Join my list"}</h3>
                        <form className="flex gap-2">
                            <input type="email" placeholder="Your email" className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-500/50" />
                            <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200">Join</button>
                        </form>
                    </div>
                )}

                {/* Links Stack */}
                <div className="flex flex-col gap-4 pb-12">
                    {profile.links?.map((link: any, i: number) => (
                        <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between backdrop-blur-sm"
                        >
                            <span className={`font-medium ${getFont(profile.font_style)}`}>{link.title}</span>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-auto py-6 text-center">
                    <Link href="/" className="text-xs font-bold opacity-30 hover:opacity-100 transition uppercase tracking-widest">
                        Built with Taylored.ai
                    </Link>
                </div>

            </div>
        </div>
    );
}

// --- HELPER COMPONENTS (Paste these at bottom of file) ---

function getFont(style: string) {
    if (style === 'elegant') return 'font-serif';
    if (style === 'brutal') return 'font-mono';
    return 'font-sans';
}

function BackgroundLayer({ profile }: { profile: any }) {
    const { background_type, theme_color, accent_color, video_background_url } = profile;

    if (background_type === 'video' && video_background_url) {
        return (
            <>
                <video
                    src={video_background_url}
                    autoPlay loop muted playsInline
                    className="fixed inset-0 w-full h-full object-cover z-0"
                />
                <div className="fixed inset-0 bg-black/40 z-0" />
            </>
        );
    }

    // Default: Mesh / Lava Gradient
    return (
        <div
            className="fixed inset-0 z-0 bg-slate-950"
            style={{
                background: `radial-gradient(circle at 50% 50%, ${theme_color}40 0%, ${accent_color || '#000'}40 100%)`
            }}
        >
            {/* Simple animated blobs for public view */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob" style={{ backgroundColor: theme_color }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: accent_color || '#8b5cf6' }}></div>
        </div>
    );
}
