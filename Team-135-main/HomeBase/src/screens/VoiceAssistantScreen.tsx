// Main Voice Assistant Screen - Orchestrates all functionality with refined UI

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  Linking,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../context/AppContext';
import { VoiceButton } from '../components/VoiceButton';
import { ResourceCard } from '../components/ResourceCard';
import { ErrorMessage } from '../components/ErrorMessage';
import { AudioManager } from '../services/AudioManager';
import { sendAudioRequest } from '../services/VapiService';
import { lookupResources } from '../services/GISService';
import { getCurrentSessionId, isSessionExpired, resetSession } from '../utils/sessionManager';
import { formatErrorMessage } from '../utils/validation';
import { APP_CONFIG } from '../config/app.config';
import ResourceResultsScreen from './ResourceResultsScreen';
import { Resource } from '../types/api';

export const VoiceAssistantScreen: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [initialPromptShown, setInitialPromptShown] = useState(false);
  const [showResourceResults, setShowResourceResults] = useState(false);
  const [currentResourceType, setCurrentResourceType] = useState<'shelter' | 'food' | 'medical' | 'hygiene' | 'other'>('other');
  const liveTranscriptAnim = useRef(new Animated.Value(0)).current;

  // Initialize on mount
  const initialize = useCallback(async () => {
    try {
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
  }, [dispatch, initialPromptShown]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSessionExpired = useCallback(() => {
    const newSessionId = resetSession();
    dispatch({ type: 'RESET_SESSION', payload: newSessionId });
    dispatch({
      type: 'SET_ERROR',
      payload: "Let's start again. Press the button when you're ready.",
    });
  }, [dispatch]);

  // Check session expiration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        handleSessionExpired();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [handleSessionExpired]);

  const latestTranscript = state.transcript[state.transcript.length - 1];
  const recentTranscripts = state.transcript.slice(-3);
  const liveTranslate = recentTranscripts.length > 0
    ? liveTranscriptAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 0],
      })
    : 0;

  useEffect(() => {
    if (!latestTranscript) return;

    liveTranscriptAnim.setValue(0);
    Animated.timing(liveTranscriptAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [latestTranscript, liveTranscriptAnim]);

  const handleVoiceButtonPress = async () => {
    if (state.isRecording) {
      await stopRecordingAndProcess();
    } else {
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
      dispatch({ type: 'SET_RECORDING', payload: false });
      const audioBase64 = await AudioManager.stopRecording();

      const sessionId = getCurrentSessionId();
      const response = await sendAudioRequest(audioBase64, sessionId);

      dispatch({
        type: 'UPDATE_TRANSCRIPT',
        payload: response.transcript,
      });

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
    if (intent === 'emergency') {
      dispatch({ type: 'SET_MODE', payload: 'emergency' });

      if (response.requires911) {
        await handle911Call();
      }
    } else if (intent === 'get_resources' || response.resources.length > 0) {
      dispatch({ type: 'SET_MODE', payload: 'resources' });

      // Determine resource type from response or transcript
      let resourceType: 'shelter' | 'food' | 'medical' | 'hygiene' | 'other' = 'other';
      
      if (response.resourceType) {
        resourceType = response.resourceType;
      } else {
        // Parse from transcript to detect resource type
        const lastTranscript = state.transcript[state.transcript.length - 1]?.text.toLowerCase() || '';
        if (lastTranscript.includes('shelter') || lastTranscript.includes('housing') || lastTranscript.includes('sleep')) {
          resourceType = 'shelter';
        } else if (lastTranscript.includes('food') || lastTranscript.includes('meal') || lastTranscript.includes('eat')) {
          resourceType = 'food';
        } else if (lastTranscript.includes('medical') || lastTranscript.includes('doctor') || lastTranscript.includes('health') || lastTranscript.includes('clinic')) {
          resourceType = 'medical';
        } else if (lastTranscript.includes('shower') || lastTranscript.includes('hygiene') || lastTranscript.includes('bathroom') || lastTranscript.includes('clean')) {
          resourceType = 'hygiene';
        }
      }

      if (response.resources && response.resources.length > 0) {
        dispatch({
          type: 'SET_RESOURCES',
          payload: response.resources,
        });
      }
      
      // Always show the resource results screen
      await performGISLookup(resourceType);
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

  const performGISLookup = async (resourceType: 'shelter' | 'food' | 'medical' | 'hygiene' | 'other') => {
    if (!state.userLocation) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Location not available.',
      });
      return;
    }

    try {
      // Navigate to ResourceResultsScreen
      setCurrentResourceType(resourceType);
      setShowResourceResults(true);
    } catch (error: any) {
      console.error('GIS lookup failed:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: formatErrorMessage(error),
      });
    }
  };

  const handleBackFromResults = () => {
    setShowResourceResults(false);
  };

  const handleTalkToSomeone = (resource: Resource) => {
    // Handle voice call or connection to resource
    console.log('Talk to someone at:', resource.name);
    if (resource.metadata?.phone) {
      Alert.alert(
        'Call Resource',
        `Would you like to call ${resource.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => Linking.openURL(`tel:${resource.metadata?.phone}`),
          },
        ]
      );
    }
  };

  const handleErrorDismiss = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const buttonMode = state.mode === 'emergency' ? 'emergency' : 'default';

  // Show ResourceResultsScreen if resources are being displayed
  if (showResourceResults && state.userLocation) {
    return (
      <ResourceResultsScreen
        userLocation={state.userLocation}
        resourceType={currentResourceType}
        onBack={handleBackFromResults}
        onTalkToSomeone={handleTalkToSomeone}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#050408', '#100f1f', '#050408']} style={styles.gradientBackground}>
        {state.error && (
          <ErrorMessage
            message={state.error}
            onDismiss={handleErrorDismiss}
          />
        )}

        {state.selectedResource && state.userLocation && (
          <View style={styles.resourceCardContainer}>
            <ResourceCard
              resource={state.selectedResource}
              userLocation={state.userLocation}
              onClose={() => dispatch({ type: 'SELECT_RESOURCE', payload: null })}
            />
          </View>
        )}

        <View style={styles.contentWrapper}>
          <View style={styles.mainContent}>
            <View style={styles.headerContainer}>
              <View style={styles.titleRow}>
                <View style={styles.titleIcon}>
                  <MaterialCommunityIcons name="shield-home" size={20} color="#0f172a" />
                </View>
              <View>
                <Text style={styles.appTitle}>HomeBase</Text>
                <Text style={styles.appSubtitle}>Distress assistant</Text>
              </View>
            </View>
            <View style={styles.statusChip}>
              <MaterialCommunityIcons
                name={state.isRecording ? 'waveform' : 'check-circle'}
                size={16}
                color="#34d399"
              />
              <Text style={styles.statusChipText}>
                {state.isRecording ? 'Listening live' : 'Ready to help'}
              </Text>
            </View>
          </View>

            <View style={styles.interactionWrapper}>
              <LinearGradient
                colors={['#261245', '#0a1c38']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.orbShell}
              >
                <View style={styles.orbGlow} />
                <LinearGradient colors={['#141826', '#040507']} style={styles.orbCore}>
                  <VoiceButton
                    mode={buttonMode}
                    isRecording={state.isRecording}
                    onPress={handleVoiceButtonPress}
                    disabled={false}
                  />
                </LinearGradient>
              </LinearGradient>
              <Text style={styles.orbHint}>
                {state.isRecording ? 'HomeBase is listening…' : 'Tap once and start speaking'}
              </Text>
              {state.mode !== 'initial' && (
                <LinearGradient
                  colors={state.mode === 'emergency' ? ['#47122f', '#271124'] : ['#123538', '#0e1f34']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modeCard}
                >
                  <View style={styles.modeContent}>
                    <View style={styles.modeBadge}>
                      <MaterialCommunityIcons
                        name={state.mode === 'emergency' ? 'alert-octagon-outline' : 'map-marker-check'}
                        size={18}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.modeCopy}>
                      <Text style={styles.modeLabel}>
                        {state.mode === 'emergency' ? 'Emergency path' : 'Resource path'}
                      </Text>
                      <Text style={styles.modeSubtext}>
                        {state.mode === 'emergency' ? 'Dispatch + outreach engaged' : 'Outreach navigator connected'}
                      </Text>
                    </View>
                    <View
                      style={[styles.modeStatusDot, state.mode === 'emergency' ? styles.modeStatusDotEmergency : styles.modeStatusDotResource]}
                    />
                  </View>
                </LinearGradient>
              )}
            </View>

          <Animated.View
            style={[
              styles.liveTranscriptContainer,
              {
                opacity: recentTranscripts.length > 0 ? liveTranscriptAnim : 0.85,
                transform: [{ translateY: liveTranslate }],
              },
            ]}
          >
            <View style={styles.liveTranscriptHeader}>
              <MaterialCommunityIcons name="waveform" size={18} color="#E5E7EB" />
              <Text style={styles.liveTranscriptTitle}>Live transcript</Text>
              {latestTranscript && (
                <Text style={styles.liveTranscriptTimestamp}>
                  {new Date(latestTranscript.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
            {recentTranscripts.length === 0 ? (
              <Text style={styles.liveTranscriptEmpty}>
                Your words will appear here instantly.
              </Text>
            ) : (
              recentTranscripts.map((entry, index) => (
                <View
                  key={`${entry.timestamp}-${index}`}
                  style={[
                    styles.liveTranscriptBubble,
                    entry.speaker === 'user'
                      ? styles.liveUserBubble
                      : styles.liveAgentBubble,
                  ]}
                >
                  <Text style={styles.liveTranscriptText}>{entry.text}</Text>
                </View>
              ))
            )}
          </Animated.View>
        </View>
      </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050408',
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontFamily: 'Nunito_700Bold',
  },
  appSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: 'Nunito_500Medium',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusChipText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Nunito_600SemiBold',
  },
  interactionWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 16,
  },
  orbShell: {
    width: 320,
    height: 320,
    borderRadius: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  orbGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  orbCore: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  orbHint: {
    fontSize: 14,
    color: 'rgba(248,250,252,0.68)',
    fontFamily: 'Nunito_500Medium',
  },
  modeCard: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 24,
    width: '85%',
  },
  modeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCopy: {
    flex: 1,
  },
  modeLabel: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Nunito_600SemiBold',
  },
  modeSubtext: {
    color: 'rgba(248,250,252,0.7)',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Nunito_400Regular',
  },
  modeStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  modeStatusDotEmergency: {
    backgroundColor: '#f87171',
  },
  modeStatusDotResource: {
    backgroundColor: '#34d399',
  },
  liveTranscriptContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 18,
    marginTop: 28,
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  liveTranscriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveTranscriptTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Nunito_600SemiBold',
  },
  liveTranscriptTimestamp: {
    marginLeft: 'auto',
    color: 'rgba(248,250,252,0.6)',
    fontSize: 12,
  },
  liveTranscriptEmpty: {
    color: 'rgba(248,250,252,0.7)',
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  liveTranscriptBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 8,
  },
  liveUserBubble: {
    backgroundColor: 'rgba(248,250,252,0.1)',
    alignSelf: 'flex-start',
  },
  liveAgentBubble: {
    backgroundColor: 'rgba(96,165,250,0.2)',
    alignSelf: 'flex-end',
  },
  liveTranscriptText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Nunito_500Medium',
  },
  resourceCardContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 100,
  },
});
