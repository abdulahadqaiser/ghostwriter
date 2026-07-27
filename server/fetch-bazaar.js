const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MINDS_BUILDER_API_KEY;

async function testSingle() {
  const log = [];
  const urls = [
    'https://api.hellominds.ai/v1/bazaar/skills',
    'https://build.hellominds.ai/v1/bazaar/skills',
    'https://build.hellominds.ai/api/v1/bazaar/skills'
  ];

  for (const url of urls) {
    log.push(`\n--- TRYING: ${url} ---`);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Builder-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      log.push(`Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      log.push(`Body:\n${text}`);
    } catch (err) {
      log.push(`Error: ${err.message}`);
    }
  }

  fs.writeFileSync('server/bazaar-raw-output.txt', log.join('\n'));
  console.log('Saved to server/bazaar-raw-output.txt');
}

testSingle();
