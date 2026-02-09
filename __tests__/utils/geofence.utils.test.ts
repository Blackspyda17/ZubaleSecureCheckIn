import {
  calculateDistance,
  isWithinGeofence,
  calculateBearing,
} from '../../src/utils/geofence.utils';

describe('GeofenceUtils', () => {
  // Known reference points for testing
  const golfito = { latitude: 8.639, longitude: -83.162 };
  const nearGolfito = { latitude: 8.6395, longitude: -83.1615 }; // ~60m away
  const farFromGolfito = { latitude: 8.65, longitude: -83.15 }; // ~1.6km away
  const samePoint = { latitude: 8.639, longitude: -83.162 };

  describe('calculateDistance', () => {
    it('should return 0 for the same point', () => {
      const distance = calculateDistance(golfito, samePoint);
      expect(distance).toBeCloseTo(0, 0);
    });

    it('should calculate distance for nearby points (<100m)', () => {
      const distance = calculateDistance(golfito, nearGolfito);
      expect(distance).toBeGreaterThan(40);
      expect(distance).toBeLessThan(100);
    });

    it('should calculate distance for far points (>1km)', () => {
      const distance = calculateDistance(golfito, farFromGolfito);
      expect(distance).toBeGreaterThan(1000);
      expect(distance).toBeLessThan(2000);
    });

    it('should be symmetric (A→B same as B→A)', () => {
      const d1 = calculateDistance(golfito, nearGolfito);
      const d2 = calculateDistance(nearGolfito, golfito);
      expect(d1).toBeCloseTo(d2, 5);
    });

    it('should handle antipodal points', () => {
      const pointA = { latitude: 0, longitude: 0 };
      const pointB = { latitude: 0, longitude: 180 };
      const distance = calculateDistance(pointA, pointB);
      // Half the earth's circumference: ~20,015 km
      expect(distance).toBeGreaterThan(20_000_000);
      expect(distance).toBeLessThan(20_100_000);
    });
  });

  describe('isWithinGeofence', () => {
    it('should return true when within radius', () => {
      expect(isWithinGeofence(nearGolfito, golfito, 500)).toBe(true);
    });

    it('should return false when outside radius', () => {
      expect(isWithinGeofence(farFromGolfito, golfito, 500)).toBe(false);
    });

    it('should return true for the exact same point', () => {
      expect(isWithinGeofence(golfito, golfito, 500)).toBe(true);
    });

    it('should return true at the boundary (radius = distance)', () => {
      const distance = calculateDistance(golfito, nearGolfito);
      expect(isWithinGeofence(nearGolfito, golfito, distance)).toBe(true);
    });
  });

  describe('calculateBearing', () => {
    it('should return ~0° for due north', () => {
      const from = { latitude: 0, longitude: 0 };
      const to = { latitude: 1, longitude: 0 };
      const bearing = calculateBearing(from, to);
      expect(bearing).toBeCloseTo(0, 0);
    });

    it('should return ~90° for due east', () => {
      const from = { latitude: 0, longitude: 0 };
      const to = { latitude: 0, longitude: 1 };
      const bearing = calculateBearing(from, to);
      expect(bearing).toBeCloseTo(90, 0);
    });

    it('should return ~180° for due south', () => {
      const from = { latitude: 1, longitude: 0 };
      const to = { latitude: 0, longitude: 0 };
      const bearing = calculateBearing(from, to);
      expect(bearing).toBeCloseTo(180, 0);
    });

    it('should return ~270° for due west', () => {
      const from = { latitude: 0, longitude: 1 };
      const to = { latitude: 0, longitude: 0 };
      const bearing = calculateBearing(from, to);
      expect(bearing).toBeCloseTo(270, 0);
    });

    it('should return a value between 0 and 360', () => {
      const bearing = calculateBearing(golfito, farFromGolfito);
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });
  });
});
