const fs = require('fs');
const https = require('https');

const sql = `
DELETE FROM page_sections WHERE page_slug = 'home';

INSERT INTO page_sections (page_slug, type, order_index, data) VALUES 
('home', 'aurora_hero', 1, '{"title": "Ready to host your event in a", "titleHighlight": "perfect hall?", "subtitle": "Book at Grand Conference Hall today! Your meetings deserve a professional environment.", "btnPrimary": "Leave a request", "btnSecondary": "More about all halls"}'::jsonb),
('home', 'bento_advantages', 2, '{"title": "Our", "titleHighlight": "Advantages", "adv1": "A premium location right in the heart of the city.", "adv2": "Ultra-HD Projectors and Professional Audio.", "adv3": "Flawless catering and valet service.", "adv4": "Spacious and bright halls", "bgImage1": "https://images.unsplash.com/photo-1517502884422-41ea60d5b436?w=1200&q=80", "bgImage2": "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=600&q=80"}'::jsonb),
('home', 'featured_events', 3, '{}'::jsonb),
('home', 'hall_showcase', 4, '{"title": "Modern &", "titleHighlight": "World-Class Venue", "description": "Grand Conference Hall is one of Tashkent''s most modern and comfortable event venues. 850-seat capacity, professional equipment, and flawless service.", "feature1": "850 seats + open flexible space", "feature2": "Ultra-HD projector & professional sound system", "feature3": "High-speed WiFi & video-conferencing equipment", "feature4": "Free parking & valet service"}'::jsonb);
`;

const data = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: '/v1/projects/kfcyanoqdydwpjrdsdvc/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_ACCESS_TOKEN',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => { responseBody += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${responseBody}`);
  });
});
req.write(data);
req.end();
