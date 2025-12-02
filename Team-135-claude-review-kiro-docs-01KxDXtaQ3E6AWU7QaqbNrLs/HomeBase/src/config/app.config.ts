// Application Configuration

import { AppConfig } from '../types/state';
import Constants from 'expo-constants';

const __DEV__ = process.env.NODE_ENV === 'development';

export const APP_CONFIG: AppConfig = {
  // Disable 911 calling in development mode for safety
  enable911Calling: __DEV__ ? false : (process.env.ENABLE_911_CALLING === 'true'),

  // API Endpoints
  vapiEndpoint: process.env.VAPI_ENDPOINT || 'https://api.vapi.ai',
  gisEndpoint: process.env.GIS_ENDPOINT || 'https://gis.example.com',

  // Network Configuration
  maxRetries: 2,
  requestTimeout: 10000, // 10 seconds

  // Initial user prompt
  initialPrompt: "Is this an emergency or do you want resources? Say 'emergency' or say 'resources'",
};

// Session timeout: 30 minutes
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Audio configuration
export const AUDIO_CONFIG = {
  sampleRate: 16000, // 16kHz optimized for voice
  quality: 'medium' as const,
  format: 'aac' as const,
};

// Map configuration
export const MAP_CONFIG = {
  defaultZoom: 15,
  markerSize: 40,
};

// UI Configuration
export const UI_CONFIG = {
  voiceButtonSize: 150, // Large for kiosks
  voiceButtonColor: {
    default: '#4B5563', // Neutral gray
    emergency: '#DC2626', // Bright red
  },
  minTouchTarget: 48, // 48dp Android, 44pt iOS minimum
  transcriptMinHeight: 150,
  resourceCardHeightPercent: 0.4, // 40% of screen
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  enableAnimations: true,
  animationDuration: 300,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes for GIS cache
};
