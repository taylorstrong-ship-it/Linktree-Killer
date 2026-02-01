/**
 * Generator Module - Post Generation Logic
 * Handles calling Edge Function and saving generated posts
 */

import { getClient, getUser } from './auth.js'

const EDGE_FUNCTION_URL = '/functions/v1/generate-post'

/**
 * Generate social media post
 * @param {Object} params - Generation parameters
 * @param {Object} params.brandKit - Brand kit configuration
 * @param {Object} params.textContent - Text content for post
 * @param {string} params.template - Template identifier
 * @returns {Promise<Object>} Generated post with image URL
 */
export async function generatePost({ brandKit, textContent, template }) {
    try {
        const client = getClient()
        const user = getUser()

        // Validate inputs
        if (!brandKit || !textContent || !template) {
            throw new Error('Missing required parameters')
        }

        // Prepare payload
        const payload = {
            brandKit: {
                logo_url: brandKit.logo_url,
                primary_color: brandKit.primary_color,
                secondary_color: brandKit.secondary_color
            },
            textContent: {
                headline: textContent.headline,
                body: textContent.body || '',
                cta: textContent.cta || ''
            },
            template
        }

        // Get auth token
        const { data: { session } } = await client.auth.getSession()
        if (!session) {
            throw new Error('Not authenticated')
        }

        // Call Edge Function
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Generation failed')
        }

        const result = await response.json()

        // Save to database
        const { data: savedPost, error: saveError } = await client
            .from('generated_posts')
            .insert({
                user_id: user.id,
                brand_kit_id: brandKit.id,
                template,
                headline: textContent.headline,
                body: textContent.body,
                cta: textContent.cta,
                image_url: result.imageUrl
            })
            .select()
            .single()

        if (saveError) {
            console.error('Error saving post:', saveError)
            // Don't throw - generation succeeded even if save failed
        }

        return {
            ...result,
            savedPost
        }
    } catch (error) {
        console.error('Generation error:', error)
        throw error
    }
}

/**
 * Get user's post history
 * @param {number} limit - Number of posts to fetch
 * @returns {Promise<Array>} Array of generated posts
 */
export async function getPostHistory(limit = 20) {
    try {
        const client = getClient()
        const user = getUser()

        const { data, error } = await client
            .from('generated_posts')
            .select('*, brand_kits(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        return data || []
    } catch (error) {
        console.error('Error fetching post history:', error)
        throw error
    }
}

/**
 * Delete generated post
 * @param {string} id - Post ID
 */
export async function deletePost(id) {
    try {
        const client = getClient()

        const { error } = await client
            .from('generated_posts')
            .delete()
            .eq('id', id)

        if (error) throw error
    } catch (error) {
        console.error('Error deleting post:', error)
        throw error
    }
}

/**
 * Download image from URL
 * @param {string} imageUrl - URL of image to download
 * @param {string} filename - Filename for download
 */
export async function downloadImage(imageUrl, filename = 'post.png') {
    try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()

        // Cleanup
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
    } catch (error) {
        console.error('Download error:', error)
        throw error
    }
}
