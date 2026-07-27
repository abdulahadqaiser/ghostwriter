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
import { repurposeContent, fetchRepurposeHistory, deleteHistoryItem, ingestYouTubeTranscript, ingestArticle } from '../utils/api';

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

export default function RepurposeStudio({
  profile,
  mindsStatus,
  onProfileUpdate,
  selectedHistoryItem,
  onHistoryAdded,
  onNewSession,
  activeHistoryId
}) {
  const [sourceText, setSourceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [repurposedOutputs, setRepurposedOutputs] = useState(null);
  const [error, setError] = useState(null);
  const [metaInfo, setMetaInfo] = useState(null);

  // Zero-Friction Content Ingestion state (YouTube + Article)
  const [ingestUrl, setIngestUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [ingestNotice, setIngestNotice] = useState(null);

  const isYouTubeUrl = (url) => /youtu\.be|youtube\.com/i.test(url);

  const handleExtractUrl = async () => {
    const trimmedUrl = ingestUrl.trim();
    if (!trimmedUrl) {
      setIngestNotice({ type: 'error', text: 'Please paste a YouTube URL or article link.' });
      return;
    }
    try {
      setExtracting(true);
      setIngestNotice(null);

      if (isYouTubeUrl(trimmedUrl)) {
        const res = await ingestYouTubeTranscript(trimmedUrl);
        if (res.success && res.transcript) {
          if (onNewSession) onNewSession();
          setSourceText(res.transcript);
          setIngestNotice({ type: 'success', text: `YouTube transcript extracted (${res.itemCount || 0} caption segments).` });
          setIngestUrl('');
        }
      } else {
        const res = await ingestArticle(trimmedUrl);
        if (res.success && res.text) {
          if (onNewSession) onNewSession();
          setSourceText(res.text);
          const wordCount = res.wordCount ? ` (~${res.wordCount.toLocaleString()} words)` : '';
          const titlePart = res.title ? `"${res.title}"` : 'Article';
          setIngestNotice({ type: 'success', text: `${titlePart} extracted successfully${wordCount}.` });
          setIngestUrl('');
        }
      }
      setExtracting(false);
    } catch (err) {
      setIngestNotice({ type: 'error', text: err.message || 'Could not extract content. Please paste text manually.' });
      setExtracting(false);
    }
  };

  useEffect(() => {
    if (selectedHistoryItem) {
      setSourceText(selectedHistoryItem.sourceContent || '');
      setRepurposedOutputs(selectedHistoryItem.repurposedOutputs || null);
      setMetaInfo(selectedHistoryItem.meta || null);
      setError(null);
    } else if (activeHistoryId === null) {
      setSourceText('');
      setRepurposedOutputs(null);
      setMetaInfo(null);
      setError(null);
    }
  }, [selectedHistoryItem, activeHistoryId]);

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

      if (res.historyItem && onHistoryAdded) {
        onHistoryAdded(res.historyItem);
      }
      setLoading(false);
    } catch (err) {
      setRepurposedOutputs(null); // ensure no stale cards remain
      setMetaInfo(null);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px' }}>
      
      {/* Mind Connection Status Indicator */}
      <MindStatusCard mindsStatus={mindsStatus} />

      {/* Main Studio Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Source Input & Voice Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Source Content Input Card */}
          <div className="editorial-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h2 className="font-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                Source Content Input
              </h2>
              {activeHistoryId && (
                <span style={{ fontSize: '0.72rem', color: 'var(--theme-accent)', fontWeight: 600, backgroundColor: 'var(--theme-accent-soft)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--theme-border)' }}>
                  Viewing History
                </span>
              )}
            </div>
            {/* Zero-Friction Content Ingestion: YouTube + Article */}
            <div style={{ marginBottom: '18px', backgroundColor: 'var(--theme-surface-hover)', border: '1px solid var(--theme-border)', padding: '14px', borderRadius: '6px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--theme-text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                Auto-Extract Content from URL
              </label>
              <p style={{ fontSize: '0.74rem', color: 'var(--theme-text-dim)', marginBottom: '10px', marginTop: 0 }}>
                Paste a <span style={{ color: '#FF0000', fontWeight: 600 }}>YouTube</span> link or any <span style={{ color: 'var(--theme-accent)', fontWeight: 600 }}>article / blog</span> URL to extract text automatically.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="youtube.com/watch?v=... or medium.com/article..."
                  value={ingestUrl}
                  onChange={(e) => setIngestUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtractUrl()}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--theme-surface)',
                    border: '1px solid var(--theme-border)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    color: 'var(--theme-text-main)',
                    fontSize: '0.8rem'
                  }}
                />
                <button
                  type="button"
                  className="btn-editorial-primary"
                  onClick={handleExtractUrl}
                  disabled={extracting}
                  style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {extracting ? (
                    <>
                      <AutorenewIcon className="spin-icon" style={{ fontSize: 15 }} />
                      Extracting...
                    </>
                  ) : (
                    'Extract'
                  )}
                </button>
              </div>

              {ingestNotice && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '0.78rem',
                  color: ingestNotice.type === 'error' ? 'var(--theme-accent)' : '#10B981',
                  fontWeight: 500
                }}>
                  {ingestNotice.text}
                </div>
              )}
            </div>

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
                      if (onNewSession) onNewSession();
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
                rows={11}
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
                  {profile?.killList?.length || 20} forbidden buzzwords active
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
