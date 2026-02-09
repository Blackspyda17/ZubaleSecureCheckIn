import { useEffect } from 'react';
import { useCheckInStore } from '../store/checkIn.store';
import { onNetworkChange, isOnline } from '../services/sync.service';

/**
 * Hook that monitors network connectivity and updates the store.
 * Used for offline-first behavior: showing online/offline status
 * and triggering sync when connection is restored.
 */
export function useNetworkStatus() {
  const { isOnline: online, setOnline } = useCheckInStore();

  useEffect(() => {
    // Check initial status
    isOnline().then(setOnline);

    // Subscribe to changes
    const unsubscribe = onNetworkChange(setOnline);
    return unsubscribe;
  }, [setOnline]);

  return { isOnline: online };
}
