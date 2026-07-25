import { useCallback } from 'react';
import { audioManager } from '../services/audioManager';

/**
 * Hook: play/stop/init audio from any component.
 * init() must be called from a user gesture (click/tap) — does nothing silently otherwise.
 */
export function useSound() {
  const init = useCallback(() => audioManager.init(), []);

  const play = useCallback((name, opts = {}) => {
    return audioManager.play(name, opts);
  }, []);

  const stop = useCallback((id) => {
    audioManager.stop(id);
  }, []);

  const stopAll = useCallback(() => {
    audioManager.stopAll();
  }, []);

  return { init, play, stop, stopAll, ready: audioManager.initialized };
}
