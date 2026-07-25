import { useGame } from '../context/GameContext';

export default function PaylinesLegend({ paylineWins }) {
  if (!paylineWins || paylineWins.length === 0) return null;

  const PAYLINE_COLORS = [
    '#facc15', '#4ade80', '#60a5fa', '#f472b6', '#fb923c',
    '#a78bfa', '#34d399', '#f87171', '#22d3ee', '#e879f9',
    '#fbbf24', '#6ee7b7', '#93c5fd', '#f9a8d4', '#fdba74',
    '#c4b5fd', '#86efac', '#fca5a5', '#67e8f9', '#d8b4fe',
  ];

  const total = paylineWins.reduce((s, w) => s + w.winAmount, 0);

  return (
    <div className="flex flex-wrap gap-1 justify-center py-1" id="paylines-legend">
      {paylineWins.map((w, i) => {
        const color = PAYLINE_COLORS[w.lineIndex % PAYLINE_COLORS.length];
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-digital font-bold"
            style={{ background: color + '22', color, border: '1px solid ' + color + '44' }}
          >
            #{w.lineIndex + 1} {w.count}x ${w.winAmount.toLocaleString('en-US')}
          </span>
        );
      })}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-digital font-bold text-[#4ade80] bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.25)] ml-1">
        TOTAL ${total.toLocaleString('en-US')}
      </span>
    </div>
  );
}
