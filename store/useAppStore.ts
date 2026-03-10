import { create } from 'zustand';

interface AppState {
  // Optimistic local state
  xp: number;
  streak: number;
  sessionTaskCount: number;
  lastGoldStandardCorrect: boolean;

  // Actions
  addXp: (amount: number) => void;
  setStreak: (streak: number) => void;
  incrementSessionCount: () => void;
  setGoldStandardResult: (correct: boolean) => void;
  syncFromServer: (xp: number, streak: number) => void;
  resetSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  xp: 0,
  streak: 0,
  sessionTaskCount: 0,
  lastGoldStandardCorrect: false,

  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
  setStreak: (streak) => set({ streak }),
  incrementSessionCount: () =>
    set((state) => ({ sessionTaskCount: state.sessionTaskCount + 1 })),
  setGoldStandardResult: (correct) => set({ lastGoldStandardCorrect: correct }),
  syncFromServer: (xp, streak) => set({ xp, streak }),
  resetSession: () => set({ sessionTaskCount: 0, lastGoldStandardCorrect: false }),
}));
