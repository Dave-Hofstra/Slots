import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { audioManager } from '../services/audioManager';

const PLAYERS_KEY = 'herons-slots-players';
const LAST_PLAYER_KEY = 'herons-slots-last-player';

function loadPlayerData() {
  try { return JSON.parse(localStorage.getItem(PLAYERS_KEY)) || {}; } catch (e) { return {}; }
}

export default function NameScreen() {
  const { state, dispatch, persistPlayer } = useGame();
  const [visible, setVisible] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [existingPlayers, setExistingPlayers] = useState([]);

  useEffect(() => {
    setExistingPlayers(getPlayerNames());
    const last = getLastPlayer();
    if (last) {
      setPlayerName(last);
    } else {
      setPlayerName('Guest');
    }
  }, []);

  function getPlayerNames() {
    const names = Object.keys(loadPlayerData()).sort();
    if (!names.includes('Guest')) {
      return ['Guest', ...names];
    }
    return names;
  }
  function getLastPlayer() {
    try { return localStorage.getItem(LAST_PLAYER_KEY); } catch (e) { return null; }
  }
  function getPlayerBalance(name) {
    if (name === 'Guest') return 10000;
    const data = loadPlayerData();
    return (data[name] && data[name].balance != null) ? data[name].balance : 10000;
  }
  function getPlayerTheme(name) {
    if (name === 'Guest') return 'scuba';
    const data = loadPlayerData();
    return (data[name] && data[name].theme) ? data[name].theme : 'scuba';
  }

  const handleContinue = () => {
    const name = playerName.trim();
    if (!name) return;
    // Initialize audio engine on user gesture
    audioManager.init();
    // New players get the URL theme hint; returning players keep their saved theme
    const savedData = loadPlayerData()[name];
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme');
    const theme = (savedData?.theme) ? savedData.theme : (urlTheme || getPlayerTheme(name));
    dispatch({
      type: 'SET_PLAYER',
      player: name,
      balance: getPlayerBalance(name),
      theme,
    });
    try { localStorage.setItem(LAST_PLAYER_KEY, name); } catch (e) {}
    setVisible(false);
  };

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val) setPlayerName(val);
  };

  if (!visible) return null;

  return (
    <div id="name-overlay" className="name-overlay">
      <div className="name-card">
        <h1>SLOTS</h1>
        <div className="sub">Slot Machine Casino</div>
        <p>Enter your name or select an existing player to save your balance and progress across devices.</p>
        <div className="player-picker">
          <label htmlFor="playerName">Player Name:</label>
          <input
            type="text"
            id="playerName"
            placeholder="Enter your name..."
            maxLength={20}
            value={playerName}
            onChange={e => { setPlayerName(e.target.value); }}
          />
          <label htmlFor="existingPlayers">Or choose existing:</label>
          <select id="existingPlayers" value="" onChange={handleSelect}>
            <option value="">-- Select --</option>
            {existingPlayers.map(n => (
              <option key={n} value={n}>{n} (${getPlayerBalance(n).toLocaleString('en-US')})</option>
            ))}
          </select>
        </div>
        <button className="btn-spin" id="nameConfirmBtn" onClick={handleContinue}>
          🎰 CONTINUE TO SLOTS
        </button>
      </div>
    </div>
  );
}
