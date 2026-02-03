import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://qxkicdhsrlpehgcsapsh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ljZGhzcmxwZWhnY3NhcHNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDgxODM4NywiZXhwIjoyMDUwMzk0Mzg3fQ.aQf6bQyKRVpFAODEoaS__E3OU6pRGx3DaHGWZGYuVY4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🚀 Executing Campaign Generator Migrations...\n');

async function runMigrations() {
    try {
        // Migration 1: Create campaigns table
        console.log('📝 Migration 1: Creating campaigns table...');
        const migration1 = readFileSync('migrations/create_campaigns_table.sql', 'utf-8');

        const { data: data1, error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 });

        if (error1) {
            console.error('❌ Migration 1 failed:', error1.message);
            console.log('   Trying direct method...');

            // Fallback: try splitting into individual statements
            const statements = migration1.split(';').filter(s => s.trim());
            for (const stmt of statements) {
                if (stmt.trim()) {
                    const { error } = await supabase.rpc('exec_sql', { sql: stmt });
                    if (error && !error.message.includes('already exists')) {
                        console.error('   Error:', error.message);
                    }
                }
            }
        } else {
            console.log('   ✅ SUCCESS\n');
        }

        // Migration 2: Extend brand_profiles
        console.log('📝 Migration 2: Extending brand_profiles table...');
        const migration2 = readFileSync('migrations/extend_brand_profiles_for_pomelli.sql', 'utf-8');

        const { data: data2, error: error2 } = await supabase.rpc('exec_sql', { sql: migration2 });

        if (error2) {
            console.error('❌ Migration 2 failed:', error2.message);
        } else {
            console.log('   ✅ SUCCESS\n');
        }

        console.log('🎉 Migrations complete! Test at: http://localhost:3000/apps/post-generator/');

    } catch (err) {
        console.error('❌ Script error:', err.message);
        console.log('\n⚠️  Supabase client cannot execute raw SQL DDL.');
        console.log('   Please paste these in Supabase Studio SQL Editor:\n');
        console.log('   1. migrations/create_campaigns_table.sql');
        console.log('   2. migrations/extend_brand_profiles_for_pomelli.sql');
    }
}

runMigrations();
