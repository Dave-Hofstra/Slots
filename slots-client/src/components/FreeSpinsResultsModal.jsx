import { useGame } from '../context/GameContext';

export default function FreeSpinsResultsModal() {
  const { state, dispatch } = useGame();

  const handleClose = () => {
    dispatch({ type: 'FS_RESULTS', show: false });
  };

  if (!state.showFsResults) return null;

  return (
    <div id="fs-results-modal" className="modal-backdrop active">
      <div className="modal-content text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="font-digital text-2xl sm:text-3xl font-bold text-[#facc15] text-glow-gold mb-2">FREE SPINS COMPLETE!</h2>
        <div className="text-[#4ade80] font-digital text-3xl sm:text-4xl font-bold mb-2 text-glow-green">
          ${state.freeSpinsTotalWon.toLocaleString('en-US')}
        </div>
        <p className="text-[#94a3b8] text-sm mb-6">Added to your balance</p>
        <button id="fs-close-btn" className="btn-spin inline-block px-8 py-3 text-lg" onClick={handleClose}>
          BACK TO GAME
        </button>
      </div>
    </div>
  );
}
