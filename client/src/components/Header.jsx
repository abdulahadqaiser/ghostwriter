import React from 'react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import TuneIcon from '@mui/icons-material/Tune';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header({ mindsStatus, onOpenProfile, onOpenOnboarding }) {
  const credits = mindsStatus?.credits?.balance ?? 4850;

  return (
    <header style={{
      borderBottom: '1px solid var(--theme-border)',
      backgroundColor: 'var(--theme-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 28px',
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo - Editorial Style */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '6px',
            backgroundColor: 'var(--theme-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <AutoFixHighIcon style={{ fontSize: 20 }} />
          </div>
          <div>
            <h1 className="font-serif-title" style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--theme-text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              Ghostwriter
            </h1>
            <p style={{ fontSize: '0.74rem', color: 'var(--theme-text-muted)', fontFamily: 'var(--font-sans)' }}>
              Editorial Content Repurposing with Voice Preservation
            </p>
          </div>
        </div>

        {/* Mind Identity, Cognition Credits & Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Mind Status Pill */}
          <div className="editorial-card" style={{
            padding: '5px 12px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block'
            }} />
            <span style={{ fontWeight: 600, color: 'var(--theme-text-main)' }}>
              {mindsStatus?.mind?.name || 'Ghostwriter Mind'}
            </span>
            <span style={{ color: 'var(--theme-text-dim)' }}>|</span>
            <span style={{ color: 'var(--theme-accent)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <ElectricBoltIcon style={{ fontSize: 14 }} /> {credits.toLocaleString()} Credits
            </span>
          </div>

          {/* Theme Switcher Toggle Component */}
          <ThemeSwitcher />

          {/* Action Buttons */}
          <button className="btn-editorial-secondary" onClick={onOpenProfile} style={{ whiteSpace: 'nowrap' }}>
            <TuneIcon style={{ fontSize: 16 }} /> Voice Profile
          </button>
          <button className="btn-editorial-secondary" onClick={onOpenOnboarding} style={{ whiteSpace: 'nowrap' }}>
            <AccountCircleIcon style={{ fontSize: 16 }} /> Re-seed Voice
          </button>
        </div>
      </div>
    </header>
  );
}
