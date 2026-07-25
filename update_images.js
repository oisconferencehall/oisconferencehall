const fs = require('fs');
const https = require('https');

const sql = `
UPDATE page_sections
SET data = jsonb_set(
    jsonb_set(
        jsonb_set(
            data,
            '{bgImage1}',
            '"https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80"'::jsonb
        ),
        '{bgImage2}',
        '"https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80"'::jsonb
    ),
    '{bgImage3}',
    '"https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=400&q=80"'::jsonb
)
WHERE type = 'hall_showcase';
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
