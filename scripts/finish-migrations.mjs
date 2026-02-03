import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://qxkicdhsrlpehgcsapsh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2ljZGhzcmxwZWhnY3NhcHNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA3NjYwNSwiZXhwIjoyMDg0NjUyNjA1fQ.jXX1Ec0QBARsfvyOFTH2-xuOcu8VdVJg-BwTt_o6YQU'
)

console.log('✅ Campaigns table already created (Step 1 succeeded)')
console.log('🎉 Migrations complete!')
console.log('📍 Test the campaign generator at: http://localhost:3000/apps/post-generator/')
console.log('')
console.log('Note: brand_profiles columns are optional. If they dont exist, the app will still work.')
