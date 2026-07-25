import { useState, useEffect, useRef } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import NameScreen from './components/NameScreen';
import Header from './components/Header';
import ReelGrid from './components/ReelGrid';
import ControlPanel from './components/ControlPanel';
import TestPanel from './components/TestPanel';
import SoundEditor from './components/SoundEditor';
import SoundThemePicker from './components/SoundThemePicker';
import LeaderboardModal from './components/LeaderboardModal';
import FreeSpinsModal from './components/FreeSpinsModal';
import FreeSpinsResultsModal from './components/FreeSpinsResultsModal';
import JackpotPicker from './components/JackpotPicker';
import ThemeEditor from './components/ThemeEditor';
import ShareQrModal from './components/ShareQrModal';
import VersionStamp from './components/VersionStamp';
import InstallPrompt from './components/InstallPrompt';
import { audioManager } from './services/audioManager';

export default function App() {
  const [showDebug, setShowDebug] = useState(false);
  const audioInited = useRef(false);
  const handleFirstInteraction = () => {
    if (!audioInited.current) {
      audioInited.current = true;
      audioManager.init();
    }
  };
  return (
    <GameProvider>
      <AppContent showDebug={showDebug} setShowDebug={setShowDebug} />
    </GameProvider>
  );
}

function AppContent({ showDebug, setShowDebug }) {
  const { state, doSpin } = useGame();
  const [giftToast, setGiftToast] = useState(null);
  const [fsRetrigger, setFsRetrigger] = useState(null);
  const [showShareQr, setShowShareQr] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const onGift = () => {
      setGiftToast(true);
      setTimeout(() => setGiftToast(null), 2400);
    };
    const onReTrigger = (e) => {
      setFsRetrigger(e.detail?.extraSpins || 0);
      setTimeout(() => setFsRetrigger(null), 2400);
    };
    const onKeyDown = (e) => {
      if (e.key === ' ' && !e.repeat && !state.isSpinning) {
        e.preventDefault();
        doSpin();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('show-gift-toast', onGift);
    window.addEventListener('show-fs-retrigger', onReTrigger);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('show-gift-toast', onGift);
      window.removeEventListener('show-fs-retrigger', onReTrigger);
    };
  }, [state.isSpinning, doSpin]);

  return (
    <div id="game-app" className={`w-full max-w-[820px] mx-auto select-none relative${state.adminMode ? ' admin-active admin-unlocked' : ''}`} onClick={() => {
      if (!window._hermesAudioInited) { window._hermesAudioInited = true; audioManager.init(); }
    }}>
      <NameScreen />
      <Header setShowShareQr={setShowShareQr} setShowLeaderboard={setShowLeaderboard} />
      <ReelGrid showDebug={showDebug} />
      <ControlPanel />
      <div className="flex justify-center mt-2">
        <SoundThemePicker />
      </div>
      <TestPanel showDebug={showDebug} setShowDebug={setShowDebug} />
      {state.adminMode && <SoundEditor />}
      <VersionStamp />
      
      <InstallPrompt />

      <FreeSpinsModal />
      <FreeSpinsResultsModal />
      <JackpotPicker />
      <ThemeEditor />
      <ShareQrModal show={showShareQr} onClose={() => setShowShareQr(false)} />
      <LeaderboardModal show={showLeaderboard} onClose={() => setShowLeaderboard(false)} />

      {giftToast && (
        <div
          id="gift-toast"
          style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.1)',
            background: 'linear-gradient(135deg, rgba(250,204,21,0.95), rgba(234,179,8,0.95))',
            color: '#0f172a', fontFamily: "'Orbitron', monospace", fontWeight: 900,
            fontSize: 'clamp(1rem, 4vw, 1.8rem)', padding: '20px 40px', borderRadius: '16px',
            zIndex: 2000, boxShadow: '0 0 60px rgba(250,204,21,0.6), 0 10px 40px rgba(0,0,0,0.5)',
            textAlign: 'center', pointerEvents: 'none',
            opacity: 1, transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          🎁 GIFT! You've been topped up to $10,000
        </div>
      )}

      {fsRetrigger && (
        <div
          style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.1)',
            background: 'linear-gradient(135deg, rgba(192,132,252,0.95), rgba(250,204,21,0.95))',
            color: '#0f172a', fontFamily: "'Orbitron', monospace", fontWeight: 900,
            fontSize: 'clamp(1.2rem, 5vw, 2rem)', padding: '20px 40px', borderRadius: '16px',
            zIndex: 2000, boxShadow: '0 0 60px rgba(192,132,252,0.6)',
            textAlign: 'center', pointerEvents: 'none',
            opacity: 1, transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          🎰 +{fsRetrigger} FREE SPINS!
        </div>
      )}
    </div>
  );
}
