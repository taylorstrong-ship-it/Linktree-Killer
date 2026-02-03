#!/usr/bin/env node

/**
 * Migration Script - Apply Pomelli Campaign Generator Migrations
 * Applies campaigns table and brand_profiles extensions to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = 'https://qxkicdhsrlpehgcsapsh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TTBR0ES-pM7LOWDsywEy7A_9BSlhWGg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runMigration(migrationFile, description) {
    console.log(`\n📝 Running: ${description}`);
    console.log(`   File: ${migrationFile}`);

    try {
        const sqlPath = join(__dirname, '..', 'migrations', migrationFile);
        const sql = readFileSync(sqlPath, 'utf-8');

        // Execute SQL via Supabase RPC or direct query
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
            // If RPC doesn't exist, try direct execution via REST API
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sql_query: sql })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            return { data: await response.json(), error: null };
        });

        if (error) {
            console.error(`   ❌ ERROR: ${error.message}`);
            return false;
        }

        console.log(`   ✅ SUCCESS`);
        return true;

    } catch (err) {
        console.error(`   ❌ FAILED: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Pomelli Campaign Generator Migrations\n');
    console.log(`   Database: ${SUPABASE_URL}`);

    // Migration 1: Campaigns Table
    const migration1 = await runMigration(
        'create_campaigns_table.sql',
        'Create campaigns table for 3-piece content bundles'
    );

    // Migration 2: Extend Brand Profiles
    const migration2 = await runMigration(
        'extend_brand_profiles_for_pomelli.sql',
        'Extend brand_profiles with Pomelli fields'
    );

    console.log('\n' + '='.repeat(60));

    if (migration1 && migration2) {
        console.log('✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY\n');
        console.log('🎉 Campaign Generator is ready to test!');
        console.log('   URL: http://localhost:3000/apps/post-generator/');
        process.exit(0);
    } else {
        console.log('⚠️  SOME MIGRATIONS FAILED\n');
        console.log('💡 Try applying manually via Supabase Studio SQL Editor');
        process.exit(1);
    }
}

main().catch(console.error);
