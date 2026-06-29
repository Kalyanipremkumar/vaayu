/**
 * The app-wide Collector / Artist mode. Collector mode answers "what is this
 * worth?"; Artist mode answers "what should I charge?". Persisted to
 * localStorage so the choice survives reloads and navigation.
 */
import { create } from 'zustand';
import type { AppMode } from '@vaayu/shared';

const STORAGE_KEY = 'vaayu_mode';

function stored(): { mode: AppMode; explicit: boolean } {
  if (typeof localStorage === 'undefined') return { mode: 'collector', explicit: false };
  const v = localStorage.getItem(STORAGE_KEY);
  return {
    mode: v === 'artist' ? 'artist' : 'collector',
    explicit: v === 'artist' || v === 'collector',
  };
}

interface AppModeState {
  mode: AppMode;
  /** True once the user (or a stored preference) has explicitly chosen a mode. */
  explicit: boolean;
  setMode: (mode: AppMode) => void;
  /** Set the mode as a default only — does not mark it as an explicit choice. */
  setDefaultMode: (mode: AppMode) => void;
}

export const useAppMode = create<AppModeState>((set) => ({
  ...stored(),
  setMode: (mode) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, mode);
    set({ mode, explicit: true });
  },
  setDefaultMode: (mode) => set((s) => (s.explicit ? s : { ...s, mode })),
}));
