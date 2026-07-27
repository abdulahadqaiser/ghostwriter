import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { updateKillList } from '../utils/api';

export default function VoiceProfileManager({ isOpen, onClose, profile, onProfileUpdate }) {
  const [newForbiddenWord, setNewForbiddenWord] = useState('');
  const [killList, setKillList] = useState(profile?.killList || []);
  const [duplicateNotice, setDuplicateNotice] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile?.killList) {
      setKillList(profile.killList);
    }
  }, [profile?.killList]);

  if (!isOpen) return null;

  const handleAddWord = async () => {
    setDuplicateNotice('');
    if (!newForbiddenWord.trim()) return;
    const word = newForbiddenWord.trim().toLowerCase();

    if (killList.includes(word)) {
      setDuplicateNotice(`"${word}" is already in your forbidden list.`);
      setNewForbiddenWord('');
      setTimeout(() => setDuplicateNotice(''), 3500);
      return;
    }

    const updated = [...killList, word];
    setKillList(updated);
    setNewForbiddenWord('');

    try {
      setUpdating(true);
      await updateKillList(updated);
      setUpdating(false);
      if (onProfileUpdate) await onProfileUpdate();
    } catch (err) {
      alert(`Error updating kill list: ${err.message}`);
      setUpdating(false);
    }
  };

  const handleRemoveWord = async (wordToRemove) => {
    setDuplicateNotice('');
    const updated = killList.filter(w => w !== wordToRemove);
    setKillList(updated);

    try {
      setUpdating(true);
      await updateKillList(updated);
      setUpdating(false);
      if (onProfileUpdate) await onProfileUpdate();
    } catch (err) {
      alert(`Error updating kill list: ${err.message}`);
      setUpdating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="editorial-card" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative'
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
            cursor: 'pointer'
          }}
        >
          <CloseIcon style={{ fontSize: 20 }} />
        </button>

        <h2 className="font-serif-title" style={{ fontSize: '1.45rem', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TuneIcon style={{ color: 'var(--theme-accent)', fontSize: 24 }} /> Creator Voice Profile
        </h2>
        <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Hybrid Memory Ownership: Stored in app database & passed into Mind prompts on every request to guarantee persistent style accuracy.
        </p>

        {/* Section 1: Extracted Voice Traits */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="font-serif-title" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--theme-text-main)', marginBottom: '10px' }}>
            Extracted Voice Traits
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {(profile?.extractedTraits?.tone || ['Direct', 'High-signal', 'Punchy']).map((t, idx) => (
              <span key={idx} style={{
                backgroundColor: 'var(--theme-accent-soft)',
                color: 'var(--theme-accent)',
                border: '1px solid var(--theme-border)',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {t}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--theme-text-muted)' }}>
            <strong>Sentence Rhythm:</strong> {profile?.extractedTraits?.sentenceLength || 'Varied, punchy'} | <strong>Formatting:</strong> {profile?.extractedTraits?.formattingStyle || 'Clean line breaks'}
          </p>
        </div>

        {/* Section 2: Negative Constraint (Kill List) */}
        <div style={{ marginBottom: '28px', backgroundColor: 'var(--theme-surface-hover)', border: '1px solid var(--theme-border)', padding: '20px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <BlockIcon style={{ color: 'var(--theme-accent)', fontSize: 18 }} />
            <h3 className="font-serif-title" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--theme-text-main)' }}>
              Negative Constraint List (Forbidden AI Buzzwords)
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--theme-text-muted)', marginBottom: '14px' }}>
            The Mind self-audits every output to ensure NONE of these generic LLM buzzwords appear in your content:
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {killList.map((word, idx) => (
              <span key={idx} style={{
                backgroundColor: 'var(--theme-surface)',
                color: 'var(--theme-text-main)',
                border: '1px solid var(--theme-border)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {word}
                <button 
                  onClick={() => handleRemoveWord(word)}
                  style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <CloseIcon style={{ fontSize: 13 }} />
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add custom forbidden word..."
              value={newForbiddenWord}
              onChange={(e) => setNewForbiddenWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
              style={{
                flex: 1,
                backgroundColor: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
                borderRadius: '4px',
                padding: '8px 12px',
                color: 'var(--theme-text-main)',
                fontSize: '0.85rem'
              }}
            />
            <button className="btn-editorial-secondary" onClick={handleAddWord} disabled={updating}>
              <AddIcon style={{ fontSize: 16 }} /> Add Word
            </button>
          </div>

          {duplicateNotice && (
            <div style={{
              marginTop: '10px',
              fontSize: '0.8rem',
              color: 'var(--theme-accent)',
              fontWeight: 500
            }}>
              {duplicateNotice}
            </div>
          )}
        </div>

        {/* Section 3: Learned Correction History */}
        <div style={{ marginBottom: '20px' }}>
          <h3 className="font-serif-title" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--theme-text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HistoryIcon style={{ fontSize: 18, color: 'var(--theme-accent)' }} /> Learned Correction History ({profile?.corrections?.length || 0})
          </h3>
          {(!profile?.corrections || profile.corrections.length === 0) ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>
              No corrections recorded yet. When you edit any output in the Studio, click "Save Edits & Train Voice" to teach the Mind your precise preferences.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {profile.corrections.map((c, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'var(--theme-surface-hover)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--theme-accent)' }}>{c.platform}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-dim)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--theme-text-main)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LightbulbIcon style={{ color: 'var(--theme-accent)', fontSize: 16 }} /> Rule: {c.learnedRule}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
