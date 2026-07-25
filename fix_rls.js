const fs = require('fs');
const https = require('https');

const sql = `
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON page_sections;
CREATE POLICY "Enable all access for all users" ON page_sections FOR ALL USING (true) WITH CHECK (true);
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
