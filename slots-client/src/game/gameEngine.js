import { SYMBOLS, REEL_STRIPS, PAYLINES, BET_OPTIONS } from './gameConfig';

let rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
let randItem = (arr) => arr[rand(0, arr.length - 1)];

export function getBetText(n) {
  return '$' + n.toLocaleString('en-US');
}

export function getRandomSymbolId() {
  const LOW_IDS = ['J', 'Q', 'K', 'A'];
  const HIGH_IDS = ['club', 'ball', 'heron'];
  const SPECIAL_IDS = ['wild', 'scatter', 'bonus'];
  const r = Math.random();
  if (r < 0.45) return randItem(LOW_IDS);
  if (r < 0.70) return randItem(LOW_IDS);
  if (r < 0.90) return randItem(HIGH_IDS);
  return randItem(SPECIAL_IDS);
}

// Generate a full spin result
export function generateSpinResult(forcedGrid) {
  if (forcedGrid) return forcedGrid;
  const grid = [[], [], [], [], []];
  for (let col = 0; col < 5; col++) {
    const strip = REEL_STRIPS[col];
    for (let row = 0; row < 3; row++) {
      grid[col][row] = strip[rand(0, strip.length - 1)];
    }
  }
  return grid;
}

// Generate a spin result with extra wilds added to each column's strip
export function generateWildSpinResult() {
  const grid = [[], [], [], [], []];
  for (let col = 0; col < 5; col++) {
    // Add 4 wilds to each column's strip (20 wilds total)
    const strip = [...REEL_STRIPS[col], 'wild', 'wild', 'wild', 'wild'];
    for (let row = 0; row < 3; row++) {
      grid[col][row] = strip[rand(0, strip.length - 1)];
    }
  }
  return grid;
}

// Check a single payline — returns { symbol, count, positions } or null
function checkLine(grid, line) {
  const symbols = line.map((row, col) => grid[col][row]);
  let baseSymbol = null;
  for (const s of symbols) {
    if (s !== 'wild') { baseSymbol = s; break; }
  }
  if (!baseSymbol || SYMBOLS[baseSymbol].type === 'scatter' || SYMBOLS[baseSymbol].type === 'bonus') return null;
  let count = 0;
  for (const s of symbols) {
    if (s === baseSymbol || s === 'wild') count++;
    else break;
  }
  if (count >= 3) return { symbol: baseSymbol, count, positions: line.slice(0, count) };
  return null;
}

// Count symbol on the board
function countSymbol(grid, symId) {
  let c = 0;
  for (let col = 0; col < 5; col++)
    for (let row = 0; row < 3; row++)
      if (grid[col][row] === symId) c++;
  return c;
}

// Full win calculation — takes grid, single bet amount, and free spin flags
// Returns { paylineWins, scatterCount, bonusCount, totalWin }
// paylineWins entries include: lineIndex, symbol, count, positions, winAmount, line
export function calculateSpinResult(grid, bet, freeSpinsRunning, freeSpinsMultiplier) {
  const results = { paylineWins: [], scatterCount: 0, bonusCount: 0, totalWin: 0 };
  const totalBet = bet * 20;
  let accumulatedMultiplier = 0;

  // Check each payline
  for (let i = 0; i < PAYLINES.length; i++) {
    const result = checkLine(grid, PAYLINES[i]);
    if (result) {
      const sym = SYMBOLS[result.symbol];
      const payout = sym.payouts[result.count] || 0;
      if (payout > 0) {
        let mult = payout;
        if (freeSpinsRunning) mult *= freeSpinsMultiplier;
        accumulatedMultiplier += mult;
        results.paylineWins.push({
          lineIndex: i,
          symbol: result.symbol,
          count: result.count,
          positions: result.positions,
          line: PAYLINES[i],
          winAmount: totalBet * mult,
        });
      }
    }
  }

  results.totalWin = totalBet * accumulatedMultiplier;
  results.scatterCount = countSymbol(grid, 'scatter');
  results.bonusCount = countSymbol(grid, 'bonus');

  // Scatter pays as multiplier of total bet
  if (results.scatterCount >= 3) {
    const scatterPayout = results.scatterCount === 3 ? 3 :
      results.scatterCount === 4 ? 10 : 25;
    const adjusted = scatterPayout * (freeSpinsRunning ? freeSpinsMultiplier : 1);
    results.totalWin += totalBet * adjusted;
  }

  return results;
}

