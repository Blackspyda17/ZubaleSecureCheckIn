import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const mmkvStorage = createMMKV({
  id: 'zubale-checkin-store',
});

/**
 * Zustand-compatible storage adapter backed by MMKV.
 * MMKV is ~30x faster than AsyncStorage, which matters for
 * persisting offline queue and location cache.
 */
export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string) => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkvStorage.set(name, value);
  },
  removeItem: (name: string) => {
    mmkvStorage.remove(name);
  },
};
