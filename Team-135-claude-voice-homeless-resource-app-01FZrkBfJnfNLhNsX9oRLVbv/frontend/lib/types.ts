// Type definitions for Voice-First Homeless Resource App

export interface VoiceAgentRequest {
  audioInput: string; // base64 or stream token
  timestamp: number; // unix epoch ms
  sessionId: string; // unique per session
}

export interface TranscriptEntry {
  text: string;
  timestamp: number;
  speaker: "user" | "agent";
}

export interface Resource {
  name: string;
  type: "shelter" | "food" | "other";
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
  resourceType: "shelter" | "food" | "other";
}

export interface GISLookupResponse {
  resources: Resource[];
  error: string | null;
}

export interface LiveTranscriptionData {
  text: string;
  timestamp: number;
  speaker: "user" | "agent";
}
