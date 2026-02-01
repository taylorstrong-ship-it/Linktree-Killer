/**
 * Storage Module - Supabase Storage Helper Functions
 * Handles file uploads to Supabase Storage with proper folder structure
 */

import { getClient, getUser } from './auth.js'

const BUCKET_NAME = 'post-generator'

/**
 * Upload logo file to Supabase Storage
 * @param {File} file - File object to upload
 * @returns {Promise<string>} Public URL of uploaded file
 */
export async function uploadLogo(file) {
    try {
        const client = getClient()
        const user = getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload PNG, JPEG, WEBP, or SVG.')
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            throw new Error('File too large. Maximum size is 5MB.')
        }

        // Generate file path: {user_id}/logo.{ext}
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/logo.${fileExt}`

        // Upload file
        const { data, error } = await client.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                upsert: true, // Replace if exists
                contentType: file.type
            })

        if (error) {
            throw error
        }

        // Get public URL
        const { data: { publicUrl } } = client.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName)

        return publicUrl
    } catch (error) {
        console.error('Upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
    }
}

/**
 * Delete logo file from Supabase Storage
 * @returns {Promise<void>}
 */
export async function deleteLogo() {
    try {
        const client = getClient()
        const user = getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        // List files in user's folder
        const { data: files, error: listError } = await client.storage
            .from(BUCKET_NAME)
            .list(user.id)

        if (listError) {
            throw listError
        }

        // Find logo file
        const logoFile = files.find(f => f.name.startsWith('logo.'))

        if (logoFile) {
            const { error: deleteError } = await client.storage
                .from(BUCKET_NAME)
                .remove([`${user.id}/${logoFile.name}`])

            if (deleteError) {
                throw deleteError
            }
        }
    } catch (error) {
        console.error('Delete error:', error)
        throw new Error(`Delete failed: ${error.message}`)
    }
}

/**
 * Get public URL for a stored file
 * @param {string} filePath - Path to file in bucket
 * @returns {string} Public URL
 */
export function getPublicUrl(filePath) {
    const client = getClient()

    const { data: { publicUrl } } = client.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

    return publicUrl
}
