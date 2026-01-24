import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxkicdhsrlpehgcsapsh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TTBR0ES-pM7LOWDsywEy7A_9BSlhWGg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('Testing EXACT App Query...');

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', 'taylor')
        .single();

    if (error) {
        console.error('❌ Query Error:', error);
    } else if (!data) {
        console.error('❌ Data is NULL (User not found)');
    } else {
        console.log('✅ SUCCESS! Found user:', data.username);
        console.log('ID:', data.id);
    }
}

check();
