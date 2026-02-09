import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface CaptureButtonProps {
  onCapture: () => void;
  disabled: boolean;
  isCapturing: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function CaptureButton({
  onCapture,
  disabled,
  isCapturing,
}: CaptureButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled || isCapturing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCapture();
  }, [disabled, isCapturing, onCapture]);

  return (
    <AnimatedTouchable
      style={[styles.button, animatedStyle, disabled && styles.disabled]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isCapturing}
      activeOpacity={0.8}
    >
      {isCapturing ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View style={styles.innerCircle} />
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  disabled: {
    opacity: 0.4,
  },
});
