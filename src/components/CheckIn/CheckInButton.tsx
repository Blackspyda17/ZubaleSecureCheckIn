import React, { useCallback } from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface CheckInButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
  label?: string;
}

/**
 * Primary check-in button with animated feedback.
 * Disabled when user is outside geofence or mock location is detected.
 */
export function CheckInButton({
  onPress,
  disabled,
  isLoading,
  label = 'Check In',
}: CheckInButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(0.95);
    }
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  }, [disabled, isLoading, onPress]);

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.text, disabled && styles.textDisabled]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: '#2C2C3E',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  textDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
});
