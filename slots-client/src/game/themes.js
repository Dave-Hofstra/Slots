import { DEFAULT_THEMES } from './gameConfig';
import { fetchThemesFromServer, saveThemesToServer } from '../services/api';

const STORAGE_KEY = 'herons-slots-themes';

function mergeThemes(saved, defaults) {
  const merged = { ...defaults };
  for (const key of Object.keys(saved)) {
    if (merged[key]) {
      merged[key] = { ...merged[key], ...saved[key] };
      merged[key].symbols = { ...merged[key].symbols, ...saved[key].symbols };
    } else {
      merged[key] = saved[key];
    }
  }
  return merged;
}

export function loadThemes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.default && !parsed.basic) {
        parsed.basic = parsed.default;
        delete parsed.default;
      }
      if (parsed.test && !parsed.scuba) {
        parsed.scuba = parsed.test;
        delete parsed.test;
      }
      return mergeThemes(parsed, DEFAULT_THEMES);
    }
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_THEMES };
}

export function saveThemesLocal(themes) {
  const saveData = { ...themes };
  delete saveData.test;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  } catch (e) { /* ignore */ }
}

export async function saveThemes(themes) {
  const saveData = { ...themes };
  delete saveData.test;
  saveThemesLocal(themes);
  try {
    await saveThemesToServer(saveData);
  } catch (e) { /* server might be down */ }
}

export async function syncThemesFromServer(currentThemes) {
  try {
    const serverThemes = await fetchThemesFromServer();
    if (serverThemes && Object.keys(serverThemes).length > 0) {
      if (serverThemes.test && !serverThemes.scuba) {
        serverThemes.scuba = serverThemes.test;
        delete serverThemes.test;
      }
      const merged = mergeThemes(serverThemes, DEFAULT_THEMES);
      saveThemesLocal(merged);
      return merged;
    }
  } catch (e) { /* server not available */ }
  return currentThemes;
}

export function getThemeInfo(themes, themeKey, symId) {
  const theme = themes[themeKey] || themes.basic;
  const ts = theme?.symbols?.[symId];
  const def = { display: '?', color: '#fff' };
  // Find the default display from our defaults
  const defaultSym = DEFAULT_THEMES.basic.symbols[symId];
  return {
    display: ts?.display ?? defaultSym?.display ?? '?',
    color: ts?.color ?? defaultSym?.color ?? '#fff',
    imagePath: ts?.imagePath ?? null,
  };
}
