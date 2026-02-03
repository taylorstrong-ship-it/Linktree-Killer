import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { db: { schema: 'public' } }
    )

    try {
        // Try to check if campaigns table exists
        const { data: existing, error: checkError } = await supabaseAdmin
            .from('campaigns')
            .select('id')
            .limit(1)

        if (existing !== null) {
            return new Response(
                JSON.stringify({ success: true, message: 'Campaigns table already exists!' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // If we get here, table doesn't exist - we need manual SQL execution
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Cannot execute DDL via Supabase JS client. Please run migrations manually in Supabase Studio SQL Editor.',
                instructions: [
                    '1. Go to https://supabase.com/dashboard/project/qxkicdhsrlpehgcsapsh/editor',
                    '2. Run migrations/create_campaigns_table.sql',
                    '3. Run migrations/extend_brand_profiles_for_pomelli.sql'
                ]
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
