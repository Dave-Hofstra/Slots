import { useState, useEffect, useRef } from 'react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installFailed, setInstallFailed] = useState(false);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    const mobile = window.innerWidth <= 768;
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const android = /android/i.test(navigator.userAgent);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsAndroid(android);
    setIsIOS(ios);

    if (mobile && !standalone && !sessionStorage.getItem('standalonePromptDismissed')) {
      setShowPrompt(true);
    }

    // Capture beforeinstallprompt for Android
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Register service worker for PWA install capability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Slots/sw.js').catch(() => {});
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleMaybeLater = () => {
    sessionStorage.setItem('standalonePromptDismissed', 'true');
    setShowPrompt(false);
  };

  const handleAddToHomeScreen = () => {
    const deferredPrompt = deferredPromptRef.current;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          localStorage.setItem('standalonePromptDismissed', 'true');
          setShowPrompt(false);
        }
        deferredPromptRef.current = null;
      });
    } else {
      setInstallFailed(true);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="standalone-overlay">
      <div className="standalone-card">
        <div className="standalone-icon">
          🎰
        </div>
        <h2 className="standalone-title">Install Slots</h2>
        <p className="standalone-message">
          This game is <strong>much better</strong> when added as an app icon to your mobile home screen.
        </p>
        <div className="standalone-buttons">
          <button className="standalone-btn standalone-btn-later" onClick={handleMaybeLater}>
            Maybe Later
          </button>
          {isAndroid && !installFailed && (
            <button className="standalone-btn standalone-btn-install" onClick={handleAddToHomeScreen}>
              Add to Home Screen
            </button>
          )}
          {isAndroid && installFailed && (
            <div className="standalone-fallback">
              <p className="standalone-fallback-title">Manual Install Instructions:</p>
              <ol className="standalone-fallback-steps">
                <li>Open the Chrome browser menu <strong>⋮</strong></li>
                <li>Tap <strong>"Add to Home screen"</strong></li>
                <li>Tap <strong>"Add"</strong> in the dialog</li>
              </ol>
            </div>
          )}
          {isIOS && (
            <button className="standalone-btn standalone-btn-install" onClick={() => {}}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"
                style={{display:'inline-block',verticalAlign:'middle',marginRight:'6px',fill:'currentColor'}}>
                <path d="M12 2L8 6h3v7h2V6h3l-4-4z"/>
                <path d="M20 11v7H4v-7H2v7c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-7h-2z"/>
              </svg>
              Tap Share icon → "Add to Home Screen"
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
