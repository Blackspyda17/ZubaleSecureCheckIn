import * as Location from 'expo-location';
import { Coordinates, LocationData } from '../types';
import { GEOFENCE_CONFIG } from '../constants/config';

/**
 * Request location permissions from the user.
 * Returns true if foreground permission was granted.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }

  // Also request background for potential future use
  await Location.requestBackgroundPermissionsAsync().catch(() => {
    // Background permission is optional, don't fail if denied
  });

  return true;
}

/**
 * Get the current device location.
 * Returns null if unavailable (GPS off, permissions denied).
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: GEOFENCE_CONFIG.HIGH_ACCURACY
        ? Location.Accuracy.High
        : Location.Accuracy.Balanced,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      timestamp: location.timestamp,
      isMocked: location.mocked ?? false,
      accuracy: location.coords.accuracy,
    };
  } catch {
    return null;
  }
}

/**
 * Subscribe to location updates for real-time geofence tracking.
 * Returns a cleanup function to stop watching.
 */
export async function watchLocation(
  onUpdate: (location: LocationData) => void,
  onError: (error: string) => void
): Promise<Location.LocationSubscription> {
  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: GEOFENCE_CONFIG.UPDATE_INTERVAL_MS,
      distanceInterval: GEOFENCE_CONFIG.DISTANCE_FILTER_METERS,
    },
    (location) => {
      onUpdate({
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        timestamp: location.timestamp,
        isMocked: location.mocked ?? false,
        accuracy: location.coords.accuracy,
      });
    }
  );
}

/**
 * Reverse geocode coordinates to get a human-readable address.
 * Used for watermark display. Falls back gracefully if offline.
 */
export async function reverseGeocode(
  coords: Coordinates
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync(coords);
    if (results.length > 0) {
      const place = results[0];
      return [place.street, place.city, place.region]
        .filter(Boolean)
        .join(', ');
    }
    return null;
  } catch {
    return null;
  }
}
