import React, { useState, useEffect } from 'react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DescriptionIcon from '@mui/icons-material/Description';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import LinkIcon from '@mui/icons-material/Link';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import PlatformCard from './PlatformCard';
import MindStatusCard from './MindStatusCard';
import { repurposeContent, ingestYouTubeTranscript, ingestArticle, acceptCorrectionRule } from '../utils/api';

// ─── RLHF PATTERN MODAL (STUDIO-LEVEL OVERLAY POPUP) ────────────────────────
function RLHFPatternModal({ suggestedRule, onClose, onRuleAccepted }) {
  const [accepting, setAccepting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!suggestedRule) return null;

  const handleAccept = async () => {
    try {
      setAccepting(true);
      await acceptCorrectionRule(suggestedRule);
      setAccepting(false);
      setSavedSuccess(true);
      if (onRuleAccepted) onRuleAccepted(suggestedRule);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      alert(`Error saving rule: ${err.message}`);
      setAccepting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 1200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-accent)',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        animation: 'fadeInUp 0.3s ease',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--theme-text-muted)', padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
          }}
        >
          <CloseIcon style={{ fontSize: 18 }} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            backgroundColor: 'var(--theme-accent-soft)',
            border: '1px solid var(--theme-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PsychologyIcon style={{ fontSize: 20, color: 'var(--theme-accent)' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--theme-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Learning Loop
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-main)' }}>
              Ghostwriter Detected a Pattern
            </div>
          </div>
        </div>

        {/* Body */}
        {savedSuccess ? (
          <div style={{
            padding: '14px 16px', borderRadius: '8px',
            backgroundColor: 'rgba(94, 120, 110, 0.15)',
            border: '1px solid var(--theme-accent)',
            fontSize: '0.88rem', color: 'var(--theme-accent)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0',
          }}>
            <CheckIcon style={{ fontSize: 18 }} />
            Rule saved to your voice profile!
          </div>
        ) : (
          <>
            <p style={{
              fontSize: '0.86rem', lineHeight: '1.5',
              color: 'var(--theme-text-main)', margin: '0 0 14px 0',
            }}>
              Ghostwriter noticed your edit. Should we remember this rule for future content repurposing?
            </p>

            {/* Rule Quote Card */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--theme-surface-hover)',
              border: '1px solid var(--theme-border)',
              fontSize: '0.86rem',
              color: 'var(--theme-text-main)',
              lineHeight: '1.5',
              margin: '0 0 20px 0',
            }}>
              <strong style={{ color: 'var(--theme-accent)' }}>Suggested Rule:</strong>{' '}
              <em>"{suggestedRule}"</em>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-editorial-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', fontSize: '0.85rem', gap: '6px' }}
                onClick={handleAccept}
                disabled={accepting}
              >
                <CheckIcon style={{ fontSize: 16 }} />
                {accepting ? 'Saving Rule...' : 'Accept & Save Rule'}
              </button>
              <button
                className="btn-editorial-secondary"
                style={{ padding: '10px 16px', fontSize: '0.85rem', gap: '6px' }}
                onClick={onClose}
                disabled={accepting}
              >
                <CloseIcon style={{ fontSize: 16 }} />
                Reject
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



const PLATFORM_TABS = [
  { key: 'x_thread',          label: 'X Thread',    shortLabel: 'X',   icon: <TwitterIcon style={{ fontSize: 15 }} /> },
  { key: 'instagram_caption', label: 'Instagram',   shortLabel: 'IG',  icon: <InstagramIcon style={{ fontSize: 15 }} /> },
  { key: 'youtube_post',      label: 'YouTube',     shortLabel: 'YT',  icon: <YouTubeIcon style={{ fontSize: 15 }} /> },
];

