const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const VoiceProfile = require('./models/VoiceProfile');

async function testCorrectionLoop() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ghostwriter';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);

  let profile = await VoiceProfile.findOne({ userId: 'default-creator' });
  console.log('Current profile corrections count:', profile?.corrections?.length || 0);

  // Push test rule
  profile.corrections.push("Never use the word 'Poll' in YouTube posts.");
  await profile.save();

  profile = await VoiceProfile.findOne({ userId: 'default-creator' });
  console.log('Updated profile corrections:', profile.corrections);

  await mongoose.disconnect();
  console.log('Correction loop MongoDB test complete!');
}

testCorrectionLoop().catch(console.error);
