/**
 * 🔥 Brand DNA API Route - Proxy to Edge Function
 * 
 * **Purpose:** Simple proxy that calls the Supabase Edge Function for brand extraction
 * **Flow:** Next.js API → Edge Function → Firecrawl → OpenAI → Brand DNA
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        console.log(`🔥 Proxying Brand DNA request for: ${url}`);

        // Call the Supabase Edge Function
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { success: false, error: 'Supabase configuration missing' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase.functions.invoke('extract-brand-dna', {
            body: { url },
        });

        if (error) {
            console.error('Edge Function error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        console.log('✅ Brand DNA extracted:', data);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
