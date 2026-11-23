import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { PersistStorage, StorageValue } from 'zustand/middleware';
import type { Answers } from './model';

// Keep Android Keystore writes ordered with the cursor written to AsyncStorage.
export function storyStorage<
  S extends { answers: Answers },
>(): PersistStorage<S> {
  const privateKey = 'brainspace-story-concerns-v1';
  let pending = Promise.resolve(),
    last: string | undefined;
  return {
    async getItem(name) {
      const raw = await AsyncStorage.getItem(name);
      if (!raw) return null;
      const saved = JSON.parse(raw) as StorageValue<S>;
      const privateValue = await SecureStore.getItemAsync(privateKey).catch(
        () => null,
      );
      if (privateValue) {
        last = privateValue;
        saved.state.answers = {
          ...saved.state.answers,
          symptoms: JSON.parse(privateValue),
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
