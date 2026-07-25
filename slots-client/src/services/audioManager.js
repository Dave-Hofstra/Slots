/**
 * Web Audio API manager for Slots.
 */
import { DEFAULT_SOUND_THEME, SOUND_THEMES, SOUND_ASSETS } from '../game/soundThemes';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.buffers = {};        // keyed "theme/name"
    this.playing = {};
    this._initPromise = null;
    this._initialized = false;
    this._theme = DEFAULT_SOUND_THEME;
    this._muted = new Set(this._loadMuted());
  }

  _loadMuted() {
    try {
      const data = JSON.parse(localStorage.getItem('herons-slots-muted') || '[]');
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }

  _saveMuted() {
    try { localStorage.setItem('herons-slots-muted', JSON.stringify([...this._muted])); } catch {}
  }

  get initialized() { return this._initialized; }
  get theme() { return this._theme; }
  get muted() { return [...this._muted]; }

  isMuted(name) { return this._muted.has(name); }

  mute(name) {
    this._muted.add(name);
    this._saveMuted();
  }

  unmute(name) {
    this._muted.delete(name);
    this._saveMuted();
  }

  setTheme(name) {
    if (name === this._theme) return;
    this._theme = name;
    // Reload buffers for the new theme (only if context already exists)
    if (this.ctx && this._initialized) {
      this._loadThemeBuffers();
    }
  }

  /** Create / resume AudioContext. Must be called from a user gesture. */
  async init() {
    if (this._initialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      // No Audio theme — skip context creation entirely
      if (this._theme === 'none') {
        this._initialized = true;
        return;
      }
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        this.ctx = null;
        this._initialized = false;
        return;
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      await this._loadThemeBuffers();
      this._initialized = true;
    })();

    return this._initPromise;
  }

  async _loadThemeBuffers() {
    const theme = SOUND_THEMES[this._theme];
    if (!theme) return;
    const promises = SOUND_ASSETS.map(name => this._load(name, theme.dir));
    await Promise.all(promises);
  }

  async _load(name, dir) {
    const base = '/Slots/audio/';
    const prefix = dir ? `${dir}/` : '';
    // Cache-busting param so audio swaps take effect on next page load
    const cb = `?v=${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    let data = null;
    // Try OGG first (check content-type to avoid nginx SPA fallback HTML)
    try {
      const resp = await fetch(`${base}${prefix}${name}.ogg${cb}`);
      if (resp.ok && resp.headers.get('content-type')?.startsWith('audio/')) {
        data = await resp.arrayBuffer();
      }
    } catch { /* fall through */ }
    // Fall back to MP3
    if (!data) {
      try {
        const resp = await fetch(`${base}${prefix}${name}.mp3${cb}`);
        if (resp.ok && resp.headers.get('content-type')?.startsWith('audio/')) {
          data = await resp.arrayBuffer();
        }
      } catch { /* skip */ }
    }
    if (!data || !this.ctx) return;
    try {
      const key = `${this._theme}/${name}`;
      this.buffers[key] = await this.ctx.decodeAudioData(data);
    } catch { /* skip corrupt files */ }
  }

  /**
   * Play a sound for the current theme.
   * @returns {string|null} playback ID (pass to stop())
   */
  play(name, { loop = false, volume = 1, startOffset = 0 } = {}) {
    if (!this.ctx) return null;
    if (this._theme === 'none') return null;

    // Auto-resume if iOS/mobile suspended the context (native dialogs, app switches, etc.)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Skip if muted
    if (this._muted.has(name)) return null;

    // Reel spin is disabled for the chatgpt theme only (ElevenLabs version is good)
    if (name === 'reel_spin' && this._theme === 'chatgpt') return null;

    const key = `${this._theme}/${name}`;
    if (!this.buffers[key]) return null;

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[key];
    source.loop = loop;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(this.ctx.destination);
    source.start(0, startOffset);
    const id = `sfx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.playing[id] = source;
    source.onended = () => { delete this.playing[id]; };
    return id;
  }

  stop(id) {
    if (this.playing[id]) {
      try { this.playing[id].stop(); } catch { /* already ended */ }
      delete this.playing[id];
    }
  }

  stopAll() {
    Object.keys(this.playing).forEach(id => this.stop(id));
  }
}

export const audioManager = new AudioManager();
