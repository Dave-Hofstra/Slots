import { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import ReelCell from './ReelCell';
import PaylinesLegend from './PaylinesLegend';
import WinLines from './WinLines';
import WildAdditionAnimation from './WildAdditionAnimation';
import WinBanner from './WinBanner';

/** In landscape, size the grid so cells are square and as large as possible. */
function useLandscapeGridSizing(gridRef) {
  const sizeGrid = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // Only apply in phone landscape (narrow screens)
    if (window.innerHeight >= window.innerWidth || window.innerWidth >= 1000) {
      // Clear landscape inline styles when returning to portrait or on iPad
      grid.style.width = '';
      grid.style.aspectRatio = '';
      return;
    }

    const header = document.getElementById('header-bar');
    const footer = document.getElementById('control-panel');
    if (!header || !footer) return;

    const headerH = header.offsetHeight;
    const footerH = footer.offsetHeight;
    const gapPx = 2; // matches landscape gap
    const colGaps = gapPx * 4;
    const rowGaps = gapPx * 2;
    const extraPad = 8; // small buffer

    const availW = window.innerWidth - extraPad;
    const availH = window.innerHeight - headerH - footerH - extraPad;

    const cellFromW = (availW - colGaps) / 5;
    const cellFromH = (availH - rowGaps) / 3;
    const cellSize = Math.max(16, Math.min(cellFromW, cellFromH));

    const gridW = cellSize * 5 + colGaps;
    grid.style.width = gridW + 'px';
    grid.style.aspectRatio = '5 / 3';
  }, [gridRef]);

  useEffect(() => {
    // Size immediately after mount
    requestAnimationFrame(sizeGrid);
    // Re-size on orientation/resize
    window.addEventListener('resize', sizeGrid);
    return () => window.removeEventListener('resize', sizeGrid);
  }, [sizeGrid]);
}

export default function ReelGrid({ showDebug }) {
  const { state } = useGame();
  const gridRef = useRef(null);
  useLandscapeGridSizing(gridRef);

  // Compute scatter/bonus order numbers (1st, 2nd, etc.) in visual reading order
  const specialOrder = {};
  let scatterN = 0, bonusN = 0;
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      const s = state.grid[col][row];
      if (s === 'scatter') specialOrder[`${col},${row}`] = { n: ++scatterN };
      if (s === 'bonus') specialOrder[`${col},${row}`] = { n: ++bonusN };
    }
  }

  const cells = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const symId = state.grid[col][row];
      const isAnimating = state.spinningColumns.includes(col);
      const isStopping = state.stoppedColumns.includes(col);
      const isWinning = state.winningCells.includes(`${col},${row}`);
      const isSpecialLanded = state.specialCells.includes(`${col},${row}`);
      cells.push(
        <ReelCell
          key={`${col}-${row}`}
          symId={symId}
          col={col}
          row={row}
          isAnimating={isAnimating}
          isStopping={isStopping}
          isWinning={isWinning}
          isSpecialLanded={isSpecialLanded}
          showDebug={showDebug}
          specialOrder={specialOrder[`${col},${row}`]}
        />
      );
    }
  }

  const containerClass = state.boardShake
    ? 'glass rounded-2xl p-2 sm:p-3 mb-3 sm:mb-4 glow-green relative board-shake'
    : 'glass rounded-2xl p-2 sm:p-3 mb-3 sm:mb-4 glow-green relative';
  const hasPaylines = state.paylineWins && state.paylineWins.length > 0;

  return (
    <div className={`${containerClass}${hasPaylines ? ' has-paylines' : ''}`} id="reel-container">
      {state.freeSpinsRunning && (
        <div className="mb-2 px-1" id="fs-progress-bar-area">
          <div className="flex items-center justify-between text-[10px] font-digital text-[#c084fc] mb-1">
            <span>🎰 FREE SPINS</span>
            <span>
              <span id="fs-progress-count">{state.freeSpinsTotal - state.freeSpinsRemaining}</span> /{' '}
              <span id="fs-total-count">{state.freeSpinsTotal}</span>
            </span>
          </div>
          <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
            <div
              id="fs-progress-bar"
              className="bg-gradient-to-r from-[#c084fc] to-[#facc15] h-full rounded-full transition-all duration-300"
              style={{ width: `${((state.freeSpinsTotal - state.freeSpinsRemaining) / state.freeSpinsTotal) * 100}%` }}
            />
          </div>
        </div>
      )}
      <div id="reel-grid" ref={gridRef} style={{ position: 'relative' }}>
        {cells}
        <WinLines />
        {state.showWildAnimation && <WildAdditionAnimation />}
        {state.winBanner && <WinBanner />}
      </div>
      <PaylinesLegend paylineWins={state.paylineWins} />
    </div>
  );
}
