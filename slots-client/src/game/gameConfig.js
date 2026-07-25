// ===== SYMBOL CONFIGURATION =====
export const SYMBOLS = {
  J: { id: 'J', display: 'J', color: '#4ade80', type: 'low', payouts: { 3: 1, 4: 5, 5: 25 } },
  Q: { id: 'Q', display: 'Q', color: '#4ade80', type: 'low', payouts: { 3: 1, 4: 5, 5: 25 } },
  K: { id: 'K', display: 'K', color: '#4ade80', type: 'low', payouts: { 3: 1, 4: 5, 5: 25 } },
  A: { id: 'A', display: 'A', color: '#4ade80', type: 'low', payouts: { 3: 1, 4: 5, 5: 25 } },
  club: { id: 'club', display: '🏌️', color: '#00d4ff', type: 'high', payouts: { 3: 3, 4: 12, 5: 75 } },
  ball: { id: 'ball', display: '⚪', color: '#ffffff', type: 'high', payouts: { 3: 3, 4: 12, 5: 75 } },
  heron: { id: 'heron', display: '🦩', color: '#ff6b9d', type: 'high', payouts: { 3: 5, 4: 25, 5: 250 } },
  wild: { id: 'wild', display: '⭐', color: '#ffd700', type: 'wild', payouts: {} },
  scatter: { id: 'scatter', display: '💎', color: '#c084fc', type: 'scatter', payouts: {} },
  bonus: { id: 'bonus', display: '🎰', color: '#ff4444', type: 'bonus', payouts: {} },
};

export const SYMBOL_IDS = Object.keys(SYMBOLS);
export const LOW_IDS = ['J', 'Q', 'K', 'A'];
export const HIGH_IDS = ['club', 'ball', 'heron'];
export const SPECIAL_IDS = ['wild', 'scatter', 'bonus'];

// ===== REEL STRIPS =====
export const REEL_STRIPS = [
  // Col 0
  ['J', 'J', 'scatter', 'K', 'A', 'bonus', 'Q', 'club', 'K', 'A',
    'ball', 'J', 'Q', 'K', 'A', 'wild', 'heron', 'Q', 'K', 'A',
    'J', 'Q', 'wild', 'club', 'A', 'ball', 'scatter', 'bonus', 'J', 'Q'],
  // Col 1
  ['Q', 'Q', 'K', 'A', 'J', 'Q', 'ball', 'K', 'A', 'J',
    'heron', 'Q', 'K', 'club', 'A', 'J', 'Q', 'K', 'K', 'A',
    'ball', 'wild', 'J', 'Q', 'K', 'A', 'heron', 'scatter', 'bonus', 'Q'],
  // Col 2
  ['K', 'K', 'A', 'J', 'Q', 'club', 'ball', 'heron', 'K', 'A',
    'J', 'Q', 'wild', 'K', 'A', 'A', 'bonus', 'J', 'Q', 'club',
    'K', 'A', 'wild', 'ball', 'heron', 'scatter', 'bonus', 'J', 'Q', 'scatter'],
  // Col 3
  ['A', 'A', 'J', 'Q', 'K', 'A', 'ball', 'J', 'Q', 'K',
    'heron', 'A', 'J', 'club', 'Q', 'K', 'A', 'J', 'J', 'Q',
    'ball', 'wild', 'K', 'A', 'J', 'Q', 'heron', 'scatter', 'bonus', 'K'],
  // Col 4
  ['J', 'J', 'Q', 'K', 'A', 'J', 'Q', 'club', 'K', 'A',
    'ball', 'J', 'Q', 'K', 'A', 'wild', 'heron', 'Q', 'K', 'A',
    'bonus', 'Q', 'wild', 'ball', 'A', 'J', 'scatter', 'bonus', 'scatter', 'Q'],
];

// ===== PAYLINES (20) =====
export const PAYLINES = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1],
  [2, 1, 2, 1, 2],
  [1, 2, 1, 2, 1],
  [0, 0, 2, 0, 0],
  [2, 2, 0, 2, 2],
  [0, 2, 2, 2, 0],
  [2, 0, 0, 0, 2],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 2, 1, 0, 0],
];

export const PAYLINE_COLORS = [
  '#facc15', '#4ade80', '#60a5fa', '#f472b6', '#fb923c',
  '#a78bfa', '#34d399', '#f87171', '#22d3ee', '#e879f9',
  '#fbbf24', '#6ee7b7', '#93c5fd', '#f9a8d4', '#fdba74',
  '#c4b5fd', '#86efac', '#fca5a5', '#67e8f9', '#d8b4fe',
];

// ===== BET OPTIONS =====
export const BET_OPTIONS = [10, 25, 50, 100, 250, 500];

// ===== JACKPOT PRIZES (multipliers) =====
export const JACKPOT_PRIZES = { mini: 250, minor: 500, major: 750 };
export const JACKPOT_NAMES = { mini: 'MINI', minor: 'MINOR', major: 'MAJOR' };
export const JACKPOT_COLORS = { mini: '#4ade80', minor: '#60a5fa', major: '#facc15' };

// ===== DEFAULT THEMES =====
export const DEFAULT_THEMES = {
  basic: {
    name: 'Basic',
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
  },
  scuba: {
    name: 'SCUBA',
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
  },
  'herons-glen': {
    name: '🦩 Herons Glen',
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
  },
};

export const SPECIAL_LABELS = { wild: 'WILD', scatter: 'SCATTER', bonus: 'BONUS' };
