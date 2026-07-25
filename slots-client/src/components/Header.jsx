import { useGame } from '../context/GameContext';
import SoundThemePicker from './SoundThemePicker';
import ShareQrButton from './ShareQrButton';

export default function Header({ setShowShareQr }) {
  const { state, dispatch, updateThemes, persistData } = useGame();
  const themeKeys = Object.keys(state.themes);

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    dispatch({ type: 'SET_THEME', theme: newTheme });
    persistData(state.balance, newTheme);
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 glow-gold" id="header-bar">
      <div className="flex items-center justify-between gap-1 sm:gap-3" id="header-row">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0" id="header-left">
          <h1 className="font-digital text-glow-gold text-xl sm:text-2xl md:text-3xl font-bold tracking-widest text-[#facc15] leading-tight whitespace-nowrap flex-shrink-0">
            SLOTS
          </h1>
          <span className="inline-flex items-center gap-1 flex-shrink-0" title="Select theme">
            <span className="text-[10px] leading-none opacity-60">🎨</span>
            <select
              id="theme-select"
              className="theme-select flex-shrink-0"
              value={state.activeTheme}
              onChange={handleThemeChange}
            >
              {themeKeys.map(key => (
                <option key={key} value={key}>
                  {state.themes[key]?.name || key}
                </option>
              ))}
            </select>
          </span>
          <button
            id="theme-edit-btn"
            className="admin-only text-[#64748b] hover:text-[#facc15] text-xs transition-colors cursor-pointer bg-transparent border-none p-0 leading-none flex-shrink-0"
            title="Edit theme"
            onClick={() => dispatch({ type: 'SHOW_TE_MODAL' })}
          >
            ✏️
          </button>
          <SoundThemePicker />
          <ShareQrButton setShowShareQr={setShowShareQr} />
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" id="header-right">
          <span className="text-[#64748b] text-[10px] sm:text-xs font-digital tracking-wider whitespace-nowrap">BALANCE</span>
          <span id="balance-display" className="text-glow-green font-digital text-lg sm:text-xl md:text-2xl font-bold text-[#4ade80] whitespace-nowrap">
            ${state.balance.toLocaleString('en-US')}
          </span>
        </div>
      </div>
    </div>
  );
}
