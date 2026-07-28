/**
 * personaSeeder.js — Seeds default Voice Profiles for Hackathon Judges
 *
 * Seeded Personas:
 *   1. "default-creator" — User's default voice
 *   2. "persona-mkbhd" — Tech Reviewer (MKBHD)
 *   3. "persona-hormozi" — Aggressive Business (Alex Hormozi)
 */

const VoiceProfile = require('../models/VoiceProfile');

const DEFAULT_PERSONAS = [
  {
    userId: 'default-creator',
    rawSamples: [
      "Stop trying to post everywhere at once without fixing your tone first. If your caption sounds like a press release, nobody is reading past line one.",
      "The best content strategy isn't creating 100 new ideas. It's taking one high-signal podcast episode and adapting it natively to 3 platforms without losing your voice."
    ],
    extractedTraits: {
      tone: ['Direct', 'High-signal', 'Punchy', 'Authentic'],
      sentenceLength: 'Short to medium, rhythmic',
      formattingStyle: 'Clean line breaks, bullet lists for key points',
      keyPhrases: ['high-signal', 'without losing your voice', 'natively']
    },
    killList: ['delve', 'tapestry', 'unlock', 'synergy']
  },
  {
    userId: 'persona-mkbhd',
    rawSamples: [
      "So I've been using this device for the last two weeks, and here's the honest truth. The hardware is crisp, the display is gorgeous... but at $3,500, it's just not for most people.",
      "Every year phone companies try to convince you that this new camera sensor changes everything. But when you actually test it in low light... the difference is subtle. Crisp hardware, but software needs work. Peace out."
    ],
    extractedTraits: {
      tone: ['Analytical', 'Pragmatic', 'Tech-focused', 'Crisp'],
      sentenceLength: 'Conversational, uses pauses (...)',
      formattingStyle: 'Structured tech review format, pragmatic verdict',
      keyPhrases: ["So I've been using", "here's the honest truth", "crisp", "Peace out"]
    },
    killList: ['game-changer', 'revolutionary', 'mind-blowing', 'unbelievable', 'delve']
  },
  {
    userId: 'persona-hormozi',
    rawSamples: [
      "If you're not making $10k a month, stop worrying about logo design and tax optimization. Pick one offer, sell it to one audience, and work 14 hours a day until it works. Period.",
      "Give away your secrets for free, sell the implementation. Most people fail because they hoard knowledge like it's valuable. Knowledge is cheap. Execution is everything."
    ],
    extractedTraits: {
      tone: ['Aggressive', 'Direct', 'No-nonsense', 'ROI-focused'],
      sentenceLength: 'Very short, blunt, declarative',
      formattingStyle: 'High-contrast statements, numbered action steps',
      keyPhrases: ['Period', 'Execution is everything', 'Stop worrying about', 'work 14 hours']
    },
    killList: ['delve', 'tapestry', 'synergy', 'maybe', 'hopefully', 'feel']
  }
];

async function seedPersonas() {
  try {
    for (const personaData of DEFAULT_PERSONAS) {
      const existing = await VoiceProfile.findOne({ userId: personaData.userId });
      if (!existing) {
        await VoiceProfile.create(personaData);
        console.log(`[PersonaSeeder] Seeded default profile: ${personaData.userId}`);
      } else if (personaData.userId !== 'default-creator') {
        // Ensure seeded personas have their distinct traits and kill list
        existing.rawSamples = personaData.rawSamples;
        existing.extractedTraits = personaData.extractedTraits;
        existing.killList = personaData.killList;
        await existing.save();
        console.log(`[PersonaSeeder] Updated profile traits for: ${personaData.userId}`);
      }
    }
  } catch (err) {
    console.warn('[PersonaSeeder] Failed to seed personas:', err.message);
  }
}

module.exports = { seedPersonas, DEFAULT_PERSONAS };
