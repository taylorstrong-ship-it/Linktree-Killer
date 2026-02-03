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
