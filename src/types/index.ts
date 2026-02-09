export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  coords: Coordinates;
  timestamp: number;
  isMocked: boolean;
  accuracy: number | null;
}

export interface TargetLocation {
  coords: Coordinates;
  name: string;
  address: string;
  radiusMeters: number;
}

export interface WatermarkData {
  dateTime: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface CheckInPhoto {
  id: string;
  uri: string;
  watermarkedUri: string | null;
  watermark: WatermarkData;
  capturedAt: number;
  syncStatus: SyncStatus;
}

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface GeofenceState {
  isWithinFence: boolean;
  distanceMeters: number;
  bearing: number;
}

export type CheckInStep = 'location' | 'camera' | 'preview' | 'done';

export interface PendingSyncItem {
  id: string;
  photo: CheckInPhoto;
  retryCount: number;
  lastAttempt: number | null;
}
