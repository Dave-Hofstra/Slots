import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const PLAYERS_KEY = 'herons-slots-players';

function loadPlayerData() {
  try { return JSON.parse(localStorage.getItem(PLAYERS_KEY)) || {}; } catch (e) { return {}; }
}

export default function LeaderboardModal({ show, onClose }) {
  const { state } = useGame();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!show) return;
    const data = loadPlayerData();
    const list = Object.entries(data)
      .filter(([, p]) => p.balance != null)
      .map(([name, p]) => ({
        name,
        balance: p.balance || 0,
        weeklyNet: p.weeklyNet || 0,
      }))
      .sort((a, b) => b.balance - a.balance);
    setPlayers(list);
  }, [show, state.balance]);

  if (!show) return null;

  return (
    <div
      id="leaderboard-modal"
      className="modal-backdrop active"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content text-center" style={{ maxWidth: '460px', padding: '24px 20px' }}>
        <div className="flex items-center justify-between mb-4">
          <div />
          <h2 className="font-digital text-xl sm:text-2xl font-bold text-[#facc15] text-glow-gold">
            🏆 LEADERBOARD
          </h2>
          <button
            className="text-[#64748b] hover:text-[#facc15] text-lg cursor-pointer bg-transparent border-none transition-colors leading-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
          {/* Header row */}
          <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-digital text-[#64748b] tracking-wider uppercase">
            <span className="w-8 text-center">#</span>
            <span className="flex-1 text-left">Player</span>
            <span className="w-28 text-right">Balance</span>
            <span className="w-24 text-right">This Week</span>
          </div>

          {players.map((player, i) => {
            const isMe = player.name === state.currentPlayer;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            const weeklyColor = player.weeklyNet >= 0 ? '#4ade80' : '#ef4444';
            const weeklySign = player.weeklyNet >= 0 ? '+' : '';
            return (
              <div
                key={player.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isMe ? 'bg-[rgba(250,204,21,0.10)] border border-[rgba(250,204,21,0.20)]' : 'hover:bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                <span className="w-8 text-center text-base">{medal || `#${i + 1}`}</span>
                <span className={`flex-1 text-left font-semibold truncate ${isMe ? 'text-[#facc15]' : 'text-[#e2e8f0]'}`}>
                  {player.name}
                  {isMe && <span className="text-[10px] text-[#facc15] ml-1 opacity-60">(you)</span>}
                </span>
                <span className="w-28 text-right font-digital font-bold text-[#4ade80] text-sm">
                  ${player.balance.toLocaleString('en-US')}
                </span>
                <span className="w-24 text-right font-digital font-bold text-sm" style={{ color: weeklyColor }}>
                  {weeklySign}${player.weeklyNet.toLocaleString('en-US')}
                </span>
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="text-[#64748b] text-sm py-8">No players yet</div>
          )}
        </div>

        <div className="text-[#475569] text-[9px] font-digital text-center mt-3">
          Weekly net resets every Monday
        </div>
      </div>
    </div>
  );
}
