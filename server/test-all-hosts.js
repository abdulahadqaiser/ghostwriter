const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MINDS_BUILDER_API_KEY;

const candidates = [
  'https://api.hellominds.ai/v1/bazaar/skills',
  'https://api.hellominds.ai/bazaar/skills',
  'https://hellominds.ai/v1/bazaar/skills',
  'https://hellominds.ai/api/v1/bazaar/skills',
  'https://useminds.com/v1/bazaar/skills',
  'https://api.useminds.com/v1/bazaar/skills',
  'https://backend.useminds.com/v1/bazaar/skills',
  'https://app.hellominds.ai/v1/bazaar/skills',
  'https://app.hellominds.ai/api/v1/bazaar/skills',
  'https://build.hellominds.ai/api/v1/bazaar/skills',
  'https://build.hellominds.ai/api/bazaar/skills'
];

async function runTest() {
  const results = [];
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Builder-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      const text = await res.text();
      results.push({ url, status: res.status, ok: res.ok, bodyPreview: text.substring(0, 300) });
    } catch (err) {
      results.push({ url, error: err.message });
    }
  }

  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync('server/bazaar-host-test-results.json', JSON.stringify(results, null, 2));
}

runTest();