// Find all scatter and bonus positions on the grid
export function findSpecialCells(grid) {
  const cells = [];
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      const s = grid[col][row];
      if (s === 'scatter' || s === 'bonus') {
        cells.push(`${col},${row}`);
      }
    }
  }
  return cells;
}

// Find all winning cell positions
export function findWinningCells(paylineWins) {
  const cells = [];
  for (const win of paylineWins) {
    for (let i = 0; i < win.positions.length; i++) {
      const row = win.positions[i];
      const col = i;
      if (!cells.includes(`${col},${row}`)) cells.push(`${col},${row}`);
    }
  }
  return cells;
}

// Build forced grid for test mode
export function buildForcedGrid(symbolType, count) {
  const LOW_IDS = ['J', 'Q', 'K', 'A'];
  const grid = [[], [], [], [], []];
  for (let col = 0; col < 5; col++)
    for (let row = 0; row < 3; row++)
      grid[col][row] = randItem(LOW_IDS);

  const positions = [[0, 1], [1, 2], [2, 1], [3, 1], [4, 2]];
  for (let i = 0; i < count && i < positions.length; i++) {
    const [col, row] = positions[i];
    grid[col][row] = symbolType;
  }
  return grid;
}

/**
 * Build a forced grid that produces a specific win tier for testing.
 * Big:   > 150× bet  (accMult 8 → ratio 160)
 * Huge:  > 300× bet  (accMult 17 → ratio 340)
 * Mega:  > 450× bet  (accMult 50 → ratio 1000)
 *
 * Paylines used:
 *   payline 0 = [0,0,0,0,0] (top row)
 *   payline 1 = [1,1,1,1,1] (middle row)
 *   payline 2 = [2,2,2,2,2] (bottom row)
 */
export function buildTierTestGrid(tier) {
  const J = 'J';
  const grid = [[], [], [], [], []];
  for (let col = 0; col < 5; col++)
    for (let row = 0; row < 3; row++)
      grid[col][row] = J;

  // Break the bottom row (payline 2) so it never matches 5-of-a-kind
  grid[0][2] = 'K';

  switch (tier) {
    case 'big':
      // Row 0: heron×3 @ cols 0-2 → payline 0 gets 5 mult
      // Row 1: club×3 @ cols 0-2 → payline 1 gets 3 mult
      // Total 8 mult → ratio 160
      grid[0][0] = 'heron'; grid[1][0] = 'heron'; grid[2][0] = 'heron';
      grid[0][1] = 'club';  grid[1][1] = 'club';  grid[2][1] = 'club';
      break;
    case 'huge':
      // Row 0: heron×3 @ cols 0-2 → payline 0 gets 5 mult
      // Row 1: club×4 @ cols 0-3 → payline 1 gets 12 mult
      // Total 17 mult → ratio 340
      grid[0][0] = 'heron'; grid[1][0] = 'heron'; grid[2][0] = 'heron';
      grid[0][1] = 'club';  grid[1][1] = 'club';  grid[2][1] = 'club'; grid[3][1] = 'club';
      break;
    case 'mega':
      // Row 0: heron×4 @ cols 0-3 → payline 0 gets 25 mult
      // Row 1: heron×4 @ cols 0-3 → payline 1 gets 25 mult
      // Total 50 mult → ratio 1000
      grid[0][0] = 'heron'; grid[1][0] = 'heron'; grid[2][0] = 'heron'; grid[3][0] = 'heron';
      grid[0][1] = 'heron'; grid[1][1] = 'heron'; grid[2][1] = 'heron'; grid[3][1] = 'heron';
      break;
  }
  return grid;
}

// Check if a column in the grid has any scatter or bonus
export function columnHasSpecial(grid, col) {
  for (let row = 0; row < 3; row++) {
    const s = grid[col][row];
    if (s === 'scatter' || s === 'bonus') return true;
  }
  return false;
}
