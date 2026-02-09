import NetInfo from '@react-native-community/netinfo';
import { CheckInPhoto, PendingSyncItem, SyncStatus } from '../types';
import { SYNC_CONFIG } from '../constants/config';

/**
 * Mock server upload - simulates sending check-in data to backend.
 * In production, this would be a real API call.
 * Randomly fails ~20% of the time to test retry logic.
 */
async function mockUpload(photo: CheckInPhoto): Promise<boolean> {
  await new Promise((resolve) =>
    setTimeout(resolve, SYNC_CONFIG.MOCK_UPLOAD_DELAY_MS)
  );

  // Simulate occasional failures for testing resilience
  if (Math.random() < 0.2) {
    throw new Error('Server temporarily unavailable');
  }

  return true;
}

/**
 * Attempt to sync a single check-in photo.
 * Returns the new sync status.
 */
export async function syncCheckIn(
  item: PendingSyncItem
): Promise<SyncStatus> {
  try {
    await mockUpload(item.photo);
    return 'synced';
  } catch {
    if (item.retryCount >= SYNC_CONFIG.MAX_RETRIES) {
      return 'failed';
    }
    return 'pending';
  }
}

/**
 * Calculate exponential backoff delay for retries.
 */
export function getRetryDelay(retryCount: number): number {
  return SYNC_CONFIG.BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
}

/**
 * Check if the device currently has network connectivity.
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

/**
 * Subscribe to network status changes.
 * Returns an unsubscribe function.
 */
export function onNetworkChange(
  callback: (isConnected: boolean) => void
): () => void {
  return NetInfo.addEventListener((state) => {
    callback(state.isConnected ?? false);
  });
}
