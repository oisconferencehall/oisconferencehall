const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kfcyanoqdydwpjrdsdvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY3lhbm9xZHlkd3BqcmRzZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTI3MzQsImV4cCI6MjA5NTg4ODczNH0.o-Xk7YDZJNVwRbUJ90DsELpFJTLiVWxmITzdfo1fe8M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  const { data, error } = await supabase.from('events').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! Tables exist. Data:', data);
  }
}

checkDatabase();
