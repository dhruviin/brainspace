import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { PersistStorage, StorageValue } from 'zustand/middleware';
import { steps, type Answers } from './model';

// Keep Android Keystore writes ordered with the cursor written to AsyncStorage.
export function storyStorage<
  S extends { answers: Answers },
>(): PersistStorage<S> {
  const privateKey = 'brainspace-story-concerns-v1';
  let pending = Promise.resolve(),
    last: string | undefined;
  return {
    async getItem(name) {
      const raw = await AsyncStorage.getItem(name).catch(() => null);
      if (!raw) return null;
      let saved: StorageValue<S>;
      try {
        const value = JSON.parse(raw);
        if (!value?.state?.answers || !steps.includes(value.state.step))
          return null;
        saved = value;
      } catch {
        return null;
      }
      const privateValue = await SecureStore.getItemAsync(privateKey).catch(
        () => null,
      );
      if (privateValue) {
        let selection: unknown;
        try {
          selection = JSON.parse(privateValue);
        } catch {
          return saved;
        }
        if (
          !Array.isArray(selection) ||
          !selection.every((v) => typeof v === 'string')
        )
          return saved;
        last = privateValue;
        saved.state.answers = {
          ...saved.state.answers,
          symptoms: selection,
        };
      }
      return saved;
    },
    setItem(name, value) {
      const { symptoms, ...answers } = value.state.answers;
      const serialized = JSON.stringify({
        ...value,
        state: { ...value.state, answers },
      });
      pending = pending
        .catch(() => {})
        .then(async () => {
          if (symptoms && JSON.stringify(symptoms) !== last) {
            const next = JSON.stringify(symptoms);
            await SecureStore.setItemAsync(privateKey, next);
            last = next;
          }
          await AsyncStorage.setItem(name, serialized);
        });
      return pending;
    },
    async removeItem(name) {
      await pending.catch(() => {});
      await SecureStore.deleteItemAsync(privateKey);
      last = undefined;
      await AsyncStorage.removeItem(name);
    },
  };
}
