import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { audioManager } from '../services/audioManager';

export default function VersionStamp() {
  const { state, dispatch } = useGame();
  const version = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : '--/--/-- --:-- EST';

  const toggleAdmin = () => {
    if (state.adminMode) {
      dispatch({ type: 'SET_ADMIN', adminMode: false });
    } else {
      const code = prompt('Enter admin passcode:');
      // iOS Safari suspends AudioContext during native prompt() — resume it
      if (audioManager.ctx && audioManager.ctx.state === 'suspended') {
        audioManager.ctx.resume();
      }
      if (code === '5545') {
        dispatch({ type: 'SET_ADMIN', adminMode: true });
      }
    }
  };

  const handleRefresh = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          // Force an update check
          registration.update().then(() => {
            if (registration.waiting) {
              // New SW is waiting — tell it to activate
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            // Reload to pick up latest — activated SW or fresh network
            window.location.reload();
          }).catch(() => {
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }).catch(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }, []);

  return (
    <div className="version-stamp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <span
        onClick={handleRefresh}
        style={{ cursor: 'pointer' }}
        title="Tap to force-refresh PWA"
      >
        Version {version}
      </span>
      <button
        id="admin-lock-btn"
        className="text-[#64748b] hover:text-[#facc15] text-xs transition-colors cursor-pointer bg-transparent border-none p-0 leading-none"
        title="Admin mode"
        onClick={toggleAdmin}
      >
        {state.adminMode ? '🔓' : '🔒'}
      </button>
    </div>
  );
}
