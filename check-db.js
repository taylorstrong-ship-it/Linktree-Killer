import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from builder.html (which we saw earlier) to ensure access
const SUPABASE_URL = 'https://qxkicdhsrlpehgcsapsh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TTBR0ES-pM7LOWDsywEy7A_9BSlhWGg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('Connecting to Supabase...');
    const { data, error } = await supabase.from('profiles').select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('--- FOUND PROFILES ---');
    if (data.length === 0) {
        console.log('No profiles found! Table is empty.');
    } else {
        data.forEach(p => {
            console.log(`ID: ${p.id}`);
            console.log(`Email: ${p.email || 'N/A'}`);
            console.log(`Username: ${p.username || '[NULL]'}`);
            console.log(`Title: ${p.title}`);
            console.log('-------------------');
        });
    }
}

check();
