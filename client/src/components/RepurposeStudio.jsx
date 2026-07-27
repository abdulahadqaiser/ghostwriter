import React, { useState, useEffect } from 'react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DescriptionIcon from '@mui/icons-material/Description';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PlatformCard from './PlatformCard';
import MindStatusCard from './MindStatusCard';
import { repurposeContent, fetchRepurposeHistory, deleteHistoryItem } from '../utils/api';

const DEMO_TRANSCRIPTS = [
  {
    title: 'Demo 1: AI & Creator Voice Research',
    text: `Recent research on large language model authorship reveals a major flaw in current AI tools. When creators try to repurpose their video transcripts using generic AI tools like OpusClip or Klap, the output strips out their authentic phrasing and voice. Even when explicitly prompted to "write in my tone", LLMs cluster back toward their default generic style—using corporate buzzwords like "delve", "tapestry", and "synergy". Creators end up spending hours manually rewriting every post before publishing. The solution is building a persistent voice profile with strict negative constraints that explicitly forbid generic AI vocabulary.`
  },
  {
    title: 'Demo 2: Podcast Script on Creator Moats',
    text: `Welcome back to the podcast. Today I want to talk about why your personal voice is your only sustainable moat in 2026. Auto-posting tools claim they save time, but Instagram and YouTube actively penalize reach on automated cross-posted content. If you want high engagement, you need platform-native text written in your actual voice. You should be taking your long-form video or audio, extracting the core insights, and crafting punchy X threads, high-retention Instagram captions, and engaging YouTube community questions.`
  }
];

