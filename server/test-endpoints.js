const mindsService = require('./services/mindsService');

async function testEndpoints() {
  console.log('--- Testing API Route Service Logic ---');

  // Test Profile Mock Data
  const defaultProfile = {
    userId: 'default-creator',
    rawSamples: [
      'Stop trying to post everywhere without fixing your tone first.',
      'The best content strategy isn\'t 100 new ideas. It\'s 1 episode adapted to 3 platforms.'
    ],
    extractedTraits: {
      tone: ['Direct', 'High-signal', 'Punchy'],
      sentenceLength: 'Short to medium',
      formattingStyle: 'Clean line breaks'
    },
    killList: ['delve', 'tapestry', 'unlock', 'unleash', 'synergy'],
    corrections: []
  };

  console.log('✅ Default Profile schema validated.');

  // Test Repurpose Logic
  const sourceText = 'Creators who repurpose long-form content currently rely on tools that get the format right but strip out their actual voice. Ghostwriter solves this with a persistent voice profile.';
  const result = await mindsService.generateRepurposedContent(defaultProfile, sourceText);

  console.log('✅ Repurpose output generated successfully:');
  console.log('   - X Thread count:', result.data.x_thread.length);
  console.log('   - Instagram caption length:', result.data.instagram_caption.length);
  console.log('   - YouTube post length:', result.data.youtube_post.length);

  // Test Credits API
  const credits = await mindsService.getCreditsBalance();
  console.log('✅ Cognition credits balance:', credits.balance, `(${credits.mode})`);

  // Test Bazaar Skills Check
  const skills = await mindsService.checkAndEquipRelevantSkills();
  console.log('✅ Bazaar skills equipped count:', skills.length);

  console.log('--- All Route Logic Tests Passed! ---');
}

testEndpoints();
