import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { BET_OPTIONS } from '../game/gameConfig';
import {
  generateSpinResult, calculateSpinResult, findSpecialCells, findWinningCells,
  buildForcedGrid, buildTierTestGrid, columnHasSpecial, generateWildSpinResult
} from '../game/gameEngine';
import { loadThemes, saveThemes, syncThemesFromServer, getThemeInfo } from '../game/themes';
import { fetchPlayersFromServer, savePlayersToServer } from '../services/api';
import { audioManager } from '../services/audioManager';
import { DEFAULT_SOUND_THEME, SOUND_THEMES } from '../game/soundThemes';

const PLAYERS_KEY = 'herons-slots-players';
const LAST_PLAYER_KEY = 'herons-slots-last-player';

function loadPlayerData() {
  try { return JSON.parse(localStorage.getItem(PLAYERS_KEY)) || {}; } catch (e) { return {}; }
}
function savePlayerData(data) {
  try { localStorage.setItem(PLAYERS_KEY, JSON.stringify(data)); } catch (e) {}
  savePlayersToServer(data).catch(() => {});
}

function createInitialGrid() {
  const grid = [[], [], [], [], []];
  const low = ['J', 'Q', 'K', 'A'];
  for (let col = 0; col < 5; col++)
    for (let row = 0; row < 3; row++)
      grid[col][row] = low[(col + row) % low.length];
  return grid;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const initialState = {
  balance: 10000,
  betIndex: 3,
  win: 0,
  isSpinning: false,
  spinningColumns: [],
  stoppedColumns: [],
  boardShake: false,
  specialCells: [],
  activeTheme: 'scuba',
  adminMode: false,
  grid: createInitialGrid(),
  freeSpinsRemaining: 0,
  freeSpinsTotal: 0,
  freeSpinsMultiplier: 1,
  freeSpinsTotalWon: 0,
  freeSpinsRunning: false,
  currentPlayer: '',
  themes: loadThemes(),
  paylineWins: [],
  winningCells: [],
  showFsModal: false,
  showFsResults: false,
  fsModalCount: 0,
  showJpModal: false,
  showTeModal: false,
  soundTheme: DEFAULT_SOUND_THEME,
  showWildAnimation: false,
  wildAnimationDone: false,
  autoSpinCountdown: 0,
  winBanner: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_BALANCE': return { ...state, balance: action.balance };
    case 'SET_BET_INDEX': return { ...state, betIndex: action.betIndex };
    case 'SET_WIN': return { ...state, win: action.win };
    case 'START_SPIN':
      return {
        ...state, isSpinning: true, spinningColumns: [0, 1, 2, 3, 4],
        stoppedColumns: [], paylineWins: [], winningCells: [],
        specialCells: [], boardShake: false, win: 0,
      };
    case 'SET_SPINNING':
      return { ...state, isSpinning: action.isSpinning,
        spinningColumns: action.isSpinning ? action.columns || [] : [],
        stoppedColumns: action.isSpinning ? [] : state.stoppedColumns };
    case 'SET_PAYLINE_WINS':
      return { ...state, paylineWins: action.paylineWins, winningCells: action.winningCells || [] };
    case 'STOP_COLUMN':
      return { ...state, spinningColumns: state.spinningColumns.filter(c => c !== action.col),
               stoppedColumns: [...state.stoppedColumns, action.col] };
    case 'CLEAR_STOPPED': return { ...state, stoppedColumns: [] };
    case 'SET_BOARD_SHAKE': return { ...state, boardShake: action.shake };
    case 'ADD_SPECIAL_CELLS':
      return { ...state, specialCells: [...state.specialCells, ...action.cells] };
    case 'CLEAR_SPECIAL_CELLS':
      return { ...state, specialCells: [] };
    case 'SET_GRID': return { ...state, grid: action.grid };
    case 'SET_THEME': return { ...state, activeTheme: action.theme };
    case 'SET_ADMIN': return { ...state, adminMode: action.adminMode };
    case 'SHOW_RESULTS':
      return {
        ...state, paylineWins: action.paylineWins, winningCells: action.winningCells,
        win: action.win, balance: action.balance,
        isSpinning: false, spinningColumns: [],
      };
    case 'SET_THEMES': return { ...state, themes: action.themes };
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.player, balance: action.balance, activeTheme: action.theme };
    case 'FS_START':
      return { ...state, freeSpinsRemaining: action.count, freeSpinsTotal: action.count,
        freeSpinsMultiplier: 2, freeSpinsTotalWon: 0, freeSpinsRunning: true,
        isSpinning: false, showFsModal: false, wildAnimationDone: false };
    case 'FS_DECREMENT':
      return { ...state, freeSpinsRemaining: action.remaining,
        freeSpinsTotal: state.freeSpinsTotal + (action.added || 0) };
    case 'FS_ADD':
      return { ...state, freeSpinsRemaining: state.freeSpinsRemaining + action.extra,
        freeSpinsTotal: state.freeSpinsTotal + action.extra };
    case 'FS_ADD_WIN': return { ...state, freeSpinsTotalWon: state.freeSpinsTotalWon + action.amount };
    case 'FS_END':
      return { ...state, freeSpinsRunning: false, freeSpinsMultiplier: 1,
        freeSpinsRemaining: 0, freeSpinsTotal: 0,
        balance: state.balance + state.freeSpinsTotalWon };
    case 'FS_RESULTS': return { ...state, showFsResults: action.show };
    case 'SHOW_FS_MODAL': return { ...state, showFsModal: true, fsModalCount: action.count };
    case 'HIDE_FS_MODAL': return { ...state, showFsModal: false };
    case 'SHOW_JP_MODAL': return { ...state, showJpModal: true, isSpinning: true };
    case 'HIDE_JP_MODAL': return { ...state, showJpModal: false, isSpinning: false };
    case 'JP_ADD_BALANCE': return { ...state, balance: state.balance + action.amount };
    case 'SHOW_TE_MODAL': return { ...state, showTeModal: true };
    case 'HIDE_TE_MODAL': return { ...state, showTeModal: false };
    case 'UPDATE_THEMES': return { ...state, themes: action.themes };
    case 'SET_SOUND_THEME': return { ...state, soundTheme: action.theme };
    case 'START_WILD_ANIMATION': return { ...state, showWildAnimation: true };
    case 'END_WILD_ANIMATION': return { ...state, showWildAnimation: false, wildAnimationDone: true };
    case 'SET_AUTO_SPIN_COUNTDOWN': return { ...state, autoSpinCountdown: action.duration };
    case 'CLEAR_AUTO_SPIN_COUNTDOWN': return { ...state, autoSpinCountdown: 0 };
    case 'SHOW_WIN_BANNER': return { ...state, winBanner: action.tier };
    case 'HIDE_WIN_BANNER': return { ...state, winBanner: null };
    default: return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const forcedGridRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const specialTimerRef = useRef(null);
  const spinSoundRef = useRef(null);
  const jingleSoundRef = useRef(null);
  const bgSoundRef = useRef(null);
  const fsBgLoopRef = useRef(null);
  const spinIdleRef = useRef(null);
  const doSpinRef = useRef(null);
  const jpModalResolveRef = useRef(null);

  /** Determine win sound tier based on win-to-bet ratio */
  function getWinTier(winAmount, bet) {
    if (winAmount <= 0) return null;
    const ratio = winAmount / bet;
    if (ratio > 450) return 'mega';
    if (ratio > 300) return 'huge';
    if (ratio > 150) return 'big';
    if (ratio >= 5) return 'medium';
    return 'small';
  }

  const setForcedGrid = useCallback((symbolType, count) => {
    forcedGridRef.current = buildForcedGrid(symbolType, count);
  }, []);

  const setTierTestGrid = useCallback((tier) => {
    forcedGridRef.current = buildTierTestGrid(tier);
  }, []);

  const getBet = useCallback(() => BET_OPTIONS[state.betIndex], [state.betIndex]);
  const getTotalBet = useCallback(() => getBet() * 20, [getBet]);
  const getThemeDisplay = useCallback((symId) => getThemeInfo(state.themes, state.activeTheme, symId), [state.themes, state.activeTheme]);

  const showGiftToast = useCallback(() => {
    window.dispatchEvent(new CustomEvent('show-gift-toast'));
  }, []);

  const persistData = useCallback((balance, theme) => {
    if (state.currentPlayer) {
      const data = loadPlayerData();
      if (!data[state.currentPlayer]) data[state.currentPlayer] = {};
      data[state.currentPlayer].balance = balance;
      data[state.currentPlayer].theme = theme;
      savePlayerData(data);
    }
  }, [state.currentPlayer]);

  const doSpin = useCallback(async () => {
    if (state.isSpinning) return;

    const totalBet = getTotalBet();
    const bet = getBet();
    let currentBalance = state.balance;

    // Gift check
    if (!state.freeSpinsRunning) {
      if (currentBalance - totalBet < 0) {
        currentBalance = 10000;
        dispatch({ type: 'SET_BALANCE', balance: 10000 });
        showGiftToast();
      } else {
        currentBalance -= totalBet;
        dispatch({ type: 'SET_BALANCE', balance: currentBalance });
      }
      persistData(currentBalance, state.activeTheme);
    }

    // Generate final result grid
    const forced = forcedGridRef.current;
    forcedGridRef.current = null;
    // Use wild-enhanced strips for all free spins
    const finalGrid = state.freeSpinsRunning ? generateWildSpinResult() : generateSpinResult(forced);
    dispatch({ type: 'SET_GRID', grid: finalGrid });
    // Start spin (clears all old state including boardShake, specialCells, etc.)
    dispatch({ type: 'START_SPIN' });
    // Play spin sound (loops while reels are spinning)
    audioManager.stopAll();
    spinSoundRef.current = audioManager.play('reel_spin', { loop: true });
    // stopAll killed bg_ambient — clear ref so it can restart if needed
    bgSoundRef.current = null;
    // Start background ambient on first spin
    if (!bgSoundRef.current) {
      bgSoundRef.current = audioManager.play('bg_ambient', { loop: true, volume: 0.35 });
    }

    // Stop columns left-to-right with delays
    let extraDelay = 0;
    for (let col = 0; col < 5; col++) {
      // Check if 2+ scatters or 2+ bonuses visible on already-locked columns
      // If so, slow down this column and all remaining columns for anticipation
      if (col > 0 && extraDelay === 0) {
        let scatterCount = 0, bonusCount = 0;
        for (let c = 0; c < col; c++) {
          for (let r = 0; r < 3; r++) {
            const s = finalGrid[c][r];
            if (s === 'scatter') scatterCount++;
            if (s === 'bonus') bonusCount++;
          }
        }
        if (scatterCount >= 2 || bonusCount >= 2) {
          extraDelay = 1500;
          audioManager.play('reel_slow');
        }
      }

      await sleep(350 + col * 160 + extraDelay);
      dispatch({ type: 'STOP_COLUMN', col });
      audioManager.play('reel_stop');

      // Shake if this column has scatter or bonus
      if (columnHasSpecial(finalGrid, col)) {
        if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
        dispatch({ type: 'SET_BOARD_SHAKE', shake: true });
        shakeTimerRef.current = setTimeout(() => {
          dispatch({ type: 'SET_BOARD_SHAKE', shake: false });
        }, 800);
      }

      // Special cells for green pulse per column
      const colSpecials = [];
      for (let row = 0; row < 3; row++) {
        const s = finalGrid[col][row];
        if (s === 'scatter' || s === 'bonus') {
          colSpecials.push(`${col},${row}`);
        }
      }
      if (colSpecials.length > 0) {
        dispatch({ type: 'ADD_SPECIAL_CELLS', cells: colSpecials });
      }
      // Play landing sounds for any special symbols in this column
      for (let row = 0; row < 3; row++) {
        const s = finalGrid[col][row];
        if (s === 'wild') audioManager.play('wild_land');
        else if (s === 'scatter') audioManager.play('scatter_land');
        else if (s === 'bonus') audioManager.play('bonus_land');
      }
    } // end for loop

    // Clear special cells after animation
    if (specialTimerRef.current) clearTimeout(specialTimerRef.current);
    specialTimerRef.current = setTimeout(() => {
      dispatch({ type: 'CLEAR_SPECIAL_CELLS' });
    }, 2000);

    // Clear stopped state
    setTimeout(() => dispatch({ type: 'CLEAR_STOPPED' }), 500);

    // --- Calculate results ---
    const results = calculateSpinResult(finalGrid, bet, state.freeSpinsRunning, state.freeSpinsMultiplier);
    const winningCells = findWinningCells(results.paylineWins);

    // Update balance and show results while keeping isSpinning until after all checks
    dispatch({ type: 'SET_PAYLINE_WINS', paylineWins: results.paylineWins, winningCells });
    if (state.freeSpinsRunning) {
      dispatch({ type: 'FS_ADD_WIN', amount: results.totalWin });
      dispatch({ type: 'SET_WIN', win: results.totalWin });
    } else {
      const newBalance = currentBalance + results.totalWin;
      dispatch({ type: 'SET_BALANCE', balance: newBalance });
      dispatch({ type: 'SET_WIN', win: results.totalWin });
      persistData(newBalance, state.activeTheme);
    }

    // Stop reel spin sound
    if (spinSoundRef.current) {
      audioManager.stop(spinSoundRef.current);
      spinSoundRef.current = null;
    }
    // Play win sound tiered + jingle loop
    const tier = getWinTier(results.totalWin, bet);
    if (tier) {
      const isBigTier = tier === 'big' || tier === 'huge' || tier === 'mega';
      // Turn down the sound effect when voice plays so the voice cuts through
      audioManager.play(`win_${tier}`, { volume: isBigTier ? 0.4 : 1.0 });
      jingleSoundRef.current = audioManager.play('win_jingle', { loop: true, volume: 0.5 });
      // Play the voice announcement noticeably louder for big/huge/mega wins
      if (isBigTier) {
        audioManager.play(`win_${tier}_voice`, { volume: 3.0 });
      }
    }

    // Bonus trigger (works during normal play AND free spins)
    if (results.bonusCount >= 3) {
      await sleep(500);
      const bonusRounds = 1 + (results.bonusCount - 3);
      for (let r = 0; r < bonusRounds; r++) {
        dispatch({ type: 'SHOW_JP_MODAL' });
        if (r < bonusRounds - 1) await sleep(600);
      }
      if (state.freeSpinsRunning) {
        // During free spins, wait for the JP picker game to complete
        // before continuing (prevents auto-spin from firing while modal is open)
        audioManager.play('jp_win');
        if (bonusRounds > 0) {
          await new Promise(resolve => { jpModalResolveRef.current = resolve; });
          jpModalResolveRef.current = null;
        }
        // Fall through to free spin advance
      } else {
        audioManager.play('jp_win');
        if (jingleSoundRef.current) { audioManager.stop(jingleSoundRef.current); jingleSoundRef.current = null; }
        dispatch({ type: 'SET_SPINNING', isSpinning: false, columns: [] });
        // If scatters also hit, don't return — let the scatter trigger below run
        if (results.scatterCount < 3) return;
      }
    }

    // Scatter trigger
    if (results.scatterCount >= 3 && !state.freeSpinsRunning) {
      await sleep(500);
      audioManager.play('fs_trigger');
      if (jingleSoundRef.current) { audioManager.stop(jingleSoundRef.current); jingleSoundRef.current = null; }
      const fsCount = 10 + (results.scatterCount - 3) * 5;
      dispatch({ type: 'SHOW_FS_MODAL', count: fsCount });
      return;
    }

    // Free spin re-trigger
    let extraFromRetrigger = 0;
    if (state.freeSpinsRunning && results.scatterCount >= 3) {
      extraFromRetrigger = 10 + (results.scatterCount - 3) * 5;
      audioManager.play('fs_retrigger');
      window.dispatchEvent(new CustomEvent('show-fs-retrigger', { detail: { extraSpins: extraFromRetrigger } }));
    }

    // Free spin advance — auto-spin during free spins
    if (state.freeSpinsRunning) {
      const remaining = state.freeSpinsRemaining - 1 + extraFromRetrigger;
      dispatch({ type: 'FS_DECREMENT', remaining, added: extraFromRetrigger });
      if (remaining <= 0) {
        await sleep(800);
        audioManager.play('fs_end');
        if (jingleSoundRef.current) { audioManager.stop(jingleSoundRef.current); jingleSoundRef.current = null; }
        // Persist free spin winnings to balance before ending
        const fsBalance = state.balance + state.freeSpinsTotalWon;
        dispatch({ type: 'FS_END' });
        dispatch({ type: 'SET_BALANCE', balance: fsBalance });
        persistData(fsBalance, state.activeTheme);
        dispatch({ type: 'SET_SPINNING', isSpinning: false, columns: [] });
        dispatch({ type: 'FS_RESULTS', show: true });
        return;
      }

      // Still have free spins — auto-spin with delay
      const hasWin = results.totalWin > 0;
      const pauseDuration = hasWin ? 3000 : 1500;

      // Show win banner for big/huge wins
      const tier = getWinTier(results.totalWin, bet);
      if (tier === 'big' || tier === 'huge' || tier === 'mega') {
        dispatch({ type: 'SHOW_WIN_BANNER', tier });
        setTimeout(() => dispatch({ type: 'HIDE_WIN_BANNER' }), pauseDuration + 500);
      }

      // Stop jingle
      if (jingleSoundRef.current) { audioManager.stop(jingleSoundRef.current); jingleSoundRef.current = null; }

      // Release spin lock and show auto-spin progress on button
      dispatch({ type: 'SET_SPINNING', isSpinning: false, columns: [] });
      dispatch({ type: 'SET_AUTO_SPIN_COUNTDOWN', duration: pauseDuration });

      await sleep(pauseDuration);
      dispatch({ type: 'CLEAR_AUTO_SPIN_COUNTDOWN' });

      // Recurse via ref to get fresh state closure
      if (doSpinRef.current) doSpinRef.current();
      return;
    }

    // Show win banner for big/huge wins during regular play
    if (!state.freeSpinsRunning) {
      const tier = getWinTier(results.totalWin, bet);
      if (tier === 'big' || tier === 'huge' || tier === 'mega') {
        dispatch({ type: 'SHOW_WIN_BANNER', tier });
        setTimeout(() => dispatch({ type: 'HIDE_WIN_BANNER' }), 3500);
      }
    }

    // Stop jingle before releasing spin lock
    if (jingleSoundRef.current) { audioManager.stop(jingleSoundRef.current); jingleSoundRef.current = null; }
    dispatch({ type: 'SET_SPINNING', isSpinning: false, columns: [] });
  }, [state.isSpinning, state.balance, state.betIndex, state.freeSpinsRunning,
      state.freeSpinsMultiplier, state.freeSpinsRemaining, state.currentPlayer,
      state.activeTheme, getBet, getTotalBet, showGiftToast, persistData]);

  doSpinRef.current = doSpin;

  const updateThemes = useCallback(async (newThemes) => {
    dispatch({ type: 'UPDATE_THEMES', themes: newThemes });
    await saveThemes(newThemes);
  }, []);

  const changeSoundTheme = useCallback((themeKey) => {
    audioManager.setTheme(themeKey);
    dispatch({ type: 'SET_SOUND_THEME', theme: themeKey });
  }, []);

  // Sync on mount
  useEffect(() => {
    // Read ?theme=XXX from URL
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme');

    // Try to apply URL theme from already-loaded localStorage themes first
    if (urlTheme && state.themes[urlTheme]) {
      dispatch({ type: 'SET_THEME', theme: urlTheme });
    }

    syncThemesFromServer(state.themes).then(merged => {
      if (merged) dispatch({ type: 'SET_THEMES', themes: merged });
      // Apply URL theme after server sync (in case the theme data came from server)
      if (urlTheme && merged && merged[urlTheme]) {
        dispatch({ type: 'SET_THEME', theme: urlTheme });
      }
    });
    syncPlayersFromServer();
  }, []);

  function syncPlayersFromServer() {
    fetchPlayersFromServer().then(serverPlayers => {
      if (serverPlayers && Object.keys(serverPlayers).length > 0) {
        const local = loadPlayerData();
        // Merge: server fills in missing players, but for existing players
        // keep the HIGHEST balance so cross-device sync doesn't lose money
        const merged = { ...serverPlayers };
        for (const name of Object.keys(local)) {
          if (!merged[name]) {
            merged[name] = { ...local[name] };
          } else {
            merged[name] = { ...merged[name] };
            merged[name].balance = Math.max(
              local[name].balance || 0,
              merged[name].balance || 0
            );
          }
        }
        savePlayerData(merged);
      }
    }).catch(() => {});
  }

  // Free spins music — fs_bg_loop during wild animation, then bg_ambient for gameplay
  useEffect(() => {
    if (state.freeSpinsRunning) {
      if (!state.wildAnimationDone) {
        // During wild animation: play fs_bg_loop
        if (!fsBgLoopRef.current) {
          fsBgLoopRef.current = audioManager.play('fs_bg_loop', { loop: true, volume: 0.35 });
        }
      } else {
        // Wild animation done: stop fs_bg_loop, start fresh bg_ambient for gameplay
        if (fsBgLoopRef.current) {
          audioManager.stop(fsBgLoopRef.current);
          fsBgLoopRef.current = null;
        }
        // Stop any existing bg_ambient (from the preceding spin) and start fresh
        if (bgSoundRef.current) {
          audioManager.stop(bgSoundRef.current);
          bgSoundRef.current = null;
        }
        bgSoundRef.current = audioManager.play('bg_ambient', { loop: true, volume: 0.35 });
      }
    } else {
      // Free spins ended — stop both
      if (fsBgLoopRef.current) {
        audioManager.stop(fsBgLoopRef.current);
        fsBgLoopRef.current = null;
      }
      if (bgSoundRef.current) {
        audioManager.stop(bgSoundRef.current);
        bgSoundRef.current = null;
      }
    }
  }, [state.freeSpinsRunning, state.wildAnimationDone]);

  // Spin idle hum — plays when reels are stopped
  useEffect(() => {
    if (!state.isSpinning && state.currentPlayer) {
      if (!spinIdleRef.current && !state.freeSpinsRunning) {
        spinIdleRef.current = audioManager.play('spin_idle', { loop: true, volume: 0.15 });
      }
    } else {
      if (spinIdleRef.current) {
        audioManager.stop(spinIdleRef.current);
        spinIdleRef.current = null;
      }
    }
  }, [state.isSpinning, state.currentPlayer, state.freeSpinsRunning]);

  const value = {
    state, dispatch, getBet, getTotalBet, getThemeDisplay,
    doSpin, doSpinRef, jpModalResolveRef, setForcedGrid, setTierTestGrid, updateThemes, persistData,
    changeSoundTheme,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
