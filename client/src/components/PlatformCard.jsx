import React, { useState, useEffect } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloseIcon from '@mui/icons-material/Close';
import { saveCorrection, suggestCorrectionRule, acceptCorrectionRule } from '../utils/api';

// ─── EXACT SVG ICONS ──────────────────────────────────────────────────────────

// X (Twitter) Icons — exact paths from twitter.com source
const XReplyIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 7.501 3.58 7.501 8 0 4.42-3.011 8-7.501 8h-4.366c-4.421 0-8.005-3.58-8.005-8zm8.005-6c-3.317 0-6.005 2.686-6.005 6 0 3.314 2.688 6 6.005 6h4.366c3.389 0 5.501-2.686 5.501-6 0-3.314-2.112-6-5.501-6H9.756z" />
  </svg>
);
const XRetweetIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
  </svg>
);
const XHeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    {filled
      ? <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
      : <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
    }
  </svg>
);
const XShareIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
  </svg>
);
const XBookmarkIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
  </svg>
);
const XMoreIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
  </svg>
);

// Instagram Icons — exact paths
const IGHeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill={filled ? '#ed4956' : 'none'} stroke={filled ? '#ed4956' : 'currentColor'} strokeWidth="1.5">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
const IGCommentIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.656 17.008a9.993 9.993 0 10-3.59 3.615L22 22z" />
  </svg>
);
const IGShareIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IGBookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" />
  </svg>
);
const IGMoreIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
  </svg>
);

// YouTube Icons — exact outline paths
const YTThumbUpIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11H3v10h4h1h9.43c1.06 0 1.98-.67 2.19-1.61l1.34-6C21.23 12.15 20.18 11 18.77 11zM7 20H4v-8h3v8zm11.98-1.86L17.61 19H8v-6.96l5.5-5.85c.06-.08.19-.09.26 0l.01.01c.03.04.04.09.02.14L12.18 11h6.59c.36 0 .61.32.52.67l-1.31 6.47z" />
  </svg>
);
const YTThumbDownIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M17 4h-1H6.57C5.5 4 4.59 4.67 4.38 5.61l-1.34 6C2.77 12.85 3.82 14 5.23 14h4.23l-1.52 4.94C7.62 19.97 8.46 21 9.62 21c.58 0 1.14-.24 1.52-.65L17 14h4V4h-4zm-3 13.07l-1.88-6.11.02-.96H18v6.96l-4 .11zM20 13h-2V5h2v8z" />
  </svg>
);
const YTCommentIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M10 14.4l1.6 1.6 3.4-4 4 5H5l3-4 2 1.4zm7-6.4c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5zm-2 0c0-1.7-1.3-3-3-3s-3 1.3-3 3 1.3 3 3 3 3-1.3 3-3z" />
  </svg>
);
const YTShareIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M15 5.63 20.66 12 15 18.37V15h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.65 10.75-7.18V5.63M14 3v5C6.22 8.9 2.44 14.6 1 21c3.64-4.55 7.86-6.42 13-6.43V19l8-8-8-8z" />
  </svg>
);

