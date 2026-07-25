const https = require('https');

const sql = `
UPDATE page_sections
SET data = jsonb_set(
    jsonb_set(
        data,
        '{adv1Desc}',
        '"A premium location right in the heart of the city."'::jsonb
    ),
    '{location}',
    '"Samarkand City Center"'::jsonb
)
WHERE type = 'bento_advantages';
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
