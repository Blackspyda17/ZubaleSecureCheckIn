import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface MockLocationBannerProps {
  isVisible: boolean;
  reason: string | null;
}

/**
 * Warning banner displayed when fake/mock GPS is detected.
 * Bonus feature: anti-fraud mock location detection.
 */
export function MockLocationBanner({
  isVisible,
  reason,
}: MockLocationBannerProps) {
  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={styles.container}
    >
      <Text style={styles.icon}>&#x26A0;</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Mock Location Detected</Text>
        <Text style={styles.description}>
          {reason || 'Fake GPS application detected. Check-in is disabled for security.'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});
