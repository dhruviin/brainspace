import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { QuestionId, SetupStep } from './content';
import { defaults, setupSteps, updateAnswers, type SavedSetup } from './model';
import { createSetupPersistence } from './persistence';
import { securePreferences } from './secure';

const storage = createSetupPersistence(AsyncStorage, securePreferences);
type SetupState = SavedSetup & {
  hydrated: boolean;
  saving: boolean;
  saveError: boolean;
  privateAvailable: boolean;
  hydrate: () => Promise<void>;
  go: (step: SetupStep) => void;
  next: () => void;
  back: () => boolean;
  answer: (id: QuestionId, values: string[]) => void;
  setCustomHabit: (label: string) => void;
  confirmAdult: () => void;
  finish: (skipped?: boolean) => Promise<void>;
  edit: () => void;
};

function snapshot(state: SetupState): SavedSetup {
  const {
    version,
    step,
    answers,
    customHabit,
    adultConfirmed,
    completed,
    skipped,
    timezone,
  } = state;
  return {
    version,
    step,
    answers,
    customHabit,
    adultConfirmed,
    completed,
    skipped,
    timezone,
  };
}
let hydrating: Promise<void> | undefined;
export const useSetup = create<SetupState>((set, get) => {
  const commit = (patch: Partial<SavedSetup>) => {
    // Completion owns the final durable snapshot until navigation changes.
    if (get().saving) return;
    set({ ...patch, saveError: false });
    void storage.save(snapshot(get())).catch(() => set({ saveError: true }));
  };
  return {
    ...defaults,
    hydrated: false,
    saving: false,
    saveError: false,
    privateAvailable: false,
    hydrate: () => {
      if (get().hydrated) return Promise.resolve();
      if (!hydrating)
        hydrating = (async () => {
          try {
            const [saved, available] = await Promise.all([
              storage.load(),
              securePreferences.available().catch(() => false),
            ]);
            set({ ...saved, privateAvailable: available, hydrated: true });
          } catch {
            set({ hydrated: true, saveError: true });
          }
        })();
      return hydrating;
    },
    go: (step) => {
      if (setupSteps(get().answers).includes(step)) commit({ step });
    },
    next: () => {
      const state = get(),
        path = setupSteps(state.answers),
        next = path[path.indexOf(state.step) + 1];
      if (next && (state.step !== 'intro' || state.adultConfirmed))
        commit({ step: next });
    },
    back: () => {
      const state = get(),
        path = setupSteps(state.answers),
        previous = path[path.indexOf(state.step) - 1];
      if (!previous) return false;
      commit({ step: previous });
      return true;
    },
    answer: (id, values) => {
      const state = get(),
        answers = updateAnswers(state.answers, id, values);
      commit({
        answers,
        customHabit: answers.habits?.includes('custom')
          ? state.customHabit
          : '',
      });
    },
    setCustomHabit: (customHabit) =>
      commit({ customHabit: customHabit.slice(0, 60) }),
    confirmAdult: () => commit({ adultConfirmed: !get().adultConfirmed }),
    finish: async (skipped = false) => {
      if (get().saving || !get().adultConfirmed) return;
      set({ saving: true, saveError: false });
      let timezone = '';
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        /* Device default still applies. */
      }
      const completed = {
        ...snapshot(get()),
        completed: true,
        skipped,
        timezone,
      };
      try {
        await storage.save(completed);
        set({ ...completed, saving: false, saveError: false });
      } catch {
        set({ saving: false, saveError: true });
      }
    },
    edit: () =>
      commit({
        completed: false,
        skipped: false,
        step: 'goals',
        adultConfirmed: true,
      }),
  };
});
