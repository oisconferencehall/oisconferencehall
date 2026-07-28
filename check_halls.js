const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://kfcyanoqdydwpjrdsdvc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY3lhbm9xZHlkd3BqcmRzZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTI3MzQsImV4cCI6MjA5NTg4ODczNH0.o-Xk7YDZJNVwRbUJ90DsELpFJTLiVWxmITzdfo1fe8M');

async function run() {
  const { data, error } = await supabase.from('page_sections').select('*').eq('type', 'halls');
  if (error) console.error(error);
  else console.log(JSON.stringify(data[0].data.halls, null, 2));
}
run();
