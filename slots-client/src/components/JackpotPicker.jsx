import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { JACKPOT_PRIZES, JACKPOT_NAMES, JACKPOT_COLORS } from '../game/gameConfig';
import { audioManager } from '../services/audioManager';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MULT_TYPES = ['mult5', 'mult10', 'mult20'];
const MULT_DISPLAY = { mult5: '+25%', mult10: '+50%', mult20: '+75%' };
const MULT_COLORS = { mult5: '#fbbf24', mult10: '#fb923c', mult20: '#ef4444' };
const MULT_VALUES = { mult5: 0.25, mult10: 0.50, mult20: 0.75 };

export default function JackpotPicker() {
  const { state, dispatch, getBet, jpModalResolveRef } = useGame();
  const [jpCounts, setJpCounts] = useState({ mini: 0, minor: 0, major: 0 });
  const [jpCards, setJpCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [prizeAmount, setPrizeAmount] = useState(0);
  const [multBoost, setMultBoost] = useState(0);
  const jpCountRef = useRef(null);

  // Reset game state every time the modal opens
  useEffect(() => {
    if (state.showJpModal) {
      // 12 cards: 3 of each jackpot type + 3 multiplier cards
      const types = shuffle([
        'mini', 'mini', 'mini',
        'minor', 'minor', 'minor',
        'major', 'major', 'major',
        'mult5', 'mult10', 'mult20',
      ]);
      setJpCards(types.map((t, i) => ({ index: i, type: t, revealed: false, faded: false })));
      setJpCounts({ mini: 0, minor: 0, major: 0 });
      setGameOver(false);
      setWinner(null);
      setPrizeAmount(0);
      setMultBoost(0);
      if (jpCountRef.current) { audioManager.stop(jpCountRef.current); jpCountRef.current = null; }
    }
  }, [state.showJpModal]);

  const handleReveal = (index) => {
    if (gameOver) return;
    audioManager.play('jp_card_flip');
    setJpCards(prev => {
      const card = prev[index];
      if (card.revealed) return prev;
      const updated = prev.map((c, i) => i === index ? { ...c, revealed: true } : c);

      // Handle multiplier cards — add to boost, no jackpot progression
      if (MULT_TYPES.includes(card.type)) {
        setMultBoost(prev => prev + MULT_VALUES[card.type]);
        return updated;
      }

      // Handle jackpot cards — count towards 3-of-a-kind
      const newCounts = { ...jpCounts };
      newCounts[card.type]++;
      setJpCounts(newCounts);

      // Check win
      for (const t of ['mini', 'minor', 'major']) {
        if (newCounts[t] >= 3) {
          setGameOver(true);
          setWinner(t);
          const bet = getBet();
          let amount = bet * JACKPOT_PRIZES[t];
          // Calculate multiplier boost from all revealed cards
          let actualBoost = 0;
          for (const c of updated) {
            if (c.revealed && MULT_TYPES.includes(c.type)) {
              actualBoost += MULT_VALUES[c.type];
            }
          }
          amount = Math.floor(amount * (1 + actualBoost));
          setPrizeAmount(amount);
          audioManager.play('jp_card_reveal');
          jpCountRef.current = audioManager.play('jp_count', { loop: true, volume: 0.4 });

          // Update balance (or free spins total if in free spins mode)
          if (state.freeSpinsRunning) {
            dispatch({ type: 'FS_ADD_WIN', amount });
          } else {
            dispatch({ type: 'SET_BALANCE', balance: state.balance + amount });
          }

          // Grey out remaining
          return updated.map(c => c.revealed ? c : { ...c, revealed: true, faded: true });
        }
      }

      return updated;
    });
  };

  const handleClose = () => {
    if (jpCountRef.current) { audioManager.stop(jpCountRef.current); jpCountRef.current = null; }
    dispatch({ type: 'HIDE_JP_MODAL' });
    // Signal doSpin() that JP modal closed (for free spins auto-spin waiting)
    if (jpModalResolveRef.current) {
      jpModalResolveRef.current();
      jpModalResolveRef.current = null;
    }
  };

  if (!state.showJpModal) return null;

  return (
    <div id="jp-modal" className="modal-backdrop active" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content text-center" style={{ maxWidth: '520px' }}>
        <div className="text-4xl sm:text-5xl mb-3">💎</div>
        <h2 className="font-digital text-xl sm:text-2xl font-bold text-[#facc15] text-glow-gold mb-1">JACKPOT PICKER</h2>
        <p className="text-[#94a3b8] text-xs sm:text-sm mb-4">Pick cards to reveal jackpots or multiplier boosts! First to 3 wins!</p>

        <div className="flex justify-center gap-4 sm:gap-6 mb-4">
          <div className="text-center">
            <div className="text-[#4ade80] font-digital text-xs tracking-wider">MINI</div>
            <div className="text-[#4ade80] font-digital font-bold text-lg">{jpCounts.mini}/3</div>
            <div className="text-[#4ade80] font-digital text-xs font-bold">250x</div>
          </div>
          <div className="text-center">
            <div className="text-[#60a5fa] font-digital text-xs tracking-wider">MINOR</div>
            <div className="text-[#60a5fa] font-digital font-bold text-lg">{jpCounts.minor}/3</div>
            <div className="text-[#60a5fa] font-digital text-xs font-bold">500x</div>
          </div>
          <div className="text-center">
            <div className="text-[#facc15] font-digital text-xs tracking-wider">MAJOR</div>
            <div className="text-[#facc15] font-digital font-bold text-lg">{jpCounts.major}/3</div>
            <div className="text-[#facc15] font-digital text-xs font-bold">750x</div>
          </div>
          {multBoost > 0 && (
            <div className="text-center">
              <div className="text-[#fb923c] font-digital text-xs tracking-wider">BOOST</div>
              <div className="text-[#fb923c] font-digital font-bold text-lg">+{(multBoost * 100).toFixed(0)}%</div>
            </div>
          )}
        </div>

        <div id="jp-grid" className="grid grid-cols-4 gap-2 sm:gap-3 max-w-[400px] mx-auto mb-4">
          {jpCards.map((card) => (
            <div
              key={card.index}
              className={`jp-card ${card.revealed ? 'revealed ' + card.type : ''} ${MULT_TYPES.includes(card.type) && !card.revealed ? 'jp-card-mult' : ''}`}
              onClick={() => handleReveal(card.index)}
              style={card.faded ? { opacity: 0.3, cursor: 'default' } : {}}
            >
              <span className="jp-label">
                {card.revealed
                  ? MULT_TYPES.includes(card.type)
                    ? <span style={{ color: MULT_COLORS[card.type], fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{MULT_DISPLAY[card.type]}</span>
                    : JACKPOT_NAMES[card.type]
                  : <span className="jp-question">?</span>
                }
              </span>
            </div>
          ))}
        </div>

        {gameOver && (
          <div id="jp-result">
            <div
              className="font-digital text-xl sm:text-2xl font-bold text-glow-gold mb-2"
              id="jp-result-text"
              style={{ color: JACKPOT_COLORS[winner] }}
            >
              🎉 {JACKPOT_NAMES[winner]} JACKPOT!
            </div>
            {multBoost > 0 && (
              <div className="font-digital text-sm text-[#fb923c] mb-1">
                Multiplier Boost: +{(multBoost * 100).toFixed(0)}%
              </div>
            )}
            <div
              className="font-digital text-lg font-bold mb-3"
              id="jp-result-amount"
              style={{ color: JACKPOT_COLORS[winner] }}
            >
              ${prizeAmount.toLocaleString('en-US')}
            </div>
            <button id="jp-close-btn" className="btn-spin inline-block px-8 py-3 text-lg" onClick={handleClose}>
              COLLECT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