function formatTimeAgo(dateString) {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function RepurposeStudio({ profile, mindsStatus, onProfileUpdate }) {
  const [sourceText, setSourceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [repurposedOutputs, setRepurposedOutputs] = useState(null);
  const [error, setError] = useState(null);
  const [metaInfo, setMetaInfo] = useState(null);

  // ChatGPT-style Past Repurposes History state
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetchRepurposeHistory();
      if (res.success && Array.isArray(res.history)) {
        setHistory(res.history);
      }
    } catch (err) {
      console.warn('[RepurposeStudio] Failed to load history:', err.message);
    }
  };

  const handleRepurpose = async () => {
    if (!sourceText.trim()) {
      setError('Please paste or load a long-form content transcript to repurpose.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRepurposedOutputs(null); // clear stale cards immediately
      const res = await repurposeContent(sourceText);
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to generate repurposed content.');
      }

      setRepurposedOutputs(res.data);
      setMetaInfo(res.meta);

      if (res.historyItem) {
        setActiveHistoryId(res.historyItem._id);
        setHistory(prev => [res.historyItem, ...prev.filter(h => h._id !== res.historyItem._id)]);
      }
      setLoading(false);
    } catch (err) {
      setRepurposedOutputs(null); // ensure no stale cards remain
      setMetaInfo(null);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSelectHistory = (item) => {
    setActiveHistoryId(item._id);
    setSourceText(item.sourceContent || '');
    setRepurposedOutputs(item.repurposedOutputs || null);
    setMetaInfo(item.meta || null);
    setError(null);
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setSourceText('');
    setRepurposedOutputs(null);
    setMetaInfo(null);
    setError(null);
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item._id !== id));
      if (activeHistoryId === id) {
        handleNewSession();
      }
    } catch (err) {
      console.error('[RepurposeStudio] Failed to delete history item:', err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '28px 24px' }}>
      
      {/* Mind Connection Status Indicator */}
      <MindStatusCard mindsStatus={mindsStatus} />

      {/* Main Studio Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Input, History & Voice Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* New Session Button */}
          <button
            type="button"
            className="btn-editorial-secondary"
            onClick={handleNewSession}
            style={{
              width: '100%',
              justify: 'center',
              padding: '10px 14px',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-main)'
            }}
          >
            <AddIcon style={{ fontSize: 18, color: 'var(--theme-accent)' }} /> + New Repurpose Session
          </button>

          {/* Past Repurposes (History Panel) */}
          <div className="editorial-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--theme-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <HistoryIcon style={{ fontSize: 16, color: 'var(--theme-accent)' }} /> Past Repurposes ({history.length})
              </h3>
              {activeHistoryId && (
                <span style={{ fontSize: '0.72rem', color: 'var(--theme-accent)', fontWeight: 600 }}>
                  Viewing Saved
                </span>
              )}
            </div>

            {history.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', fontStyle: 'italic', margin: 0 }}>
                No past sessions yet. Generated outputs will automatically be saved here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', paddingRight: '2px' }}>
                {history.map((item) => {
                  const isSelected = activeHistoryId === item._id;
                  return (
                    <div
                      key={item._id}
                      onClick={() => handleSelectHistory(item)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? 'var(--theme-accent-soft)' : 'var(--theme-surface)',
                        border: isSelected ? '1px solid var(--theme-accent)' : '1px solid var(--theme-border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? 'var(--theme-accent)' : 'var(--theme-text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.title || 'Untitled Repurpose'}
                        </div>
                        <div style={{ fontSize: '0.71rem', color: 'var(--theme-text-dim)', marginTop: '2px' }}>
                          {formatTimeAgo(item.createdAt)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistory(e, item._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--theme-text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.7
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                        title="Delete session"
                      >
                        <DeleteOutlineIcon style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Source Content Input Card */}
          <div className="editorial-card" style={{ padding: '24px' }}>
            <h2 className="font-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>
              Source Content Input
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--theme-text-muted)', marginBottom: '16px' }}>
              Paste video transcript, podcast script, or blog post.
            </p>

            {/* Quick Demo Sample Buttons */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--theme-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Load Sample Transcripts:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                {DEMO_TRANSCRIPTS.map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn-editorial-secondary"
                    style={{ fontSize: '0.78rem', justifyContent: 'flex-start', padding: '6px 10px' }}
                    onClick={() => {
                      setActiveHistoryId(null);
                      setSourceText(demo.text);
                    }}
                  >
                    <DescriptionIcon style={{ fontSize: 15 }} /> {demo.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div style={{ marginBottom: '16px' }}>
              <textarea
                className="editorial-input"
                rows={10}
                placeholder="Paste long-form text here..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--theme-text-dim)', marginTop: '6px' }}>
                <span>{sourceText.length} characters</span>
                <span>MVP Platform Count: 3 Locked</span>
              </div>
            </div>

            {/* Repurpose Button */}
            <button
              className="btn-editorial-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
              onClick={handleRepurpose}
              disabled={loading}
            >
              {loading ? (
                <>
                  <AutorenewIcon className="spin-icon" style={{ fontSize: 18 }} />
                  Mind Engine Repurposing...
                </>
              ) : (
                <>
                  <AutoFixHighIcon style={{ fontSize: 18 }} />
                  Repurpose in My Voice
                </>
              )}
            </button>
          </div>

          {/* Active Voice Summary Panel */}
          <div className="editorial-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--theme-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Active Voice Context (Prompt Safety Net)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--theme-text-dim)' }}>Target Tone: </span>
                <span style={{ color: 'var(--theme-text-main)', fontWeight: 600 }}>
                  {profile?.extractedTraits?.tone?.join(', ') || 'Direct, Authentic'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--theme-text-dim)' }}>Negative Constraint: </span>
                <span style={{ color: 'var(--theme-accent)', fontWeight: 600 }}>
                  {profile?.killList?.length || 18} forbidden buzzwords active
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--theme-text-dim)' }}>Learned Corrections: </span>
                <span style={{ color: 'var(--theme-accent)', fontWeight: 600 }}>
                  {profile?.corrections?.length || 0} user rules applied
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Platform Output Cards */}
        <div style={{ minWidth: 0 }}>
          {error ? (
            /* --- ERROR STATE: prominent, no cards --- */
            <div className="editorial-card" style={{
              padding: '60px 40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '520px',
              border: '1px solid rgba(220, 38, 38, 0.35)',
              backgroundColor: 'rgba(220, 38, 38, 0.04)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                marginBottom: '20px'
              }}>
                <ErrorOutlineIcon style={{ fontSize: 28 }} />
              </div>
              <h3 className="font-serif-title" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#DC2626', marginBottom: '12px' }}>
                Generation Failed
              </h3>
              <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem', maxWidth: '420px', lineHeight: '1.7', marginBottom: '20px' }}>
                {error}
              </p>
              <button
                className="btn-editorial-secondary"
                onClick={() => setError(null)}
                style={{ fontSize: '0.82rem' }}
              >
                Dismiss &amp; Try Again
              </button>
            </div>
          ) : !repurposedOutputs ? (
            /* --- EMPTY STATE --- */
            <div className="editorial-card" style={{
              padding: '60px 40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '520px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                backgroundColor: 'var(--theme-accent-soft)',
                border: '1px solid var(--theme-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--theme-accent)',
                marginBottom: '16px'
              }}>
                <AutoFixHighIcon style={{ fontSize: 26 }} />
              </div>
              <h3 className="font-serif-title" style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '8px' }}>
                Ready to Repurpose Content
              </h3>
              <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem', maxWidth: '420px', lineHeight: '1.6' }}>
                Paste your transcript on the left and click <strong>"Repurpose in My Voice"</strong>. Ghostwriter will generate platform-native posts for X, Instagram, and YouTube matching your voice profile.
              </p>
            </div>
          ) : (
            <div>
              {metaInfo && (
                <div style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--theme-accent-soft)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-accent)',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                    <CheckCircleIcon style={{ fontSize: 16 }} /> Generated via Minds Engine ({metaInfo.mode || 'Active'})
                  </span>
                  <span style={{ fontWeight: 600 }}>Strict JSON Safety Net Passed</span>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                gap: '20px'
              }}>
                {/* 1. X (Thread) */}
                <PlatformCard
                  platformKey="x_thread"
                  title="X Thread"
                  pillClass="pill-x"
                  icon={<TwitterIcon style={{ fontSize: 14 }} />}
                  content={repurposedOutputs.x_thread}
                  onSaveSuccess={onProfileUpdate}
                />

                {/* 2. Instagram Caption */}
                <PlatformCard
                  platformKey="instagram_caption"
                  title="Instagram Caption"
                  pillClass="pill-ig"
                  icon={<InstagramIcon style={{ fontSize: 14 }} />}
                  content={repurposedOutputs.instagram_caption}
                  onSaveSuccess={onProfileUpdate}
                />

                {/* 3. YouTube Community Post */}
                <PlatformCard
                  platformKey="youtube_post"
                  title="YouTube Community"
                  pillClass="pill-yt"
                  icon={<YouTubeIcon style={{ fontSize: 14 }} />}
                  content={repurposedOutputs.youtube_post}
                  onSaveSuccess={onProfileUpdate}
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
