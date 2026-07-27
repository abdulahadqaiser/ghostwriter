const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MINDS_BUILDER_API_KEY;
const baseUrl = process.env.MINDS_API_BASE_URL || 'https://api.build.hellominds.ai/v1';
const alias = 'ghostwriter-test-1785138816535'; // Alias from previous test

async function testHistory() {
  console.log(`--> Fetching History for alias: ${alias}...`);
  try {
    const res = await fetch(`${baseUrl}/messaging/histories/${alias}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log('\n--- RAW HISTORY RESPONSE BODY ---');
    console.log(text);
    console.log('---------------------------------\n');
  } catch (err) {
    console.error('History fetch error:', err);
  }
}

testHistory();
