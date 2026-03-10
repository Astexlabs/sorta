import { create } from 'zustand';

interface AppState {
  xp: number;
  streak: number;
  tasksCompleted: number;
  accuracyScore: number;
  sessionTasks: number;
  lastBonusType: 'xp' | 'streak' | 'accuracy' | null;
  showBonus: boolean;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  incrementSessionTasks: () => void;
  triggerAccuracyBonus: () => void;
  dismissBonus: () => void;
  syncFromServer: (data: { xp: number; streak: number; tasksCompleted: number; accuracyScore: number }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  xp: 0,
  streak: 0,
  tasksCompleted: 0,
  accuracyScore: 0,
  sessionTasks: 0,
  lastBonusType: null,
  showBonus: false,

  addXp: (amount) =>
    set((state) => ({
      xp: state.xp + amount,
      tasksCompleted: state.tasksCompleted + 1,
    })),

  incrementStreak: () =>
    set((state) => ({ streak: state.streak + 1 })),

  incrementSessionTasks: () =>
    set((state) => {
      const next = state.sessionTasks + 1;
      if (next > 0 && next % 10 === 0) {
        return { sessionTasks: next, lastBonusType: 'streak', showBonus: true };
      }
      return { sessionTasks: next };
    }),

  triggerAccuracyBonus: () =>
    set({ lastBonusType: 'accuracy', showBonus: true }),

  dismissBonus: () =>
    set({ showBonus: false, lastBonusType: null }),

  syncFromServer: (data) =>
    set({
      xp: data.xp,
      streak: data.streak,
      tasksCompleted: data.tasksCompleted,
      accuracyScore: data.accuracyScore,
    }),
}));
