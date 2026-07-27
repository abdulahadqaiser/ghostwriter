const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const VoiceProfile = require('./models/VoiceProfile');

async function testDynamicKillList() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ghostwriter';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);

  const profile = await VoiceProfile.findOne({ userId: 'default-creator' });
  console.log('Current MongoDB killList count:', profile?.killList?.length || 0);
  console.log('Sample killList words:', (profile?.killList || []).slice(0, 10));

  await mongoose.disconnect();
  console.log('Done.');
}

testDynamicKillList().catch(console.error);
