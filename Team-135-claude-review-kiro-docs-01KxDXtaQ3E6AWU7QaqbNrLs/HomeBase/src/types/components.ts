// Component Prop Types

import { TranscriptEntry, Resource } from './api';
import { Location } from './state';

export interface VoiceButtonProps {
  mode: 'default' | 'emergency';
  isRecording: boolean;
  onPress: () => void;
  disabled: boolean;
}

export interface TranscriptViewProps {
  entries: TranscriptEntry[];
  resourceCardVisible: boolean;
}

export interface ResourceCardProps {
  resource: Resource;
  userLocation: Location;
  onClose?: () => void;
}

export interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}
