'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface NewsletterFormProps {
    heading: string
    profileId: string
    theme_color: string
}

export default function NewsletterForm({ heading, profileId, theme_color }: NewsletterFormProps) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // Helper function to convert hex color to rgba with alpha
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            return
        }

        setLoading(true)

        try {
            // Insert subscriber into database
            const { error: insertError } = await supabase
                .from('subscribers')
                .insert({
                    email: email.toLowerCase().trim(),
                    profile_id: profileId
                })

            if (insertError) {
                // Check for duplicate email error
                if (insertError.code === '23505') {
                    setError('You\'re already subscribed!')
                } else {
                    throw insertError
                }
            } else {
                // Success!
                setSuccess(true)
                setEmail('')

                // Reset success message after 5 seconds
                setTimeout(() => {
                    setSuccess(false)
                }, 5000)
            }
        } catch (err) {
            console.error('Newsletter signup error:', err)
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full mb-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-lg font-bold text-white text-center mb-4 drop-shadow-md">
                {heading || 'Join my newsletter'}
            </h3>

            {success ? (
                <div className="text-center py-6">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-400/30 rounded-xl text-green-100 font-semibold backdrop-blur-sm">
                        <i className="fa-solid fa-check-circle text-xl"></i>
                        <span>Success! You're on the list</span>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full py-3 px-6 rounded-xl text-center font-semibold text-white transition-all duration-300 shadow-xl hover:scale-105 bg-white/10 backdrop-blur-md border border-white/20 hover:border-opacity-60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{
                            '--glow-color': theme_color || '#3b82f6'
                        } as React.CSSProperties}
                        onMouseEnter={(e) => {
                            if (!loading && email) {
                                e.currentTarget.style.borderColor = theme_color || '#3b82f6'
                                e.currentTarget.style.boxShadow = `0 0 20px ${hexToRgba(theme_color || '#3b82f6', 0.6)}`
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                Subscribing...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-envelope mr-2"></i>
                                Subscribe
                            </>
                        )}
                    </button>

                    {error && (
                        <p className="text-red-300 text-sm text-center mt-2 bg-red-500/10 border border-red-400/30 rounded-lg py-2 px-3">
                            {error}
                        </p>
                    )}
                </form>
            )}
        </div>
    )
}
