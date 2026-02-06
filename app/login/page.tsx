'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Mail, Sparkles, Check } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleMagicLink(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (otpError) throw otpError

            setSuccess(true)
        } catch (err) {
            console.error('Magic link error:', err)
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212] font-sans selection:bg-[#FF6B35]/30 selection:text-[#FF6B35]">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-2xl shadow-orange-500/40">
                        <span className="font-black text-2xl text-white">T</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        Welcome to Taylored AI.
                    </h1>
                    <p className="text-white/40 text-sm">
                        Sign in to access your creative studio
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#1E1E1E]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mb-4">
                                <Check className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Check your email!</h2>
                            <p className="text-white/60 leading-relaxed">
                                We sent a magic link to <span className="text-[#FF6B35] font-medium">{email}</span>
                            </p>
                            <p className="text-white/40 text-sm pt-4">
                                Click the link in the email to sign in.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleMagicLink} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6B35]/50 focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                                    <span className="mt-0.5">⚠️</span>
                                    <div>{error}</div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6 shadow-[0_0_30px_rgba(255,107,53,0.3)]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Sending magic link...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Send Magic Link
                                    </>
                                )}
                            </button>

                            <p className="text-center text-white/40 text-xs pt-2">
                                No password required. We'll email you a secure link.
                            </p>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-white/20 text-xs">
                    Powered by <span className="text-white/40 font-medium">Taylored AI</span>
                </p>
            </div>
        </div>
    )
}
