import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { PAYLINE_COLORS } from '../game/gameConfig';

export default function WinLines() {
  const { state } = useGame();
  const containerRef = useRef(null);

  useEffect(() => {
    // Remove any existing overlays
    document.querySelectorAll('.payline-overlay').forEach(el => el.remove());

    if (!state.paylineWins || state.paylineWins.length === 0) return;

    const reelGrid = document.getElementById('reel-grid');
    if (!reelGrid) return;

    const gridRect = reelGrid.getBoundingClientRect();
    const cells = reelGrid.querySelectorAll('.reel-cell');

    for (const win of state.paylineWins) {
      const color = PAYLINE_COLORS[win.lineIndex % PAYLINE_COLORS.length];
      const pixelPositions = [];

      for (let i = 0; i < win.positions.length; i++) {
        const col = i;
        const row = win.positions[i];
        const cell = cells[row * 5 + col];
        if (!cell) continue;
        const rect = cell.getBoundingClientRect();
        pixelPositions.push({
          x: rect.left - gridRect.left + rect.width / 2,
          y: rect.top - gridRect.top + rect.height / 2,
        });
      }

      if (pixelPositions.length >= 2) {
        const first = pixelPositions[0];
        const last = pixelPositions[pixelPositions.length - 1];

        // Check if all points are on the same row (within 2px tolerance)
        const sameY = pixelPositions.every(p => Math.abs(p.y - first.y) < 2);
        const sameX = pixelPositions.every(p => Math.abs(p.x - first.x) < 2);

        if (sameY) {
          // Horizontal line — single bar spanning all points
          const line = document.createElement('div');
          line.className = 'payline-overlay';
          line.style.cssText = [
            'position:absolute;pointer-events:none;z-index:10;',
            'left:' + first.x + 'px;',
            'top:' + (first.y - 1.5) + 'px;',
            'width:' + (last.x - first.x) + 'px;',
            'height:3px;',
            'background:' + color + ';',
            'border-radius:2px;',
            'box-shadow:0 0 6px ' + color + ';',
            'opacity:0.7;',
          ].join('');
          reelGrid.appendChild(line);
        } else if (sameX) {
          // Vertical line — single bar spanning all points
          const line = document.createElement('div');
          line.className = 'payline-overlay';
          line.style.cssText = [
            'position:absolute;pointer-events:none;z-index:10;',
            'left:' + (first.x - 1.5) + 'px;',
            'top:' + first.y + 'px;',
            'width:3px;',
            'height:' + (last.y - first.y) + 'px;',
            'background:' + color + ';',
            'border-radius:2px;',
            'box-shadow:0 0 6px ' + color + ';',
            'opacity:0.7;',
          ].join('');
          reelGrid.appendChild(line);
        } else {
          // Zigzag — draw a segment between each consecutive pair
          for (let s = 0; s < pixelPositions.length - 1; s++) {
            const p1 = pixelPositions[s];
            const p2 = pixelPositions[s + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const seg = document.createElement('div');
            seg.className = 'payline-overlay';
            seg.style.cssText = [
              'position:absolute;pointer-events:none;z-index:10;',
              'left:' + p1.x + 'px;',
              'top:' + (p1.y - 1.5) + 'px;',
              'width:' + len + 'px;',
              'height:3px;',
              'background:' + color + ';',
              'border-radius:2px;',
              'box-shadow:0 0 6px ' + color + ';',
              'opacity:0.7;',
              'transform-origin:0 50%;',
              'transform:rotate(' + angle + 'deg);',
            ].join('');
            reelGrid.appendChild(seg);
          }
        }

        // Highlight winning cells with gold pulse
        for (const key of pixelPositions) {
          // Gold pulse is handled by the winning CSS class on cells
        }
      }
    }

    return () => {
      document.querySelectorAll('.payline-overlay').forEach(el => el.remove());
    };
  }, [state.paylineWins]);

  return null; // Renders nothing — uses direct DOM manipulation like original
}
