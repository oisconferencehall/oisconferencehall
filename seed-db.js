const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// We can require the data file by just importing the objects, but since it's ES module (export const),
// let's just parse the file or duplicate the most basic ones. Wait, I can just use the Management API again or standard client!
// Let me just write a JS module and run it.

const supabaseUrl = 'https://kfcyanoqdydwpjrdsdvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY3lhbm9xZHlkd3BqcmRzZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTI3MzQsImV4cCI6MjA5NTg4ODczNH0.o-Xk7YDZJNVwRbUJ90DsELpFJTLiVWxmITzdfo1fe8M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // Use dynamic import for ES modules
  const { DEMO_EVENTS } = await import('./lib/data.js');
  
  for (const ev of DEMO_EVENTS) {
    const { id, bookedSeats, ...eventData } = ev;
    
    // Insert event
    const { data, error } = await supabase.from('events').insert([
      { 
        title: eventData.title,
        title_ru: eventData.titleRu,
        title_uz: eventData.titleUz,
        description: eventData.description,
        description_ru: eventData.descriptionRu,
        description_uz: eventData.descriptionUz,
        date: eventData.date,
        time: eventData.time,
        end_time: eventData.endTime,
        category: eventData.category,
        image: eventData.image,
        bg_image: eventData.bgImage,
        price: eventData.price,
        organizer: eventData.organizer,
        featured: eventData.featured || false
      }
    ]);
    
    if (error) {
      console.log('Error inserting event:', error.message);
    } else {
      console.log(`Inserted event: ${ev.title}`);
    }
  }
}

seed();
