import { useState, useEffect, useCallback, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';

/**
 * Hook that provides compass heading using the device magnetometer.
 * Used for the bonus compass overlay feature.
 *
 * Combined with the bearing from useGeofence, this allows
 * showing an arrow pointing toward the target location.
 */
export function useCompass() {
  const [heading, setHeading] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof Magnetometer.addListener> | null>(null);

  // Low-pass filter to smooth magnetometer readings
  const prevHeadingRef = useRef(0);
  const SMOOTHING_FACTOR = 0.15;

  const calculateHeading = useCallback(
    (magnetometer: { x: number; y: number; z: number }) => {
      const { x, y } = magnetometer;
      let angle = Math.atan2(y, x) * (180 / Math.PI);

      // Normalize to 0-360
      angle = (angle + 360) % 360;

      // Adjust for device orientation (pointing up = North)
      angle = (360 - angle) % 360;

      // Apply low-pass filter for smooth rotation
      const smoothed =
        prevHeadingRef.current +
        SMOOTHING_FACTOR * (angle - prevHeadingRef.current);
      prevHeadingRef.current = smoothed;

      setHeading(smoothed);
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    async function init() {
      const available = await Magnetometer.isAvailableAsync();
      if (mounted) {
        setIsAvailable(available);
      }

      if (available) {
        Magnetometer.setUpdateInterval(100); // 10 Hz

        subscriptionRef.current = Magnetometer.addListener((data) => {
          if (mounted) {
            calculateHeading(data);
          }
        });
      }
    }

    init();

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, [calculateHeading]);

  /**
   * Calculate the rotation angle for an arrow pointing to the target.
   * @param bearingToTarget - Bearing from current position to target (from geofence)
   * @returns Rotation in degrees for the arrow UI element
   */
  const getArrowRotation = useCallback(
    (bearingToTarget: number) => {
      return bearingToTarget - heading;
    },
    [heading]
  );

  return {
    heading,
    isAvailable,
    getArrowRotation,
  };
}
