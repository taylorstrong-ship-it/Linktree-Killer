/**
 * 🎨 IMAGE UTILITIES FOR MULTI-MODAL GEMINI COMPOSITION
 * 
 * Purpose: Fetch brand images (logos, product photos) and convert to base64
 * for sending to Gemini API alongside text prompts
 */

/**
 * Fetch an image from a URL and convert to base64 string
 * @param imageUrl - Absolute URL to the image
 * @returns Base64-encoded image data, or empty string on error
 */
export async function fetchImageAsBase64(imageUrl: string): Promise<string> {
    try {
        console.log(`📸 Fetching image: ${imageUrl}`);

        // Validate URL
        if (!imageUrl || !imageUrl.startsWith('http')) {
            console.warn(`⚠️ Invalid image URL: ${imageUrl}`);
            return '';
        }

        // Fetch the image
        const response = await fetch(imageUrl);

        if (!response.ok) {
            console.warn(`⚠️ Image fetch failed (${response.status}): ${imageUrl}`);
            return '';
        }

        // Convert to ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        // Convert to Base64
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = uint8Array.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
        }, '');
        const base64 = btoa(binaryString);

        console.log(`✅ Image converted to base64 (${base64.length} chars)`);
        return base64;

    } catch (error) {
        console.error(`❌ Failed to fetch image: ${imageUrl}`, error);
        return '';
    }
}

/**
 * Determine MIME type from file extension
 * @param url - Image URL
 * @returns MIME type string (e.g., 'image/png')
 */
export function getMimeType(url: string): string {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.endsWith('.png')) return 'image/png';
    if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) return 'image/jpeg';
    if (lowerUrl.endsWith('.webp')) return 'image/webp';
    if (lowerUrl.endsWith('.gif')) return 'image/gif';

    // Default to JPEG for unknown extensions
    return 'image/jpeg';
}

/**
 * Validate if a URL is a valid image URL
 * @param url - URL to validate
 * @returns true if valid image URL
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    if (!url.startsWith('http')) return false;

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const lowerUrl = url.toLowerCase();

    return imageExtensions.some(ext => lowerUrl.includes(ext));
}
