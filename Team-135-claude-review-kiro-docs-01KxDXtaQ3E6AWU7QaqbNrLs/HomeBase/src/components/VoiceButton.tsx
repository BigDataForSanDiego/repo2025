// Voice Button Component with Animations

import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { VoiceButtonProps } from '../types/components';
import { UI_CONFIG, PERFORMANCE_CONFIG } from '../config/app.config';

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  mode,
  isRecording,
  onPress,
  disabled,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation when recording
  useEffect(() => {
    if (isRecording && PERFORMANCE_CONFIG.enableAnimations) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handlePress = async () => {
    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics might not be available on all devices
      console.log('Haptics not available');
    }

    onPress();
  };

  const backgroundColor = mode === 'emergency'
    ? UI_CONFIG.voiceButtonColor.emergency
    : UI_CONFIG.voiceButtonColor.default;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor },
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={
          isRecording ? 'Recording, tap to stop' : 'Tap to speak'
        }
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {/* Microphone icon indicator */}
        <Animated.View style={styles.iconContainer}>
          {isRecording ? (
            <Animated.View style={styles.recordingIndicator} />
          ) : (
            <Animated.View style={styles.micIcon} />
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: UI_CONFIG.voiceButtonSize,
    height: UI_CONFIG.voiceButtonSize,
    borderRadius: UI_CONFIG.voiceButtonSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    width: 40,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  recordingIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
});
