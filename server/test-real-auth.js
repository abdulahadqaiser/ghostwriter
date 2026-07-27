const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MINDS_BUILDER_API_KEY;
const baseUrl = process.env.MINDS_API_BASE_URL || 'https://api.build.hellominds.ai/v1';
const humanId = '6108513e-f36b-1410-8465-00039ce7df11';

async function testRealAuth() {
  const output = [];
  output.push('=====================================================');
  output.push('Testing Real Minds API Auth & Base URL');
  output.push(`Base URL: ${baseUrl}`);
  output.push(`Auth Header: X-Api-Key (${apiKey.substring(0, 15)}...)`);
  output.push('=====================================================\n');

  // Test 1: GET /v1/humans/{humanId}/minds
  const mindsUrl = `${baseUrl}/humans/${humanId}/minds`;
  output.push(`--> Sending GET ${mindsUrl}...`);
  try {
    const res = await fetch(mindsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });

    output.push(`HTTP Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    output.push('\n--- RAW RESPONSE BODY (humans/minds) ---');
    output.push(text);
    output.push('-------------------------\n');
  } catch (err) {
    output.push(`Fetch Error: ${err.message}`);
  }

  // Test 2: GET /v1/bazaar/skills
  const skillsUrl = `${baseUrl}/bazaar/skills`;
  output.push(`--> Sending GET ${skillsUrl}...`);
  try {
    const res2 = await fetch(skillsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });

    output.push(`HTTP Status: ${res2.status} ${res2.statusText}`);
    const text2 = await res2.text();
    output.push('\n--- RAW RESPONSE BODY (bazaar/skills) ---');
    output.push(text2);
    output.push('-----------------------------------------\n');
  } catch (err) {
    output.push(`Fetch Error: ${err.message}`);
  }

  fs.writeFileSync('server/real-auth-log.utf8.txt', output.join('\n'), 'utf8');
  console.log('Saved to server/real-auth-log.utf8.txt');
}

testRealAuth();
