import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DescriptionIcon from '@mui/icons-material/Description';
import { saveOnboardingSamples } from '../utils/api';

const PRESET_CREATORS = [
  {
    name: 'Tech & AI Creator',
    samples: [
      "Stop trying to post everywhere at once without fixing your tone first. If your caption sounds like a press release, nobody is reading past line one.",
      "The best content strategy isn't creating 100 new ideas. It's taking one high-signal podcast episode and adapting it natively to 3 platforms without losing your voice.",
      "Generic AI tools get the format right, but strip out your phrasing. Your voice is your moat—protect it."
    ]
  },
  {
    name: 'Storyteller & Founder',
    samples: [
      "Three years ago, I almost shut down my company. Here is the single decision that changed everything.",
      "Building in public doesn't mean sharing your revenue every day. It means sharing the raw lessons you learned when things broke.",
      "If you can't explain your product in two plain sentences without jargon, you don't understand your customer yet."
    ]
  },
  {
    name: 'Creative Educator',
    samples: [
      "Here is how I outline a 20-minute video in under 15 minutes without getting stuck.",
      "Quality over quantity isn't an excuse to post once a month. Consistency builds momentum, quality builds trust.",
      "The secret to scroll-stopping hooks? Start with the exact problem your viewer woke up thinking about."
    ]
  }
];

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [samplesText, setSamplesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (samplesArray) => {
    try {
      setLoading(true);
      setError(null);
      const samples = samplesArray || samplesText
        .split('\n---')
        .map(s => s.trim())
        .filter(Boolean);

      if (samples.length === 0) {
        throw new Error('Please enter at least one writing sample or choose a preset profile.');
      }

      await saveOnboardingSamples(samples);
      setLoading(false);
      onComplete();
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset) => {
    setSamplesText(preset.samples.join('\n\n---\n\n'));
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="editorial-card" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative',
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        borderRadius: '12px'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--theme-text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Close"
        >
          <CloseIcon style={{ fontSize: 20 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <AutoAwesomeIcon style={{ color: 'var(--theme-accent)', fontSize: 26 }} />
          <h2 className="font-serif-title" style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--theme-text-main)', margin: 0 }}>
            Seed Your Voice Profile
          </h2>
        </div>
        <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
          Paste 3–5 examples of your past captions, tweets, or scripts. Ghostwriter extracts your authentic phrasing, rhythm, and style notes to preserve your voice across all platforms.
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#FCA5A5',
            fontSize: '0.88rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Quick Presets */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--theme-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Presets:
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
            {PRESET_CREATORS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-editorial-secondary"
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                onClick={() => handlePresetSelect(preset)}
              >
                <DescriptionIcon style={{ fontSize: 15 }} /> {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--theme-text-main)' }}>
            Writing Samples (separate entries with --- lines):
          </label>
          <textarea
            className="editorial-input"
            rows={8}
            placeholder="Paste your past post #1 here...&#10;&#10;---&#10;&#10;Paste your past post #2 here..."
            value={samplesText}
            onChange={(e) => setSamplesText(e.target.value)}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-editorial-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-editorial-primary" onClick={() => handleSave()} disabled={loading}>
            {loading ? 'Analyzing Voice Profile...' : 'Save Voice Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
