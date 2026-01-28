'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { X, Sparkles, Lock, ArrowRight } from 'lucide-react'

interface AuthModalProps {
    onClose: () => void
    onSuccess: (userId: string) => void
    prefilledEmail?: string
}

export default function AuthModal({ onClose, onSuccess, prefilledEmail = '' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('signup')
    const [email, setEmail] = useState(prefilledEmail)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (mode === 'signup') {
                // Create new account
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/builder`
                    }
                })

                if (signUpError) throw signUpError

                if (data.user) {
                    console.log('✅ Account created:', data.user.id)
                    onSuccess(data.user.id)
                }
            } else {
                // Login to existing account
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })

                if (signInError) throw signInError

                if (data.user) {
                    console.log('✅ Logged in:', data.user.id)
                    onSuccess(data.user.id)
                }
            }
        } catch (err) {
            console.error('Auth error:', err)
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center pt-8 px-8 pb-6 border-b border-white/10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-[#FFAD7A] to-orange-400 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FFAD7A]/20">
                        <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {mode === 'signup' ? 'Claim Your Link' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {mode === 'signup'
                            ? 'Create your account to publish your bio link forever'
                            : 'Log in to save your changes'}
                    </p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-300 block mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFAD7A] focus:ring-2 focus:ring-[#FFAD7A]/50 transition"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-300 block mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFAD7A] focus:ring-2 focus:ring-[#FFAD7A]/50 transition"
                            />
                            {mode === 'signup' && (
                                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FFAD7A] hover:bg-[#FF9A5A] text-black font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#FFAD7A]/30"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    <span>{mode === 'signup' ? 'Creating Account...' : 'Logging In...'}</span>
                                </>
                            ) : (
                                <>
                                    {mode === 'signup' ? 'Create Account & Publish' : 'Log In & Save'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="text-center mt-6 pt-6 border-t border-white/10">
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login')
                                setError('')
                            }}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {mode === 'signup' ? (
                                <>Already have an account? <span className="text-[#FFAD7A] font-semibold">Log in</span></>
                            ) : (
                                <>Need an account? <span className="text-[#FFAD7A] font-semibold">Sign up</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
