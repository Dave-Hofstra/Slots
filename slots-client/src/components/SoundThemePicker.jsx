import { useGame } from '../context/GameContext';
import { SOUND_THEMES } from '../game/soundThemes';

export default function SoundThemePicker() {
  const { state, changeSoundTheme } = useGame();
  const keys = Object.keys(SOUND_THEMES);

  return (
    <span className="inline-flex items-center gap-1 flex-shrink-0" title="Sound theme">
      <span className="text-[10px] leading-none opacity-60">🔈</span>
      <select
        id="sound-theme-select"
        className="theme-select"
        value={state.soundTheme}
        onChange={e => changeSoundTheme(e.target.value)}
      >
        {keys.map(key => (
          <option key={key} value={key}>
            {SOUND_THEMES[key].name}
          </option>
        ))}
      </select>
    </span>
  );
}
