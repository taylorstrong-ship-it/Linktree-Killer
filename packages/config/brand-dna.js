/**
 * Shared Brand DNA Module
 * Centralized brand profile management for all Taylored Solutions apps
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase configuration
const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'https://qxkicdhsrlpehgcsapsh.supabase.co'
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || 'sb_publishable_TTBR0ES-pM7LOWDsywEy7A_9BSlhWGg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Get user's brand profile
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Brand profile or null
 */
export async function getBrandProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('brand_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned - user doesn't have a profile yet
                return null
            }
            throw error
        }

        return data
    } catch (error) {
        console.error('Error fetching brand profile:', error)
        return null
    }
}

/**
 * Extract brand DNA from URL and save to database
 * @param {string} url - Website URL
 * @param {string} sourceApp - App that initiated the extraction
 * @returns {Promise<Object>} Created brand profile
 */
export async function extractAndSaveBrandDNA(url, sourceApp = 'unknown') {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Call Edge Function to extract brand DNA
        const { data: brandDNA, error: extractError } = await supabase.functions.invoke('extract-brand-dna', {
            body: { url }
        })

        if (extractError) throw extractError

        // Check if user already has a brand profile
        const existingProfile = await getBrandProfile(user.id)

        const profileData = {
            company_name: brandDNA.company_name,
            logo_url: brandDNA.logo_url,
            primary_color: brandDNA.primary_color,
            secondary_color: brandDNA.secondary_color,
            accent_color: brandDNA.accent_color,
            background_color: brandDNA.background_color,
            text_primary_color: brandDNA.text_primary_color,
            text_secondary_color: brandDNA.text_secondary_color,
            color_scheme: brandDNA.color_scheme,
            fonts: brandDNA.fonts,
            typography: brandDNA.typography,
            social_links: brandDNA.social_links || [],
            business_type: brandDNA.business_type || 'general',
            suggested_ctas: brandDNA.suggested_ctas || [],
            source_app: sourceApp
        }

        if (existingProfile) {
            // Update existing profile
            return await updateBrandProfile(existingProfile.id, profileData)
        } else {
            // Create new profile
            const { data, error } = await supabase
                .from('brand_profiles')
                .insert({
                    user_id: user.id,
                    ...profileData,
                    tone: 'professional' // Default tone
                })
                .select()
                .single()

            if (error) throw error
            return data
        }
    } catch (error) {
        console.error('Error extracting and saving brand DNA:', error)
        throw error
    }
}

/**
 * Update existing brand profile
 * @param {string} profileId - Brand profile ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated brand profile
 */
export async function updateBrandProfile(profileId, updates) {
    try {
        const { data, error } = await supabase
            .from('brand_profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', profileId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error updating brand profile:', error)
        throw error
    }
}

/**
 * Create a new brand profile manually
 * @param {string} userId - User ID
 * @param {Object} profileData - Brand profile data
 * @returns {Promise<Object>} Created brand profile
 */
export async function createBrandProfile(userId, profileData) {
    try {
        const { data, error } = await supabase
            .from('brand_profiles')
            .insert({
                user_id: userId,
                ...profileData
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error creating brand profile:', error)
        throw error
    }
}

/**
 * Delete brand profile
 * @param {string} profileId - Brand profile ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteBrandProfile(profileId) {
    try {
        const { error } = await supabase
            .from('brand_profiles')
            .delete()
            .eq('id', profileId)

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error deleting brand profile:', error)
        throw error
    }
}
