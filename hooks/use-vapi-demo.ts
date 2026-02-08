'use client';

import { useCallback, useRef, useState } from 'react';
// 🛡️ CRITICAL: Vapi import REMOVED - will lazy load in toggleCall instead

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface BrandDNA {
    business_name?: string;
    company_name?: string;
    tone?: string;
    business_intel?: {
        archetype?: string;
        vibe_keywords?: string[];
        signature_items?: string[];
        policies?: Record<string, string>;
        price_range?: string;
        insider_tips?: string[];
        [key: string]: any;
    };
    [key: string]: any;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'disconnecting' | 'error';

interface VapiState {
    status: CallStatus;
    volumeLevel: number;
    transcript: string;
    error: string | null;
    isMuted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: useVapiDemo
// ─────────────────────────────────────────────────────────────────────────────

export function useVapiDemo() {
    const vapiRef = useRef<any | null>(null); // Changed from Vapi to any since we're lazy loading
    const initializedRef = useRef(false);
    const [state, setState] = useState<VapiState>({
        status: 'idle',
        volumeLevel: 0,
        transcript: '',
        error: null,
        isMuted: false,
    });

    // 🛡️ LAZY LOAD: Initialize Vapi SDK only when toggleCall is first invoked
    const initializeVapi = useCallback(async () => {
        if (initializedRef.current || vapiRef.current) {
            return vapiRef.current;
        }

        try {
            console.log('🎙️ [Vapi] Lazy loading SDK...');

            // 🔥 DYNAMIC IMPORT: Load Vapi only when needed
            const { default: Vapi } = await import('@vapi-ai/web');

            const apiKey = process.env.NEXT_PUBLIC_VAPI_KEY;

            if (!apiKey) {
                console.error('❌ VAPI_KEY not found in environment');
                setState(prev => ({
                    ...prev,
                    error: 'Vapi API key not configured',
                    status: 'error'
                }));
                return null;
            }

            console.log('✅ [Vapi] SDK loaded, initializing...');
            const vapi = new Vapi(apiKey);
            vapiRef.current = vapi;
            initializedRef.current = true;

            // ────────────────────────────────────────────────────────────────
            // EVENT LISTENERS (Set up after SDK loads)
            // ────────────────────────────────────────────────────────────────

            vapi.on('call-start', () => {
                console.log('✅ [Vapi] Call started');
                setState(prev => ({ ...prev, status: 'active', error: null }));
            });

            vapi.on('call-end', () => {
                console.log('📴 [Vapi] Call ended');
                setState(prev => ({
                    ...prev,
                    status: 'idle',
                    volumeLevel: 0,
                    transcript: '',
                }));
            });

            vapi.on('volume-level', (volume: number) => {
                // Volume is 0-1 float - use for waveform visualization
                setState(prev => ({ ...prev, volumeLevel: volume }));
            });

            vapi.on('message', (message: any) => {
                // Live transcript from the conversation
                if (message.type === 'transcript' && message.transcript) {
                    console.log('💬 [Vapi]', message.transcript);
                    setState(prev => ({
                        ...prev,
                        transcript: message.transcript || prev.transcript,
                    }));
                }
            });

            vapi.on('error', (error: any) => {
                console.error('❌ [Vapi] Error:', error);
                setState(prev => ({
                    ...prev,
                    status: 'error',
                    error: error.message || 'Unknown error',
                }));
            });

            return vapi;
        } catch (error) {
            console.error('❌ [Vapi] Failed to load SDK:', error);
            setState(prev => ({
                ...prev,
                status: 'error',
                error: 'Failed to load Vapi SDK'
            }));
            return null;
        }
    }, []);

    // Toggle call (start/stop)
    const toggleCall = useCallback(async (brandDNA: BrandDNA) => {
        // 🔥 LAZY LOAD: Initialize SDK on first call
        const vapi = await initializeVapi();

        if (!vapi) {
            console.error('❌ [Vapi] SDK initialization failed');
            return;
        }

        // If call is active, hang up
        if (state.status === 'active') {
            console.log('📴 [Vapi] Stopping call...');
            setState(prev => ({ ...prev, status: 'disconnecting' }));
            vapi.stop();
            return;
        }

        // Otherwise, start a new call with dynamic assistant config
        try {
            setState(prev => ({ ...prev, status: 'connecting', error: null }));

            // Extract brand identity
            const businessName = brandDNA.business_name || brandDNA.company_name || 'this business';
            const tone = brandDNA.tone || 'professional and helpful';
            const archetype = brandDNA.business_intel?.archetype || 'The Guide';
            const intel = brandDNA.business_intel || {};

            // Smart voice selection based on tone
            const voiceId = tone.toLowerCase().includes('energetic') ? 'aria' :
                tone.toLowerCase().includes('warm') ? 'bella' :
                    'emma';

            console.log(`🚀 [Vapi] Starting call with voice: ${voiceId}, archetype: ${archetype}`);

            vapi.start({
                name: `${businessName} AI Assistant`,
                model: {
                    provider: 'google',
                    model: 'gemini-2.0-flash-exp',
                    systemPrompt: `You are the AI voice assistant for ${businessName}, a business with the archetype "${archetype}".

Your personality: ${tone}

Brand Intelligence:
${archetype ? `- Archetype: ${archetype}` : ''}
${intel.vibe_keywords ? `- Vibe: ${intel.vibe_keywords.join(', ')}` : ''}
${intel.signature_items ? `- Signature Items: ${intel.signature_items.join(', ')}` : ''}
${intel.price_range ? `- Price Range: ${intel.price_range}` : ''}
${intel.insider_tips ? `\nInsider Tips:\n${intel.insider_tips.map((tip: string) => `- ${tip}`).join('\n')}` : ''}
${intel.policies ? `\nPolicies:\n${Object.entries(intel.policies).map(([key, value]) => `- ${key}: ${value}`).join('\n')}` : ''}

Your role:
- Embody the brand's personality and values
- Help customers with questions about products, services, pricing, and policies
- Use your brand knowledge to provide specific, helpful answers
- Speak naturally and conversationally, matching the ${tone} tone
- If you don't know something, say so honestly - never make up information

Keep responses concise (under 30 seconds)`,
                },
                voice: {
                    provider: 'elevenlabs',
                    voiceId: voiceId,
                },
            });

        } catch (error: any) {
            console.error('❌ [Vapi] Failed to start call:', error);
            setState(prev => ({
                ...prev,
                status: 'error',
                error: error.message || 'Failed to start call',
            }));
        }
    }, [state.status, initializeVapi]);

    return {
        status: state.status,
        volumeLevel: state.volumeLevel,
        transcript: state.transcript,
        error: state.error,
        isMuted: state.isMuted,
        toggleCall,
        isCallActive: state.status === 'active',
    };
}
