import { useState, useEffect, useRef, memo } from 'react';
import { useGame } from '../context/GameContext';
import { SPECIAL_LABELS } from '../game/gameConfig';
import { getRandomSymbolId } from '../game/gameEngine';

function ReelCell({ symId, col, row, isAnimating, isStopping, isWinning, isSpecialLanded, showDebug, specialOrder }) {
  const { getThemeDisplay } = useGame();
  const info = getThemeDisplay(symId);
  const isSpecial = symId === 'wild' || symId === 'scatter' || symId === 'bonus';
  const hasImage = !!info.imagePath;
  const [animDisplay, setAnimDisplay] = useState(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (isAnimating) {
      animRef.current = setInterval(() => {
        setAnimDisplay(getRandomSymbolId());
      }, 60);
    } else {
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
      setAnimDisplay(null);
    }
    return () => {
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
    };
  }, [isAnimating]);

  const showAnim = isAnimating && animDisplay;
  const displayInfo = showAnim ? getThemeDisplay(animDisplay) : info;
  const displaySymId = showAnim ? animDisplay : symId;
  const displayIsSpecial = displaySymId === 'wild' || displaySymId === 'scatter' || displaySymId === 'bonus';
  const displayHasImage = !!displayInfo.imagePath;

  // Compute display label — append #N for scatter/bonus ordering
  const displaySpecialLabel = (() => {
    if (!displayIsSpecial) return null;
    const base = SPECIAL_LABELS[displaySymId] || displaySymId.toUpperCase();
    if (specialOrder && specialOrder.n > 0) {
      return <>{base} <span className="special-hash">#</span>{specialOrder.n}</>;
    }
    return base;
  })();

  let className = 'reel-cell';
  if (isAnimating) className += ' animating';
  if (isStopping) className += ' stopping';
  if (isWinning) className += ' winning';
  if (isSpecialLanded) className += ' special-landed';
  if (displayIsSpecial && displayHasImage) className += ' has-special';

  return (
    <div className={className} data-col={col} data-row={row} data-symbol={symId}>
      {displayHasImage ? (
        <div className="symbol-wrapper">
          <img className="symbol-img" src={displayInfo.imagePath} alt={displaySymId} draggable={false} />
          {displayIsSpecial && (
            <div className="cell-special-label">
              {displaySpecialLabel}
            </div>
          )}
        </div>
      ) : (
        <span className="symbol-label" style={{ color: displayInfo.color }}>
          {displayInfo.display}
        </span>
      )}
      {showDebug && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          fontSize: '7px', color: '#fff', opacity: 0.7,
          textAlign: 'center', lineHeight: 1, fontFamily: 'monospace',
          zIndex: 1, pointerEvents: 'none',
          background: 'rgba(0,0,0,0.5)', borderRadius: '0 0 10px 10px',
        }}>
          {symId}
        </div>
      )}
    </div>
  );
}

// Memoize so stopped cells don't re-render when spinning cells cycle
export default memo(ReelCell);
