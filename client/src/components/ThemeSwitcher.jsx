import React, { useState, useEffect } from 'react';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ForestIcon from '@mui/icons-material/Forest';

const THEMES = [
  { id: 'light', label: 'Editorial Light', icon: LightModeIcon },
  { id: 'dark', label: 'Matte Dark', icon: DarkModeIcon },
  { id: 'nature', label: 'Quiet Nature', icon: ForestIcon }
];

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('ghostwriter-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.body.setAttribute('data-theme', activeTheme);
    localStorage.setItem('ghostwriter-theme', activeTheme);
  }, [activeTheme]);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: 'var(--theme-surface)',
      border: '1px solid var(--theme-border)',
      borderRadius: '6px',
      padding: '3px'
    }}>
      {THEMES.map((theme) => {
        const IconComponent = theme.icon;
        const isActive = activeTheme === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => setActiveTheme(theme.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--theme-accent)' : 'var(--theme-text-muted)',
              backgroundColor: isActive ? 'var(--theme-accent-soft)' : 'transparent',
              border: isActive ? '1px solid var(--theme-border)' : '1px solid transparent',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            title={theme.label}
          >
            <IconComponent style={{ fontSize: 14 }} />
            <span>{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
}
