// Audio Manager Service for Recording and TTS

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { AUDIO_CONFIG } from '../config/app.config';

let recording: Audio.Recording | null = null;

/**
 * Requests microphone permissions
 */
export const requestPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request audio permissions:', error);
    return false;
  }
};

/**
 * Starts audio recording
 */
export const startRecording = async (): Promise<void> => {
  try {
    // Request permissions if not already granted
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission denied');
    }

    // Configure audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create and start recording
    const { recording: newRecording } = await Audio.Recording.createAsync({
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: AUDIO_CONFIG.sampleRate,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        audioQuality: Audio.IOSAudioQuality.MEDIUM,
        sampleRate: AUDIO_CONFIG.sampleRate,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    });

    recording = newRecording;
    console.log('Recording started');
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
};

/**
 * Stops recording and returns base64 encoded audio
 */
export const stopRecording = async (): Promise<string> => {
  try {
    if (!recording) {
      throw new Error('No active recording');
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (!uri) {
      throw new Error('No recording URI');
    }

    // Read file and convert to base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Clean up
    recording = null;

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    console.log('Recording stopped, size:', base64.length);
    return base64;

  } catch (error) {
    console.error('Failed to stop recording:', error);
    recording = null;
    throw error;
  }
};

/**
 * Plays text-to-speech
 */
export const playTTS = async (text: string): Promise<void> => {
  try {
    // Stop any ongoing speech
    await stopTTS();

    // Speak the text
    await Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9, // Slightly slower for clarity
      onDone: () => console.log('TTS completed'),
      onError: (error) => console.error('TTS error:', error),
    });

  } catch (error) {
    console.error('Failed to play TTS:', error);
    throw error;
  }
};

/**
 * Stops any ongoing text-to-speech
 */
export const stopTTS = async (): Promise<void> => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
  } catch (error) {
    console.error('Failed to stop TTS:', error);
  }
};

/**
 * Checks if currently recording
 */
export const isRecording = (): boolean => {
  return recording !== null;
};

/**
 * AudioManager service object
 */
export const AudioManager = {
  requestPermissions,
  startRecording,
  stopRecording,
  playTTS,
  stopTTS,
  isRecording,
};
