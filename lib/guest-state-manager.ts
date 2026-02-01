import { supabase } from '@/lib/supabase/client';

export interface Link {
    title: string;
    url: string;
}

export interface GuestProfile {
    title: string;
    description: string;
    avatar_url: string;
    background_image: string;
    background_type: 'mesh' | 'video';
    video_background_url: string;
    font_style: 'modern' | 'elegant' | 'brutal';
    theme_color: string;
    accent_color: string;
    animation_speed: 'slow' | 'medium' | 'fast';
    animation_type: 'drift' | 'pulse' | 'swirl' | 'lava';
    texture_overlay: 'none' | 'noise' | 'grid' | 'lines';
    enable_spotlight: boolean;
    contact_email: string;
    lead_gen_enabled: boolean;
    newsletter_active: boolean;
    newsletter_heading: string;
    newsletter_size?: 'small' | 'medium' | 'large';
    video_url: string;
    social_spotlight_url: string;
    showcase: { before: string; after: string };
    page_views?: number;
    fb_pixel_id?: string;
    google_analytics_id?: string;
    socials: {
        instagram?: string;
        tiktok?: string;
        facebook?: string;
        email?: string;
    };
    links: Link[];
    gallery_images: string[];
    username?: string; // For claiming URL
    timestamp?: number; // For expiry
}

export class GuestStateManager {
    private static KEY = 'taylored_brand_data'; // Keeping backward compatibility with existing localStorage key

    // Save incrementally as user edits
    static save(profile: Partial<GuestProfile>) {
        if (typeof window === 'undefined') return;

        try {
            const existing = this.load() || {};
            const updated = {
                ...existing,
                ...profile,
                timestamp: Date.now(),
            };
            localStorage.setItem(this.KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save guest state:', error);
        }
    }

    // Load on mount
    static load(): GuestProfile | null {
        if (typeof window === 'undefined') return null;

        try {
            const data = localStorage.getItem(this.KEY);
            if (!data) return null;

            const profile = JSON.parse(data);
            const TWO_HOURS = 2 * 60 * 60 * 1000;

            // Auto-expire stale sessions if older than 24 hours (relaxed from 2 hours for UX)
            // Actually, let's keep it indefinite for now unless explicitly cleared, 
            // but maybe refresh timestamp.
            // Research said 2 hours, but for a builder, users might come back next day.
            // Let's stick to simple load for now.

            return profile;
        } catch (error) {
            console.error('Failed to load guest state:', error);
            return null;
        }
    }

    // Clear guest state
    static clear() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.KEY);
    }

    // Check if guest has unsaved changes
    static hasUnsavedChanges(): boolean {
        return !!this.load();
    }

    // Migrate guest data to a new user profile
    static async migrateToProfile(userId: string, email: string) {
        const guestData = this.load();
        if (!guestData) return false;

        try {
            // Merge socials back into links array for database storage (backward compatibility)
            const socialLinks: Link[] = [];
            if (guestData.socials?.instagram) socialLinks.push({ title: 'Instagram', url: guestData.socials.instagram });
            if (guestData.socials?.tiktok) socialLinks.push({ title: 'TikTok', url: guestData.socials.tiktok });
            if (guestData.socials?.facebook) socialLinks.push({ title: 'Facebook', url: guestData.socials.facebook });
            if (guestData.socials?.email) socialLinks.push({ title: 'Email', url: `mailto:${guestData.socials.email}` });

            const mergedLinks = [...socialLinks, ...(guestData.links || [])];

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    user_id: userId,
                    username: guestData.username,
                    title: guestData.title,
                    description: guestData.description,
                    avatar_url: guestData.avatar_url,
                    background_image: guestData.background_image,
                    background_type: guestData.background_type,
                    video_background_url: guestData.video_background_url,
                    font_style: guestData.font_style,
                    theme_color: guestData.theme_color,
                    accent_color: guestData.accent_color,
                    animation_speed: guestData.animation_speed,
                    animation_type: guestData.animation_type,
                    texture_overlay: guestData.texture_overlay,
                    enable_spotlight: guestData.enable_spotlight,
                    contact_email: guestData.contact_email,
                    lead_gen_enabled: guestData.lead_gen_enabled,
                    newsletter_active: guestData.newsletter_active,
                    newsletter_heading: guestData.newsletter_heading,
                    video_url: guestData.video_url,
                    social_spotlight_url: guestData.social_spotlight_url,
                    showcase: guestData.showcase,
                    page_views: guestData.page_views || 0,
                    fb_pixel_id: guestData.fb_pixel_id,
                    google_analytics_id: guestData.google_analytics_id,
                    socials: guestData.socials,
                    links: mergedLinks, // Saving merged links
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            // Clear guest state after successful migration
            this.clear();
            return true;
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }
}
