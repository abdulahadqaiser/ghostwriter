import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RepurposeStudio from './components/RepurposeStudio';
import OnboardingModal from './components/OnboardingModal';
import VoiceProfileManager from './components/VoiceProfileManager';
import { fetchVoiceProfile, fetchMindsStatus, fetchRepurposeHistory, deleteHistoryItem } from './utils/api';

// Route Wrapper for /repurpose/:id
function RepurposeHistoryRoute({ history, profile, mindsStatus, loadData, handleHistoryAdded, handleNewSession }) {
  const { id } = useParams();
  const item = history.find(h => h._id === id) || null;

  return (
    <RepurposeStudio
      profile={profile}
      mindsStatus={mindsStatus}
      onProfileUpdate={loadData}
      selectedHistoryItem={item}
      onHistoryAdded={handleHistoryAdded}
      onNewSession={handleNewSession}
      activeHistoryId={id}
    />
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [mindsStatus, setMindsStatus] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // ChatGPT-style History State
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, statusRes, historyRes] = await Promise.all([
        fetchVoiceProfile().catch(() => ({ profile: null })),
        fetchMindsStatus().catch(() => ({ mind: null, credits: null })),
        fetchRepurposeHistory().catch(() => ({ success: false, history: [] }))
      ]);

      if (profileRes.profile) {
        setProfile(profileRes.profile);
        if (!profileRes.profile.rawSamples || profileRes.profile.rawSamples.length === 0) {
          setIsOnboardingOpen(true);
        }
      }

      if (statusRes.mind || statusRes.credits) {
        setMindsStatus(statusRes);
      }

      if (historyRes.success && Array.isArray(historyRes.history)) {
        setHistory(historyRes.history);
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

  const handleSelectHistory = (item) => {
    setActiveHistoryId(item._id);
    setSelectedHistoryItem(item);
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setSelectedHistoryItem(null);
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item._id !== id));
      if (activeHistoryId === id) {
        handleNewSession();
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleHistoryAdded = (newRecord) => {
    if (!newRecord) return;
    setActiveHistoryId(newRecord._id);
    setSelectedHistoryItem(newRecord);
    setHistory(prev => [newRecord, ...prev.filter(h => h._id !== newRecord._id)]);
    navigate(`/repurpose/${newRecord._id}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--theme-bg)' }}>
      {/* ChatGPT-style Collapsible Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        history={history}
        activeHistoryId={activeHistoryId}
        onSelectHistory={handleSelectHistory}
        onNewSession={handleNewSession}
        onDeleteHistory={handleDeleteHistory}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        mindsStatus={mindsStatus}
      />

      {/* Main Content Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          mindsStatus={mindsStatus}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={
                <RepurposeStudio
                  profile={profile}
                  mindsStatus={mindsStatus}
                  onProfileUpdate={loadData}
                  selectedHistoryItem={null}
                  onHistoryAdded={handleHistoryAdded}
                  onNewSession={handleNewSession}
                  activeHistoryId={null}
                />
              }
            />
            <Route
              path="/repurpose/:id"
              element={
                <RepurposeHistoryRoute
                  history={history}
                  profile={profile}
                  mindsStatus={mindsStatus}
                  loadData={loadData}
                  handleHistoryAdded={handleHistoryAdded}
                  handleNewSession={handleNewSession}
                />
              }
            />
          </Routes>
        </main>

        <footer style={{
          borderTop: '1px solid var(--theme-border)',
          padding: '20px 32px',
          textAlign: 'center',
          color: 'var(--theme-text-dim)',
          fontSize: '0.8rem'
        }}>
          Ghostwriter — Persistent AI Mind Content Repurposer | Minds by Animoca Brands Hackathon Submission
        </footer>
      </div>

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
