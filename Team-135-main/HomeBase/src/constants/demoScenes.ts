// Demo scene presets shared between native and web builds

import { Resource, TranscriptEntry } from '../types/api';
import { Location } from '../types/state';

export type DemoScenario = 'idle' | 'resources' | 'emergency';

export const DEMO_RESOURCE: Resource = {
  name: 'Downtown Safe Sleep Center',
  type: 'shelter',
  latitude: 32.7157,
  longitude: -117.1611,
  address: '125 Civic Center Dr, San Diego, CA 92101',
  distanceMeters: 820,
  metadata: {
    phone: '(619) 555-0192',
    hours: '24/7 intake, ID not required',
  },
};

export const DEMO_USER_LOCATION: Location = {
  latitude: 32.7123,
  longitude: -117.1646,
  accuracy: 18,
};

export const buildDemoTranscripts = (): Record<DemoScenario, TranscriptEntry[]> => {
  const now = Date.now();
  return {
    idle: [
      {
        speaker: 'agent',
        text: 'HomeBase is on standby whenever you are ready.',
        timestamp: now - 45000,
      },
      {
        speaker: 'user',
        text: 'Okay, give me a moment.',
        timestamp: now - 40000,
      },
    ],
    resources: [
      {
        speaker: 'user',
        text: "I need somewhere safe to sleep near downtown.",
        timestamp: now - 36000,
      },
      {
        speaker: 'agent',
        text: 'I found Downtown Safe Sleep Center about half a mile away.',
        timestamp: now - 32000,
      },
      {
        speaker: 'agent',
        text: 'Tap to hear directions or ask for another option.',
        timestamp: now - 30000,
      },
    ],
    emergency: [
      {
        speaker: 'user',
        text: 'I feel unsafe and need urgent help.',
        timestamp: now - 20000,
      },
      {
        speaker: 'agent',
        text: "Stay with me. I'm alerting 911 and outreach right now.",
        timestamp: now - 16000,
      },
    ],
  };
};

export const DEMO_SCENE_OPTIONS: { id: DemoScenario | null; label: string }[] = [
  { id: null, label: 'Live' },
  { id: 'idle', label: 'Voice' },
  { id: 'resources', label: 'Resources' },
  { id: 'emergency', label: 'Emergency' },
];
