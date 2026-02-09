import { useEffect, useCallback, useRef } from 'react';
import { LocationSubscription } from 'expo-location';
import { useCheckInStore } from '../store/checkIn.store';
import {
  requestLocationPermissions,
  watchLocation,
  getCurrentLocation,
} from '../services/location.service';
import { detectMockLocation } from '../services/mockDetector.service';
import {
  calculateDistance,
  calculateBearing,
  isWithinGeofence,
} from '../utils/geofence.utils';
import { TARGET_LOCATION } from '../constants/config';

/**
 * Hook that manages geofence tracking.
 * Watches the device location and calculates distance/bearing to target.
 * Also integrates mock location detection.
 */
export function useGeofence() {
  const subscriptionRef = useRef<LocationSubscription | null>(null);

  const {
    currentLocation,
    geofence,
    isMockDetected,
    mockReason,
    locationError,
    setLocation,
    setGeofence,
    setMockDetected,
    setLocationError,
  } = useCheckInStore();

  const processLocation = useCallback(
    (location: { coords: { latitude: number; longitude: number }; timestamp: number; isMocked: boolean; accuracy: number | null }) => {
      setLocation(location);

      const distance = calculateDistance(
        location.coords,
        TARGET_LOCATION.coords
      );

      const bearing = calculateBearing(
        location.coords,
        TARGET_LOCATION.coords
      );

      const withinFence = isWithinGeofence(
        location.coords,
        TARGET_LOCATION.coords,
        TARGET_LOCATION.radiusMeters
      );

      setGeofence({
        isWithinFence: withinFence,
        distanceMeters: distance,
        bearing,
      });

      // Mock detection
      const mockResult = detectMockLocation(
        location.isMocked,
        location.coords.latitude,
        location.coords.longitude,
        location.timestamp
      );

      setMockDetected(mockResult.isMocked, mockResult.reason);
    },
    [setLocation, setGeofence, setMockDetected]
  );

  const startTracking = useCallback(async () => {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      setLocationError(
        'Location permission denied. Please enable it in Settings.'
      );
      return;
    }

    // Get initial position immediately
    const initialLocation = await getCurrentLocation();
    if (initialLocation) {
      processLocation(initialLocation);
    }

    // Start continuous tracking
    try {
      const subscription = await watchLocation(
        processLocation,
        (error) => setLocationError(error)
      );
      subscriptionRef.current = subscription;
    } catch {
      setLocationError('Failed to start location tracking');
    }
  }, [processLocation, setLocationError]);

  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  useEffect(() => {
    startTracking();
    return stopTracking;
  }, [startTracking, stopTracking]);

  return {
    currentLocation,
    geofence,
    isMockDetected,
    mockReason,
    locationError,
    targetLocation: TARGET_LOCATION,
  };
}
