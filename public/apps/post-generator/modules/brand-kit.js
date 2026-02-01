/**
 * Brand Kit Module - CRUD Operations for Brand Kits
 * Manages brand configurations (logo, colors) in Supabase
 */

import { getClient, getUser } from './auth.js'
import { uploadLogo, deleteLogo } from './storage.js'

/**
 * Fetch all brand kits for current user
 * @returns {Promise<Array>} Array of brand kit objects
 */
export async function getBrandKits() {
    try {
        const client = getClient()
        const user = getUser()

        const { data, error } = await client
            .from('brand_kits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return data || []
    } catch (error) {
        console.error('Error fetching brand kits:', error)
        throw error
    }
}

/**
 * Get default brand kit for current user
 * @returns {Promise<Object|null>} Default brand kit or null
 */
export async function getDefaultBrandKit() {
    try {
        const client = getClient()
        const user = getUser()

        const { data, error } = await client
            .from('brand_kits')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error
        }

        return data
    } catch (error) {
        console.error('Error fetching default brand kit:', error)
        return null
    }
}

/**
 * Create new brand kit
 * @param {Object} brandKit - Brand kit data
 * @param {string} brandKit.name - Name of brand kit
 * @param {string} brandKit.primary_color - Primary hex color
 * @param {string} brandKit.secondary_color - Secondary hex color
 * @param {File|null} brandKit.logoFile - Logo file to upload (optional)
 * @param {boolean} brandKit.is_default - Set as default
 * @returns {Promise<Object>} Created brand kit
 */
export async function createBrandKit(brandKit) {
    try {
        const client = getClient()
        const user = getUser()

        let logoUrl = null

        // Upload logo if provided
        if (brandKit.logoFile) {
            logoUrl = await uploadLogo(brandKit.logoFile)
        }

        // Insert brand kit
        const { data, error } = await client
            .from('brand_kits')
            .insert({
                user_id: user.id,
                name: brandKit.name,
                primary_color: brandKit.primary_color,
                secondary_color: brandKit.secondary_color,
                logo_url: logoUrl,
                is_default: brandKit.is_default || false
            })
            .select()
            .single()

        if (error) throw error

        return data
    } catch (error) {
        console.error('Error creating brand kit:', error)
        throw error
    }
}

/**
 * Update existing brand kit
 * @param {string} id - Brand kit ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated brand kit
 */
export async function updateBrandKit(id, updates) {
    try {
        const client = getClient()

        let logoUrl = updates.logo_url

        // Upload new logo if provided
        if (updates.logoFile) {
            logoUrl = await uploadLogo(updates.logoFile)
        }

        // Prepare update data
        const updateData = {
            ...updates,
            logo_url: logoUrl,
            updated_at: new Date().toISOString()
        }

        // Remove logoFile from update data (not a DB column)
        delete updateData.logoFile

        // Update brand kit
        const { data, error } = await client
            .from('brand_kits')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return data
    } catch (error) {
        console.error('Error updating brand kit:', error)
        throw error
    }
}

/**
 * Delete brand kit
 * @param {string} id - Brand kit ID
 */
export async function deleteBrandKit(id) {
    try {
        const client = getClient()

        const { error } = await client
            .from('brand_kits')
            .delete()
            .eq('id', id)

        if (error) throw error
    } catch (error) {
        console.error('Error deleting brand kit:', error)
        throw error
    }
}

/**
 * Set brand kit as default
 * @param {string} id - Brand kit ID
 */
export async function setDefaultBrandKit(id) {
    try {
        const client = getClient()

        // Update brand kit to set as default
        // Trigger will handle unsetting other defaults
        const { error } = await client
            .from('brand_kits')
            .update({ is_default: true })
            .eq('id', id)

        if (error) throw error
    } catch (error) {
        console.error('Error setting default brand kit:', error)
        throw error
    }
}
