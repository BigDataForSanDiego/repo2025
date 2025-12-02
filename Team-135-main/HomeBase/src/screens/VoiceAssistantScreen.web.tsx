// Main Voice Assistant Screen - Orchestrates all functionality with refined UI

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  Linking,
  Easing,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../context/AppContext';
import { VoiceButton } from '../components/VoiceButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { AudioManager } from '../services/AudioManager';
import { sendAudioRequest } from '../services/VapiService';
import { lookupResources } from '../services/GISService';
import { getCurrentSessionId, isSessionExpired, resetSession } from '../utils/sessionManager';
import { formatErrorMessage } from '../utils/validation';
import { APP_CONFIG } from '../config/app.config';
import { Resource, TranscriptEntry } from '../types/api';
import {
  DEMO_RESOURCE,
  DEMO_SCENE_OPTIONS,
  DEMO_USER_LOCATION,
  DemoScenario,
  buildDemoTranscripts,
} from '../constants/demoScenes';

const DEMO_SCENES_ENABLED = process.env.EXPO_PUBLIC_ENABLE_DEMO_SCENES !== 'false';

export const VoiceAssistantScreen: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [initialPromptShown, setInitialPromptShown] = useState(false);
  const [demoScenario, setDemoScenario] = useState<DemoScenario | null>(null);
  const liveTranscriptAnim = useRef(new Animated.Value(0)).current;
  const orbWaveAnim = useRef(new Animated.Value(0)).current;
  const orbTranslate = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(1)).current;
  const { height: screenHeight } = useWindowDimensions();
  const addressPanelHeight = Math.max(screenHeight * 0.5, 360);
  const demoTranscripts = useMemo(buildDemoTranscripts, []);
  const activeDemoScenario = DEMO_SCENES_ENABLED ? demoScenario : null;
  const isDemoScene = Boolean(activeDemoScenario);

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

  const effectiveSelectedResource = activeDemoScenario === 'resources'
    ? DEMO_RESOURCE
    : state.selectedResource;
  const effectiveUserLocation = activeDemoScenario === 'resources'
    ? state.userLocation ?? DEMO_USER_LOCATION
    : state.userLocation;
  const effectiveMode = activeDemoScenario === 'emergency'
    ? 'emergency'
    : activeDemoScenario === 'resources'
      ? 'resources'
      : activeDemoScenario === 'idle'
        ? 'initial'
        : state.mode;
  const effectiveTranscripts: TranscriptEntry[] = activeDemoScenario
    ? demoTranscripts[activeDemoScenario]
    : state.transcript;
  const effectiveIsRecording = activeDemoScenario ? false : state.isRecording;
  const latestTranscript = effectiveTranscripts[effectiveTranscripts.length - 1];
  const recentTranscripts = effectiveTranscripts.slice(-2);
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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(orbWaveAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [orbWaveAnim]);

  const showAddressPanel = Boolean(effectiveSelectedResource);

  useEffect(() => {
    const targetTranslate = showAddressPanel ? 170 : 0;
    const targetScale = showAddressPanel ? 0.68 : 1;
    const targetHeader = showAddressPanel ? 0 : 1;
    const targetHalo = showAddressPanel ? 0 : 1;

    Animated.parallel([
      Animated.timing(orbTranslate, {
        toValue: targetTranslate,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(orbScale, {
        toValue: targetScale,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: targetHeader,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(haloOpacity, {
        toValue: targetHalo,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showAddressPanel, orbTranslate, orbScale, headerOpacity, haloOpacity]);

  const handleVoiceButtonPress = async () => {
    if (activeDemoScenario) {
      return;
    }
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

      if (response.resources.length > 0) {
        dispatch({
          type: 'SET_RESOURCES',
          payload: response.resources,
        });
      } else {
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

  const buttonMode = effectiveMode === 'emergency' ? 'emergency' : 'default';

  const renderTranscript = (resourceLayout: boolean) => (
    <Animated.View
      style={[
        styles.liveTranscriptContainer,
        resourceLayout ? styles.liveTranscriptPanelSpacing : styles.liveTranscriptDefaultSpacing,
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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#050408', '#100f1f', '#050408']} style={styles.gradientBackground}>
        {state.error && (
          <ErrorMessage
            message={state.error}
            onDismiss={handleErrorDismiss}
          />
        )}
        {DEMO_SCENES_ENABLED && (
          <DemoSceneControls
            scenario={activeDemoScenario}
            onSelect={setDemoScenario}
          />
        )}

        <View style={styles.contentWrapper}>
          <View
            style={[
              styles.mainContent,
              showAddressPanel && styles.mainContentCompact,
            ]}
          >
            <Animated.View
              style={[
                styles.headerContainer,
                showAddressPanel && styles.headerCollapsed,
                { opacity: headerOpacity },
              ]}
            >
              <View style={styles.titleRow}>
                <View>
                  <Text style={styles.appTitle}>HomeBase</Text>
                  <Text style={styles.appSubtitle}>Distress assistant</Text>
                </View>
              </View>
              <View style={styles.statusChip}>
                <MaterialCommunityIcons
                  name={effectiveIsRecording ? 'waveform' : 'check-circle'}
                  size={16}
                  color="#34d399"
                />
                <Text style={styles.statusChipText}>
                  {effectiveIsRecording ? 'Listening live' : 'Ready to help'}
                </Text>
              </View>
            </Animated.View>

            {showAddressPanel && effectiveSelectedResource ? (
              <>
                <InlineResourcePanel
                  resource={effectiveSelectedResource}
                  userLocation={effectiveUserLocation}
                  onClose={() => {
                    if (activeDemoScenario === 'resources') {
                      setDemoScenario('idle');
                    } else {
                      dispatch({ type: 'SELECT_RESOURCE', payload: null });
                    }
                  }}
                  height={addressPanelHeight}
                />
                <View style={styles.resourceMicSection}>
                  <View style={styles.resourceMicOrb}>
                    <VoiceButton
                      mode={buttonMode}
                      isRecording={effectiveIsRecording}
                      onPress={handleVoiceButtonPress}
                      disabled={isDemoScene}
                    />
                  </View>
                  <Text style={styles.resourceMicHint}>
                    {effectiveIsRecording ? 'HomeBase is listening…' : 'Tap once and start speaking'}
                  </Text>
                </View>
                {renderTranscript(true)}
              </>
            ) : (
              <>
                <View style={styles.interactionWrapper}>
                  <Animated.View
                    style={[
                      styles.waveCanvas,
                      {
                        transform: [
                          { translateY: orbTranslate },
                          { scale: orbScale },
                        ],
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.waveLayer,
                        {
                          transform: [
                            {
                              rotate: orbWaveAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                            {
                              scale: orbWaveAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.08],
                              }),
                            },
                          ],
                          opacity: haloOpacity,
                        },
                      ]}
                    />
                    <LinearGradient
                      colors={['rgba(99,102,241,0.65)', 'rgba(14,165,233,0.35)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.waveInner}
                    />
                    <View style={styles.voiceButtonHolder}>
                      <VoiceButton
                        mode={buttonMode}
                        isRecording={effectiveIsRecording}
                        onPress={handleVoiceButtonPress}
                        disabled={isDemoScene}
                      />
                    </View>
                  </Animated.View>
                  <Text style={styles.orbHint}>
                    {effectiveIsRecording ? 'HomeBase is listening…' : 'Tap once and start speaking'}
                  </Text>
                  {effectiveMode === 'emergency' && (
                    <LinearGradient
                      colors={['#47122f', '#271124']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modeCard}
                    >
                      <View style={styles.modeContent}>
                        <View style={styles.modeBadge}>
                          <MaterialCommunityIcons
                            name="alert-octagon-outline"
                            size={18}
                            color="#fff"
                          />
                        </View>
                        <View style={styles.modeCopy}>
                          <Text style={styles.modeLabel}>Emergency path</Text>
                          <Text style={styles.modeSubtext}>Dispatch + outreach engaged</Text>
                        </View>
                        <View style={[styles.modeStatusDot, styles.modeStatusDotEmergency]} />
                      </View>
                    </LinearGradient>
                  )}
                </View>
                {renderTranscript(false)}
              </>
            )}
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
  demoControlsWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoCollapsedWrapper: {
    right: 4,
  },
  demoControls: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  demoLabel: {
    color: 'rgba(248,250,252,0.65)',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: 'Nunito_600SemiBold',
  },
  demoOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  demoOptionActive: {
    backgroundColor: 'rgba(99,102,241,0.18)',
    borderColor: 'rgba(99,102,241,0.6)',
  },
  demoOptionText: {
    color: 'rgba(248,250,252,0.75)',
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
  },
  demoOptionTextActive: {
    color: '#E0EAFF',
  },
  demoHint: {
    color: 'rgba(248,250,252,0.55)',
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
  },
  demoHintActive: {
    color: '#cbd5f5',
  },
  demoToggleHandle: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(7,12,24,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoToggleHandleCollapsed: {
    backgroundColor: 'rgba(7,12,24,0.7)',
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
    paddingTop: 20,
    paddingBottom: 28,
  },
  mainContentCompact: {
    paddingTop: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerCollapsed: {
    height: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    fontFamily: 'Nunito_700Bold',
  },
  appSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 32,
    gap: 16,
  },
  waveCanvas: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveLayer: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  waveInner: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  voiceButtonHolder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceMicSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 12,
    gap: 12,
  },
  resourceMicOrb: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,18,32,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    boxShadow: '0 18px 30px rgba(0,0,0,0.35)',
  } as any,
  resourceMicHint: {
    fontSize: 13,
    color: 'rgba(248,250,252,0.7)',
    fontFamily: 'Nunito_500Medium',
  },
  inlinePanel: {
    width: '100%',
    borderRadius: 36,
    backgroundColor: '#060912',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
  },
  inlinePanelOffset: {
    marginTop: 4,
  },
  inlineMapContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0b1021',
  },
  inlineMapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineMapOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  inlineMapInfo: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inlineMapTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
  },
  inlineMapSubtitle: {
    color: 'rgba(248,250,252,0.72)',
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Nunito_400Regular',
  },
  inlineDistancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 118, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.5)',
  },
  inlineDistanceText: {
    color: '#e0f2fe',
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
  },
  inlineCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(2,6,23,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineDetailsArea: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
    backgroundColor: 'rgba(7,9,18,0.95)',
  },
  inlineDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineStatusMark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  inlineDetailsLabel: {
    color: '#f8fafc',
    fontSize: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: 'Nunito_600SemiBold',
  },
  inlineMetaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inlineMetaChipIcon: {
    marginRight: 6,
  },
  inlineMetaChipText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
  },
  inlineDivider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inlineInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineInfoIcon: {
    marginRight: 2,
  },
  inlineInfoText: {
    color: 'rgba(248,250,252,0.82)',
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    flex: 1,
  },
  orbHint: {
    fontSize: 14,
    color: 'rgba(248,250,252,0.68)',
    fontFamily: 'Nunito_500Medium',
    marginTop: 32,
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
  liveTranscriptContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  liveTranscriptDefaultSpacing: {
    marginTop: 24,
  },
  liveTranscriptPanelSpacing: {
    marginTop: 18,
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

type InlineResourcePanelProps = {
  resource: Resource;
  userLocation: { latitude: number; longitude: number } | null;
  onClose: () => void;
  height: number;
};

const InlineResourcePanel = ({ resource, userLocation, onClose, height }: InlineResourcePanelProps) => {
  const mapHeight = Math.max(Math.min(height * 0.65, height - 140), 300);
  const detailsHeight = Math.max(height - mapHeight, 160);
  const distanceLabel =
    typeof resource.distanceMeters === 'number'
      ? resource.distanceMeters < 1000
        ? `${Math.round(resource.distanceMeters)} m`
        : `${(resource.distanceMeters / 1000).toFixed(1)} km`
      : null;
  const hoursLabel = resource.metadata?.hours;
  const phoneLabel = resource.metadata?.phone;
  const helperText =
    resource.metadata?.note || 'Ask HomeBase to route you here or request another safe option.';

  return (
    <View style={[styles.inlinePanel, styles.inlinePanelOffset, { height }]}>
      <View style={[styles.inlineMapContainer, { height: mapHeight }]}>
        <LinearGradient
          colors={['#1f1b2e', '#0f1a2e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inlineMapPlaceholder}
        >
          <MaterialCommunityIcons name="map" size={32} color="#a5b4fc" />
          <Text style={{ color: '#cbd5f5', marginTop: 6, fontFamily: 'Nunito_500Medium' }}>
            Map preview unavailable on web
          </Text>
          {userLocation && distanceLabel && (
            <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
              {resource.name} • {distanceLabel} away
            </Text>
          )}
        </LinearGradient>
        <LinearGradient
          colors={['rgba(4,6,12,0)', 'rgba(4,6,12,0.85)']}
          style={styles.inlineMapOverlay}
        />
        <View style={styles.inlineMapInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inlineMapTitle} numberOfLines={1}>
              {resource.name}
            </Text>
            <Text style={styles.inlineMapSubtitle} numberOfLines={1}>
              {resource.address || 'Address provided once connected'}
            </Text>
          </View>
          {distanceLabel && (
            <View style={styles.inlineDistancePill}>
              <MaterialCommunityIcons name="map-marker-distance" size={16} color="#dbeafe" />
              <Text style={styles.inlineDistanceText}>{distanceLabel}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.inlineCloseButton}
          onPress={onClose}
          accessibilityLabel="Close location"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="close" size={20} color="#f1f5f9" />
        </TouchableOpacity>
      </View>

      <View style={[styles.inlineDetailsArea, { height: detailsHeight }]}>
        <View style={styles.inlineDetailsHeader}>
          <View style={styles.inlineStatusMark} />
          <Text style={styles.inlineDetailsLabel}>Resource details</Text>
        </View>

        <View style={styles.inlineMetaChips}>
          {hoursLabel && (
            <View style={styles.inlineMetaChip}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#e7e9ff"
                style={styles.inlineMetaChipIcon}
              />
              <Text style={styles.inlineMetaChipText}>{hoursLabel}</Text>
            </View>
          )}
          {phoneLabel && (
            <View style={styles.inlineMetaChip}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={16}
                color="#e7e9ff"
                style={styles.inlineMetaChipIcon}
              />
              <Text style={styles.inlineMetaChipText}>{phoneLabel}</Text>
            </View>
          )}
          {distanceLabel && (
            <View style={styles.inlineMetaChip}>
              <MaterialCommunityIcons
                name="walk"
                size={16}
                color="#e7e9ff"
                style={styles.inlineMetaChipIcon}
              />
              <Text style={styles.inlineMetaChipText}>{distanceLabel} away</Text>
            </View>
          )}
        </View>

        <View style={styles.inlineDivider} />
        <View style={styles.inlineInfoRow}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color="#cbd5f5"
            style={styles.inlineInfoIcon}
          />
          <Text style={styles.inlineInfoText} numberOfLines={2}>
            {helperText}
          </Text>
        </View>
      </View>
    </View>
  );
};

type DemoSceneControlsProps = {
  scenario: DemoScenario | null;
  onSelect: (scene: DemoScenario | null) => void;
};

const DemoSceneControls = ({ scenario, onSelect }: DemoSceneControlsProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <View style={[styles.demoControlsWrapper, collapsed && styles.demoCollapsedWrapper]}>
      {!collapsed && (
        <View style={styles.demoControls}>
          <Text style={styles.demoLabel}>Demo scenes</Text>
          <View style={styles.demoOptionsRow}>
            {DEMO_SCENE_OPTIONS.map((option) => {
              const isActive = scenario === option.id;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.demoOption, isActive && styles.demoOptionActive]}
                  onPress={() => onSelect(option.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${option.label} scene`}
                >
                  <Text style={[styles.demoOptionText, isActive && styles.demoOptionTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.demoHint, scenario && styles.demoHintActive]}>
            {scenario ? 'Previewing demo — voice input paused' : 'Live voice enabled'}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.demoToggleHandle, collapsed && styles.demoToggleHandleCollapsed]}
        onPress={() => setCollapsed((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={collapsed ? 'Expand demo scene controls' : 'Collapse demo scene controls'}
      >
        <MaterialCommunityIcons
          name={collapsed ? 'chevron-left' : 'chevron-right'}
          size={18}
          color="#cbd5f5"
        />
      </TouchableOpacity>
    </View>
  );
};
