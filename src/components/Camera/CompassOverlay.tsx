import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useCompass } from '../../hooks/useCompass';
import { formatDistance } from '../../utils/format.utils';

interface CompassOverlayProps {
  bearingToTarget: number;
  distanceMeters: number;
  targetName: string;
}

/**
 * Compass overlay that shows an arrow pointing toward the target store.
 * Bonus feature: Uses magnetometer for real compass heading.
 */
export function CompassOverlay({
  bearingToTarget,
  distanceMeters,
  targetName,
}: CompassOverlayProps) {
  const { heading, isAvailable, getArrowRotation } = useCompass();

  const rotation = useMemo(
    () => (isAvailable ? getArrowRotation(bearingToTarget) : 0),
    [isAvailable, getArrowRotation, bearingToTarget]
  );

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(`${rotation}deg`, { damping: 20 }) }],
  }));

  if (!isAvailable) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.arrowContainer, arrowStyle]}>
        <Text style={styles.arrow}>&#x25B2;</Text>
      </Animated.View>
      <Text style={styles.distance}>{formatDistance(distanceMeters)}</Text>
      <Text style={styles.target} numberOfLines={1}>
        {targetName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 28,
    color: '#4CAF50',
  },
  distance: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  target: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
    maxWidth: 80,
    textAlign: 'center',
  },
});
