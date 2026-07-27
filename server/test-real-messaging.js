const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MINDS_BUILDER_API_KEY;
const baseUrl = process.env.MINDS_API_BASE_URL || 'https://api.build.hellominds.ai/v1';
const mindId = 'c909513e-f36b-1410-8465-00039ce7df11'; // Real Mind ID from earlier GET test
const alias = `ghostwriter-test-${Date.now()}`;

async function testMessaging() {
  console.log('=====================================================');
  console.log('Testing Real Minds Messaging Endpoints');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Mind ID: ${mindId}`);
  console.log(`Alias: ${alias}`);
  console.log('=====================================================\n');

  // 1. POST /v1/messaging/conversation
  console.log('--> Step 1: Creating Conversation (POST /v1/messaging/conversation)...');
  try {
    const convRes = await fetch(`${baseUrl}/messaging/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({
        alias,
        mindId
      })
    });

    console.log(`HTTP Status: ${convRes.status} ${convRes.statusText}`);
    const convText = await convRes.text();
    console.log('Response Body:', convText);

    // 2. POST /v1/messaging/message
    console.log('\n--> Step 2: Sending Message (POST /v1/messaging/message)...');
    const msgRes = await fetch(`${baseUrl}/messaging/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({
        alias,
        messageText: 'Hello Mind! Send me a short hello back.'
      })
    });

    console.log(`HTTP Status: ${msgRes.status} ${msgRes.statusText}`);
    const msgText = await msgRes.text();
    console.log('Response Body:', msgText);

  } catch (err) {
    console.error('Error during messaging test:', err);
  }
}

testMessaging();
