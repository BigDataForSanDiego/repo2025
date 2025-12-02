// Main Voice Assistant Screen - Orchestrates all functionality

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { useAppState } from '../context/AppContext';
import { VoiceButton } from '../components/VoiceButton';
import { TranscriptView } from '../components/TranscriptView';
import { ResourceCard } from '../components/ResourceCard';
import { ErrorMessage } from '../components/ErrorMessage';
import { AudioManager } from '../services/AudioManager';
import { sendAudioRequest } from '../services/VapiService';
import { lookupResources } from '../services/GISService';
import { getCurrentSessionId, isSessionExpired, resetSession } from '../utils/sessionManager';
import { formatErrorMessage } from '../utils/validation';
import { APP_CONFIG, PERFORMANCE_CONFIG } from '../config/app.config';

export const VoiceAssistantScreen: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [initialPromptShown, setInitialPromptShown] = useState(false);
  const buttonPosAnim = useRef(new Animated.Value(0)).current;

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  // Check session expiration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        handleSessionExpired();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Animate button when resource card appears/disappears
  useEffect(() => {
    if (state.selectedResource && PERFORMANCE_CONFIG.enableAnimations) {
      Animated.timing(buttonPosAnim, {
        toValue: 100, // Move down
        duration: PERFORMANCE_CONFIG.animationDuration,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(buttonPosAnim, {
        toValue: 0,
        duration: PERFORMANCE_CONFIG.animationDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [state.selectedResource]);

  const initialize = async () => {
    try {
      // Request permissions
      const audioGranted = await AudioManager.requestPermissions();
      if (!audioGranted) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'We need permission to use the microphone.',
        });
        return;
      }

      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        dispatch({
          type: 'SET_ERROR',
          payload: 'We need permission to use your location.',
        });
        return;
      }

      // Get user location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      dispatch({
        type: 'SET_LOCATION',
        payload: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
        },
      });

      // Play initial prompt
      if (!initialPromptShown) {
        await AudioManager.playTTS(APP_CONFIG.initialPrompt);
        setInitialPromptShown(true);
      }

    } catch (error: any) {
      console.error('Initialization error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: formatErrorMessage(error),
      });
    }
  };

  const handleSessionExpired = () => {
    const newSessionId = resetSession();
    dispatch({ type: 'RESET_SESSION', payload: newSessionId });
    dispatch({
      type: 'SET_ERROR',
      payload: "Let's start again. Press the button when you're ready.",
    });
  };

  const handleVoiceButtonPress = async () => {
    if (state.isRecording) {
      // Stop recording and process
      await stopRecordingAndProcess();
    } else {
      // Start recording
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      await AudioManager.startRecording();
      dispatch({ type: 'SET_RECORDING', payload: true });
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: formatErrorMessage(error),
      });
    }
  };

  const stopRecordingAndProcess = async () => {
    try {
      // Stop recording
      dispatch({ type: 'SET_RECORDING', payload: false });
      const audioBase64 = await AudioManager.stopRecording();

      // Send to Vapi
      const sessionId = getCurrentSessionId();
      const response = await sendAudioRequest(audioBase64, sessionId);

      // Update transcript
      dispatch({
        type: 'UPDATE_TRANSCRIPT',
        payload: response.transcript,
      });

      // Handle intent
      await handleIntent(response.intent, response);

    } catch (error: any) {
      console.error('Failed to process audio:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: formatErrorMessage(error),
      });
    }
  };

  const handleIntent = async (intent: string, response: any) => {
    // Handle emergency intent
    if (intent === 'emergency') {
      dispatch({ type: 'SET_MODE', payload: 'emergency' });

      // Check if response indicates immediate 911 need
      if (response.requires911) {
        await handle911Call();
      }
    }

    // Handle resources intent
    else if (intent === 'get_resources' || response.resources.length > 0) {
      dispatch({ type: 'SET_MODE', payload: 'resources' });

      // If resources already in response, use them
      if (response.resources.length > 0) {
        dispatch({
          type: 'SET_RESOURCES',
          payload: response.resources,
        });
      } else {
        // Otherwise, look up resources via GIS
        await performGISLookup(response.resourceType || 'other');
      }
    }
  };

  const handle911Call = async () => {
    if (!APP_CONFIG.enable911Calling) {
      console.log('[DEBUG] 911 calling disabled in config');
      return;
    }

    try {
      const supported = await Linking.canOpenURL('tel:911');
      if (supported) {
        Alert.alert(
          'Call 911?',
          'This will call emergency services.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Call 911',
              style: 'destructive',
              onPress: () => Linking.openURL('tel:911'),
            },
          ]
        );
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Unable to make emergency call. Please dial 911 directly.',
        });
      }
    } catch (error) {
      console.error('Failed to initiate 911 call:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Unable to make emergency call. Please dial 911 directly.',
      });
    }
  };

  const performGISLookup = async (resourceType: 'shelter' | 'food' | 'other') => {
    if (!state.userLocation) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Location not available.',
      });
      return;
    }

    try {
      const resources = await lookupResources(
        state.userLocation.latitude,
        state.userLocation.longitude,
        resourceType
      );

      if (resources.length === 0) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'No nearby resources found. Try a different request.',
        });
      } else {
        dispatch({ type: 'SET_RESOURCES', payload: resources });
      }

    } catch (error: any) {
      console.error('GIS lookup failed:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: formatErrorMessage(error),
      });
    }
  };

  const handleErrorDismiss = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const buttonMode = state.mode === 'emergency' ? 'emergency' : 'default';

  return (
    <SafeAreaView style={styles.container}>
      {/* Error message (toast-style, doesn't block interaction) */}
      {state.error && (
        <ErrorMessage
          message={state.error}
          onDismiss={handleErrorDismiss}
        />
      )}

      {/* Initial prompt text */}
      {state.transcript.length === 0 && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>
            {APP_CONFIG.initialPrompt}
          </Text>
        </View>
      )}

      {/* Transcript view */}
      <TranscriptView
        entries={state.transcript}
        resourceCardVisible={state.selectedResource !== null}
      />

      {/* Resource card (conditional) */}
      {state.selectedResource && state.userLocation && (
        <ResourceCard
          resource={state.selectedResource}
          userLocation={state.userLocation}
          onClose={() => dispatch({ type: 'SELECT_RESOURCE', payload: null })}
        />
      )}

      {/* Voice button with animation */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ translateY: buttonPosAnim }],
          },
        ]}
      >
        <VoiceButton
          mode={buttonMode}
          isRecording={state.isRecording}
          onPress={handleVoiceButtonPress}
          disabled={false}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  promptContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 20,
  },
  promptText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#374151',
    lineHeight: 26,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
