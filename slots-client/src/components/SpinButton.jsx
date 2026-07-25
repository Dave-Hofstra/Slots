import { useGame } from '../context/GameContext';
import { audioManager } from '../services/audioManager';

export default function SpinButton() {
  const { state, doSpin } = useGame();

  let text = 'SPIN';
  if (state.showWildAnimation) {
    text = '⚡ ADDING WILDS...';
  } else if (state.freeSpinsRunning && state.autoSpinCountdown === 0 && !state.isSpinning) {
    const completed = state.freeSpinsTotal - state.freeSpinsRemaining;
    text = `🎰 FREE SPIN (${completed + 1}/${state.freeSpinsTotal})`;
  } else if (state.freeSpinsRunning && state.autoSpinCountdown > 0) {
    const completed = state.freeSpinsTotal - state.freeSpinsRemaining;
    text = `🎰 AUTO (${completed + 1}/${state.freeSpinsTotal})`;
  } else if (state.freeSpinsRunning && state.isSpinning) {
    const completed = state.freeSpinsTotal - state.freeSpinsRemaining;
    text = `🎰 FREE SPIN (${completed + 1}/${state.freeSpinsTotal})`;
  }

  const handleClick = () => {
    if (state.isSpinning || state.showWildAnimation || state.autoSpinCountdown > 0) return;
    audioManager.play('btn_click');
    doSpin();
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' && !e.repeat && !state.isSpinning && !state.showWildAnimation && state.autoSpinCountdown <= 0) {
      e.preventDefault();
      audioManager.play('btn_click');
      doSpin();
    }
  };

  const isDisabled = state.isSpinning || state.showWildAnimation || state.autoSpinCountdown > 0;
  const isAutoActive = state.autoSpinCountdown > 0;

  return (
    <div className="flex flex-col items-end justify-center" style={{ gridColumn: 4 }}>
      <div className="relative w-full btn-spin-wrapper">
        {isAutoActive && (
          <div
            className="btn-spin-progress"
            style={{ animationDuration: `${state.autoSpinCountdown}ms` }}
          />
        )}
        <button
          id="spin-button"
          className={`btn-spin w-full py-2 sm:py-3 text-sm sm:text-base md:text-lg leading-none${isAutoActive ? ' auto-spin-active' : ''}`}
          disabled={isDisabled}
          onClick={handleClick}
        >
          <span className="relative z-10">{text}</span>
        </button>
      </div>
    </div>
  );
}