// ─── RLHF SUGGESTION TOAST ───────────────────────────────────────────────────
function RLHFSuggestionToast({ suggestedRule, onAccept, onReject, accepting }) {
  if (!suggestedRule) return null;

  return (
    <div style={{
      marginTop: '12px',
      padding: '16px',
      borderRadius: '10px',
      backgroundColor: 'rgba(94, 120, 110, 0.08)',
      border: '1px solid var(--theme-accent)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      animation: 'fadeInUp 0.3s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '10px',
      }}>
        <PsychologyIcon style={{ fontSize: 18, color: 'var(--theme-accent)' }} />
        <span style={{
          fontSize: '0.82rem', fontWeight: 700,
          color: 'var(--theme-accent)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          Learning Loop — Ghostwriter Detected a Pattern
        </span>
      </div>

      <p style={{
        fontSize: '0.88rem', lineHeight: '1.6',
        color: 'var(--theme-text-main)', fontWeight: 500,
        margin: '0 0 6px 0',
      }}>
        Ghostwriter noticed your edit. Should we remember this for next time?
      </p>

      <div style={{
        padding: '10px 14px',
        borderRadius: '6px',
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        fontSize: '0.85rem',
        color: 'var(--theme-text-main)',
        fontStyle: 'italic',
        lineHeight: '1.5',
        margin: '0 0 12px 0',
      }}>
        <strong style={{ fontStyle: 'normal', color: 'var(--theme-accent)' }}>Suggested Rule:</strong>{' '}
        "{suggestedRule}"
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn-editorial-primary"
          style={{ flex: 1, justifyContent: 'center', padding: '8px 14px', fontSize: '0.82rem', gap: '6px' }}
          onClick={onAccept}
          disabled={accepting}
        >
          <CheckIcon style={{ fontSize: 15 }} />
          {accepting ? 'Saving Rule...' : 'Accept & Save Rule'}
        </button>
        <button
          className="btn-editorial-secondary"
          style={{ padding: '8px 14px', fontSize: '0.82rem', gap: '6px' }}
          onClick={onReject}
          disabled={accepting}
        >
          <CloseIcon style={{ fontSize: 15 }} />
          Reject
        </button>
      </div>
    </div>
  );
}

// ─── X (TWITTER) THREAD MOCKUP ────────────────────────────────────────────────
function XThreadMockup({ tweets }) {
  const [likedTweets, setLikedTweets] = useState({});

  const toggleLike = (idx) => {
    setLikedTweets(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const BG = '#000000';
  const TEXT = '#e7e9ea';
  const BORDER = '#2f3336';
  const DIM = '#71767b';

  return (
    <div style={{
      backgroundColor: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: '16px',
      overflow: 'hidden',
      fontFamily: FONT,
    }}>
      {tweets.map((tweet, idx) => {
        const isLast = idx === tweets.length - 1;
        const liked = !!likedTweets[idx];

        return (
          <div key={idx} style={{
            padding: '12px 16px 0 16px',
            borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Avatar + thread line column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1d9bf0 0%, #0a4fa8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 700, color: '#fff',
                  flexShrink: 0,
                }}>
                  YC
                </div>
                {/* Thread connector line */}
                {!isLast && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 20,
                    backgroundColor: '#333639',
                    margin: '4px 0',
                  }} />
                )}
              </div>

              {/* Right: Content */}
              <div style={{ flex: 1, minWidth: 0, paddingBottom: '12px' }}>
                {/* Name row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap', lineHeight: '20px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: TEXT }}>Your Name</span>
                    <span style={{ fontSize: '15px', color: DIM }}>@yourhandle</span>
                    <span style={{ color: DIM, fontSize: '15px' }}>·</span>
                    <span style={{ fontSize: '15px', color: DIM }}>2h</span>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, padding: '0 4px', lineHeight: 0 }}>
                    <XMoreIcon />
                  </button>
                </div>

                {/* Tweet body */}
                <p style={{
                  margin: '4px 0 12px 0',
                  fontSize: '15px',
                  lineHeight: '20px',
                  color: TEXT,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {tweet}
                </p>

                {/* Action bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  maxWidth: '425px',
                  marginBottom: '4px',
                }}>
                  <XActionBtn icon={<XReplyIcon />} count="12" hoverColor="#1d9bf0" hoverBg="rgba(29,155,240,0.1)" />
                  <XActionBtn icon={<XRetweetIcon />} count="34" hoverColor="#00ba7c" hoverBg="rgba(0,186,124,0.1)" />
                  <XActionBtn
                    icon={<XHeartIcon filled={liked} />}
                    count={liked ? '288' : '287'}
                    hoverColor="#f91880"
                    hoverBg="rgba(249,24,128,0.1)"
                    activeColor="#f91880"
                    isActive={liked}
                    onClick={() => toggleLike(idx)}
                  />
                  <XActionBtn icon={<XBookmarkIcon />} count="" hoverColor="#1d9bf0" hoverBg="rgba(29,155,240,0.1)" />
                  <XActionBtn icon={<XShareIcon />} count="" hoverColor="#1d9bf0" hoverBg="rgba(29,155,240,0.1)" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function XActionBtn({ icon, count, hoverColor, hoverBg, activeColor, isActive, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: isActive ? activeColor : (hov ? hoverColor : '#71767b'),
        fontSize: '13px',
        fontFamily: 'inherit',
        padding: '6px',
        borderRadius: '50%',
        transition: 'color 0.15s ease',
      }}
    >
      {icon}
      {count && <span style={{ fontSize: '13px', lineHeight: 1 }}>{count}</span>}
    </button>
  );
}

// ─── INSTAGRAM MOCKUP ─────────────────────────────────────────────────────────
function InstagramMockup({ caption }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const BG = '#000000';
  const TEXT = '#f5f5f5';
  const BORDER = '#262626';
  const DIM = '#a8a8a8';

  // Stable gradient — pick once on mount
  const gradients = [
    'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    'linear-gradient(135deg, #405de6 0%, #5851db 20%, #833ab4 40%, #c13584 60%, #e1306c 80%, #fd1d1d 100%)',
    'linear-gradient(135deg, #f9c784 0%, #fc5c7d 100%)',
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  ];
  const [gradient] = useState(() => gradients[Math.floor(Math.random() * gradients.length)]);

  return (
    <div style={{
      backgroundColor: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: '3px',
      fontFamily: FONT,
      overflow: 'hidden',
    }}>
      {/* Top bar: Avatar + username + more */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 16px',
        gap: '10px',
      }}>
        {/* Story ring avatar */}
        <div style={{
          padding: '2px', borderRadius: '50%',
          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 100%)',
            border: `2px solid ${BG}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: '#fff',
          }}>
            YN
          </div>
        </div>

        {/* Username + location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: TEXT, lineHeight: '18px' }}>yourname</div>
          <div style={{ fontSize: '12px', color: DIM, lineHeight: '16px' }}>Original Audio</div>
        </div>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT, padding: 0, lineHeight: 0 }}>
          <IGMoreIcon />
        </button>
      </div>

      {/* Image placeholder — 4:5 ratio */}
      <div style={{
        width: '100%',
        paddingBottom: '125%', // 4:5
        position: 'relative',
        background: gradient,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* IG camera logo SVG */}
          <svg viewBox="0 0 24 24" width="56" height="56" fill="rgba(255,255,255,0.25)">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ padding: '8px 16px 0 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={() => setLiked(l => !l)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, color: liked ? '#ed4956' : TEXT, transition: 'transform 0.1s ease', transform: liked ? 'scale(1.12)' : 'scale(1)' }}
            >
              <IGHeartIcon filled={liked} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, color: TEXT }}>
              <IGCommentIcon />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, color: TEXT }}>
              <IGShareIcon />
            </button>
          </div>
          <button
            onClick={() => setSaved(s => !s)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, color: TEXT }}
          >
            <IGBookmarkIcon filled={saved} />
          </button>
        </div>

        {/* Likes */}
        <div style={{ fontSize: '14px', fontWeight: 600, color: TEXT, lineHeight: '18px', marginBottom: '8px' }}>
          {liked ? '1,288' : '1,287'} likes
        </div>

        {/* Caption */}
        <div style={{ fontSize: '14px', fontWeight: 400, color: TEXT, lineHeight: '18px', marginBottom: '8px', wordBreak: 'break-word' }}>
          <span style={{ fontWeight: 600, marginRight: '4px' }}>yourname</span>
          <span style={{ whiteSpace: 'pre-wrap' }}>{caption}</span>
        </div>

        {/* View comments */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', color: DIM, lineHeight: '18px', display: 'block', marginBottom: '8px' }}>
          View all 43 comments
        </button>

        {/* Timestamp */}
        <div style={{ fontSize: '10px', color: DIM, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: '12px', marginBottom: '14px' }}>
          2 hours ago
        </div>
      </div>
    </div>
  );
}

// ─── YOUTUBE COMMUNITY POST MOCKUP ────────────────────────────────────────────
function YouTubeMockup({ text }) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const FONT = '"Roboto", Arial, sans-serif';
  const BG = '#0f0f0f';
  const TEXT_C = '#f1f1f1';
  const DIM = '#aaaaaa';
  const BORDER = '#272727';
  const LIKEDBG = '#272727';

  const handleLike = () => { setLiked(l => !l); if (disliked) setDisliked(false); };
  const handleDislike = () => { setDisliked(d => !d); if (liked) setLiked(false); };

  return (
    <div style={{
      backgroundColor: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: '12px',
      padding: '16px',
      fontFamily: FONT,
    }}>
      {/* Channel row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff0000 0%, #ff4444 100%)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 500, color: '#fff',
        }}>
          YC
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: TEXT_C }}>Your Channel</span>
            {/* YT verified checkmark */}
            <svg viewBox="0 0 24 24" height="14" width="14" fill={DIM}>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 14.5l-3.5-3.5 1.41-1.41L10 13.67l6.09-6.08 1.41 1.41L10 16.5z" />
            </svg>
          </div>
          <div style={{ fontSize: '13px', color: DIM, lineHeight: '18px' }}>2 hours ago</div>
        </div>

        {/* More menu */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: DIM, lineHeight: 0 }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* Post text */}
      <p style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        lineHeight: '20px',
        color: TEXT_C,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {text}
      </p>

      {/* Action bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingTop: '12px',
        borderTop: `1px solid ${BORDER}`,
      }}>
        {/* Like / Dislike pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: LIKEDBG,
          borderRadius: '18px',
          overflow: 'hidden',
        }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: liked ? '#3ea6ff' : TEXT_C,
              fontSize: '14px', fontFamily: FONT,
              padding: '8px 14px',
              transition: 'color 0.15s ease',
            }}
          >
            <YTThumbUpIcon />
            <span style={{ fontSize: '14px' }}>{liked ? '848' : '847'}</span>
          </button>
          <div style={{ width: '1px', height: '20px', backgroundColor: BORDER }} />
          <button
            onClick={handleDislike}
            style={{
              display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: disliked ? '#3ea6ff' : TEXT_C,
              padding: '8px 14px',
              transition: 'color 0.15s ease',
            }}
          >
            <YTThumbDownIcon />
          </button>
        </div>

        {/* Comment button */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: LIKEDBG, border: 'none', cursor: 'pointer',
          color: TEXT_C, borderRadius: '18px',
          padding: '8px 14px', fontSize: '14px', fontFamily: FONT,
        }}>
          <YTCommentIcon />
          <span>143</span>
        </button>

        {/* Share button */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: LIKEDBG, border: 'none', cursor: 'pointer',
          color: TEXT_C, borderRadius: '18px',
          padding: '8px 14px', fontSize: '14px', fontFamily: FONT,
        }}>
          <YTShareIcon />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}


// ─── MAIN PLATFORMCARD COMPONENT ──────────────────────────────────────────────
export default function PlatformCard({ platformKey, title, pillClass, icon, content, onSaveSuccess, onRuleSuggested }) {
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [showMockup, setShowMockup] = useState(true);

  // ── RLHF State ──────────────────────────────────────────────────────────
  const [suggestedRule, setSuggestedRule] = useState('');
  const [isSuggestingRule, setIsSuggestingRule] = useState(false);
  const [isAcceptingRule, setIsAcceptingRule] = useState(false);
  const [rlhfSuccess, setRlhfSuccess] = useState('');

  useEffect(() => {
    if (Array.isArray(content)) {
      setEditableContent(content.join('\n\n---\n\n'));
    } else {
      setEditableContent(content || '');
    }
    setIsEditing(false);
    setSuggestedRule('');
    setRlhfSuccess('');
  }, [content]);

  const handleCopy = () => {
    let textToCopy = editableContent;
    if (platformKey === 'x_thread' && Array.isArray(content)) {
      textToCopy = content.join('\n\n');
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCorrection = async () => {
    try {
      setIsSavingCorrection(true);
      const originalStr = Array.isArray(content) ? content.join('\n\n') : (content || '');

      setIsEditing(false);
      setIsSavingCorrection(false);

      // Step 2: Ask Gemini for a rule suggestion (async, non-blocking for the save)
      if (originalStr.trim() !== editableContent.trim()) {
        setIsSuggestingRule(true);
        try {
          const result = await suggestCorrectionRule(originalStr, editableContent);
          if (result.suggestedRule) {
            if (onRuleSuggested) {
              onRuleSuggested(result.suggestedRule);
            } else {
              setSuggestedRule(result.suggestedRule);
            }
          }
        } catch (err) {
          console.warn('Gemini rule suggestion failed (non-critical):', err.message);
        }
        setIsSuggestingRule(false);
      }

      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert(`Error saving correction: ${err.message}`);
      setIsSavingCorrection(false);
    }
  };

  const handleAcceptRule = async () => {
    try {
      setIsAcceptingRule(true);
      await acceptCorrectionRule(suggestedRule);
      setRlhfSuccess(`Rule saved: "${suggestedRule}"`);
      setSuggestedRule('');
      setIsAcceptingRule(false);
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setRlhfSuccess(''), 4000);
    } catch (err) {
      alert(`Error saving rule: ${err.message}`);
      setIsAcceptingRule(false);
    }
  };

  const handleRejectRule = () => {
    setSuggestedRule('');
  };

  const renderMockup = () => {
    if (platformKey === 'x_thread' && Array.isArray(content)) return <XThreadMockup tweets={content} />;
    if (platformKey === 'instagram_caption') return <InstagramMockup caption={editableContent} />;
    if (platformKey === 'youtube_post') return <YouTubeMockup text={editableContent} />;
    return null;
  };

  const renderRawContent = () => {
    if (isEditing) {
      return (
        <textarea
          className="editorial-input"
          rows={12}
          value={editableContent}
          onChange={(e) => setEditableContent(e.target.value)}
          style={{ fontSize: '0.9rem', lineHeight: '1.6' }}
        />
      );
    }
    return (
      <div style={{
        whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: '1.65',
        color: 'var(--theme-text-main)', backgroundColor: 'var(--theme-surface-hover)',
        padding: '16px', borderRadius: '6px', border: '1px solid var(--theme-border)'
      }}>
        {editableContent}
      </div>
    );
  };

  const getCharCount = () => {
    if (Array.isArray(content)) return `${content.length} tweets`;
    return `${editableContent.length} chars`;
  };

  return (
    <div className="editorial-card" style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', padding: '20px',
      position: 'relative', minWidth: 0
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px', paddingBottom: '12px',
        borderBottom: '1px solid var(--theme-border)',
        gap: '8px', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{
            fontSize: '0.78rem', fontWeight: 700,
            color: 'var(--theme-accent)', backgroundColor: 'var(--theme-accent-soft)',
            border: '1px solid var(--theme-border)', padding: '3px 8px', borderRadius: '4px',
            display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap'
          }}>
            {icon} {title}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', whiteSpace: 'nowrap' }}>
            {getCharCount()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className="btn-editorial-secondary"
            style={{
              padding: '5px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap',
              backgroundColor: showMockup ? 'var(--theme-accent-soft)' : undefined,
              borderColor: showMockup ? 'var(--theme-accent)' : undefined,
              color: showMockup ? 'var(--theme-accent)' : undefined
            }}
            onClick={() => { setShowMockup(m => !m); setIsEditing(false); }}
          >
            {showMockup ? 'Raw Text' : 'Preview'}
          </button>
          <button
            className="btn-editorial-secondary"
            style={{ padding: '5px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            onClick={() => { setIsEditing(!isEditing); setShowMockup(false); }}
          >
            <EditIcon style={{ fontSize: 14 }} /> {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            className="btn-editorial-secondary"
            style={{
              padding: '5px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap',
              backgroundColor: copied ? 'var(--theme-accent-soft)' : undefined,
              borderColor: copied ? 'var(--theme-accent)' : undefined,
              color: copied ? 'var(--theme-accent)' : undefined
            }}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon style={{ fontSize: 14 }} /> : <ContentCopyIcon style={{ fontSize: 14 }} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
        {showMockup && !isEditing ? renderMockup() : renderRawContent()}
      </div>

      {/* Correction Form — Now with AI Auto-Suggest */}
      {isEditing && (
        <div style={{
          marginTop: '12px', padding: '14px', borderRadius: '6px',
          backgroundColor: 'var(--theme-surface-hover)', border: '1px solid var(--theme-border)'
        }}>
          <button
            className="btn-editorial-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.85rem' }}
            onClick={handleSaveCorrection}
            disabled={isSavingCorrection || isSuggestingRule}
          >
            <AutoAwesomeIcon style={{ fontSize: 15 }} />
            {isSavingCorrection ? 'Saving Edit...' : isSuggestingRule ? 'Analyzing Pattern (Gemini)...' : 'Save Edits & Train Voice Profile'}
          </button>
        </div>
      )}

      {/* RLHF Suggestion Toast — only if not using popup modal */}
      {!onRuleSuggested && (
        <RLHFSuggestionToast
          suggestedRule={suggestedRule}
          onAccept={handleAcceptRule}
          onReject={handleRejectRule}
          accepting={isAcceptingRule}
        />
      )}

      {/* RLHF Success Banner */}
      {rlhfSuccess && (
        <div style={{
          marginTop: '10px',
          padding: '10px 14px',
          borderRadius: '6px',
          backgroundColor: 'rgba(94, 120, 110, 0.12)',
          border: '1px solid var(--theme-accent)',
          fontSize: '0.82rem',
          color: 'var(--theme-accent)',
          fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <CheckIcon style={{ fontSize: 16 }} />
          {rlhfSuccess}
        </div>
      )}
    </div>
  );
}

