import { TargetLocation } from '../types';

// Target location for geofence check-in
// Using coordinates near Golfito, Costa Rica for testing
// Change these to coordinates near your location for easy testing
export const TARGET_LOCATION: TargetLocation = {
  coords: {
    latitude: 8.639,
    longitude: -83.162,
  },
  name: 'Zubale Store - Golfito',
  address: 'Centro Comercial Golfito, Costa Rica',
  radiusMeters: 500,
};

// Geofence configuration
export const GEOFENCE_CONFIG = {
  UPDATE_INTERVAL_MS: 3000,
  HIGH_ACCURACY: true,
  DISTANCE_FILTER_METERS: 5,
} as const;

// Sync configuration
export const SYNC_CONFIG = {
  MAX_RETRIES: 5,
  BASE_RETRY_DELAY_MS: 2000,
  MOCK_UPLOAD_DELAY_MS: 1500,
} as const;

// Camera configuration
export const CAMERA_CONFIG = {
  QUALITY: 0.85,
  WATERMARK_FONT_SIZE: 14,
  WATERMARK_PADDING: 12,
  WATERMARK_BG_OPACITY: 0.7,
} as const;
