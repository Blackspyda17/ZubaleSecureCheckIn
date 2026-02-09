import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PendingSyncItem, SyncStatus } from '../types';
import { zustandMMKVStorage } from './storage';

interface SyncState {
  pendingItems: PendingSyncItem[];
  isSyncing: boolean;

  // Actions
  addPendingItem: (item: PendingSyncItem) => void;
  updateItemStatus: (id: string, status: SyncStatus) => void;
  incrementRetry: (id: string) => void;
  removeItem: (id: string) => void;
  setSyncing: (syncing: boolean) => void;
  getPendingCount: () => number;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      pendingItems: [],
      isSyncing: false,

      addPendingItem: (item) =>
        set((state) => ({
          pendingItems: [...state.pendingItems, item],
        })),

      updateItemStatus: (id, status) =>
        set((state) => ({
          pendingItems: state.pendingItems.map((item) =>
            item.id === id
              ? { ...item, photo: { ...item.photo, syncStatus: status } }
              : item
          ),
        })),

      incrementRetry: (id) =>
        set((state) => ({
          pendingItems: state.pendingItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  retryCount: item.retryCount + 1,
                  lastAttempt: Date.now(),
                }
              : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          pendingItems: state.pendingItems.filter((item) => item.id !== id),
        })),

      setSyncing: (syncing) => set({ isSyncing: syncing }),

      getPendingCount: () =>
        get().pendingItems.filter(
          (item) =>
            item.photo.syncStatus === 'pending' ||
            item.photo.syncStatus === 'failed'
        ).length,
    }),
    {
      name: 'sync-queue',
      storage: createJSONStorage(() => zustandMMKVStorage),
      // Persist the entire queue for offline resilience
    }
  )
);
