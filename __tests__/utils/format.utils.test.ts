import {
  formatDistance,
  formatCoordinates,
  formatDateTime,
  generateId,
} from '../../src/utils/format.utils';

describe('FormatUtils', () => {
  describe('formatDistance', () => {
    it('should format meters for distances < 1km', () => {
      expect(formatDistance(42)).toBe('42m');
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format kilometers for distances >= 1km', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(12345)).toBe('12.3km');
    });

    it('should round meters to nearest integer', () => {
      expect(formatDistance(42.7)).toBe('43m');
      expect(formatDistance(42.2)).toBe('42m');
    });
  });

  describe('formatCoordinates', () => {
    it('should format to 6 decimal places', () => {
      expect(formatCoordinates(8.639, -83.162)).toBe(
        '8.639000, -83.162000'
      );
    });

    it('should handle negative coordinates', () => {
      const result = formatCoordinates(-33.8688, 151.2093);
      expect(result).toBe('-33.868800, 151.209300');
    });
  });

  describe('formatDateTime', () => {
    it('should format a timestamp into a readable string', () => {
      const result = formatDateTime(1700000000000);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('generateId', () => {
    it('should return a UUID-like string', () => {
      const id = generateId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });
});