// ─── PLATFORM TAB BAR ─────────────────────────────────────────────────────────
function PlatformTabBar({ active, onChange, outputs }) {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      padding: '0 0 20px 0',
    }}>
      {PLATFORM_TABS.map(tab => {
        const isActive = active === tab.key;
        const hasContent = outputs && outputs[tab.key];
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'inherit',
              transition: 'all 0.18s ease',
              position: 'relative',
              backgroundColor: isActive
                ? 'var(--theme-accent)'
                : 'var(--theme-surface-hover)',
              color: isActive
                ? '#fff'
                : 'var(--theme-text-muted)',
              boxShadow: isActive
                ? '0 2px 12px rgba(var(--theme-accent-rgb, 52,72,67), 0.35)'
                : 'none',
            }}
          >
            <span style={{ opacity: isActive ? 1 : 0.7, lineHeight: 0 }}>{tab.icon}</span>
            {tab.label}
            {/* Green dot if content exists */}
            {hasContent && !isActive && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: '#10B981',
                flexShrink: 0,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── VOICE CONTEXT COMPACT CARD ───────────────────────────────────────────────
function VoiceContextCard({ profile }) {
  return (
    <div style={{
      backgroundColor: 'var(--theme-surface-hover)',
      border: '1px solid var(--theme-border)',
      borderRadius: '8px',
      padding: '12px 14px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        marginBottom: '10px',
      }}>
        <PsychologyIcon style={{ fontSize: 14, color: 'var(--theme-accent)' }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--theme-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Active Voice Context
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <VoiceContextRow
          label="Tone"
          value={profile?.extractedTraits?.tone?.join(', ') || 'Direct, Authentic'}
          color="var(--theme-text-main)"
        />
        <VoiceContextRow
          label="Forbidden"
          value={`${profile?.killList?.length || 20} buzzwords`}
          color="var(--theme-accent)"
        />
        <VoiceContextRow
          label="User Rules"
          value={`${profile?.corrections?.length || 0} learned`}
          color={profile?.corrections?.length > 0 ? '#10B981' : 'var(--theme-text-muted)'}
        />
      </div>
    </div>
  );
}

function VoiceContextRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
      <span style={{ color: 'var(--theme-text-dim)' }}>{label}</span>
      <span style={{ color, fontWeight: 600, textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

// ─── EMPTY / LOADING STATE ────────────────────────────────────────────────────
function OutputEmptyState({ loading, activePlatform }) {
  const tab = PLATFORM_TABS.find(t => t.key === activePlatform);
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 40px',
      gap: '16px',
    }}>
      {loading ? (
        <>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            backgroundColor: 'var(--theme-accent-soft)',
            border: '1px solid var(--theme-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--theme-accent)',
          }}>
            <AutorenewIcon className="spin-icon" style={{ fontSize: 28 }} />
          </div>
          <h3 className="font-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            Repurposing in Your Voice…
          </h3>
          <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.88rem', maxWidth: 360, lineHeight: '1.6', margin: 0 }}>
            The Minds Engine is reading your content and writing platform-native posts that match your voice profile.
          </p>
        </>
      ) : (
        <>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            backgroundColor: 'var(--theme-accent-soft)',
            border: '1px solid var(--theme-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--theme-accent)',
          }}>
            <AutoFixHighIcon style={{ fontSize: 28 }} />
          </div>
          <h3 className="font-serif-title" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            {tab ? `${tab.label} Preview` : 'Output Workspace'}
          </h3>
          <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.88rem', maxWidth: 380, lineHeight: '1.65', margin: 0 }}>
            Paste or extract content on the left, then click <strong style={{ color: 'var(--theme-text-main)' }}>Repurpose in My Voice</strong> to generate platform-native posts.
          </p>
        </>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RepurposeStudio({
  profile,
  mindsStatus,
  onProfileUpdate,
  selectedHistoryItem,
  onHistoryAdded,
  onNewSession,
  activeHistoryId,
  activeUserId = 'default-creator',
  activeEngine = 'minds'
}) {
  const [sourceText, setSourceText]           = useState('');
  const [loading, setLoading]                 = useState(false);
  const [repurposedOutputs, setRepurposedOutputs] = useState(null);
  const [error, setError]                     = useState(null);
  const [metaInfo, setMetaInfo]               = useState(null);

  // RLHF Pattern Detection Popup State
  const [suggestedRulePopup, setSuggestedRulePopup] = useState('');

  // Tabbed workspace state
  const [activePlatform, setActivePlatform]   = useState('x_thread');

  // URL ingestion state
  const [ingestUrl, setIngestUrl]             = useState('');
  const [extracting, setExtracting]           = useState(false);
  const [ingestNotice, setIngestNotice]       = useState(null);

  const isYouTubeUrl = (url) => /youtu\.be|youtube\.com/i.test(url);

  const handleExtractUrl = async (targetUrlOverride) => {
    const rawUrl = typeof targetUrlOverride === 'string' ? targetUrlOverride : ingestUrl;
    const trimmedUrl = rawUrl.trim();
    if (!trimmedUrl) {
      setIngestNotice({ type: 'error', text: 'Please paste a YouTube URL or article link.' });
      return;
    }
    setIngestUrl(trimmedUrl);
    try {
      setExtracting(true);
      setIngestNotice(null);
      if (isYouTubeUrl(trimmedUrl)) {
        const res = await ingestYouTubeTranscript(trimmedUrl);
        if (res.success && res.transcript) {
          if (onNewSession) onNewSession();
          setSourceText(res.transcript);
          setIngestNotice({ type: 'success', text: `YouTube transcript extracted (${res.itemCount || 0} segments).` });
          setIngestUrl('');
        }
      } else {
        const res = await ingestArticle(trimmedUrl);
        if (res.success && res.text) {
          if (onNewSession) onNewSession();
          setSourceText(res.text);
          const wordCount = res.wordCount ? ` (~${res.wordCount.toLocaleString()} words)` : '';
          const titlePart = res.title ? `"${res.title}"` : 'Article';
          setIngestNotice({ type: 'success', text: `${titlePart} extracted${wordCount}.` });
          setIngestUrl('');
        }
      }
      setExtracting(false);
    } catch (err) {
      setIngestNotice({ type: 'error', text: err.message || 'Could not extract. Paste text manually.' });
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
      setError('Please paste or load a transcript to repurpose.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setRepurposedOutputs(null);
      const res = await repurposeContent(sourceText, activeUserId, activeEngine);
      if (!res.success) throw new Error(res.error || 'Failed to generate content.');
      setRepurposedOutputs(res.data);
      setMetaInfo(res.meta);
      if (res.historyItem && onHistoryAdded) onHistoryAdded(res.historyItem);
      setLoading(false);
      // Auto-select first tab after generation
      setActivePlatform('x_thread');
    } catch (err) {
      setRepurposedOutputs(null);
      setMetaInfo(null);
      setError(err.message);
      setLoading(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const activeTab = PLATFORM_TABS.find(t => t.key === activePlatform);

  return (
    // Full-height two-pane flex container
    <div style={{
      display: 'flex',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: 'var(--theme-bg)',
    }}>

      {/* ═══════════════════════════════════════════════════════
          PANE 2 — INPUT PANEL (fixed 420px)
      ═══════════════════════════════════════════════════════ */}
      <div style={{
        width: '420px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--theme-border)',
        backgroundColor: 'var(--theme-surface)',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Scrollable body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 20px 0 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>

          {/* Mind Status */}
          <MindStatusCard mindsStatus={mindsStatus} compact />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="font-serif-title" style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
              Source Content
            </h2>
            {activeHistoryId && (
              <span style={{
                fontSize: '0.7rem', color: 'var(--theme-accent)', fontWeight: 600,
                backgroundColor: 'var(--theme-accent-soft)', padding: '2px 8px',
                borderRadius: '4px', border: '1px solid var(--theme-border)'
              }}>
                Viewing History
              </span>
            )}
          </div>

          {/* ── URL Extractor ── */}
          <div style={{
            backgroundColor: 'var(--theme-surface-hover)',
            border: '1px solid var(--theme-border)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <label style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--theme-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', gap: '5px',
              margin: 0,
            }}>
              <LinkIcon style={{ fontSize: 13 }} /> Auto-Extract from URL
            </label>

            <div style={{ display: 'flex', gap: '7px' }}>
              <input
                type="text"
                placeholder="YouTube URL or article link..."
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExtractUrl()}
                style={{
                  flex: 1, minWidth: 0,
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: 'var(--theme-text-main)',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                className="btn-editorial-primary"
                onClick={() => handleExtractUrl()}
                disabled={extracting}
                style={{ padding: '7px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {extracting
                  ? <AutorenewIcon className="spin-icon" style={{ fontSize: 14 }} />
                  : 'Extract'
                }
              </button>
            </div>

            {/* One-Click Sample Pills */}
            <div>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: 'var(--theme-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '5px'
              }}>
                Try a sample:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-editorial-secondary"
                  onClick={() => handleExtractUrl('https://www.youtube.com/watch?v=86Gy035z_KA')}
                  disabled={extracting}
                  style={{
                    fontSize: '0.74rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    gap: '6px',
                  }}
                >
                  <YouTubeIcon style={{ fontSize: 14, color: 'var(--theme-accent)' }} />
                  Vision Pro Review
                </button>
                <button
                  type="button"
                  className="btn-editorial-secondary"
                  onClick={() => handleExtractUrl('https://blog.samaltman.com/what-i-wish-someone-had-told-me')}
                  disabled={extracting}
                  style={{
                    fontSize: '0.74rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    gap: '6px',
                  }}
                >
                  <ArticleIcon style={{ fontSize: 14, color: 'var(--theme-accent)' }} />
                  Sam Altman Blog
                </button>
              </div>
            </div>

            {ingestNotice && (
              <div style={{
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: ingestNotice.type === 'error' ? 'var(--theme-accent-soft)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${ingestNotice.type === 'error' ? 'var(--theme-accent)' : 'rgba(16, 185, 129, 0.3)'}`,
                fontSize: '0.76rem',
                fontWeight: 500,
                color: ingestNotice.type === 'error' ? 'var(--theme-accent)' : '#10B981',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {ingestNotice.type === 'error' ? <ErrorOutlineIcon style={{ fontSize: 14 }} /> : <CheckCircleIcon style={{ fontSize: 14 }} />}
                <span>{ingestNotice.text}</span>
              </div>
            )}
          </div>

          {/* ── Textarea ── */}
          <div style={{ flex: 1 }}>
            <textarea
              className="editorial-input"
              rows={13}
              placeholder="Paste transcript, podcast script, or article text here…"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              style={{ resize: 'vertical', minHeight: '180px' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.72rem', color: 'var(--theme-text-dim)', marginTop: '5px'
            }}>
              <span>{sourceText.length} chars</span>
              <span>{wordCount.toLocaleString()} words</span>
            </div>
          </div>

          {/* ── Compact Voice Context ── */}
          <VoiceContextCard profile={profile} />

          {/* bottom spacer so button shadow doesn't overlap content */}
          <div style={{ height: '80px', flexShrink: 0 }} />
        </div>

        {/* ── Sticky Generate Button ── */}
        <div style={{
          padding: '12px 20px 16px 20px',
          borderTop: '1px solid var(--theme-border)',
          backgroundColor: 'var(--theme-surface)',
          flexShrink: 0,
        }}>
          {error && (
            <div style={{
              marginBottom: '10px',
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(220,38,38,0.06)',
              border: '1px solid rgba(220,38,38,0.3)',
              fontSize: '0.78rem',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <ErrorOutlineIcon style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
              <span style={{ lineHeight: '1.5' }}>{error}</span>
            </div>
          )}
          <button
            className="btn-editorial-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '13px',
              fontSize: '0.92rem',
              fontWeight: 600,
              borderRadius: '8px',
              gap: '8px',
              boxShadow: '0 2px 12px rgba(var(--theme-accent-rgb, 52,72,67), 0.3)',
            }}
            onClick={handleRepurpose}
            disabled={loading}
          >
            {loading ? (
              <>
                <AutorenewIcon className="spin-icon" style={{ fontSize: 18 }} />
                Repurposing…
              </>
            ) : (
              <>
                <AutoFixHighIcon style={{ fontSize: 18 }} />
                Repurpose in My Voice
              </>
            )}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PANE 3 — OUTPUT WORKSPACE (flex-1)
      ═══════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--theme-bg)',
        height: '100%',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        {/* Workspace Top Bar */}
        <div style={{
          padding: '16px 28px 0 28px',
          borderBottom: '1px solid var(--theme-border)',
          backgroundColor: 'var(--theme-surface)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ paddingBottom: 0 }}>
            {/* Tab bar — only show when output exists or loading */}
            <PlatformTabBar
              active={activePlatform}
              onChange={setActivePlatform}
              outputs={repurposedOutputs}
            />
          </div>

          {/* Meta pill */}
          {metaInfo && repurposedOutputs && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
              {metaInfo.compression?.wasCompressed && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '0.76rem', color: 'var(--theme-accent)', fontWeight: 600,
                  backgroundColor: 'rgba(94, 120, 110, 0.12)',
                  border: '1px solid var(--theme-accent)',
                  padding: '4px 10px', borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}>
                  <PsychologyIcon style={{ fontSize: 14 }} />
                  Compressed ({metaInfo.compression.originalChars.toLocaleString()} → {metaInfo.compression.sentToMindsChars.toLocaleString()} chars sent to Minds)
                </div>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.76rem', color: 'var(--theme-accent)', fontWeight: 500,
                backgroundColor: 'var(--theme-accent-soft)',
                border: '1px solid var(--theme-border)',
                padding: '4px 10px', borderRadius: '20px',
                whiteSpace: 'nowrap',
              }}>
                <CheckCircleIcon style={{ fontSize: 13 }} />
                Minds Engine · JSON Validated
              </div>
            </div>
          )}
        </div>

        {/* Scrollable preview area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px',
        }}>
          {loading || !repurposedOutputs ? (
            <OutputEmptyState loading={loading} activePlatform={activePlatform} />
          ) : (
            <div style={{
              maxWidth: '680px',
              margin: '0 auto',
            }}>
              <PlatformCard
                platformKey={activePlatform}
                title={activeTab?.label}
                icon={activeTab?.icon}
                content={repurposedOutputs[activePlatform]}
                onSaveSuccess={onProfileUpdate}
                onRuleSuggested={(rule) => setSuggestedRulePopup(rule)}
              />
            </div>
          )}
        </div>
      </div>

      {/* RLHF Pattern Overlay Popup — renders globally regardless of active tab */}
      <RLHFPatternModal
        suggestedRule={suggestedRulePopup}
        onClose={() => setSuggestedRulePopup('')}
        onRuleAccepted={() => {
          if (onProfileUpdate) onProfileUpdate();
        }}
      />
    </div>
  );
}
