const { createClient } = require('@supabase/supabase-js');

const url = 'https://bzqdjouhyxnldqvatacl.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWRqb3VoeXhubGRxdmF0YWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzEwNTAsImV4cCI6MjA4ODY0NzA1MH0.boUUiczKe59J_Ru0Uapt6cLf8wV6JxLvfxH6IAsoZWY';

const supabase = createClient(url, key);

async function check() {
    console.log('Query without single() to see all rows for this user...');
    const { data, error } = await supabase.from('profiles').select('*').eq('id', 'e7648be4-61f8-4362-89a7-f2ec580ca377');
    console.log('Data:', data);
    console.log('Error:', error);
}

check();
