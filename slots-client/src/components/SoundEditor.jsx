import { useState } from 'react';
import { SOUND_ASSETS, SOUND_THEMES } from '../game/soundThemes';
import { audioManager } from '../services/audioManager';

const SOUND_LABELS = {
  reel_spin: 'Reel Spin', reel_stop: 'Reel Stop', reel_slow: 'Reel Slow',
  win_small: 'Win Small', win_medium: 'Win Medium', win_big: 'Win Big',
  win_huge: 'Win Huge', win_mega: 'Win Mega', win_jingle: 'Win Jingle',
  win_big_voice: 'Big Win Voice', win_huge_voice: 'Huge Win Voice',
  win_mega_voice: 'Mega Win Voice',
  btn_click: 'Button Click', btn_disabled: 'Button Disabled',
  bet_change: 'Bet Change', toggle_on: 'Toggle On', toggle_off: 'Toggle Off',
  wild_land: 'Wild Land', scatter_land: 'Scatter Land', bonus_land: 'Bonus Land',
  fs_trigger: 'FS Trigger', fs_bg_loop: 'FS Bg Loop',
  fs_retrigger: 'FS Retrigger', fs_end: 'FS End',
  jp_card_flip: 'JP Card Flip', jp_card_reveal: 'JP Card Reveal',
  jp_win: 'JP Win', jp_count: 'JP Count',
  bg_ambient: 'Bg Ambient', spin_idle: 'Spin Idle',
};

export default function SoundEditor() {
  const [playing, setPlaying] = useState(null);
  const [muted, setMuted] = useState(new Set(audioManager.muted));

  const toggleMute = (name) => {
    if (muted.has(name)) {
      audioManager.unmute(name);
      muted.delete(name);
    } else {
      audioManager.mute(name);
      muted.add(name);
    }
    setMuted(new Set(muted));
  };

  const playSound = async (name) => {
    await audioManager.init();
    // Stop any currently playing test sound
    if (playing) audioManager.stop(playing);
    const id = audioManager.play(name);
    if (id) setPlaying(id);
  };

  return (
    <div className="sound-editor glass rounded-lg p-3 mt-3">
      <div className="text-[#64748b] text-[10px] font-digital tracking-wider text-center uppercase mb-2">
        Sound Editor
      </div>
      <div className="sound-editor-grid">
        {SOUND_ASSETS.map(name => {
          const isMuted = muted.has(name);
          const isActive = name === 'reel_spin' && audioManager.theme === 'chatgpt';
          return (
            <div key={name} className={`sound-editor-row ${isActive ? 'opacity-30' : ''}`}>
              <button
                className="sound-editor-play"
                title={`Play "${SOUND_LABELS[name] || name}"`}
                onClick={() => playSound(name)}
                disabled={isActive}
              >
                ▶
              </button>
              <span className="sound-editor-name">{SOUND_LABELS[name] || name}</span>
              <span className="sound-editor-id">{name}</span>
              <button
                className={`sound-editor-mute ${isMuted ? 'muted' : ''}`}
                title={isMuted ? `Unmute "${SOUND_LABELS[name] || name}"` : `Mute "${SOUND_LABELS[name] || name}"`}
                onClick={() => toggleMute(name)}
                disabled={isActive}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="text-[#475569] text-[9px] font-digital text-center mt-2">
        Muted sounds are stored in localStorage and apply to all players on this device
      </div>
    </div>
  );
}
