/**
 * Sound theme definitions for Slots.
 */
export const SOUND_THEMES = {
  none: {
    name: 'No Audio',
    dir: null,
    description: 'Silence — no sounds play',
  },
  chatgpt: {
    name: 'ChatGpt',
    dir: 'chatgpt',
    description: 'Original AI-generated sound pack',
  },
  elevenlabs: {
    name: 'ElevenLabs',
    dir: 'elevenlabs', // /Slots/audio/elevenlabs/
    description: 'ElevenLabs sound effects',
  },
};

export const SOUND_THEME_KEYS = Object.keys(SOUND_THEMES);
export const DEFAULT_SOUND_THEME = 'elevenlabs';

/** All sound asset names shared across themes */
export const SOUND_ASSETS = [
  'reel_spin', 'reel_stop', 'reel_slow',
  'win_small', 'win_medium', 'win_big', 'win_huge', 'win_mega', 'win_jingle',
  'win_big_voice', 'win_huge_voice', 'win_mega_voice',
  'btn_click', 'btn_disabled', 'bet_change', 'toggle_on', 'toggle_off',
  'wild_land', 'scatter_land', 'bonus_land',
  'fs_trigger', 'fs_bg_loop', 'fs_retrigger', 'fs_end',
  'jp_card_flip', 'jp_card_reveal', 'jp_win', 'jp_count',
  'bg_ambient', 'spin_idle',
];
