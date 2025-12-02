// Voice Button Component with refined waveform-inspired animation

import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VoiceButtonProps } from '../types/components';
import { UI_CONFIG, PERFORMANCE_CONFIG } from '../config/app.config';

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  mode,
  isRecording,
  onPress,
  disabled,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording && PERFORMANCE_CONFIG.enableAnimations) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      pulseAnim.setValue(1);
    };
  }, [isRecording, pulseAnim]);

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      console.log('Haptics not available');
    }

    onPress();
  };

  const gradientColors = mode === 'emergency'
    ? ['#f43f5e', '#f97316']
    : ['#6366f1', '#06b6d4'];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={disabled && styles.disabled}
          onPress={handlePress}
          disabled={disabled}
          accessibilityLabel={
            isRecording ? 'Recording, tap to stop' : 'Tap to speak'
          }
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          activeOpacity={0.9}
        >
          <LinearGradient colors={gradientColors} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <MaterialCommunityIcons
              name={isRecording ? 'waveform' : 'microphone'}
              size={56}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: UI_CONFIG.voiceButtonSize,
    height: UI_CONFIG.voiceButtonSize,
    borderRadius: UI_CONFIG.voiceButtonSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});
