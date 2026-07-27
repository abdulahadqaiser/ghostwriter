const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MINDS_BUILDER_API_KEY;
const baseUrl = process.env.MINDS_API_BASE_URL || 'https://api.build.hellominds.ai/v1';

// Alias from the live E2E test
const alias = 'gw-1785140102674';

async function checkHistory() {
  console.log(`Checking history for alias: ${alias}\n`);

  const res = await fetch(`${baseUrl}/messaging/histories/${alias}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey }
  });

  console.log(`HTTP Status: ${res.status}`);
  const items = await res.json();

  if (!Array.isArray(items)) {
    console.log('Response:', JSON.stringify(items, null, 2));
    return;
  }

  console.log(`Total messages in history: ${items.length}\n`);
  items.forEach((m, i) => {
    console.log(`[${i}] senderType=${m.senderType} | status=${m.status} | createdAt=${m.createdAt}`);
    console.log(`    messageText: ${(m.messageText || '').substring(0, 120)}...`);
    console.log();
  });
}

checkHistory();
