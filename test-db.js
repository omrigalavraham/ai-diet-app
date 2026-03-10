require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) throw new Error('Missing Supabase creds');

const supabase = createClient(url, key);

async function check() {
    console.log('Checking user profile e7648be4-61f8-4362-89a7-f2ec580ca377...');
    const { data, error } = await supabase.from('profiles').select('*').eq('id', 'e7648be4-61f8-4362-89a7-f2ec580ca377').single();
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Profile Data Found:');
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
