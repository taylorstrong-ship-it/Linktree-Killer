// Supabase Client Initialization
const SUPABASE_URL = 'https://qxkicdhsrlpehgcsapsh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TTBR0ES-pM7LOWDsywEy7A_9BSlhWGg';

// Initialize Supabase client
// The @supabase/supabase-js CDN script must be loaded before this file
// It exposes 'supabase' as a global variable
let supabaseClient;

// Initialize when DOM is ready and supabase is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabaseClient;
    } else {
        console.error('Supabase library not loaded. Make sure the CDN script is included before this file.');
    }
});

// Also try immediate initialization (in case DOMContentLoaded already fired)
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
}
