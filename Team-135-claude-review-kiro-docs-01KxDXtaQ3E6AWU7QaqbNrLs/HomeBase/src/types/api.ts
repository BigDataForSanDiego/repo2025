// API Request and Response Types

export interface VoiceAgentRequest {
  audioInput: string; // Base64 encoded audio
  timestamp: number;
  sessionId: string;
}

export interface TranscriptEntry {
  text: string;
  timestamp: number;
  speaker: 'user' | 'agent';
}

export interface Resource {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  distanceMeters: number;
  metadata: Record<string, any>;
}

export interface VoiceAgentResponse {
  transcript: TranscriptEntry[];
  intent: string;
  error: string | null;
  resources: Resource[];
}

export interface GISLookupRequest {
  latitude: number;
  longitude: number;
  resourceType: 'shelter' | 'food' | 'other';
}

export interface GISLookupResponse {
  resources: Resource[];
  error: string | null;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  retryable?: boolean;
}
