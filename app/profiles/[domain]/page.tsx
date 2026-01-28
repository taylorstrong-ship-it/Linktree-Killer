import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

// 1. Initialize Supabase (Server-Side capable for public data)
// Using keys from lib/supabase/client.ts
const supabase = createClient(
    'https://qxkicdhsrlpehgcsapsh.supabase.co',
    'sb_publishable_TTBR0ES-pM7LOWDsywEy7A_9BSlhWGg'
);

// Helper: Identify Social Links
const getSocialIcon = (url: string) => {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram.com')) return { icon: 'fa-instagram', color: '#E1306C', label: 'Instagram' };
    if (lowerUrl.includes('tiktok.com')) return { icon: 'fa-tiktok', color: '#000000', label: 'TikTok' };
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return { icon: 'fa-x-twitter', color: '#000000', label: 'X' };
    if (lowerUrl.includes('facebook.com')) return { icon: 'fa-facebook', color: '#1877F2', label: 'Facebook' };
    if (lowerUrl.includes('youtube.com')) return { icon: 'fa-youtube', color: '#FF0000', label: 'YouTube' };
    if (lowerUrl.includes('linkedin.com')) return { icon: 'fa-linkedin', color: '#0077B5', label: 'LinkedIn' };
    if (lowerUrl.includes('twitch.tv')) return { icon: 'fa-twitch', color: '#9146FF', label: 'Twitch' };
    if (lowerUrl.includes('github.com')) return { icon: 'fa-github', color: '#181717', label: 'GitHub' };
    if (lowerUrl.includes('snapchat.com')) return { icon: 'fa-snapchat', color: '#FFFC00', label: 'Snapchat' };
    if (lowerUrl.includes('whatsapp.com')) return { icon: 'fa-whatsapp', color: '#25D366', label: 'WhatsApp' };
    if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram.org')) return { icon: 'fa-telegram', color: '#0088cc', label: 'Telegram' };
    if (lowerUrl.includes('spotify.com')) return { icon: 'fa-spotify', color: '#1DB954', label: 'Spotify' };
    if (lowerUrl.includes('soundcloud.com')) return { icon: 'fa-soundcloud', color: '#ff5500', label: 'SoundCloud' };
    return null;
};

export const revalidate = 0; // Disable static caching to allow fresh updates

export default async function ProfilePage({ params }: { params: Promise<{ domain: string }> }) {
    const resolvedParams = await params;
    const domain = decodeURIComponent(resolvedParams.domain);

    // 2. Extract Username
    // Strategy: "bio.tayloredpetportraits.com" -> remove "bio." -> "tayloredpetportraits.com" -> split "." -> "tayloredpetportraits"
    // Default fallback if logic fails: use the whole string or handle errors
    let username = domain;
    if (domain.startsWith('bio.')) {
        username = domain.replace('bio.', '').split('.')[0];
    } else {
        // Handle "tayloredpetportraits.com" -> "tayloredpetportraits"
        username = domain.split('.')[0];
    }

    // Clean up any remaining www or https (though middleware gives us hostname)
    username = username.toLowerCase();

    // 3. Fetch Data
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !profile) {
        console.error(`Profile not found for username: ${username} (Domain: ${domain})`);
        // Ideally retrieve by ID if username is missing? 
        // But architecture says we save username.
        // If not found, show 404
        return notFound();
    }

    // 4. Transform Links if needed (ensure it's an array)
    const links = Array.isArray(profile.links) ? profile.links : [];

    return (
        // Page Container: Light Gray Patterned Background
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50"
            style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

            {/* Mobile Card Container */}
            <div className="w-full max-w-[400px] bg-white rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative">

                {/* Header Section */}
                <div className="flex flex-col items-center pt-12 pb-8 px-6 text-center">
                    {/* Logo / Avatar */}
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 mb-4">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-3xl font-bold">
                                {profile.title?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>

                    {/* Title & Bio */}
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        {profile.title || profile.display_name || "Welcome"}
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed px-2">
                        {profile.description || profile.bio}
                    </p>
                </div>

                {/* Social Icons Row */}
                <div className="flex flex-wrap justify-center gap-4 px-6 mb-6">
                    {links.filter((link: any) => getSocialIcon(link.url)).map((link: any, index: number) => {
                        const social = getSocialIcon(link.url);
                        if (!social) return null;
                        return (
                            <a
                                key={`social-${index}`}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md transition-transform hover:scale-110 hover:shadow-lg text-2xl"
                                style={{ color: social.color }}
                                title={link.title || social.label}
                            >
                                <i className={`fa-brands ${social.icon}`}></i>
                            </a>
                        );
                    })}
                </div>

                {/* Main Action Buttons */}
                <div className="flex-1 px-6 pb-12 space-y-4">
                    {links.filter((link: any) => !getSocialIcon(link.url)).map((link: any, index: number) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full"
                        >
                            <div className="w-full py-4 px-6 rounded-full bg-[#7DD3FC] hover:bg-[#38bdf8] transition-all transform hover:scale-[1.02] shadow-md flex items-center relative group">

                                {/* Icon (Left) - Generic for custom links */}
                                <div className="absolute left-6 text-white text-xl">
                                    <i className="fa-solid fa-link"></i>
                                </div>

                                {/* Text (Centered) */}
                                <div className="w-full text-center text-white font-bold text-sm tracking-wide">
                                    {link.title || link.label}
                                </div>
                            </div>
                        </a>
                    ))}

                    {links.length === 0 && (
                        <div className="text-center text-gray-400 text-sm mt-8">
                            No links found.
                        </div>
                    )}
                </div>

                {/* Footer Branding */}
                <div className="pb-6 text-center">
                    <a href="https://tayloredsolutions.ai" className="text-[10px] font-bold text-gray-300 hover:text-gray-400 uppercase tracking-widest">
                        Powered by Taylored AI
                    </a>
                </div>

            </div>

            {/* Font Awesome CDN (ensure icons work) */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
