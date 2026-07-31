import React from 'react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import TuneIcon from '@mui/icons-material/Tune';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  mindsStatus,
  onOpenProfile,
  onOpenOnboarding,
  activeEngine = 'minds',
  onSelectEngine
}) {
  const credits = mindsStatus?.credits?.balance ?? 1551;

  // Localhost / Dev Mode Check: ONLY renders on localhost / local development!
  const isDevMode = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    Boolean(import.meta.env.DEV)
  );

  return (
    <header style={{
      borderBottom: '1px solid var(--theme-border)',
      backgroundColor: 'var(--theme-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      padding: '12px 24px',
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Left Section: Sidebar Toggle + Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onToggleSidebar}
            style={{
              backgroundColor: isSidebarOpen ? 'transparent' : 'var(--theme-accent-soft)',
              border: '1px solid var(--theme-border)',
              color: isSidebarOpen ? 'var(--theme-text-muted)' : 'var(--theme-accent)',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
            title={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          >
            <ViewSidebarOutlinedIcon style={{ fontSize: 18 }} />
            {!isSidebarOpen && <span>Sidebar</span>}
          </button>

          {!isSidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/ghost-writer-logo.png"
                alt="Ghostwriter"
                style={{
                  width: '36px',
                  height: '36px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))'
                }}
              />
              <h1 className="font-serif-title" style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--theme-text-main)',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Ghostwriter
              </h1>
            </div>
          )}
        </div>

        {/* Right Section: Engine Switcher, Mind Status, Theme Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* AI Engine Switcher (Available in Production & Dev) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--theme-surface-hover)',
            border: '1px solid var(--theme-accent)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.76rem'
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--theme-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI ENGINE:
            </span>
            <select
              value={activeEngine || 'minds'}
              onChange={(e) => onSelectEngine && onSelectEngine(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--theme-text-main)',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="minds">⚡ Minds Engine</option>
              <option value="gemini">✨ Gemini Engine</option>
            </select>
          </div>

          {/* Mind Status Pill */}
          <div className="editorial-card" style={{
            padding: '4px 10px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block'
            }} />
            <span style={{ fontWeight: 600, color: 'var(--theme-text-main)' }}>
              {mindsStatus?.mind?.name || 'Andrew.Garrett'}
            </span>
            <span style={{ color: 'var(--theme-text-dim)' }}>|</span>
            <span style={{ color: 'var(--theme-accent)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <ElectricBoltIcon style={{ fontSize: 13 }} /> {credits.toLocaleString()} Credits
            </span>
          </div>

          {/* Theme Switcher Toggle */}
          <ThemeSwitcher />

          {/* Action Buttons */}
          <button className="btn-editorial-secondary" onClick={onOpenProfile} style={{ whiteSpace: 'nowrap', padding: '6px 10px', fontSize: '0.78rem' }}>
            <TuneIcon style={{ fontSize: 15 }} /> Voice Profile
          </button>
          <button className="btn-editorial-secondary" onClick={onOpenOnboarding} style={{ whiteSpace: 'nowrap', padding: '6px 10px', fontSize: '0.78rem' }}>
            <AccountCircleIcon style={{ fontSize: 15 }} /> Re-seed
          </button>
        </div>
      </div>
    </header>
  );
}
