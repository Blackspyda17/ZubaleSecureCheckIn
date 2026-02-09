import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';

interface StatusBannerProps {
  isOnline: boolean;
  pendingSyncCount: number;
}

/**
 * Top banner showing network status and pending sync count.
 * Shows offline warning or pending sync indicator.
 */
export function StatusBanner({ isOnline, pendingSyncCount }: StatusBannerProps) {
  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      style={[
        styles.container,
        isOnline ? styles.syncing : styles.offline,
      ]}
    >
      <Text style={styles.text}>
        {!isOnline
          ? 'You are offline. Check-ins will sync when connected.'
          : `Syncing ${pendingSyncCount} pending check-in${pendingSyncCount > 1 ? 's' : ''}...`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  syncing: {
    backgroundColor: '#FF9800',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
