/**
 * Live end-to-end test for the real Minds API integration.
 * Tests the full generateRepurposedContent flow:
 *   POST /v1/messaging/conversation -> POST /v1/messaging/message -> poll GET /v1/messaging/histories/{alias}
 * 
 * Runs with USE_MOCK_MINDS_API=false so it hits real Minds API.
 */

const dotenv = require('dotenv');
dotenv.config();

// Force live mode for this test regardless of .env
process.env.USE_MOCK_MINDS_API = 'false';

const mindsService = require('./services/mindsService');

const DEMO_TRANSCRIPT = `Recent research on large language model authorship reveals a major flaw in current AI tools. When creators try to repurpose their video transcripts using generic AI tools like OpusClip or Klap, the output strips out their authentic phrasing and voice. Even when explicitly prompted to "write in my tone", LLMs cluster back toward their default generic style—using corporate buzzwords like "delve", "tapestry", and "synergy". Creators end up spending hours manually rewriting every post before publishing. The solution is building a persistent voice profile with strict negative constraints that explicitly forbid generic AI vocabulary.`;

const MOCK_VOICE_PROFILE = {
  userId: 'test-user-001',
  rawSamples: [
    "I spent 3 years optimizing my content workflow before realizing the problem wasn't the tools — it was that none of them knew my voice.",
    "Most creators waste 2+ hours rewriting AI-generated posts. The fix isn't a better prompt. It's a persistent voice layer the AI actually respects."
  ],
  killList: ['delve', 'tapestry', 'synergy', 'embark', 'robust', 'leverage', 'utilize', 'realm', 'transformative', 'groundbreaking', 'revolutionary', 'game-changer', 'paradigm', 'holistic', 'in conclusion'],
  extractedTraits: {
    tone: ['Direct', 'High-signal', 'Punchy', 'Authentic'],
    sentenceLength: 'Varied, punchy',
    formattingStyle: 'Short paragraphs, clean line breaks'
  },
  corrections: []
};

async function runLiveTest() {
  console.log('=====================================================');
  console.log('LIVE END-TO-END TEST: Real Minds API Integration');
  console.log(`Mind ID: ${process.env.MINDS_MIND_ID}`);
  console.log(`Base URL: ${process.env.MINDS_API_BASE_URL}`);
  console.log(`Mock Mode: ${mindsService.useMock}`);
  console.log('=====================================================\n');

  console.log('Source content snippet:', DEMO_TRANSCRIPT.substring(0, 80) + '...\n');
  console.log('Kill list:', MOCK_VOICE_PROFILE.killList.slice(0, 6).join(', '), '...\n');
  console.log('Starting generateRepurposedContent() ...\n');

  const startTime = Date.now();
  
  try {
    const result = await mindsService.generateRepurposedContent(MOCK_VOICE_PROFILE, DEMO_TRANSCRIPT);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n--- RESULT (completed in ${elapsed}s) ---`);
    console.log('success:', result.success);
    console.log('meta:', JSON.stringify(result.meta, null, 2));
    console.log('\n--- x_thread ---');
    if (Array.isArray(result.data?.x_thread)) {
      result.data.x_thread.forEach((t, i) => console.log(`Tweet ${i+1}: ${t}`));
    } else {
      console.log('MISSING or invalid x_thread:', result.data?.x_thread);
    }
    console.log('\n--- instagram_caption ---');
    console.log(result.data?.instagram_caption || 'MISSING');
    console.log('\n--- youtube_post ---');
    console.log(result.data?.youtube_post || 'MISSING');
    console.log('\n=====================================================');
    console.log(result.meta?.mode?.includes('Live Minds API') ? 'LIVE API PATH CONFIRMED' : 'WARNING: Used fallback path');
    console.log('=====================================================\n');
  } catch (err) {
    console.error('Unexpected test error:', err);
  }
}

runLiveTest();
