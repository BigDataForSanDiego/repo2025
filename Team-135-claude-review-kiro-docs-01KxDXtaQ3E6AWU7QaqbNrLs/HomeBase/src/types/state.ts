// Application State Types

import { TranscriptEntry, Resource } from './api';

export type AppMode = 'initial' | 'emergency' | 'resources' | 'error';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AppConfig {
  enable911Calling: boolean;
  vapiEndpoint: string;
  gisEndpoint: string;
  maxRetries: number;
  requestTimeout: number;
  initialPrompt: string;
}

export interface AppState {
  mode: AppMode;
  sessionId: string;
  transcript: TranscriptEntry[];
  resources: Resource[];
  selectedResource: Resource | null;
  isRecording: boolean;
  error: string | null;
  userLocation: Location | null;
  config: AppConfig;
}

export type AppAction =
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'UPDATE_TRANSCRIPT'; payload: TranscriptEntry[] }
  | { type: 'SET_RESOURCES'; payload: Resource[] }
  | { type: 'SELECT_RESOURCE'; payload: Resource | null }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'RESET_SESSION'; payload: string };
