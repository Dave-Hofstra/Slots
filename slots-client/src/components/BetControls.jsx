import { useGame } from '../context/GameContext';
import { audioManager } from '../services/audioManager';

export default function BetControls() {
  const { state, dispatch, getBet, getTotalBet, persistPlayer } = useGame();
  const bet = getBet();
  const disabled = state.isSpinning || state.freeSpinsRunning;

  const decBet = () => {
    if (disabled || state.betIndex <= 0) {
      audioManager.play('btn_disabled');
      return;
    }
    audioManager.play('bet_change');
    const newIdx = state.betIndex - 1;
    dispatch({ type: 'SET_BET_INDEX', betIndex: newIdx });
  };

  const incBet = () => {
    if (disabled || state.betIndex >= 5) {
      audioManager.play('btn_disabled');
      return;
    }
    audioManager.play('bet_change');
    const newIdx = state.betIndex + 1;
    dispatch({ type: 'SET_BET_INDEX', betIndex: newIdx });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-[#64748b] text-[10px] sm:text-xs font-digital tracking-wider mb-0.5">BET</div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button id="bet-minus" className="btn-bet" disabled={disabled} onClick={decBet} aria-label="Decrease bet">−</button>
        <div id="bet-display" className="font-digital text-[#facc15] text-base sm:text-lg md:text-xl font-bold min-w-[60px] text-center">
          ${bet}
        </div>
        <button id="bet-plus" className="btn-bet" disabled={disabled} onClick={incBet} aria-label="Increase bet">+</button>
      </div>
      <div id="total-bet-display" className="text-[#475569] text-[9px] sm:text-[10px] font-digital mt-0.5">
        TOTAL ${(bet * 20).toLocaleString('en-US')}
      </div>
    </div>
  );
}
