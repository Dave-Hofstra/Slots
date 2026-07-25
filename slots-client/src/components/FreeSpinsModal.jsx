import { useGame } from '../context/GameContext';
import { audioManager } from '../services/audioManager';

export default function FreeSpinsModal() {
  const { state, dispatch } = useGame();

  const handleStart = () => {
    // Stop any lingering sounds from the preceding spin (e.g. wild_land)
    audioManager.stopAll();
    dispatch({ type: 'FS_START', count: state.fsModalCount });
    // Trigger wild addition animation immediately after dismissing modal
    dispatch({ type: 'START_WILD_ANIMATION' });
  };

  if (!state.showFsModal) return null;

  return (
    <div id="fs-modal" className="modal-backdrop active">
      <div className="modal-content text-center">
        <div className="text-5xl sm:text-6xl mb-4">🎰</div>
        <h2 className="font-digital text-2xl sm:text-3xl font-bold text-[#facc15] text-glow-gold mb-2">FREE SPINS TRIGGERED!</h2>
        <p className="text-[#94a3b8] text-base sm:text-sm mb-2">
          You won <span className="text-[#c084fc] font-bold">{state.fsModalCount}</span> Free Spins
        </p>
        <p className="text-[#64748b] text-sm mb-1">
          All wins during free spins are multiplied by <span className="text-[#4ade80] font-bold">2x</span>
        </p>
        <p className="text-[#facc15] text-xs sm:text-sm mb-6 font-digital font-bold" style={{ textShadow: '0 0 8px rgba(250,204,21,0.4)' }}>
          ⚡ EXTRA WILDS ADDED TO REELS DURING FREE SPINS
        </p>
        <button id="fs-start-btn" className="btn-spin inline-block px-8 py-3 text-lg" onClick={handleStart}>
          PLAY FREE SPINS
        </button>
      </div>
    </div>
  );
}
