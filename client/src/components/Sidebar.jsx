import React from 'react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import { useNavigate, useLocation } from 'react-router-dom';

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

export default function Sidebar({
  isOpen = true,
  onToggle,
  history = [],
  activeHistoryId,
  onSelectHistory,
  onNewSession,
  onDeleteHistory,
  onOpenProfile,
  onOpenOnboarding,
  mindsStatus,
  activeUserId = 'default-creator',
  onSelectPersona
}) {
  const credits = mindsStatus?.credits?.balance ?? 1551;
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewClick = () => {
    if (onNewSession) onNewSession();
    navigate('/');
  };

  const handleHistoryClick = (item) => {
    if (onSelectHistory) onSelectHistory(item);
    navigate(`/repurpose/${item._id}`);
  };

  return (
    <aside style={{
      width: isOpen ? '270px' : '0px',
      minWidth: isOpen ? '270px' : '0px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      backgroundColor: 'var(--theme-surface)',
      borderRight: isOpen ? '1px solid var(--theme-border)' : '0px solid transparent',
      overflow: 'hidden',
      zIndex: 40,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease'
    }}>
      <div style={{
        width: '270px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        opacity: isOpen ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-in-out'
      }}>
        {/* Top Header / Branding + Collapse Toggle */}
        <div style={{ padding: '16px 16px 14px 16px', borderBottom: '1px solid var(--theme-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/ghost-writer-logo.png"
                alt="Ghostwriter"
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))',
                  flexShrink: 0
                }}
              />
              <div>
                <h1 className="font-serif-title" style={{
                  fontSize: '1.18rem',
                  fontWeight: 700,
                  color: 'var(--theme-text-main)',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1',
                  margin: 0
                }}>
                  Ghostwriter
                </h1>
                <p style={{ fontSize: '0.68rem', color: 'var(--theme-text-muted)', margin: 0 }}>
                  AI Content Repurposer
                </p>
              </div>
            </div>

            {/* Toggle / Close Sidebar Button */}
            <button
              onClick={onToggle}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--theme-text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Collapse sidebar"
            >
              <ViewSidebarOutlinedIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Active Voice Persona Dropdown */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--theme-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '5px'
            }}>
              <AccountCircleIcon style={{ fontSize: 13, color: 'var(--theme-accent)' }} />
              Active Persona
            </label>
            <select
              value={activeUserId || 'default-creator'}
              onChange={(e) => onSelectPersona && onSelectPersona(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--theme-surface-hover)',
                border: '1px solid var(--theme-border)',
                borderRadius: '6px',
                padding: '6px 9px',
                color: 'var(--theme-text-main)',
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="default-creator">My Voice (Default)</option>
              <option value="persona-mkbhd">Tech Reviewer (MKBHD)</option>
              <option value="persona-hormozi">Aggressive Biz (Hormozi)</option>
            </select>
          </div>

          {/* ChatGPT-style + New Repurpose Button */}
          <button
            onClick={handleNewClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justify: 'flex-start',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--theme-accent-soft)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-accent)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <AddIcon style={{ fontSize: 18 }} /> + New Repurpose
          </button>
        </div>

        {/* Middle: Scrollable History List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--theme-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0 6px 8px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <HistoryIcon style={{ fontSize: 14, color: 'var(--theme-accent)' }} /> Past Repurposes ({history.length})
          </div>

          {history.length === 0 ? (
            <div style={{ padding: '14px 6px', fontSize: '0.78rem', color: 'var(--theme-text-muted)', fontStyle: 'italic' }}>
              No past sessions yet. Generated content will automatically appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {history.map((item) => {
                const isSelected = activeHistoryId === item._id || location.pathname === `/repurpose/${item._id}`;
                return (
                  <div
                    key={item._id}
                    onClick={() => handleHistoryClick(item)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? 'var(--theme-accent-soft)' : 'transparent',
                      border: isSelected ? '1px solid var(--theme-border)' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? 'var(--theme-accent)' : 'var(--theme-text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.title || 'Untitled Repurpose'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--theme-text-dim)', marginTop: '2px' }}>
                        {formatTimeAgo(item.createdAt)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistory(item._id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--theme-text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.6
                      }}
                      title="Delete session"
                    >
                      <DeleteOutlinedIcon style={{ fontSize: 14 }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Footer: Voice Profile Controls & Mind Credits */}
        <div style={{ padding: '12px 12px 16px 12px', borderTop: '1px solid var(--theme-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Mind status pill */}
          <div style={{
            padding: '7px 10px',
            borderRadius: '6px',
            backgroundColor: 'var(--theme-surface-hover)',
            border: '1px solid var(--theme-border)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontWeight: 600, color: 'var(--theme-text-main)', fontSize: '0.78rem' }}>
                {mindsStatus?.mind?.name || 'Andrew.Garrett'}
              </span>
            </div>
            <span style={{ color: 'var(--theme-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem' }}>
              <ElectricBoltIcon style={{ fontSize: 13 }} /> {credits.toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={onOpenProfile}
              className="btn-editorial-secondary"
              style={{ flex: 1, padding: '6px 6px', fontSize: '0.74rem', justifyContent: 'center' }}
              title="Creator Voice Profile"
            >
              <TuneIcon style={{ fontSize: 13 }} /> Voice Profile
            </button>
            <button
              onClick={onOpenOnboarding}
              className="btn-editorial-secondary"
              style={{ flex: 1, padding: '6px 6px', fontSize: '0.74rem', justifyContent: 'center' }}
              title="Re-seed Voice Samples"
            >
              <AccountCircleIcon style={{ fontSize: 13 }} /> Re-seed
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
