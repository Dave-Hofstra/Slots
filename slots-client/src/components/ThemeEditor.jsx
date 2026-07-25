import { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { SYMBOL_IDS, SYMBOLS, DEFAULT_THEMES } from '../game/gameConfig';
import { uploadSymbolImage, saveThemesToServer } from '../services/api';

const EDITOR_LABELS = {
  club: 'Special 1', ball: 'Special 2', heron: 'Special 3',
};

export default function ThemeEditor() {
  const { state, dispatch, updateThemes, getThemeDisplay } = useGame();
  const editingTheme = state.activeTheme;
  const theme = state.themes[editingTheme] || { name: editingTheme, symbols: {} };

  const handleUpload = useCallback(async (symId, file) => {
    if (!file) return;
    try {
      const path = await uploadSymbolImage(editingTheme, symId, file);
      const newThemes = JSON.parse(JSON.stringify(state.themes));
      if (!newThemes[editingTheme]) newThemes[editingTheme] = { name: editingTheme, symbols: {} };
      if (!newThemes[editingTheme].symbols) newThemes[editingTheme].symbols = {};
      if (!newThemes[editingTheme].symbols[symId]) newThemes[editingTheme].symbols[symId] = {};
      const ver = (newThemes[editingTheme].symbols[symId]._v || 0) + 1;
      newThemes[editingTheme].symbols[symId]._v = ver;
      newThemes[editingTheme].symbols[symId].imagePath = path + '?v=' + ver;
      delete newThemes[editingTheme].symbols[symId].display;
      await updateThemes(newThemes);
    } catch (e) {
      console.error('Upload failed:', e);
    }
  }, [editingTheme, state.themes, updateThemes]);

  const handleClear = useCallback(async (symId) => {
    const newThemes = JSON.parse(JSON.stringify(state.themes));
    if (newThemes[editingTheme]?.symbols?.[symId]) {
      delete newThemes[editingTheme].symbols[symId].imagePath;
      await updateThemes(newThemes);
    }
  }, [editingTheme, state.themes, updateThemes]);

  const handleReset = useCallback(async () => {
    const newThemes = { ...state.themes };
    newThemes[editingTheme] = JSON.parse(JSON.stringify(DEFAULT_THEMES[editingTheme] || DEFAULT_THEMES.basic));
    await updateThemes(newThemes);
  }, [editingTheme, state.themes, updateThemes]);

  const handleRename = useCallback(async () => {
    const current = theme?.name || editingTheme;
    const newName = prompt(`Rename "${current}" theme to:`, current);
    if (newName && newName.trim() && newName.trim() !== current) {
      const newThemes = JSON.parse(JSON.stringify(state.themes));
      if (!newThemes[editingTheme]) newThemes[editingTheme] = { name: editingTheme, symbols: {} };
      newThemes[editingTheme].name = newName.trim();
      await updateThemes(newThemes);
    }
  }, [editingTheme, theme, state.themes, updateThemes]);

  const handleClose = () => dispatch({ type: 'HIDE_TE_MODAL' });

  if (!state.showTeModal) return null;

  return (
    <div id="te-modal" className="modal-backdrop active" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-digital text-xl sm:text-2xl font-bold text-[#facc15]">
            🎨 <span id="te-title">{theme?.name || editingTheme} Theme</span>
          </h2>
          <button
            id="te-close-btn"
            className="text-[#64748b] hover:text-[#facc15] text-lg cursor-pointer bg-transparent border-none transition-colors"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
        <p className="text-[#94a3b8] text-xs sm:text-sm mb-4">
          Click a symbol slot to upload an image (square PNG with transparency, 120×120px or larger).
        </p>
        <div id="te-grid" className="grid grid-cols-5 gap-2 sm:gap-3 max-w-[460px] mx-auto mb-4">
          {SYMBOL_IDS.map(symId => {
            const def = SYMBOLS[symId];
            const ts = theme?.symbols?.[symId] || {};
            const hasImage = !!ts.imagePath;
            const display = getThemeDisplay(symId);

            return (
              <div
                key={symId}
                className={`te-card ${hasImage ? 'has-image' : ''}`}
                data-sym-id={symId}
                onClick={() => document.getElementById(`file-${symId}`)?.click()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', position: 'relative' }}>
                  {ts.imagePath ? (
                    <img src={ts.imagePath} alt={symId} style={{ maxWidth: '70%', maxHeight: '70%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: display.color, fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 'clamp(0.8rem, 2.5vw, 1.2rem)' }}>
                      {display.display}
                    </span>
                  )}
                </div>
                <span
                  className="te-clear"
                  onClick={e => { e.stopPropagation(); handleClear(symId); }}
                >
                  ✕
                </span>
                <div className="te-label">
                  {EDITOR_LABELS[symId] || ((def?.display || symId) + ' (' + symId + ')')}
                </div>
                <input
                  id={`file-${symId}`}
                  type="file"
                  className="te-file-input"
                  accept="image/png,image/gif,image/jpeg,image/webp"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(symId, file);
                    e.target.value = '';
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              id="te-theme-name-btn"
              className="text-[#64748b] hover:text-[#facc15] text-xs cursor-pointer bg-transparent border border-[rgba(250,204,21,0.2)] rounded-lg px-3 py-1.5 transition-colors font-digital"
              onClick={handleRename}
            >
              Rename Theme
            </button>
            <button
              id="te-reset-btn"
              className="text-[#ef4444] hover:text-[#f87171] text-xs cursor-pointer bg-transparent border border-[rgba(239,68,68,0.3)] rounded-lg px-3 py-1.5 transition-colors font-digital"
              onClick={handleReset}
            >
              Reset All
            </button>
          </div>
          <button id="te-done-btn" className="btn-spin inline-block px-6 py-2 text-sm" onClick={handleClose}>
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
