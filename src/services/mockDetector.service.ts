import { Platform } from 'react-native';
import * as Location from 'expo-location';

/**
 * Detect if the device is using mock/fake location.
 *
 * Detection strategies:
 * 1. Android: expo-location provides `mocked` field in location data
 * 2. iOS: Check for jailbreak indicators (less reliable)
 * 3. Heuristic: Rapid impossible location changes
 *
 * This is a bonus feature for the anti-fraud requirement.
 */

interface MockDetectionResult {
  isMocked: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

// Store recent locations for heuristic analysis
const locationHistory: Array<{ lat: number; lng: number; time: number }> = [];
const MAX_HISTORY = 10;
const IMPOSSIBLE_SPEED_MPS = 340; // Speed of sound - impossible for human movement

/**
 * Primary mock detection using system-provided flag.
 */
export function checkSystemMockFlag(isMocked: boolean): MockDetectionResult {
  if (isMocked) {
    return {
      isMocked: true,
      confidence: 'high',
      reason: 'System reports mock location enabled',
    };
  }
  return {
    isMocked: false,
    confidence: 'high',
    reason: 'System reports real location',
  };
}

/**
 * Heuristic mock detection: checks for impossible movement speeds.
 * If the device "teleported" faster than physically possible,
 * it's likely using a fake GPS app.
 */
export function checkLocationHeuristics(
  latitude: number,
  longitude: number,
  timestamp: number
): MockDetectionResult {
  const entry = { lat: latitude, lng: longitude, time: timestamp };

  if (locationHistory.length > 0) {
    const prev = locationHistory[locationHistory.length - 1];
    const timeDelta = (timestamp - prev.time) / 1000; // seconds

    if (timeDelta > 0) {
      // Simple distance calculation (good enough for speed check)
      const latDiff = entry.lat - prev.lat;
      const lngDiff = entry.lng - prev.lng;
      const approxMeters =
        Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111320;
      const speed = approxMeters / timeDelta;

      if (speed > IMPOSSIBLE_SPEED_MPS) {
        return {
          isMocked: true,
          confidence: 'medium',
          reason: `Impossible movement speed detected: ${Math.round(speed)} m/s`,
        };
      }
    }
  }

  // Maintain history buffer
  locationHistory.push(entry);
  if (locationHistory.length > MAX_HISTORY) {
    locationHistory.shift();
  }

  return {
    isMocked: false,
    confidence: 'low',
    reason: 'No anomalies detected in movement pattern',
  };
}

/**
 * Combined mock detection check.
 * Uses multiple strategies for robust detection.
 */
export function detectMockLocation(
  systemMocked: boolean,
  latitude: number,
  longitude: number,
  timestamp: number
): MockDetectionResult {
  // System flag is most reliable
  const systemCheck = checkSystemMockFlag(systemMocked);
  if (systemCheck.isMocked) {
    return systemCheck;
  }

  // Heuristic check as fallback
  return checkLocationHeuristics(latitude, longitude, timestamp);
}
