import React, { useState, useEffect } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { saveCorrection } from '../utils/api';

export default function PlatformCard({ platformKey, title, pillClass, icon, content, onSaveSuccess }) {
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [learnedRuleInput, setLearnedRuleInput] = useState('');

  useEffect(() => {
    if (Array.isArray(content)) {
      setEditableContent(content.join('\n\n---\n\n'));
    } else {
      setEditableContent(content || '');
    }
    setIsEditing(false);
  }, [content]);

  // Copy handler
  const handleCopy = () => {
    let textToCopy = editableContent;
    if (platformKey === 'x_thread' && Array.isArray(content)) {
      textToCopy = content.join('\n\n');
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit correction handler
  const handleSaveCorrection = async () => {
    try {
      setIsSavingCorrection(true);
      const originalStr = Array.isArray(content) ? content.join('\n\n') : (content || '');
      await saveCorrection(
        platformKey, 
        originalStr, 
        editableContent, 
        learnedRuleInput || `Creator corrected ${title} for voice match`
      );
      setIsSavingCorrection(false);
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert(`Error saving correction: ${err.message}`);
      setIsSavingCorrection(false);
    }
  };

  // Helper for rendering content based on platform
  const renderContentBody = () => {
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

    if (platformKey === 'x_thread' && Array.isArray(content)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {content.map((tweet, idx) => (
            <div key={idx} style={{
              backgroundColor: 'var(--theme-surface-hover)',
              border: '1px solid var(--theme-border)',
              borderRadius: '6px',
              padding: '14px',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              color: 'var(--theme-text-main)'
            }}>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: 'var(--theme-accent)', 
                display: 'block', 
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Tweet {idx + 1} of {content.length}
              </span>
              {tweet}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{
        whiteSpace: 'pre-wrap',
        fontSize: '0.9rem',
        lineHeight: '1.65',
        color: 'var(--theme-text-main)',
        backgroundColor: 'var(--theme-surface-hover)',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid var(--theme-border)'
      }}>
        {editableContent}
      </div>
    );
  };

  const getCharCount = () => {
    if (Array.isArray(content)) {
      return `${content.length} Tweets`;
    }
    return `${editableContent.length} chars`;
  };

  return (
    <div className="editorial-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '20px',
      position: 'relative',
      minWidth: 0
    }}>
      {/* Platform Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--theme-border)',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--theme-accent)',
            backgroundColor: 'var(--theme-accent-soft)',
            border: '1px solid var(--theme-border)',
            padding: '3px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap'
          }}>
            {icon} {title}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', whiteSpace: 'nowrap' }}>
            {getCharCount()}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            className="btn-editorial-secondary" 
            style={{ padding: '5px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            onClick={() => setIsEditing(!isEditing)}
          >
            <EditIcon style={{ fontSize: 14 }} /> {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button 
            className="btn-editorial-secondary"
            style={{ 
              padding: '5px 10px', 
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
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

      {/* Main Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
        {renderContentBody()}
      </div>

      {/* Correction Form & Train Button */}
      {isEditing && (
        <div style={{
          marginTop: '12px',
          padding: '14px',
          borderRadius: '6px',
          backgroundColor: 'var(--theme-surface-hover)',
          border: '1px solid var(--theme-border)'
        }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--theme-text-main)', marginBottom: '6px' }}>
            Voice Rule to Save (Optional):
          </label>
          <input
            type="text"
            placeholder="e.g., Avoid exclamation marks in hooks, use punchier sentences"
            value={learnedRuleInput}
            onChange={(e) => setLearnedRuleInput(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              borderRadius: '4px',
              padding: '8px 12px',
              color: 'var(--theme-text-main)',
              fontSize: '0.82rem',
              marginBottom: '10px'
            }}
          />
          <button 
            className="btn-editorial-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.85rem' }}
            onClick={handleSaveCorrection}
            disabled={isSavingCorrection}
          >
            <AutoAwesomeIcon style={{ fontSize: 15 }} />
            {isSavingCorrection ? 'Training Voice...' : 'Save Edits & Train Voice Profile'}
          </button>
        </div>
      )}
    </div>
  );
}
