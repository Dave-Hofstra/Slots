import { useGame } from '../context/GameContext';

export default function TestPanel({ showDebug, setShowDebug }) {
  const { state, dispatch, doSpin, setForcedGrid, setTierTestGrid, updateThemes } = useGame();

  if (!state.adminMode) return null;

  const testSpin = (symbolType, count) => {
    if (state.isSpinning) return;
    setForcedGrid(symbolType, count);
    doSpin();
  };

  const testWinTier = (tier) => {
    if (state.isSpinning) return;
    setTierTestGrid(tier);
    doSpin();
  };

  return (
    <div id="test-panel" className="glass rounded-lg p-3 mt-3 flex flex-col gap-2">
      <div className="text-[#64748b] text-[10px] font-digital tracking-wider text-center uppercase">Admin</div>
      <div className="test-btns">
        <button className="test-btn" onClick={() => testSpin('scatter', 2)}>2 Scatters</button>
        <button className="test-btn" onClick={() => testSpin('bonus', 2)}>2 Bonus</button>
        <button className="test-btn" onClick={() => testSpin('scatter', 3)}>3 Scatters</button>
        <button className="test-btn" onClick={() => testSpin('bonus', 3)}>3 Bonus</button>
      </div>
      <div className="test-btns border-t border-[rgba(250,204,21,0.12)] pt-2 mt-1">
        <button
          className="test-btn text-[#4ade80] border-[rgba(74,222,128,0.3)]"
          onClick={() => testWinTier('big')}
        >
          🟢 BIG WIN
        </button>
        <button
          className="test-btn text-[#facc15] border-[rgba(250,204,21,0.3)]"
          onClick={() => testWinTier('huge')}
        >
          🟡 HUGE WIN
        </button>
        <button
          className="test-btn text-[#ef4444] border-[rgba(239,68,68,0.3)]"
          onClick={() => testWinTier('mega')}
        >
          🔴 MEGA WIN
        </button>
      </div>
      <div className="flex justify-center mt-1">
        <button
          id="new-theme-btn"
          className="test-btn"
          title="Create a new theme"
          onClick={async () => {
            const name = prompt('New theme name:');
            if (!name?.trim()) return;
            const key = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            if (!key || state.themes[key]) {
              alert('Theme "' + key + '" already exists or invalid name.');
              return;
            }
            const newThemes = JSON.parse(JSON.stringify(state.themes));
            newThemes[key] = {
              name: name.trim(),
              symbols: {
                J: { display: 'J', color: '#4ade80' },
                Q: { display: 'Q', color: '#4ade80' },
                K: { display: 'K', color: '#4ade80' },
                A: { display: 'A', color: '#4ade80' },
                club: { display: '🏌️', color: '#00d4ff' },
                ball: { display: '⚪', color: '#ffffff' },
                heron: { display: '🦩', color: '#ff6b9d' },
                wild: { display: '⭐', color: '#ffd700' },
                scatter: { display: '💎', color: '#c084fc' },
                bonus: { display: '🎰', color: '#ff4444' },
              },
            };
            await updateThemes(newThemes);
            dispatch({ type: 'SET_THEME', theme: key });
          }}
        >
          + New Theme
        </button>
      </div>
      <div className="flex justify-center mt-1">
        <button className="test-btn" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? '🛠 Debug: ON' : '🛠 Debug: OFF'}
        </button>
      </div>
    </div>
  );
}
