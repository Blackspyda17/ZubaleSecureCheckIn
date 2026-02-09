import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface LoadingSkeletonProps {
  message?: string;
}

/**
 * Loading skeleton shown while GPS is acquiring a fix.
 * Pulsating animation for visual feedback.
 */
export function LoadingSkeleton({
  message = 'Acquiring GPS signal...',
}: LoadingSkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, pulseStyle]} />
      <Text style={styles.text}>{message}</Text>
      <View style={styles.bars}>
        <Animated.View style={[styles.bar, styles.barLong, pulseStyle]} />
        <Animated.View style={[styles.bar, styles.barShort, pulseStyle]} />
        <Animated.View style={[styles.bar, styles.barMedium, pulseStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2C2C3E',
    marginBottom: 16,
  },
  text: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 24,
  },
  bars: {
    width: '100%',
    gap: 8,
  },
  bar: {
    height: 12,
    backgroundColor: '#2C2C3E',
    borderRadius: 6,
  },
  barLong: {
    width: '100%',
  },
  barShort: {
    width: '60%',
  },
  barMedium: {
    width: '80%',
  },
});
