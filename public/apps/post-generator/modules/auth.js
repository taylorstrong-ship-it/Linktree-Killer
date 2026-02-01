/**
 * Auth Module - Authentication State Management
 * Handles user authentication, session checking, and redirects
 */

import { createSupabaseClient, getCurrentUser, isAuthenticated as checkAuth, signOut } from '../../packages/config/supabase-client.js'

let supabaseClient = null
let currentUser = null

/**
 * Initialize auth module
 * @returns {Promise<Object>} { authenticated, user, client }
 */
export async function initializeAuth() {
    try {
        // Create Supabase client
        supabaseClient = createSupabaseClient()

        // Check if user is authenticated
        const authenticated = await checkAuth(supabaseClient)

        if (!authenticated) {
            // Redirect to login with return URL
            const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search)
            window.location.href = `/login?redirect=${redirectUrl}`
            return { authenticated: false, user: null, client: null }
        }

        // Get current user
        currentUser = await getCurrentUser(supabaseClient)

        return {
            authenticated: true,
            user: currentUser,
            client: supabaseClient
        }
    } catch (error) {
        console.error('Auth initialization error:', error)
        throw error
    }
}

/**
 * Get the Supabase client instance
 * @returns {Object} Supabase client
 */
export function getClient() {
    if (!supabaseClient) {
        throw new Error('Auth not initialized. Call initializeAuth() first.')
    }
    return supabaseClient
}

/**
 * Get the current user
 * @returns {Object|null} User object
 */
export function getUser() {
    return currentUser
}

/**
 * Sign out and redirect to home
 */
export async function handleSignOut() {
    try {
        await signOut(supabaseClient)
        window.location.href = '/'
    } catch (error) {
        console.error('Sign out error:', error)
        alert('Failed to sign out. Please try again.')
    }
}

/**
 * Listen for auth state changes
 * @param {Function} callback - Callback function (user) => void
 */
export function onAuthStateChange(callback) {
    if (!supabaseClient) {
        throw new Error('Auth not initialized')
    }

    return supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            currentUser = null
            callback(null)
        } else if (event === 'SIGNED_IN' && session) {
            currentUser = session.user
            callback(session.user)
        }
    })
}
