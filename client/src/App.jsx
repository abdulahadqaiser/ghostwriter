import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RepurposeStudio from './components/RepurposeStudio';
import OnboardingModal from './components/OnboardingModal';
import VoiceProfileManager from './components/VoiceProfileManager';
import { fetchVoiceProfile, fetchMindsStatus } from './utils/api';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [mindsStatus, setMindsStatus] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, statusRes] = await Promise.all([
        fetchVoiceProfile().catch(() => ({ profile: null })),
        fetchMindsStatus().catch(() => ({ mind: null, credits: null }))
      ]);

      if (profileRes.profile) {
        setProfile(profileRes.profile);
        // If profile has no writing samples, prompt onboarding automatically
        if (!profileRes.profile.rawSamples || profileRes.profile.rawSamples.length === 0) {
          setIsOnboardingOpen(true);
        }
      }

      if (statusRes.mind || statusRes.credits) {
        setMindsStatus(statusRes);
      }
      setLoading(false);
    } catch (err) {
      console.warn('Error loading initial state:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        mindsStatus={mindsStatus}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      <main style={{ flex: 1 }}>
        <RepurposeStudio
          profile={profile}
          mindsStatus={mindsStatus}
          onProfileUpdate={loadData}
        />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 32px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        marginTop: '40px'
      }}>
        Ghostwriter — Persistent AI Mind Content Repurposer | Minds by Animoca Brands Hackathon Submission
      </footer>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={loadData}
      />

      <VoiceProfileManager
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onProfileUpdate={loadData}
      />
    </div>
  );
}
