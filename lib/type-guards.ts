/**
 * Type Guard Utilities
 * 
 * Defensive helpers to prevent "Font Bug" type runtime errors
 * where API returns objects instead of expected strings.
 * 
 * Created: 2026-02-02 (Stability Report Fix C3)
 */

/**
 * Safely extract string from unknown API data
 * Handles objects, arrays, null, undefined
 * 
 * @example
 * safeString('Hello') // => 'Hello'
 * safeString({ family: 'Inter' }) // => 'Inter'
 * safeString({ hex: '#FF0000' }) // => '#FF0000'
 * safeString(null, 'fallback') // => 'fallback'
 */
export function safeString(value: any, fallback: string = ''): string {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        // Common object patterns in API responses
        return (
            value.title ||
            value.name ||
            value.label ||
            value.family || // Font objects: { family: 'Inter' }
            value.hex || // Color objects: { hex: '#FF0000' }
            value.value || // Generic value objects
            fallback
        );
    }
    return String(value);
}

/**
 * Safely extract string array from unknown API data
 * 
 * @example
 * safeStringArray(['red', 'blue']) // => ['red', 'blue']
 * safeStringArray([{ hex: '#FF0000' }, { hex: '#0000FF' }]) // => ['#FF0000', '#0000FF']
 * safeStringArray(null, ['#333']) // => ['#333']
 */
export function safeStringArray(value: any, fallback: string[] = []): string[] {
    if (!Array.isArray(value)) return fallback;
    return value.map(item => safeString(item)).filter(Boolean);
}

/**
 * Safely extract font family string from font data
 * Handles both string fonts and font objects
 * 
 * @example
 * safeFontString('Inter') // => 'Inter'
 * safeFontString({ family: 'Playfair Display', weight: 400 }) // => 'Playfair Display'
 * safeFontString(null) // => 'Inter'
 */
export function safeFontString(value: any, fallback: string = 'Inter'): string {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.family) return value.family;
    return fallback;
}

/**
 * Safely extract color hex string from color data
 * Handles both string colors and color objects
 * 
 * @example
 * safeColorString('#FF0000') // => '#FF0000'
 * safeColorString({ hex: '#FF0000', name: 'Red' }) // => '#FF0000'
 * safeColorString(null) // => '#333333'
 */
export function safeColorString(value: any, fallback: string = '#333333'): string {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value.hex || value.value || value.color || fallback;
    }
    return fallback;
}

// =================================================================
// 🧬 BRAND DNA TYPE DEFINITIONS (Feb 2026)
// Matches Edge Function output from extract-brand-dna
// =================================================================

/**
 * Complete Brand DNA structure with Deep Soul Intelligence
 * Extracted by: Claude Opus 4.6 (brand voice) + Claude Sonnet 5 (social) + GPT-5.2 (deep soul)
 */
export interface BrandDNA {
    // Core Identity
    company_name: string;
    business_type: string;
    industry: string;
    description: string;

    // Visual Assets
    logo_url: string;
    favicon_url?: string;
    hero_image?: string;
    og_image?: string;
    brand_images: string[]; // Real product/gallery photos

    // Colors
    primary_color: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_primary_color?: string;
    text_secondary_color?: string;
    color_scheme?: 'light' | 'dark';

    // Typography
    fonts?: string[];
    typography?: Record<string, any>;

    // Social
    social_links?: Record<string, string>;

    // Business Intelligence
    suggested_ctas?: Array<{ title: string; url: string; category?: string }>;

    // 🤖 AI-Powered Brand Intelligence (Claude Opus 4.6)
    brand_voice?: string;
    tone_score?: number;
    personality_traits?: string[];
    brand_archetype?: string;
    writing_style?: {
        sentence_length: string;
        vocabulary: string;
        uses_emojis: boolean;
        uses_humor: boolean;
    };

    // Social Media Examples (Claude Sonnet 5)
    social_media_examples?: Array<{
        platform: string;
        post_type: string;
        caption: string;
        tone: string;
        hashtags: string[];
    }>;

    // 🀄 Visual Social Posts (v5.0) - Instagram-ready
    visual_social_posts?: Array<{
        type: string;
        caption: string;
        visual_description: string;
        cta: string;
        hashtags: string[];
        original_image_url: string;
        enhanced_image_url: string;
        enhancement_success: boolean;
    }> | null;

    // 🧠 Deep Soul Intelligence (GPT-5.2) - "20-Year Employee" Knowledge
    business_intel?: {
        archetype: string; // "The Caregiver", "The Rebel", "The Jester"
        vibe_keywords: string[]; // ["Cozy", "Rustic", "Welcoming"]
        atmosphere: string; // "Cozy & Casual" | "Loud Sports Bar" | "Family-Friendly"
        signature_items: string[]; // Top 3 signature menu items/services
        unique_features: string[]; // Specific claims ("Grass-fed beef")
        policies: {
            reservations?: string; // "Required" | "Recommended" | "Walk-ins welcome"
            parking?: string; // "Valet" | "Street" | "Lot"
            dietary?: string; // "GF menu" | "Vegan options"
            dress_code?: string; // "Casual" | "Business Casual"
            hours_note?: string; // "Late night" | "Breakfast only"
        };
        price_range?: string; // "$" | "$$" | "$$$" | "$$$$"
        insider_tips?: string[]; // ["Ask for the truffle fries"]
        source: string; // "gpt-5.2_deep_soul_extraction"
    };

    // Metadata
    source?: string;
}

/**
 * Type guard to check if data is valid BrandDNA
 */
export function isBrandDNA(data: any): data is BrandDNA {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.company_name === 'string' &&
        typeof data.business_type === 'string' &&
        Array.isArray(data.brand_images)
    );
}
