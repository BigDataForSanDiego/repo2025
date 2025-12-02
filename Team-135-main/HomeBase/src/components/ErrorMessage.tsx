// Error Message Component (Toast-style)

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ErrorMessageProps } from '../types/components';
import { PERFORMANCE_CONFIG } from '../config/app.config';

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleDismiss = useCallback(() => {
    if (PERFORMANCE_CONFIG.enableAnimations) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onDismiss());
    } else {
      onDismiss();
    }
  }, [fadeAnim, onDismiss]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [fadeAnim, handleDismiss]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.errorBox}
        onPress={handleDismiss}
        activeOpacity={0.9}
        accessibilityLabel={`Error: ${message}. Tap to dismiss`}
        accessibilityRole="alert"
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="alert-octagon" size={22} color="#B91C1C" />
        </View>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="close" size={18} color="#DC2626" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 20,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#7F1D1D',
    fontWeight: '500',
  },
  dismissButton: {
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
