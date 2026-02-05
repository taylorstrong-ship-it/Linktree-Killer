/**
 * 🛡️ SafeString Utility - Prevents "Font Bug" Crash
 * Purpose: Safely convert Brand DNA API fields to strings before rendering
 * 
 * Background:
 * - API fields like `brand_personality` or `fonts` can be arrays or objects
 * - React crashes with "Objects are not valid as a React child" when rendering non-primitives
 * - This utility ensures all Brand DNA data is safe for DOM rendering
 */

/**
 * Convert any value to a safe string for rendering
 * @param {*} value - Any value from Brand DNA API
 * @param {string} fallback - Default string if value is null/undefined
 * @returns {string} - Safe string for rendering
 */
export function safeString(value, fallback = '') {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return fallback;
    }

    // Already a string - return as-is
    if (typeof value === 'string') {
        return value.trim();
    }

    // Arrays - join with commas
    if (Array.isArray(value)) {
        return value
            .map(item => safeString(item, ''))
            .filter(Boolean)
            .join(', ');
    }

    // Objects - return JSON or fallback
    if (typeof value === 'object') {
        console.warn('⚠️ safeString: Received object, converting to JSON:', value);
        return JSON.stringify(value);
    }

    // Numbers, booleans, etc - convert to string
    return String(value);
}

/**
 * Safely extract array from Brand DNA field
 * @param {*} value - Brand DNA field (might be array, CSV string, or object)
 * @returns {Array<string>} - Array of strings
 */
export function safeArray(value) {
    if (!value) return [];

    // Already an array
    if (Array.isArray(value)) {
        return value.map(item => safeString(item, '')).filter(Boolean);
    }

    // CSV string - split and clean
    if (typeof value === 'string') {
        return value
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }

    // Single value - wrap in array
    return [safeString(value, '')];
}

/**
 * Validate and sanitize hex color
 * @param {string} color - Potential hex color
 * @param {string} fallback - Fallback color (default: Taylored Orange)
 * @returns {string} - Valid hex color
 */
export function safeColor(color, fallback = '#FF6B35') {
    if (!color || typeof color !== 'string') {
        return fallback;
    }

    // Add # if missing
    const hex = color.startsWith('#') ? color : `#${color}`;

    // Validate hex format (3 or 6 digits)
    const validHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    return validHex.test(hex) ? hex : fallback;
}
