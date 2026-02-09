import {
  checkSystemMockFlag,
  checkLocationHeuristics,
  detectMockLocation,
} from '../../src/services/mockDetector.service';

describe('MockDetectorService', () => {
  describe('checkSystemMockFlag', () => {
    it('should detect mock when system flag is true', () => {
      const result = checkSystemMockFlag(true);
      expect(result.isMocked).toBe(true);
      expect(result.confidence).toBe('high');
    });

    it('should report real when system flag is false', () => {
      const result = checkSystemMockFlag(false);
      expect(result.isMocked).toBe(false);
      expect(result.confidence).toBe('high');
    });
  });

  describe('checkLocationHeuristics', () => {
    it('should not flag normal movement', () => {
      // Walking speed: ~1.4 m/s
      const now = Date.now();
      checkLocationHeuristics(8.639, -83.162, now);
      const result = checkLocationHeuristics(
        8.6391,
        -83.1621,
        now + 10000
      );
      expect(result.isMocked).toBe(false);
    });

    it('should flag impossible teleportation', () => {
      const now = Date.now();
      // First location
      checkLocationHeuristics(8.639, -83.162, now);
      // "Teleport" to very different location in 1 second
      const result = checkLocationHeuristics(
        19.4326,
        -99.1332,
        now + 1000
      );
      expect(result.isMocked).toBe(true);
      expect(result.confidence).toBe('medium');
    });
  });

  describe('detectMockLocation', () => {
    it('should prioritize system flag over heuristics', () => {
      const result = detectMockLocation(
        true,
        8.639,
        -83.162,
        Date.now()
      );
      expect(result.isMocked).toBe(true);
      expect(result.confidence).toBe('high');
    });

    it('should fall back to heuristics when system flag is false', () => {
      const result = detectMockLocation(
        false,
        8.639,
        -83.162,
        Date.now()
      );
      // With no prior history or normal movement, should not flag
      expect(result.confidence).toBe('low');
    });
  });
});
