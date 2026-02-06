/**
 * 🤖 AI-Assisted Maintenance Guide 🤖
 * 
 * **File:** app/builder/page.tsx
 * **Purpose:** This is the core page builder where users customize their link-in-bio page.
 * 
 * **Key Logic:**
 * 1. **Data Loading:** It first tries to load user data from the Supabase database. If that fails, it checks `localStorage` for data from the initial scan.
 * 2. **State Management:** A large `useState` hook manages the entire profile object, including links, theme, and social media handles.
 * 3. **Link Management:**
 *    - `addLink`: Adds a new empty link object to the `profile.links` array.
 *    - `removeLink`: Removes a link from the array by its index.
 *    - `updateLink`: Updates a specific link's title or URL.
 *    - `moveLink`: Reorders links using up/down buttons (NO DRAG AND DROP YET).
 * 4. **Saving Data:** The `saveProfile` function saves the entire profile object to the Supabase `profiles` table.
 * 5. **Authentication:** It checks for an authenticated user. If the user is a guest, it prompts them to sign up or log in before saving.
 * 
 * **Common Issues to Check:**
 * - **Links Not Saving:** Check the `saveProfile` function for errors. Ensure the `links` array is correctly formatted before sending to Supabase.
 * - **Data Not Loading:** Verify the `initializeProfile` function is correctly fetching data from Supabase or `localStorage`.
 * - **Authentication Errors:** Check the Supabase client and the user session logic.
 * - **Drag and Drop:** This is not implemented. The `moveLink` function is the current method for reordering.
 */

// @ts-nocheck
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import ImageUpload from '@/components/upload/ImageUpload'
import { MagicImporter } from '@/components/magic-importer'
import type { ScrapedProfile } from '@/app/actions/magic-scrape'
import PhonePreview from '@/components/PhonePreview'
import AuthModal from '@/components/AuthModal'
import { SortableLinksList } from '@/components/builder/SortableLinksList'
import { Waves, Zap, Tornado, Flame, Check, Pencil, Eye } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface Link {
    title: string
    url: string
    position?: number  // For drag-and-drop ordering
}

interface ProfileData {
    id?: string
    user_id?: string
    title: string
    description: string
    avatar_url: string
    background_image: string
    background_type: 'mesh' | 'video'  // NEW: Theme Engine
    video_background_url: string       // NEW: Video background URL
    font_style: 'modern' | 'elegant' | 'brutal'  // NEW: Typography Engine
    theme_color: string
    accent_color: string  // NEW: Living Gradients secondary color
    animation_speed: 'slow' | 'medium' | 'fast'  // NEW: Animation speed control
    animation_type: 'drift' | 'pulse' | 'swirl' | 'lava'  // NEW: Animation pattern control
    texture_overlay: 'none' | 'noise' | 'grid' | 'lines'  // NEW: Texture overlays
    enable_spotlight: boolean  // NEW: Cursor spotlight effect
    contact_email: string
    lead_gen_enabled: boolean
    newsletter_active: boolean  // NEW: Newsletter signup block enabled
    newsletter_heading: string  // NEW: Newsletter heading text
    newsletter_size: 'small' | 'medium' | 'large'  // NEW: Newsletter size control
    video_url: string
    social_spotlight_url: string  // NEW: Instagram/TikTok URL
    showcase: { before: string; after: string }  // NEW: Before/After Slider
    page_views?: number  // NEW: Total page views counter
    fb_pixel_id?: string  // NEW: Facebook Pixel ID
    google_analytics_id?: string  // NEW: Google Analytics GA4 ID
    socials: {
        instagram?: string
        tiktok?: string
        facebook?: string
        email?: string
    }
    links: Link[]
    gallery_images: string[]
}

function BuilderPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false) // Default to guest mode
    const [loading, setLoading] = useState(true)
    const [authChecking, setAuthChecking] = useState(true) // STABILITY PATCH: Track auth check separately
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [username, setUsername] = useState('') // NEW: Claim URL State
    const [showSuccessModal, setShowSuccessModal] = useState(false) // NEW: Success Modal State
    const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor') // MOBILE: Toggle between editor and preview
    const [showAuthModal, setShowAuthModal] = useState(false) // NEW: Auth Modal for guests
    const [profile, setProfile] = useState<ProfileData>({
        title: '',
        description: '',
        avatar_url: '',
        background_image: '',
        background_type: 'mesh',
        video_background_url: '',
        font_style: 'modern',
        theme_color: '#3b82f6',
        accent_color: '#8b5cf6',  // Complementary violet for gradients
        animation_speed: 'medium',
        animation_type: 'drift',
        texture_overlay: 'none',
        enable_spotlight: false,
        contact_email: '',
        lead_gen_enabled: false,
        newsletter_active: false,
        newsletter_heading: 'Join my newsletter',
        video_url: '',
        social_spotlight_url: '',
        showcase: { before: '', after: '' },
        page_views: 0,
        fb_pixel_id: '',
        google_analytics_id: '',
        socials: {
            instagram: '',
            tiktok: '',
            facebook: '',
            email: ''
        },
        links: [],
        gallery_images: []
    })

    // 🔌 STABILITY PATCH: DUAL-MODE BUILDER LOGIC (THE GATEKEEPER)
    // Priority: Session Check FIRST, then DB (Owner) or localStorage (Guest)
    useEffect(() => {
        async function initializeProfile() {
            try {
                // 🚀 FORCE HANDOFF: Check for fresh session flag
                const isNewSession = searchParams?.get('session') === 'new';

                if (isNewSession) {
                    console.log('🚨 FORCE HANDOFF DETECTED: Loading fresh data from localStorage...');

                    // Clear query param immediately to prevent loops
                    router.replace('/builder');

                    // Force load from localStorage (bypass all other checks)
                    const savedData = localStorage.getItem('taylored_brand_data');
                    if (savedData) {
                        try {
                            const parsed = JSON.parse(savedData);
                            console.log('📦 FORCE HANDOFF: Fresh Golden Record loaded:', parsed);

                            // Apply comprehensive Brand DNA mapping
                            const brandDNAProfile = {
                                ...profile,
                                title: parsed.title || profile.title,
                                description: parsed.bio || parsed.description || profile.description,
                                avatar_url: parsed.logo_url || parsed.avatar_url || profile.avatar_url,
                                theme_color: parsed.brand_colors?.[0] || parsed.primary_color || profile.theme_color,
                                accent_color: parsed.brand_colors?.[1] || parsed.accent_color || profile.accent_color,
                                font_style: (() => {
                                    const font = parsed.fonts?.[0];
                                    const fontString = typeof font === 'string' ? font : (font?.family || '');
                                    if (fontString.toLowerCase().includes('serif')) return 'elegant';
                                    if (fontString.toLowerCase().includes('mono')) return 'brutal';
                                    return 'modern';
                                })(),
                                socials: {
                                    instagram: parsed.social_links?.find((s: any) => s.platform === 'instagram')?.url || '',
                                    tiktok: parsed.social_links?.find((s: any) => s.platform === 'tiktok')?.url || '',
                                    facebook: parsed.social_links?.find((s: any) => s.platform === 'facebook')?.url || '',
                                    email: parsed.social_links?.find((s: any) => s.platform === 'email')?.url?.replace('mailto:', '') || '',
                                },
                                links: parsed.suggested_ctas && parsed.suggested_ctas.length > 0
                                    ? parsed.suggested_ctas.map((cta: any, idx: number) => ({
                                        title: cta.label || cta.title,
                                        url: cta.url,
                                        position: idx
                                    }))
                                    : (parsed.links && Array.isArray(parsed.links) && parsed.links.length > 0)
                                        ? parsed.links.map((link: any, idx: number) => ({
                                            title: link.title || link.label,
                                            url: link.url,
                                            position: idx
                                        }))
                                        : profile.links
                            };

                            setProfile(brandDNAProfile);

                            if (parsed.title) {
                                const generated = parsed.title.toLowerCase().replace(/\s+/g, '');
                                setUsername(generated);
                            }

                            setIsAuthenticated(true); // Enable builder UI
                            setAuthChecking(false);
                            setLoading(false);

                            console.log('✅ FORCE HANDOFF COMPLETE: Fresh data loaded');
                            return; // Exit early, skip normal flow
                        } catch (e) {
                            console.error('❌ FORCE HANDOFF FAILED: Data corruption', e);
                        }
                    } else {
                        console.warn('⚠️ FORCE HANDOFF: No localStorage data found');
                    }
                }

                console.log('🔒 GATEKEEPER: Checking authentication...');
                setAuthChecking(true);

                // STEP 1: Check Supabase session (NOT getUser - session is faster)
                const { data: { session } } = await supabase.auth.getSession();

                // STEP 2A: OWNER MODE - Session exists
                if (session?.user) {
                    const user = session.user;
                    console.log("✅ OWNER MODE: User authenticated:", user.id);
                    setIsAuthenticated(true);
                    setUserId(user.id);
                    setAuthChecking(false);

                    // Fetch profile from Supabase (IGNORE localStorage)
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (data && !error) {
                        console.log("📦 Loading profile from database...");
                        console.log("📊 DB Data:", {
                            title: data.title,
                            avatar: data.avatar_url,
                            links_count: data.links?.length || 0,
                            socials: data.socials
                        });

                        const rawData = data as any;

                        // Step 3: Load ALL links as custom links (no splitting by domain)
                        // The live site renders profile.links directly, so we do the same
                        const customLinks: Link[] = rawData.links || [];
                        const socialsObj = rawData.socials || { instagram: '', tiktok: '', facebook: '', email: '' };

                        setProfile({
                            ...rawData,
                            showcase: rawData.showcase || { before: '', after: '' },
                            socials: socialsObj,
                            links: customLinks,
                            newsletter_active: rawData.newsletter_active || false,
                            texture_overlay: rawData.texture_overlay || 'none',
                        });

                        // Set username from DB
                        if (rawData.username) {
                            setUsername(rawData.username);
                        }

                        // STABILITY FIX H1: Only clear localStorage after DB confirmation
                        // This prevents race conditions in multi-tab scenarios
                        console.log("🗑️ Clearing stale localStorage data after DB confirmation...");
                        const dbConfirmed = await supabase
                            .from('profiles')
                            .select('id')
                            .eq('id', user.id)
                            .single();

                        if (dbConfirmed.data) {
                            localStorage.removeItem('taylored_brand_data');
                            console.log("✅ localStorage cleared after DB verification");
                        }

                        setLoading(false);
                        return; // Successfully loaded from DB
                    }

                    // No DB profile found, check localStorage as fallback
                    console.log("⚠️ No database profile found. Checking localStorage...");
                    const savedData = localStorage.getItem('taylored_brand_data');
                    if (savedData) {
                        try {
                            const parsed = JSON.parse(savedData);
                            console.log('📥 Loading from localStorage as fallback...');
                            console.log('🔍 localStorage data:', parsed);
                            console.log('🔗 Links found:', parsed.links);
                            console.log('🎨 Brand colors:', parsed.brand_colors);
                            console.log('📱 Social links:', parsed.social_links);

                            // Map Brand DNA to profile structure
                            const brandDNAProfile = {
                                ...prev,
                                // Basic Info
                                title: parsed.title || prev.title,
                                description: parsed.bio || parsed.description || prev.description,
                                avatar_url: parsed.logo_url || parsed.avatar_url || prev.avatar_url,

                                // Colors - Full palette from Firecrawl v2
                                theme_color: parsed.brand_colors?.[0] || parsed.primary_color || prev.theme_color,
                                accent_color: parsed.brand_colors?.[1] || parsed.accent_color || prev.accent_color,

                                // Typography - Font detection (STABILITY FIX C2: Type guard for font objects)
                                font_style: (() => {
                                    const font = parsed.fonts?.[0];
                                    const fontString = typeof font === 'string' ? font : (font?.family || '');
                                    if (fontString.toLowerCase().includes('serif')) return 'elegant';
                                    if (fontString.toLowerCase().includes('mono')) return 'brutal';
                                    return 'modern';
                                })(),

                                // Social Links - Auto-populate from Brand DNA
                                socials: {
                                    instagram: parsed.social_links?.find((s: any) => s.platform === 'instagram')?.url || prev.socials.instagram,
                                    tiktok: parsed.social_links?.find((s: any) => s.platform === 'tiktok')?.url || prev.socials.tiktok,
                                    facebook: parsed.social_links?.find((s: any) => s.platform === 'facebook')?.url || prev.socials.facebook,
                                    email: parsed.social_links?.find((s: any) => s.platform === 'email')?.url?.replace('mailto:', '') || prev.socials.email,
                                },

                                // Links - Map suggested CTAs or use existing links
                                links: parsed.suggested_ctas && parsed.suggested_ctas.length > 0
                                    ? parsed.suggested_ctas.map((cta: any, idx: number) => ({
                                        title: cta.label || cta.title,
                                        url: cta.url,
                                        position: idx
                                    }))
                                    : (parsed.links && Array.isArray(parsed.links) && parsed.links.length > 0)
                                        ? parsed.links.map((link: any, idx: number) => ({
                                            title: link.title || link.label,
                                            url: link.url,
                                            position: idx
                                        }))
                                        : prev.links
                            };

                            setProfile(brandDNAProfile);

                            if (parsed.title) {
                                const generated = parsed.title.toLowerCase().replace(/\s+/g, '');
                                setUsername(generated);
                            }
                        } catch (e) {
                            console.error("Data corruption in localStorage", e);
                        }
                    }

                } else {
                    // STEP 2B: GUEST MODE - No session
                    console.log("👤 GUEST MODE: No authentication. Checking localStorage...");
                    setAuthChecking(false);

                    const savedData = localStorage.getItem('taylored_brand_data');
                    if (savedData) {
                        try {
                            const parsed = JSON.parse(savedData);
                            console.log('📥 Guest Mode: Loading Brand DNA from localStorage...');

                            // Apply same comprehensive Brand DNA mapping for guest users
                            const brandDNAProfile = {
                                ...prev,
                                title: parsed.title || prev.title,
                                description: parsed.bio || parsed.description || prev.description,
                                avatar_url: parsed.logo_url || parsed.avatar_url || prev.avatar_url,
                                theme_color: parsed.brand_colors?.[0] || parsed.primary_color || prev.theme_color,
                                accent_color: parsed.brand_colors?.[1] || parsed.accent_color || prev.accent_color,
                                // Typography - Font detection (STABILITY FIX C2: Type guard for font objects)
                                font_style: (() => {
                                    const font = parsed.fonts?.[0];
                                    const fontString = typeof font === 'string' ? font : (font?.family || '');
                                    if (fontString.toLowerCase().includes('serif')) return 'elegant';
                                    if (fontString.toLowerCase().includes('mono')) return 'brutal';
                                    return 'modern';
                                })(),
                                socials: {
                                    instagram: parsed.social_links?.find((s: any) => s.platform === 'instagram')?.url || '',
                                    tiktok: parsed.social_links?.find((s: any) => s.platform === 'tiktok')?.url || '',
                                    facebook: parsed.social_links?.find((s: any) => s.platform === 'facebook')?.url || '',
                                    email: parsed.social_links?.find((s: any) => s.platform === 'email')?.url?.replace('mailto:', '') || '',
                                },
                                links: parsed.suggested_ctas && parsed.suggested_ctas.length > 0
                                    ? parsed.suggested_ctas.map((cta: any, idx: number) => ({
                                        title: cta.label || cta.title,
                                        url: cta.url,
                                        position: idx
                                    }))
                                    : (parsed.links && Array.isArray(parsed.links) && parsed.links.length > 0)
                                        ? parsed.links.map((link: any, idx: number) => ({
                                            title: link.title || link.label,
                                            url: link.url,
                                            position: idx
                                        }))
                                        : prev.links
                            };

                            setProfile(brandDNAProfile);

                            if (parsed.title) {
                                const generated = parsed.title.toLowerCase().replace(/\s+/g, '');
                                setUsername(generated);
                            }

                            setIsAuthenticated(true); // Enable Guest Mode UI
                            console.log('✅ GUEST MODE: Loaded from localStorage');
                        } catch (e) {
                            console.error("❌ Data corruption in localStorage:", e);
                            // Redirect to home if data is corrupted
                            window.location.href = '/';
                        }
                    } else {
                        // No localStorage data - redirect to home
                        console.log('⚠️ GUEST MODE: No data found. Redirecting to home...');
                        window.location.href = '/';
                        return;
                    }
                }

            } catch (error) {
                console.error('Profile initialization failed:', error)
            } finally {
                setLoading(false)
            }
        }

        initializeProfile();
    }, []);

    // 📱 MOBILE: Orientation Detection - Auto-switch to desktop mode on landscape
    useEffect(() => {
        const handleResize = () => {
            // Force desktop mode if width >= 768px (prevents mobile overlay in landscape)
            if (window.innerWidth >= 768 && viewMode === 'preview') {
                setViewMode('editor');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    async function saveProfile() {
        setSaving(true)

        // 🔒 Guest Check: Show auth modal instead of redirecting
        if (!userId) {
            console.log("⚠️ Guest user detected. Showing auth modal...");
            // Save current state to localStorage
            localStorage.setItem('taylored_brand_data', JSON.stringify(profile));

            setSaving(false);
            setShowAuthModal(true); // Show modal instead of redirect
            return;
        }

        try {
            console.log('💾 Saving profile for user:', userId);

            // CRITICAL: Merge socials back into links array for database storage
            const socialLinks: Link[] = [];
            if (profile.socials.instagram) {
                socialLinks.push({ title: 'Instagram', url: profile.socials.instagram, position: 0 });
            }
            if (profile.socials.tiktok) {
                socialLinks.push({ title: 'TikTok', url: profile.socials.tiktok, position: 1 });
            }
            if (profile.socials.facebook) {
                socialLinks.push({ title: 'Facebook', url: profile.socials.facebook, position: 2 });
            }
            if (profile.socials.email) {
                socialLinks.push({ title: 'Email', url: `mailto:${profile.socials.email}`, position: 3 });
            }

            // Ensure all custom links have positions (based on array order)
            const customLinksWithPosition = profile.links.map((link, idx) => ({
                ...link,
                position: link.position !== undefined ? link.position : (socialLinks.length + idx)
            }));

            // Merge: Socials first, then custom links (position preserved)
            const mergedLinks = [...socialLinks, ...customLinksWithPosition];

            // Remove 'dna' field from profile before saving (it's not in the database schema)
            const { dna, ...profileWithoutDna } = profile as any;

            const updates = {
                id: userId,
                user_id: userId,
                username: username, // Save the handle
                ...profileWithoutDna,
                links: mergedLinks, // Save merged links with positions
                socials: profile.socials, // Also save to new socials column
                updated_at: new Date().toISOString()
            }

            console.log('💾 Saving profile with links:', mergedLinks);
            console.log('💾 Full updates object:', updates);

            const { error } = await supabase
                .from('profiles')
                .upsert(updates)

            if (error) throw error

            if (error) throw error

            // showToast('Changes Saved!', 'success') // Replaced by Modal
            setShowSuccessModal(true); // 🎉 Show Success Modal

            // Preview auto-updates via React props - no manual refresh needed! 🎉
        } catch (error) {
            console.error('Save error:', error)
            showToast('Save failed: ' + (error as Error).message, 'error')
        } finally {
            setSaving(false)
        }
    }

    async function handleLogout() {
        try {
            console.log('🚪 Logging out...');

            // STABILITY PATCH: Clear localStorage BEFORE signOut to prevent zombie state
            console.log('🧹 Clearing localStorage...');
            localStorage.removeItem('taylored_brand_data');
            localStorage.removeItem('taylored_guest_profile');

            // Also clear all other cached data
            sessionStorage.clear();

            // Sign out from Supabase
            await supabase.auth.signOut();
            console.log('✅ Logout complete');

            // Force redirect to home (with full reload)
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            // Force reload anyway to ensure clean state
            window.location.href = '/';
        }
    }

    // 🎉 NEW: Handle successful auth from modal
    async function handleAuthSuccess(newUserId: string) {
        try {
            console.log('🎉 Auth successful! Migrating guest data to database...');
            setShowAuthModal(false);
            setUserId(newUserId);

            // Read localStorage data
            const guestData = localStorage.getItem('taylored_brand_data');
            if (guestData) {
                const parsed = JSON.parse(guestData);
                console.log('📦 Found guest data to migrate:', parsed);

                // Merge guest data with current profile state
                const dataToSave = {
                    id: newUserId,
                    user_id: newUserId,
                    username: username || parsed.username,
                    ...profile,
                    updated_at: new Date().toISOString()
                };

                // Save to Supabase
                const { error } = await supabase
                    .from('profiles')
                    .upsert(dataToSave);

                if (error) throw error;

                console.log('✅ Guest data migrated successfully!');

                // Clear localStorage after successful migration
                localStorage.removeItem('taylored_brand_data');

                // Show success modal
                setShowSuccessModal(true);
            } else {
                // No guest data, just save current state
                await saveProfile();
            }
        } catch (error) {
            console.error('❌ Migration failed:', error);
            showToast('Account created but save failed: ' + (error as Error).message, 'error');
        }
    }

    // Emergency: Force reload from database
    async function forceReloadFromDatabase() {
        try {
            console.log('🔄 FORCING DATABASE RELOAD...');

            // Clear ALL cache
            localStorage.clear();
            sessionStorage.clear();

            // Reload the page with cache bypass
            window.location.reload(true);
        } catch (error) {
            console.error('Force reload error:', error);
            window.location.reload();
        }
    }

    function refreshPreview() {
        console.log('🔄 Refreshing preview iframe...')
        const iframe = document.getElementById('preview-frame') as HTMLIFrameElement
        if (iframe?.contentWindow) {
            try {
                iframe.contentWindow.location.reload()
                console.log('✅ Preview refreshed successfully')
            } catch (error) {
                console.error('Failed to reload iframe:', error)
                // Fallback: Try to reload by changing src
                const currentSrc = iframe.src
                iframe.src = currentSrc + '?v=' + Date.now()
            }
        } else {
            console.error('❌ Preview iframe not found')
        }
    }

    async function handleImageUpload(url: string, field: keyof ProfileData) {
        try {
            console.log(`📤 Uploading ${field}:`, url)

            // Create the updated profile data FIRST (using current state)
            const updatedProfile = {
                ...profile,
                [field]: url
            }

            console.log('📝 Updating local state immediately...')
            // Update React state immediately with the new data
            setProfile(updatedProfile)

            console.log('💾 Saving to Supabase...')
            // Auto-save to Supabase with the SAME updated data
            const updates = {
                id: userId,
                user_id: userId,
                ...updatedProfile,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(updates)

            if (error) throw error

            console.log('✅ Saved to database successfully')
            showToast('Image uploaded & saved!', 'success')

            // Refresh preview immediately - use setTimeout to ensure state has updated
            console.log('⏱️ Scheduling preview refresh in 800ms...')
            setTimeout(() => {
                refreshPreview()
            }, 800)
        } catch (error) {
            console.error('❌ Auto-save error:', error)
            showToast('Upload succeeded but auto-save failed: ' + (error as Error).message, 'error')
        }
    }

    async function handleMagicImport(data: ScrapedProfile) {
        try {
            console.log('✨ Magic Import started:', data)

            // Map social links to our link format
            const socialLinks = data.social_links.map(link => ({
                title: link.label,
                url: link.url
            }))

            // Merge with existing profile (prioritize imported data, but keep existing id/user_id)
            const updatedProfile: ProfileData = {
                ...profile,
                title: data.title || profile.title,
                description: data.bio || profile.description,
                theme_color: data.theme_color || profile.theme_color,
                // Only overwrite avatar if we found one
                avatar_url: data.avatar_url || profile.avatar_url,
                // Append new links to existing ones
                links: [...profile.links, ...socialLinks]
            }

            console.log('📝 Updating state with magic data...')
            setProfile(updatedProfile)

            // Auto-save
            console.log('💾 Auto-saving magic profile...')
            const updates = {
                id: userId,
                user_id: userId,
                ...updatedProfile,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(updates)

            if (error) throw error

            showToast('Magic Import Successful! ✨', 'success')

            // Refresh preview
            setTimeout(() => refreshPreview(), 800)

        } catch (error) {
            console.error('Magic Import failed:', error)
            showToast('Import failed to save: ' + (error as Error).message, 'error')
        }
    }


    function showToast(message: string, type: 'success' | 'error') {
        const toast = document.getElementById('toast')
        if (toast) {
            const icon = type === 'error'
                ? '<i class="fa-solid fa-circle-xmark text-xl"></i>'
                : '<i class="fa-solid fa-check text-xl"></i>'
            const bgColor = type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                : 'bg-gradient-to-r from-emerald-500 to-green-600'

            toast.className = `fixed top-5 right-5 ${bgColor}text-white px-6 py-3 rounded-xl shadow-2xl transition-transform flex items-center gap-3 z-50 font-medium`
            toast.innerHTML = `${icon} <span>${message}</span>`
            toast.classList.remove('-translate-y-32')
            setTimeout(() => toast.classList.add('-translate-y-32'), 3000)
        }
    }

    if (loading || authChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    {/* Ferrari Red Spinner */}
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-[#DC0000]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-[#DC0000] rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-400 font-sans">
                        {authChecking ? 'Verifying access...' : 'Loading studio...'}
                    </p>
                </div>
            </div>
        )
    }

    // Allow both authenticated and guest users to access builder
    // Guest users will see "Guest Mode" badge and be prompted to sign up when saving

    return (
        <>
            {/* AUTH MODAL - Shown for guest users */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                    prefilledEmail=""
                />
            )}

            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-[#1E1E1E] border border-green-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>

                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fa-solid fa-rocket text-3xl text-green-500"></i>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Site Live!</h2>
                        <p className="text-gray-400 mb-6">Your bio link is active and ready to share.</p>

                        <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between gap-3 group">
                            <a
                                href={`https://bio.tayloredsolutions.ai/${username}`}
                                target="_blank"
                                className="text-green-400 font-mono text-sm truncate hover:underline"
                            >
                                bio.tayloredsolutions.ai/{username}
                            </a>
                            <button
                                onClick={() => navigator.clipboard.writeText(`https://bio.tayloredsolutions.ai/${username}`)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <i className="fa-regular fa-copy"></i>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Awesome
                        </button>
                    </div>
                </div>
            )}

            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

            <div className="flex h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                {/* Sidebar - Dark Glassmorphism - MOBILE: Conditionally visible based on viewMode */}
                <div className={`w-full md:w-[420px] bg-gray-900/60 backdrop-blur-xl border-r border-white/10 flex flex-col h-full shadow-2xl ${viewMode === 'editor' ? 'block' : 'hidden'} md:block`}>
                    {/* Header */}
                    <div className="p-6 pb-3 border-b border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="font-bold text-xl text-white flex items-center gap-2">
                                <i className="fa-solid fa-wand-magic-sparkles text-blue-500"></i>
                                Taylored Link in Bio
                            </h1>
                            {userId ? (
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg font-medium bg-gray-800/50 hover:bg-gray-800 transition"
                                >
                                    <i className="fa-solid fa-arrow-right-from-bracket mr-1"></i>
                                    Log Out
                                </button>
                            ) : (
                                <div className="text-xs text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-medium bg-amber-500/10 flex items-center gap-1.5">
                                    <i className="fa-solid fa-eye"></i>
                                    Guest Mode
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Card - Page Views */}
                    <div className="px-6 pt-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <i className="fa-solid fa-eye text-blue-400 text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Views</p>
                                        <p className="text-2xl font-bold text-white">{profile.page_views?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Unique sessions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">

                        {/* Magic Import Section */}
                        <MagicImporter
                            onImport={handleMagicImport}
                            onStart={() => {
                                console.log('🧹 Clearing stale data for new import...');
                                setProfile(prev => ({ ...prev, links: [] }));
                            }}
                        />
                        {/* Branding Section */}
                        <details open className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                Branding
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                {/* Claim Your Link Input */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                    <label className="text-xs font-bold text-blue-200 block mb-2">
                                        Claim Your Link 🚀
                                    </label>
                                    <div className="flex items-center bg-gray-900/50 rounded-lg border border-blue-500/20 overflow-hidden">
                                        <span className="text-xs text-gray-500 pl-3 pr-1 bg-transparent truncate max-w-[140px]">
                                            bio.tayloredsolutions.ai/
                                        </span>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                                            className="flex-1 p-2 bg-transparent text-sm text-white focus:outline-none placeholder-gray-600 font-bold"
                                            placeholder="yourname"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.title}
                                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Bio / Description
                                    </label>
                                    <textarea
                                        value={profile.description}
                                        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 h-20 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        placeholder="Tell people about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        Avatar Image
                                    </label>
                                    <ImageUpload
                                        currentImage={profile.avatar_url}
                                        onUploadComplete={(url) => handleImageUpload(url, 'avatar_url')}
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Theme Engine Section */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-palette"></i>
                                    Theme Engine
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        Background Type
                                    </label>
                                    <select
                                        value={profile.background_type}
                                        onChange={(e) => setProfile({ ...profile, background_type: e.target.value as 'mesh' | 'video' })}
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    >
                                        <option value="mesh">✨ Animated Mesh (Premium)</option>
                                        <option value="video">🎥 Video Background</option>
                                    </select>
                                </div>

                                {/* Show video URL input only when Video Background is selected */}
                                {profile.background_type === 'video' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-300 block mb-2">
                                            Video Background URL
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.video_background_url}
                                            onChange={(e) => setProfile({ ...profile, video_background_url: e.target.value })}
                                            placeholder="https://example.com/video.mp4"
                                            className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Use a direct .mp4 URL for best results
                                        </p>
                                    </div>
                                )}

                                {/* Typography Engine - Type Preview List */}
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        <i className="fa-solid fa-font mr-1"></i>
                                        Font Style
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        {/* Modern Font Option */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, font_style: 'modern' })}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition font-sans ${profile.font_style === 'modern'
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-300'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">Modern Sans</span>
                                            {profile.font_style === 'modern' && <Check size={16} />}
                                        </button>

                                        {/* Elegant Font Option */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, font_style: 'elegant' })}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition font-serif ${profile.font_style === 'elegant'
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-300'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">Elegant Serif</span>
                                            {profile.font_style === 'elegant' && <Check size={16} />}
                                        </button>

                                        {/* Brutal Font Option */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, font_style: 'brutal' })}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition font-mono ${profile.font_style === 'brutal'
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-300'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">Brutal Mono</span>
                                            {profile.font_style === 'brutal' && <Check size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Living Gradients - Dual Color Pickers */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                        <label className="text-xs font-bold text-gray-300">
                                            Primary Color
                                        </label>
                                        <input
                                            type="color"
                                            value={profile.theme_color}
                                            onChange={(e) => setProfile({ ...profile, theme_color: e.target.value })}
                                            className="h-10 w-full p-0 border-0 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                        <label className="text-xs font-bold text-gray-300">
                                            Secondary Color
                                        </label>
                                        <input
                                            type="color"
                                            value={profile.accent_color}
                                            onChange={(e) => setProfile({ ...profile, accent_color: e.target.value })}
                                            className="h-10 w-full p-0 border-0 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Background Motion Controls - Only show for Mesh backgrounds */}
                                {profile.background_type === 'mesh' && (
                                    <div className="space-y-3 pt-3 border-t border-white/10">
                                        <label className="text-xs font-bold text-gray-400 block">
                                            Background Motion
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Speed Control - Segmented Pill */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 block mb-2">
                                                    Speed
                                                </label>
                                                <div className="bg-gray-800 rounded-lg p-1 flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_speed: 'slow' })}
                                                        className={`flex-1 py-1.5 text-xs transition ${profile.animation_speed === 'slow'
                                                            ? 'bg-gray-700 text-white shadow-sm rounded-md'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        Slow
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_speed: 'medium' })}
                                                        className={`flex-1 py-1.5 text-xs transition ${profile.animation_speed === 'medium'
                                                            ? 'bg-gray-700 text-white shadow-sm rounded-md'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        Medium
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_speed: 'fast' })}
                                                        className={`flex-1 py-1.5 text-xs transition ${profile.animation_speed === 'fast'
                                                            ? 'bg-gray-700 text-white shadow-sm rounded-md'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        Fast
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Pattern Control - Grid Cards */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 block mb-2">
                                                    Pattern
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {/* Drift Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_type: 'drift' })}
                                                        className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center gap-1 ${profile.animation_type === 'drift'
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-400'
                                                            }`}
                                                    >
                                                        <Waves size={18} />
                                                        <span className="text-xs font-medium">Drift</span>
                                                    </button>

                                                    {/* Pulse Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_type: 'pulse' })}
                                                        className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center gap-1 ${profile.animation_type === 'pulse'
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-400'
                                                            }`}
                                                    >
                                                        <Zap size={18} />
                                                        <span className="text-xs font-medium">Pulse</span>
                                                    </button>

                                                    {/* Swirl Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_type: 'swirl' })}
                                                        className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center gap-1 ${profile.animation_type === 'swirl'
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-400'
                                                            }`}
                                                    >
                                                        <Tornado size={18} />
                                                        <span className="text-xs font-medium">Swirl</span>
                                                    </button>

                                                    {/* Lava Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, animation_type: 'lava' })}
                                                        className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col items-center gap-1 ${profile.animation_type === 'lava'
                                                            ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 text-gray-400'
                                                            }`}
                                                    >
                                                        <Flame size={18} />
                                                        <span className="text-xs font-medium">Lava</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Texture Overlay Control - Swatch Row */}
                                <div className="pt-3 border-t border-white/10">
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        <i className="fa-solid fa-film mr-1"></i>
                                        Texture Overlay
                                    </label>
                                    <div className="flex gap-2">
                                        {/* None Swatch */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, texture_overlay: 'none' })}
                                            title="None"
                                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition relative flex items-center justify-center ${profile.texture_overlay === 'none'
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            <div className="text-2xl text-gray-400">⊘</div>
                                        </button>

                                        {/* Noise Swatch */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, texture_overlay: 'noise' })}
                                            title="Noise"
                                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition relative ${profile.texture_overlay === 'noise'
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                            style={{
                                                background: '#6b7280',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
                                            }}
                                        />

                                        {/* Grid Swatch */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, texture_overlay: 'grid' })}
                                            title="Grid"
                                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition relative ${profile.texture_overlay === 'grid'
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                            style={{
                                                background: '#4b5563',
                                                backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)',
                                                backgroundSize: '12px 12px'
                                            }}
                                        />

                                        {/* Lines Swatch */}
                                        <button
                                            type="button"
                                            onClick={() => setProfile({ ...profile, texture_overlay: 'lines' })}
                                            title="Lines"
                                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition relative ${profile.texture_overlay === 'lines'
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : 'border-gray-700 hover:border-gray-500'
                                                }`}
                                            style={{
                                                background: '#4b5563',
                                                backgroundImage: 'repeating-linear-gradient(0deg, #9ca3af, #9ca3af 1px, transparent 1px, transparent 4px)',
                                                backgroundSize: '100% 4px'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Cursor Spotlight Toggle */}
                                <div className="pt-3 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-300">
                                            <i className="fa-solid fa-lightbulb mr-1"></i>
                                            Cursor Spotlight
                                        </label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={profile.enable_spotlight}
                                                onChange={(e) => setProfile({ ...profile, enable_spotlight: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Interactive cursor glow effect
                                    </p>
                                </div>

                            </div>
                        </details>

                        {/* Social Spotlight Section */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-brands fa-instagram text-pink-400"></i>
                                    Social Spotlight
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Instagram or TikTok Post URL
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.social_spotlight_url}
                                        onChange={(e) => setProfile({ ...profile, social_spotlight_url: e.target.value })}
                                        placeholder="https://instagram.com/p/... or https://tiktok.com/@..."
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Showcase a specific post on your page
                                    </p>
                                </div>
                            </div>
                        </details>

                        {/* Showcase Slider Section - NEW! */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-sliders text-purple-400"></i>
                                    Showcase Slider
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <p className="text-xs text-gray-400 mb-3">
                                    Show potential customers your AI transformation magic with a before/after slider
                                </p>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        Original Photo (Before)
                                    </label>
                                    <ImageUpload
                                        currentImage={profile.showcase.before}
                                        onUploadComplete={async (url) => {
                                            try {
                                                console.log('📤 Uploading showcase.before:', url)

                                                // Update local state immediately
                                                const updatedProfile = {
                                                    ...profile,
                                                    showcase: { ...profile.showcase, before: url }
                                                }
                                                setProfile(updatedProfile)

                                                console.log('💾 Auto-saving showcase.before to Supabase...')
                                                // Auto-save to database
                                                const updates = {
                                                    id: userId,
                                                    user_id: userId,
                                                    ...updatedProfile,
                                                    updated_at: new Date().toISOString()
                                                }

                                                const { error } = await supabase
                                                    .from('profiles')
                                                    .upsert(updates)

                                                if (error) throw error

                                                console.log('✅ Showcase "Before" image saved!')
                                                showToast('Before image uploaded & saved!', 'success')

                                                // Refresh preview
                                                setTimeout(() => refreshPreview(), 800)
                                            } catch (error) {
                                                console.error('❌ Showcase before upload error:', error)
                                                showToast('Upload failed: ' + (error as Error).message, 'error')
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-2">
                                        AI Portrait (After)
                                    </label>
                                    <ImageUpload
                                        currentImage={profile.showcase.after}
                                        onUploadComplete={async (url) => {
                                            try {
                                                console.log('📤 Uploading showcase.after:', url)

                                                // Update local state immediately
                                                const updatedProfile = {
                                                    ...profile,
                                                    showcase: { ...profile.showcase, after: url }
                                                }
                                                setProfile(updatedProfile)

                                                console.log('💾 Auto-saving showcase.after to Supabase...')
                                                // Auto-save to database
                                                const updates = {
                                                    id: userId,
                                                    user_id: userId,
                                                    ...updatedProfile,
                                                    updated_at: new Date().toISOString()
                                                }

                                                const { error } = await supabase
                                                    .from('profiles')
                                                    .upsert(updates)

                                                if (error) throw error

                                                console.log('✅ Showcase "After" image saved!')
                                                showToast('After image uploaded & saved!', 'success')

                                                // Refresh preview
                                                setTimeout(() => refreshPreview(), 800)
                                            } catch (error) {
                                                console.error('❌ Showcase after upload error:', error)
                                                showToast('Upload failed: ' + (error as Error).message, 'error')
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Featured Media Section */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                Featured Media
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        YouTube Video URL
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.video_url}
                                        onChange={(e) => setProfile({ ...profile, video_url: e.target.value })}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Lead Gen Section */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                Lead Gen & Contacts
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={profile.lead_gen_enabled}
                                        onChange={(e) => setProfile({ ...profile, lead_gen_enabled: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <label className="text-sm font-medium text-gray-300">
                                        Show "Connect" Button
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profile.contact_email}
                                        onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                                        placeholder="hello@example.com"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Newsletter Section - NEW! */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-newspaper text-blue-400"></i>
                                    Newsletter
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={profile.newsletter_active}
                                        onChange={(e) => setProfile({ ...profile, newsletter_active: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <label className="text-sm font-medium text-gray-300">
                                        Enable Newsletter Signup
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        Heading Text
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.newsletter_heading}
                                        onChange={(e) => setProfile({ ...profile, newsletter_heading: e.target.value })}
                                        placeholder="Join my newsletter"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Customize the heading for your newsletter signup block
                                    </p>
                                </div>
                            </div>
                        </details>

                        {/* Analytics Section - NEW! */}
                        <details className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-chart-line text-green-400"></i>
                                    Analytics
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-4 pl-1 mt-3">
                                <p className="text-xs text-gray-400 mb-3">
                                    Connect your tracking pixels to analyze visitor behavior and run retargeting campaigns.
                                </p>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        <i className="fa-brands fa-facebook text-blue-500 mr-1"></i>
                                        Facebook Pixel ID
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.fb_pixel_id || ''}
                                        onChange={(e) => setProfile({ ...profile, fb_pixel_id: e.target.value })}
                                        placeholder="123456789012345"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Find this in your Facebook Events Manager
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        <i className="fa-brands fa-google text-red-500 mr-1"></i>
                                        Google Analytics ID
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.google_analytics_id || ''}
                                        onChange={(e) => setProfile({ ...profile, google_analytics_id: e.target.value })}
                                        placeholder="G-XXXXXXXXXX"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        GA4 Measurement ID (starts with "G-")
                                    </p>
                                </div>
                            </div>
                        </details>

                        {/* Social Profiles Section */}
                        <details open className="border-b border-white/10 pb-4 mb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-users text-pink-400"></i>
                                    Social Profiles
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="space-y-3 pl-1 mt-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        <i className="fa-brands fa-instagram text-pink-500 mr-1"></i>
                                        Instagram
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.socials.instagram || ''}
                                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, instagram: e.target.value } })}
                                        placeholder="https://instagram.com/username"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        <i className="fa-brands fa-tiktok mr-1"></i>
                                        TikTok
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.socials.tiktok || ''}
                                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, tiktok: e.target.value } })}
                                        placeholder="https://tiktok.com/@username"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        <i className="fa-brands fa-facebook text-blue-500 mr-1"></i>
                                        Facebook
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.socials.facebook || ''}
                                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, facebook: e.target.value } })}
                                        placeholder="https://facebook.com/username"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-300 block mb-1">
                                        <i className="fa-solid fa-envelope text-red-400 mr-1"></i>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profile.socials.email || ''}
                                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, email: e.target.value } })}
                                        placeholder="hello@example.com"
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Custom Links Section */}
                        <details open className="pb-4">
                            <summary className="cursor-pointer font-bold text-xs text-gray-500 uppercase tracking-wider py-3 flex justify-between items-center hover:text-gray-300 transition">
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-link text-blue-400"></i>
                                    Custom Links
                                </span>
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </summary>
                            <div className="pl-1 mt-3">
                                <SortableLinksList
                                    links={profile.links}
                                    onChange={(newLinks) => setProfile(prev => ({ ...prev, links: newLinks }))}
                                />
                            </div>
                        </details>
                    </div>

                    {/* Save Button */}
                    <div className="p-6 border-t border-white/10 bg-gray-900/40">
                        <button
                            onClick={saveProfile}
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-floppy-disk"></i>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Preview Area - Scaled Mobile Preview - DESKTOP ONLY */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center relative p-8 bg-slate-950">
                    {/* Preview Label */}
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                        <i className="fa-solid fa-mobile-screen-button"></i>
                        <span>Mobile Preview</span>
                    </div>

                    {/* Scaled Mobile Container - Portrait Mode */}
                    <div className="relative" style={{
                        width: '380px',
                        height: '760px',
                        transform: 'scale(0.75)',
                        transformOrigin: 'top center'
                    }}>
                        {/* iPhone Frame with thick border and shadow */}
                        <div className="w-full h-full bg-black rounded-[60px] p-[14px] shadow-2xl shadow-black/40">
                            <div className="w-full h-full bg-white rounded-[46px] overflow-hidden relative">
                                <PhonePreview
                                    title={profile.title}
                                    description={profile.description}
                                    avatar_url={profile.avatar_url}
                                    background_image={profile.background_image}
                                    background_type={profile.background_type}
                                    video_background_url={profile.video_background_url}
                                    font_style={profile.font_style}
                                    theme_color={profile.theme_color}
                                    accent_color={profile.accent_color}
                                    animation_speed={profile.animation_speed}
                                    animation_type={profile.animation_type}
                                    texture_overlay={profile.texture_overlay}
                                    enable_spotlight={profile.enable_spotlight}
                                    lead_gen_enabled={profile.lead_gen_enabled}
                                    newsletter_active={profile.newsletter_active}
                                    newsletter_heading={profile.newsletter_heading}
                                    profile_id={userId || ''}
                                    links={profile.links}
                                    social_spotlight_url={profile.social_spotlight_url}
                                    showcase={profile.showcase}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400 font-medium">
                            Built by <span className="text-blue-400 font-bold">Taylored AI Solutions</span>
                        </p>
                    </div>
                </div>

                {/* 📱 MOBILE PREVIEW OVERLAY - Full screen slide-up animation (GPU Accelerated) */}
                <AnimatePresence>
                    {viewMode === 'preview' && (
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            style={{ willChange: 'transform, opacity' }}
                            className="fixed inset-0 z-50 bg-slate-950 md:hidden flex flex-col items-center justify-center p-8"
                        >
                            {/* Preview Label */}
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                                <i className="fa-solid fa-mobile-screen-button"></i>
                                <span>Live Preview</span>
                            </div>

                            {/* Scaled Mobile Container - Portrait Mode */}
                            <div className="relative" style={{
                                width: '380px',
                                height: '760px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top center'
                            }}>
                                {/* iPhone Frame with thick border and shadow */}
                                <div className="w-full h-full bg-black rounded-[60px] p-[14px] shadow-2xl shadow-black/40">
                                    <div className="w-full h-full bg-white rounded-[46px] overflow-hidden relative">
                                        <PhonePreview
                                            title={profile.title}
                                            description={profile.description}
                                            avatar_url={profile.avatar_url}
                                            background_image={profile.background_image}
                                            background_type={profile.background_type}
                                            video_background_url={profile.video_background_url}
                                            font_style={profile.font_style}
                                            theme_color={profile.theme_color}
                                            accent_color={profile.accent_color}
                                            animation_speed={profile.animation_speed}
                                            animation_type={profile.animation_type}
                                            texture_overlay={profile.texture_overlay}
                                            enable_spotlight={profile.enable_spotlight}
                                            lead_gen_enabled={profile.lead_gen_enabled}
                                            newsletter_active={profile.newsletter_active}
                                            newsletter_heading={profile.newsletter_heading}
                                            profile_id={userId || ''}
                                            links={profile.links}
                                            social_spotlight_url={profile.social_spotlight_url}
                                            showcase={profile.showcase}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 📱 MOBILE BOTTOM NAVIGATION - Glassmorphism Toggle Bar with Liquid Animation */}
                <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-md bg-black/80 border-t border-white/10 px-6 py-4 safe-area-inset-bottom">
                    <div className="relative flex items-center gap-4 max-w-md mx-auto">
                        {/* Liquid Background Indicator */}
                        <motion.div
                            layout
                            layoutId="activeTab"
                            className="absolute inset-0 bg-[#DC0000] rounded-xl shadow-lg shadow-[#DC0000]/30"
                            style={{
                                left: viewMode === 'editor' ? '0%' : '50%',
                                width: '50%',
                                paddingLeft: viewMode === 'editor' ? '0' : '0.5rem',
                                paddingRight: viewMode === 'preview' ? '0' : '0.5rem'
                            }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 300
                            }}
                        />

                        {/* Edit Tab */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setViewMode('editor')}
                            className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors z-10 ${viewMode === 'editor'
                                ? 'text-white'
                                : 'text-gray-400'
                                }`}
                        >
                            <Pencil className="w-5 h-5" />
                            <span>Edit</span>
                        </motion.button>

                        {/* Preview Tab */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setViewMode('preview')}
                            className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors z-10 ${viewMode === 'preview'
                                ? 'text-white'
                                : 'text-gray-400'
                                }`}
                        >
                            <Eye className="w-5 h-5" />
                            <span>Preview</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Toast Notification - Dark Mode */}
            <div
                id="toast"
                className="fixed top-5 right-5 px-6 py-3 rounded-xl shadow-2xl -translate-y-32 transition-transform flex items-center gap-3 z-50"
            >
                <span></span>
            </div>

            {/* Font Awesome - Required for icons */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
        </>
    )
}

// Wrap in Suspense to satisfy Next.js useSearchParams() requirement
export default function BuilderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-[#DC0000]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-[#DC0000] rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-400 font-sans">Loading builder...</p>
                </div>
            </div>
        }>
            <BuilderPageContent />
        </Suspense>
    )
}
