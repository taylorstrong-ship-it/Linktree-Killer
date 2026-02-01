/**
 * Shared Supabase Client Factory
 * Used by all apps in the Taylored Solutions monorepo
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase configuration
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL ||
    window.ENV?.SUPABASE_URL ||
    'https://your-project.supabase.co'

const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY ||
    window.ENV?.SUPABASE_ANON_KEY ||
    'your-anon-key'

/**
 * Create a new Supabase client instance
 * @returns {Object} Supabase client
 */
export function createSupabaseClient() {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    })
}

/**
 * Get the current authenticated user
 * @param {Object} client - Supabase client instance
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser(client) {
    const { data: { user }, error } = await client.auth.getUser()
    if (error) {
        console.error('Error getting user:', error)
        return null
    }
    return user
}

/**
 * Check if user is authenticated
 * @param {Object} client - Supabase client instance
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated(client) {
    const user = await getCurrentUser(client)
    return user !== null
}

/**
 * Sign out the current user
 * @param {Object} client - Supabase client instance
 */
export async function signOut(client) {
    const { error } = await client.auth.signOut()
    if (error) {
        console.error('Error signing out:', error)
        throw error
    }
}

/**
 * Get the current session
 * @param {Object} client - Supabase client instance
 * @returns {Promise<Object|null>}
 */
export async function getSession(client) {
    const { data: { session }, error } = await client.auth.getSession()
    if (error) {
        console.error('Error getting session:', error)
        return null
    }
    return session
}
