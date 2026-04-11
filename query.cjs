require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('user_accounts').select('*').limit(5);
  console.log('user_accounts row:', data.map(u => ({ email: u.email, name: u.full_name, role: u.role })));
}
run();
