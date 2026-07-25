const fs = require('fs');
const https = require('https');

const sql = `
CREATE TABLE IF NOT EXISTS custom_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug text REFERENCES custom_pages(slug) ON DELETE CASCADE,
  type text NOT NULL,
  order_index integer NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

INSERT INTO custom_pages (slug, title) VALUES ('home', 'Home Page') ON CONFLICT (slug) DO NOTHING;
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
