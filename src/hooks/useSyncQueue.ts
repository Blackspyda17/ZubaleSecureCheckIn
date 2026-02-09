import { useEffect, useCallback, useRef } from 'react';
import { useSyncStore } from '../store/sync.store';
import { useCheckInStore } from '../store/checkIn.store';
import { syncCheckIn, getRetryDelay, isOnline } from '../services/sync.service';

/**
 * Hook that manages the offline sync queue.
 * Automatically processes pending items when the device comes online.
 * Implements exponential backoff for failed retries.
 */
export function useSyncQueue() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    pendingItems,
    isSyncing,
    addPendingItem,
    updateItemStatus,
    incrementRetry,
    removeItem,
    setSyncing,
  } = useSyncStore();

  const online = useCheckInStore((s) => s.isOnline);

  const processQueue = useCallback(async () => {
    const connected = await isOnline();
    if (!connected) return;

    const pending = pendingItems.filter(
      (item) =>
        item.photo.syncStatus === 'pending' ||
        item.photo.syncStatus === 'failed'
    );

    if (pending.length === 0) return;

    setSyncing(true);

    for (const item of pending) {
      // Check retry delay
      if (item.lastAttempt) {
        const delay = getRetryDelay(item.retryCount);
        const elapsed = Date.now() - item.lastAttempt;
        if (elapsed < delay) continue;
      }

      updateItemStatus(item.id, 'syncing');

      const result = await syncCheckIn(item);

      if (result === 'synced') {
        updateItemStatus(item.id, 'synced');
        // Remove after a brief delay so the user can see the "synced" status
        setTimeout(() => removeItem(item.id), 3000);
      } else if (result === 'failed') {
        updateItemStatus(item.id, 'failed');
      } else {
        // Still pending - increment retry for backoff
        incrementRetry(item.id);
        updateItemStatus(item.id, 'pending');
      }
    }

    setSyncing(false);
  }, [
    pendingItems,
    setSyncing,
    updateItemStatus,
    incrementRetry,
    removeItem,
  ]);

  // Process queue when coming online
  useEffect(() => {
    if (online) {
      processQueue();
    }
  }, [online, processQueue]);

  // Periodic retry for pending items
  useEffect(() => {
    timeoutRef.current = setInterval(processQueue, 15000);
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [processQueue]);

  const pendingCount = pendingItems.filter(
    (i) => i.photo.syncStatus !== 'synced'
  ).length;

  return {
    pendingItems,
    pendingCount,
    isSyncing,
    addPendingItem,
    processQueue,
  };
}
