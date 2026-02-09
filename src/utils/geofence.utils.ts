import { Coordinates } from '../types';

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in meters.
 *
 * Haversine is accurate for short distances (< 1000km) which is
 * more than sufficient for our 500m geofence radius.
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Check if a position is within a geofence radius.
 */
export function isWithinGeofence(
  position: Coordinates,
  target: Coordinates,
  radiusMeters: number
): boolean {
  return calculateDistance(position, target) <= radiusMeters;
}

/**
 * Calculate the bearing (compass direction) from one point to another.
 * Returns degrees from North (0-360).
 * Used for the compass overlay bonus feature.
 */
export function calculateBearing(
  from: Coordinates,
  to: Coordinates
): number {
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  const y = Math.sin(dLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);

  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
