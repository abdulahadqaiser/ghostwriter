import React from 'react';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ExtensionIcon from '@mui/icons-material/Extension';

export default function MindStatusCard({ mindsStatus }) {
  const mind = mindsStatus?.mind;
  const credits = mindsStatus?.credits;

  return (
    <div className="editorial-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Mind Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            backgroundColor: 'var(--theme-accent-soft)',
            border: '1px solid var(--theme-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-accent)'
          }}>
            <PsychologyIcon style={{ fontSize: 20 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="font-serif-title" style={{ fontSize: '1.05rem', fontWeight: 600 }}>{mind?.name || 'Ghostwriter Mind'}</h3>
              <span className="editorial-badge" style={{ backgroundColor: 'var(--theme-accent-soft)', color: 'var(--theme-accent)' }}>
                {mind?.mode || 'Minds Platform'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--theme-text-muted)' }}>
              ID: {mind?.id || 'ghostwriter-mind-01'} | Status: {mind?.status || 'Online'}
            </p>
          </div>
        </div>

        {/* Cognition Credit Monitor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--theme-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cognition Balance
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--theme-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ElectricBoltIcon style={{ fontSize: 16 }} /> {(credits?.balance ?? 4850).toLocaleString()} Credits
            </span>
          </div>

          {/* Bazaar Ecosystem Skills */}
          <div style={{ borderLeft: '1px solid var(--theme-border)', paddingLeft: '16px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--theme-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bazaar Ecosystem Skills
            </span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--theme-surface-hover)',
                color: 'var(--theme-text-main)',
                border: '1px solid var(--theme-border)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 500
              }}>
                <VerifiedUserIcon style={{ fontSize: 13, color: 'var(--theme-accent)' }} /> Tone Preserver
              </span>
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--theme-surface-hover)',
                color: 'var(--theme-text-main)',
                border: '1px solid var(--theme-border)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 500
              }}>
                <ExtensionIcon style={{ fontSize: 13, color: 'var(--theme-accent)' }} /> Platform Adapter
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
