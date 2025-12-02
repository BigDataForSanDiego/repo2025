// Audio Manager Service for Recording and TTS

import { AudioModule, AudioRecorder, RecordingOptions } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

let recorder: AudioRecorder | null = null;

/**
 * Recording options optimized for Vapi (16kHz mono WAV)
 */
const recordingOptions: RecordingOptions = {
  android: {
    extension: '.wav',
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    audioEncoder: 'pcm',
  },
  ios: {
    extension: '.wav',
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    audioQuality: 'high',
    outputFormat: 'wav',
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

/**
 * Requests microphone permissions
 */
export const requestPermissions = async (): Promise<boolean> => {
  try {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    return granted;
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

    // Stop any existing recording
    if (recorder) {
      await stopRecording();
    }

    // Create new recorder with platform-specific options
    recorder = new AudioRecorder();

    // Prepare and start recording
    await recorder.prepareToRecordAsync(recordingOptions[Platform.OS]);
    await recorder.startAsync();

    console.log('✅ Real audio recording started');
  } catch (error) {
    console.error('Failed to start recording:', error);
    recorder = null;
    throw error;
  }
};

/**
 * Stops recording and returns base64 encoded audio
 */
export const stopRecording = async (): Promise<string> => {
  try {
    if (!recorder) {
      throw new Error('No active recording');
    }

    // Stop recording and get URI
    const status = await recorder.stopAndUnloadAsync();
    const uri = recorder.getURI();

    recorder = null;

    if (!uri) {
      throw new Error('Failed to get recording URI');
    }

    // Read file and convert to base64
    const base64Audio = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Clean up: delete the temp file
    await FileSystem.deleteAsync(uri, { idempotent: true });

    console.log(`✅ Recording stopped: ${(base64Audio.length / 1024).toFixed(1)}KB`);
    return base64Audio;

  } catch (error) {
    console.error('Failed to stop recording:', error);
    recorder = null;
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
    Speech.speak(text, {
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
  return recorder !== null;
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
