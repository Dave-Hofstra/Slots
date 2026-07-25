import { useGame } from '../context/GameContext';

const BANNER_STYLES = {
  mega: {
    label: 'MEGA WIN',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #facc15 30%, #ef4444 60%, #dc2626 100%)',
    shadow: 'rgba(239,68,68,0.9), 0 0 100px rgba(220,38,38,0.5)',
  },
  huge: {
    label: 'HUGE WIN',
    gradient: 'linear-gradient(135deg, #facc15 0%, #ef4444 50%, #facc15 100%)',
    shadow: 'rgba(250,204,21,0.8), 0 0 80px rgba(239,68,68,0.4)',
  },
  big: {
    label: 'BIG WIN',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #facc15 50%, #4ade80 100%)',
    shadow: 'rgba(74,222,128,0.6), 0 0 60px rgba(250,204,21,0.3)',
  },
};

export default function WinBanner() {
  const { state } = useGame();

  if (!state.winBanner || !BANNER_STYLES[state.winBanner]) return null;

  const style = BANNER_STYLES[state.winBanner];

  return (
    <div id="win-banner" className="win-banner-overlay">
      <div
        className="win-banner-text"
        style={{
          background: style.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 0 40px ${style.shadow}`,
        }}
      >
        {style.label}
      </div>
    </div>
  );
}
