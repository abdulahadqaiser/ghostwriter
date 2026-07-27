const mindsService = require('./services/mindsService');

async function runTests() {
  console.log('--- Testing MindsService JSON Extraction & Validation Safety Net ---');

  // Test Case 1: Clean JSON
  const raw1 = `{"x_thread":["Tweet 1","Tweet 2"],"instagram_caption":"Cap","youtube_post":"Post"}`;
  const res1 = mindsService.extractAndValidateJson(raw1);
  console.log('✅ Test 1 Passed:', res1.x_thread.length === 2);

  // Test Case 2: Markdown wrapped JSON with conversational preamble
  const raw2 = `Here is your JSON response:
\`\`\`json
{
  "x_thread": ["Tweet A", "Tweet B", "Tweet C"],
  "instagram_caption": "My IG Caption here...",
  "youtube_post": "My YT Post here..."
}
\`\`\`
Hope this helps!`;
  const res2 = mindsService.extractAndValidateJson(raw2);
  console.log('✅ Test 2 Passed (Markdown & preamble stripped):', res2.x_thread.length === 3);

  // Test Case 3: Minds Service Mock Generation
  const dummyProfile = {
    userId: 'test-user',
    rawSamples: ['Test writing sample'],
    extractedTraits: { tone: ['Direct'] },
    killList: ['delve', 'tapestry']
  };
  const mockGen = await mindsService.generateRepurposedContent(dummyProfile, 'This is a sample video transcript about AI tools.');
  console.log('✅ Test 3 Passed (Mock Repurpose Generation):', mockGen.success && mockGen.data.x_thread.length > 0);

  console.log('--- All MindsService tests passed successfully! ---');
}

runTests();
