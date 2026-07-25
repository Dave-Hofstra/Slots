import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const TOTAL_WILDS = 20;
const SHOW_INTERVAL = 150; // ms between each wild appearing

/** Generate random positions within the reel grid area */
function generatePositions(count) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    // Scatter randomly across the 5x3 grid area
    const col = Math.random() * 5;
    const row = Math.random() * 3;
    // Add some random offset within each cell
    const xOffset = (Math.random() - 0.5) * 60;
    const yOffset = (Math.random() - 0.5) * 60;
    positions.push({ col, row, xOffset, yOffset });
  }
  return positions;
}

export default function WildAdditionAnimation() {
  const { getThemeDisplay, dispatch } = useGame();
  const wildInfo = getThemeDisplay('wild');
  const wildImage = wildInfo?.imagePath;
  const [visibleWilds, setVisibleWilds] = useState([]);
  const positions = useRef(generatePositions(TOTAL_WILDS));
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Show wilds one at a time, immediately on mount
    timerRef.current = setInterval(() => {
      const i = indexRef.current;
      if (i >= TOTAL_WILDS) {
        clearInterval(timerRef.current);
        // Let the last card's animation finish, then end
        setTimeout(() => {
          dispatch({ type: 'END_WILD_ANIMATION' });
        }, 700);
        return;
      }
      setVisibleWilds(prev => [...prev, {
        id: i,
        pos: positions.current[i],
      }]);
      indexRef.current = i + 1;
    }, SHOW_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dispatch]);

  return (
    <div className="wild-animation-overlay">
      {/* Banner text — shows immediately */}
      <div className="wild-animation-banner">
        ⚡ EXTRA WILDS BEING ADDED...
      </div>

      {/* Animated wild cards */}
      {visibleWilds.map(w => (
        <div
          key={w.id}
          className="wild-card-falling"
          style={{
            '--wild-x': `${(w.pos.col / 5) * 100}%`,
            '--wild-y': `${(w.pos.row / 3) * 100}%`,
            '--wild-offset-x': `${w.pos.xOffset}px`,
            '--wild-offset-y': `${w.pos.yOffset}px`,
          }}
        >
          {wildImage ? (
            <img src={wildImage} alt="WILD" className="wild-card-img" draggable={false} />
          ) : (
            <span className="wild-card-label">🃏</span>
          )}
        </div>
      ))}
    </div>
  );
}
