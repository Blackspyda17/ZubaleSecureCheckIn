import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { formatDistance } from '../../utils/format.utils';

interface GeofenceIndicatorProps {
  distanceMeters: number;
  radiusMeters: number;
  isWithinFence: boolean;
  accuracy: number | null;
}

/**
 * Visual indicator showing distance to target and geofence status.
 * Animates color transition between in/out of range.
 */
export function GeofenceIndicator({
  distanceMeters,
  radiusMeters,
  isWithinFence,
  accuracy,
}: GeofenceIndicatorProps) {
  const progress = useMemo(() => {
    if (distanceMeters === Infinity) return 0;
    return Math.max(0, Math.min(1, 1 - distanceMeters / (radiusMeters * 2)));
  }, [distanceMeters, radiusMeters]);

  const barStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, { duration: 500 }),
    backgroundColor: interpolateColor(
      progress,
      [0, 0.4, 0.6, 1],
      ['#F44336', '#FF9800', '#FFC107', '#4CAF50']
    ),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Distance to Store</Text>
        <Text
          style={[styles.distance, isWithinFence && styles.distanceActive]}
        >
          {distanceMeters === Infinity ? '--' : formatDistance(distanceMeters)}
        </Text>
      </View>

      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isWithinFence
            ? 'You are within check-in range'
            : `Must be within ${formatDistance(radiusMeters)}`}
        </Text>
        {accuracy !== null && (
          <Text style={styles.accuracy}>
            GPS accuracy: {Math.round(accuracy)}m
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  distance: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  distanceActive: {
    color: '#4CAF50',
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  accuracy: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
  },
});
