import {
  hasPrivatePreferences,
  PRIVATE_KEY,
  restoreSetup,
  SETUP_KEY,
  type SavedSetup,
} from './model';

export type SetupStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};
export type PrivateStorage = SetupStorage & {
  available: () => Promise<boolean>;
};

// Native adapters are injected so ordering, failure and privacy boundaries are testable.
export function createSetupPersistence(
  local: SetupStorage,
  secure: PrivateStorage,
) {
  let pending = Promise.resolve();
  return {
    async load() {
      const raw = await local.getItem(SETUP_KEY);
      if (!raw) {
        const legacy = await local.getItem('brainspace-story-v1');
        try {
          if (legacy && JSON.parse(legacy)?.state?.completed === true) {
            return restoreSetup({ completed: true });
          }
        } catch {
          /* An old draft starts with the new welcome. */
        }
        return restoreSetup(null);
      }
      let publicValue: unknown;
      try {
        publicValue = JSON.parse(raw);
      } catch {
        return restoreSetup(null);
      }
      const saved = restoreSetup(publicValue);
      // The public record is authoritative about whether private preferences exist.
      // This avoids reviving a deleted preference from an orphaned secure write.
      if (
        publicValue &&
        typeof publicValue === 'object' &&
        (publicValue as { privatePreferences?: boolean }).privatePreferences &&
        (await secure.available())
      ) {
        const privateValue = await secure
          .getItem(PRIVATE_KEY)
          .catch(() => null);
        if (privateValue) {
          try {
            const secret = JSON.parse(privateValue);
            return restoreSetup({
              ...saved,
              answers: { ...saved.answers, habits: secret.habits },
              customHabit: secret.customHabit,
            });
          } catch {
            /* Corrupt private data does not prevent using the app. */
          }
        }
      }
      return saved;
    },
    save(value: SavedSetup) {
      const { habits, ...answers } = value.answers;
      const privatePreferences = hasPrivatePreferences(value);
      const publicValue = JSON.stringify({
        ...value,
        customHabit: '',
        answers: {
          ...answers,
          ...(habits?.includes('general') ? { habits: ['general'] } : {}),
        },
        privatePreferences,
      });
      const privateValue = JSON.stringify({
        habits: habits ?? [],
        customHabit: value.customHabit,
      });
      pending = pending
        .catch(() => undefined)
        .then(async () => {
          const available = await secure.available();
          if (privatePreferences && !available)
            throw new Error('Private storage unavailable');
          if (available) await secure.setItem(PRIVATE_KEY, privateValue);
          await local.setItem(SETUP_KEY, publicValue);
        });
      return pending;
    },
  };
}
