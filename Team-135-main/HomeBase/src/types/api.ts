// API Request and Response Types

export interface VoiceAgentRequest {
  audioInput: string; // Base64 encoded audio
  timestamp: number;
  sessionId: string;
  assistantId?: string; // Vapi assistant ID (optional, can be in headers)
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
  intent: string; // 'emergency' | 'get_resources' | 'timeout' | 'waiting'
  resourceType?: string; // 'shelter' | 'food' | 'medical' | 'other'
  requires911?: boolean; // true if emergency requires 911 call
  error: string | null;
  resources: Resource[];
}

export interface GISLookupRequest {
  latitude: number;
  longitude: number;
  resourceType: 'shelter' | 'food' | 'medical' | 'other';
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
