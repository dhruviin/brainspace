import { requireOptionalNativeModule } from 'expo';
import type { PrivateStorage } from './persistence';

// Some existing iOS builds explicitly exclude SecureStore. Check the native
// module before importing its JS wrapper, which otherwise throws at launch.
const available = async () =>
  Boolean(requireOptionalNativeModule('ExpoSecureStore'));
async function secureStore() {
  if (!(await available())) throw new Error('Private storage unavailable');
  return import('expo-secure-store');
}
export const securePreferences: PrivateStorage = {
  available,
  getItem: async (key) => (await secureStore()).getItemAsync(key),
  setItem: async (key, value) => (await secureStore()).setItemAsync(key, value),
};
