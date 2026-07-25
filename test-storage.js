const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://kfcyanoqdydwpjrdsdvc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY3lhbm9xZHlkd3BqcmRzZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTI3MzQsImV4cCI6MjA5NTg4ODczNH0.o-Xk7YDZJNVwRbUJ90DsELpFJTLiVWxmITzdfo1fe8M');

async function testStorage() {
  const { data, error } = await supabase.storage.getBucket('events');
  if (error) {
    console.log('Error getting bucket:', error.message);
    // try to create it
    const { data: createData, error: createError } = await supabase.storage.createBucket('events', { public: true });
    if (createError) {
      console.log('Error creating bucket:', createError.message);
    } else {
      console.log('Bucket created successfully!');
    }
  } else {
    console.log('Bucket exists:', data.name);
  }
}
testStorage();
