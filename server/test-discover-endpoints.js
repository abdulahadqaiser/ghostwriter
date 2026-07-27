const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MINDS_BUILDER_API_KEY;
const baseUrl = process.env.MINDS_API_BASE_URL || 'https://api.build.hellominds.ai/v1';
const humanId = '6108513e-f36b-1410-8465-00039ce7df11';

async function discoverEndpoints() {
  console.log('=== Discovering available Minds API endpoints ===\n');

  // 1. Check both Mind details
  const minds = [
    { id: 'c909513e-f36b-1410-8465-00039ce7df11', name: 'Dylan.Parker' },
    { id: '7b08513e-f36b-1410-8465-00039ce7df11', name: 'Andrew.Garrett' }
  ];

  for (const mind of minds) {
    const res = await fetch(`${baseUrl}/minds/${mind.id}`, {
      headers: { 'X-Api-Key': apiKey }
    });
    console.log(`GET /minds/${mind.id} -> HTTP ${res.status}`);
    if (res.ok) {
      const d = await res.json();
      console.log(JSON.stringify(d, null, 2));
    } else {
      console.log(await res.text());
    }
    console.log();
  }

  // 2. Check if there's a completions or chat endpoint
  const endpoints = [
    `/minds/${minds[0].id}/completions`,
    `/minds/${minds[0].id}/chat`,
    `/minds/${minds[0].id}/chat/completions`,
    `/chat/completions`,
    `/completions`,
    `/minds/${minds[0].id}/invoke`,
    `/messaging/send`,
  ];

  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: JSON.stringify({ message: 'test', messages: [{ role: 'user', content: 'test' }] })
    });
    console.log(`POST ${ep} -> HTTP ${res.status}`);
    if (res.status !== 404) {
      console.log(await res.text());
    }
  }
}

discoverEndpoints().catch(console.error);
