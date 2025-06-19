// store/navigationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NavigationState {
  hasCompletedTutorial: boolean;
  isInitialized: boolean;

  // Actions
  completeTutorial: () => void;
  initialize: () => void;
  reset: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      hasCompletedTutorial: false,
      isInitialized: false,

      completeTutorial: () => set({ hasCompletedTutorial: true }),

      initialize: () => set({ isInitialized: true }),

      reset: () =>
        set({
          hasCompletedTutorial: false,
          isInitialized: false,
        }),
    }),
    {
      name: 'navigation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
