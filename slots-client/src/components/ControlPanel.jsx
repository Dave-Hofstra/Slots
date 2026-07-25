import { useGame } from '../context/GameContext';
import BetControls from './BetControls';
import SpinButton from './SpinButton';

export default function ControlPanel() {
  const { state } = useGame();

  return (
    <div className="glass-strong rounded-lg p-3 sm:p-4" id="control-panel">
      <div className="grid grid-cols-4 gap-2 sm:gap-3 items-center" id="control-grid">
        <BetControls />

        <div className="flex flex-col items-center justify-center">
          <div className="text-[#64748b] text-[10px] sm:text-xs font-digital tracking-wider mb-0.5">WIN</div>
          <div id="win-display" className="font-digital text-[#4ade80] text-base sm:text-lg md:text-2xl font-bold min-h-[28px] flex items-center text-glow-green">
            ${state.win.toLocaleString('en-US')}
          </div>
        </div>

        {state.freeSpinsRunning && (
          <div id="fs-win-col" className="flex flex-col items-center justify-center">
            <div className="text-[#c084fc] text-[10px] sm:text-xs font-digital tracking-wider mb-0.5">WIN TOTAL</div>
            <div id="fs-total-win-display" className="font-digital text-[#c084fc] text-base sm:text-lg md:text-xl font-bold min-h-[28px] flex items-center">
              ${state.freeSpinsTotalWon.toLocaleString('en-US')}
            </div>
          </div>
        )}

        <SpinButton />
      </div>

      {state.freeSpinsRunning && (
        <div id="free-spins-indicator" className="mt-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(192,132,252,0.12)] border border-[rgba(192,132,252,0.25)]">
            <span className="text-[#c084fc] text-xs font-digital">🎰 FREE SPINS</span>
            <span id="fs-count" className="text-[#c084fc] font-digital font-bold text-sm">{state.freeSpinsRemaining}</span>
            <span className="text-[#c084fc] text-xs font-digital">×2</span>
          </div>
        </div>
      )}
    </div>
  );
}
