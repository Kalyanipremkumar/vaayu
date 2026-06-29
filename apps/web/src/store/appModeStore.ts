/**
 * The app-wide Collector / Artist mode. Collector mode answers "what is this
 * worth?"; Artist mode answers "what should I charge?". Persisted to
 * localStorage so the choice survives reloads and navigation.
 */
import { create } from 'zustand';
import type { AppMode } from '@vaayu/shared';

const STORAGE_KEY = 'vaayu_mode';

function initialMode(): AppMode {
  if (typeof localStorage === 'undefined') return 'collector';
  return localStorage.getItem(STORAGE_KEY) === 'artist' ? 'artist' : 'collector';
}

interface AppModeState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const useAppMode = create<AppModeState>((set) => ({
  mode: initialMode(),
  setMode: (mode) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, mode);
    set({ mode });
  },
}));
