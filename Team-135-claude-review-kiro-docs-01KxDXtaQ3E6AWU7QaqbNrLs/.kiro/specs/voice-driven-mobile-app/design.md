# Design Document

## Overview

This design document outlines the architecture and implementation approach for a voice-driven React Native mobile application targeting iOS and Android platforms. The application serves homeless individuals through a single-screen interface with voice-first interaction, integrating with Vapi voice agent services and a custom GIS backend for resource location.

The design prioritizes simplicity, accessibility, and resilience to poor network conditions while running efficiently on low-end devices and public kiosks.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Single Screen Component                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Live Transcription View                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Resource Card (conditional)              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Voice Button (circular)                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Vapi Service │  │  GIS Service │  │ Audio Manager│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                    │              │              │
                    ▼              ▼              ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │   Vapi   │   │   GIS    │   │  Device  │
            │  Backend │   │ Backend  │   │   APIs   │
            └──────────┘   └──────────┘   └──────────┘
```

### Technology Stack

- **Framework**: React Native (latest stable)
- **Language**: TypeScript for type safety
- **State Management**: React Context API + useReducer for application state
- **Audio**: react-native-audio-recorder-player or expo-av for audio capture
- **Maps**: react-native-maps with Google Maps provider
- **Location**: @react-native-community/geolocation or expo-location
- **HTTP**: axios with retry logic and timeout handling
- **TTS**: react-native-tts for text-to-speech
- **Linking**: React Native Linking API for 911 calls

## Components and Interfaces

### Component Hierarchy

```
App
└── VoiceAssistantScreen
    ├── TranscriptView
    │   └── TranscriptItem (repeated)
    ├── ResourceCard (conditional)
    │   ├── MapView
    │   └── ResourceDetails
    ├── VoiceButton
    └── ErrorMessage (conditional)
```

### Core Components

#### 1. VoiceAssistantScreen

Main container component managing all application state and orchestrating child components.

**State:**

```typescript
interface AppState {
  mode: "initial" | "emergency" | "resources" | "error";
  sessionId: string;
  transcript: TranscriptEntry[];
  resources: Resource[];
  selectedResource: Resource | null;
  isRecording: boolean;
  error: string | null;
  userLocation: Location | null;
}
```

**Responsibilities:**

- Initialize session on mount
- Manage application state transitions
- Coordinate between Vapi and GIS services
- Handle layout animations when resource card appears
- Trigger TTS for initial prompt

#### 2. VoiceButton

Large circular button for voice interaction.

**Props:**

```typescript
interface VoiceButtonProps {
  mode: "default" | "emergency";
  isRecording: boolean;
  onPress: () => void;
  disabled: boolean;
}
```

**Styling:**

- Default: 120px diameter, neutral blue/gray color
- Emergency: 120px diameter, bright red (#DC2626)
- Recording: pulsing animation
- Disabled: 50% opacity

**Behavior:**

- Press to start recording
- Release or press again to stop recording
- Haptic feedback on press (if available)

#### 3. TranscriptView

Scrollable list displaying conversation history.

**Props:**

```typescript
interface TranscriptViewProps {
  entries: TranscriptEntry[];
  resourceCardVisible: boolean;
}
```

**Layout:**

- Auto-scroll to bottom when new entries added
- Adjust height when resource card appears
- Minimum visible height: 150px
- User messages: left-aligned, light background
- Agent messages: right-aligned, darker background

#### 4. ResourceCard

Displays resource information with embedded map.

**Props:**

```typescript
interface ResourceCardProps {
  resource: Resource;
  userLocation: Location;
  onClose?: () => void;
}
```

**Layout:**

- Slides in from top with animation
- Fixed height: 40% of screen
- Contains map (60% of card) and details (40% of card)
- Map shows user location and resource marker
- Details show name, address, distance, type, metadata

#### 5. ErrorMessage

Toast-style error display.

**Props:**

```typescript
interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}
```

**Behavior:**

- Auto-dismiss after 5 seconds
- Manual dismiss via tap
- Does not block interaction with voice button

### Service Interfaces

#### VapiService

Handles all communication with Vapi voice agent backend.

```typescript
interface VapiService {
  sendAudioRequest(
    audioInput: string,
    sessionId: string
  ): Promise<VoiceAgentResponse>;

  validateResponse(response: any): VoiceAgentResponse | Error;
}

interface VoiceAgentRequest {
  audioInput: string;
  timestamp: number;
  sessionId: string;
}

interface VoiceAgentResponse {
  transcript: TranscriptEntry[];
  intent: string;
  error: string | null;
  resources: Resource[];
}

interface TranscriptEntry {
  text: string;
  timestamp: number;
  speaker: "user" | "agent";
}
```

**Error Handling:**

- Network timeout: 10 seconds
- Retry logic: 2 attempts with exponential backoff
- Validation: Check all required fields present
- Return structured error objects

#### GISService

Handles resource lookups via custom GIS backend.

```typescript
interface GISService {
  lookupResources(
    latitude: number,
    longitude: number,
    resourceType: ResourceType
  ): Promise<GISLookupResponse>;

  validateResponse(response: any): GISLookupResponse | Error;
}

interface GISLookupRequest {
  latitude: number;
  longitude: number;
  resourceType: "shelter" | "food" | "other";
}

interface GISLookupResponse {
  resources: Resource[];
  error: string | null;
}

interface Resource {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  distanceMeters: number;
  metadata: Record<string, any>;
}
```

**Error Handling:**

- Network timeout: 8 seconds
- Retry logic: 1 attempt
- Validation: Check resources array and error field
- Return structured error objects

#### AudioManager

Manages audio recording and playback.

```typescript
interface AudioManager {
  startRecording(): Promise<void>;
  stopRecording(): Promise<string>; // Returns base64 audio
  playTTS(text: string): Promise<void>;
  stopTTS(): void;
  requestPermissions(): Promise<boolean>;
}
```

**Configuration:**

- Audio format: AAC or MP3 (platform-dependent)
- Sample rate: 16kHz (optimized for voice)
- Encoding: Base64 for transmission
- TTS: System default voice, moderate speed

## Data Models

### Application State Model

```typescript
type AppMode = "initial" | "emergency" | "resources" | "error";

interface AppState {
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

interface AppConfig {
  enable911Calling: boolean;
  vapiEndpoint: string;
  gisEndpoint: string;
  maxRetries: number;
  requestTimeout: number;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}
```

### State Transitions

```
initial → emergency (intent: "emergency")
initial → resources (intent: "get_resources")
emergency → initial (session reset)
resources → initial (session reset)
any → error (network/validation failure)
error → previous state (error dismissed)
```

## Error Handling

### Error Categories

1. **Network Errors**

   - Connection timeout
   - No internet connectivity
   - Server unreachable
   - Message: "Connection issue. Please try again."

2. **Validation Errors**

   - Missing required fields
   - Malformed JSON
   - Invalid data types
   - Message: "Something went wrong. Let's try again."

3. **Permission Errors**

   - Microphone access denied
   - Location access denied
   - Message: "We need permission to use [microphone/location]."

4. **Session Errors**

   - Session expired
   - Invalid session ID
   - Message: "Let's start again. Press the button when you're ready."

5. **GIS Errors**
   - No resources found
   - Invalid coordinates
   - Message: "No nearby resources found. Try a different request."

### Error Recovery Strategy

1. **Preserve State**: Never clear transcript or lose user progress
2. **Clear Messaging**: Use simple, non-technical language
3. **Actionable Feedback**: Tell user what to do next
4. **Graceful Degradation**: Keep voice button functional
5. **Retry Logic**: Automatic retry for transient failures
6. **Logging**: Log errors for debugging (sanitize PII)

### Error Response Format

All services return errors in consistent format:

```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  retryable?: boolean;
}
```

## Testing Strategy

### Unit Testing

**Target Coverage**: Core business logic and utilities

**Test Files**:

- `services/__tests__/VapiService.test.ts`
- `services/__tests__/GISService.test.ts`
- `services/__tests__/AudioManager.test.ts`
- `utils/__tests__/validation.test.ts`
- `utils/__tests__/sessionManager.test.ts`

**Key Test Cases**:

- JSON schema validation (valid and invalid inputs)
- Error response parsing
- Session ID generation and management
- Audio encoding/decoding
- Retry logic behavior
- Timeout handling

**Tools**: Jest, React Native Testing Library

### Integration Testing

**Target**: Component interaction and state management

**Test Files**:

- `components/__tests__/VoiceAssistantScreen.test.tsx`
- `components/__tests__/VoiceButton.test.tsx`
- `components/__tests__/TranscriptView.test.tsx`
- `components/__tests__/ResourceCard.test.tsx`

**Key Test Cases**:

- State transitions (initial → emergency → resources)
- Transcript updates and scrolling
- Resource card animation and layout
- Voice button state changes
- Error message display and dismissal
- Layout adjustments when resource card appears

**Tools**: Jest, React Native Testing Library, Mock services

### Manual Testing Scenarios

**Scenario 1: Emergency Flow**

1. Launch app
2. Press voice button
3. Say "emergency"
4. Verify button turns red
5. Verify transcript updates
6. Verify follow-up questions appear
7. (If enabled) Verify 911 call initiation

**Scenario 2: Resources Flow**

1. Launch app
2. Press voice button
3. Say "resources"
4. Say "I need food"
5. Verify GIS lookup occurs
6. Verify resource card appears
7. Verify button animates down
8. Verify transcript remains visible
9. Verify map shows correct location

**Scenario 3: Poor Connectivity**

1. Enable airplane mode
2. Launch app
3. Press voice button
4. Verify error message appears
5. Verify button remains functional
6. Verify transcript preserved
7. Disable airplane mode
8. Retry and verify recovery

**Scenario 4: Low-End Device**

1. Test on device with <2GB RAM
2. Verify smooth animations
3. Verify responsive button
4. Verify no lag in transcript updates
5. Verify map renders correctly

### Performance Testing

**Metrics**:

- App launch time: <3 seconds
- Voice button response: <100ms
- Transcript update: <200ms
- Resource card animation: 60fps
- Memory usage: <150MB
- Network request timeout: 10s (Vapi), 8s (GIS)

**Tools**: React Native Performance Monitor, Flipper, Xcode Instruments, Android Profiler

### Accessibility Testing

**Requirements**:

- Screen reader compatibility (VoiceOver, TalkBack)
- Minimum touch target: 44x44 points
- Color contrast ratio: 4.5:1 minimum
- Text scaling support
- Haptic feedback where appropriate

**Tools**: Accessibility Inspector (iOS), Accessibility Scanner (Android)

## Implementation Notes

### Layout Animation Strategy

When resource card appears:

1. Measure current voice button position
2. Calculate new position (move down by card height + margin)
3. Animate button using `Animated.timing` (300ms, easeInOut)
4. Simultaneously adjust transcript view height
5. Ensure transcript auto-scrolls to bottom

### Session Management

- Generate UUID on app launch
- Store in memory (not persisted)
- Include in all Vapi requests
- Reset on explicit user action or session expiration
- Timeout: 30 minutes of inactivity

### 911 Calling Logic

```typescript
const handle911Call = async (config: AppConfig) => {
  if (!config.enable911Calling) {
    console.log("[DEBUG] 911 calling disabled");
    return;
  }

  try {
    const supported = await Linking.canOpenURL("tel:911");
    if (supported) {
      await Linking.openURL("tel:911");
    } else {
      // Fallback: show emergency instructions
      showEmergencyInstructions();
    }
  } catch (error) {
    console.error("Failed to initiate 911 call:", error);
    showEmergencyInstructions();
  }
};
```

### Configuration Management

Store configuration in `app.config.ts`:

```typescript
export const APP_CONFIG = {
  enable911Calling: __DEV__ ? false : true,
  vapiEndpoint: process.env.VAPI_ENDPOINT || "https://api.vapi.ai",
  gisEndpoint: process.env.GIS_ENDPOINT || "https://gis.example.com",
  maxRetries: 2,
  requestTimeout: 10000,
  initialPrompt:
    "Is this an emergency or do you want resources? Say 'emergency' or say 'resources'.",
};
```

### Performance Optimizations

1. **Lazy Loading**: Load map component only when needed
2. **Memoization**: Use React.memo for transcript items
3. **Debouncing**: Debounce audio input processing
4. **Image Optimization**: Use appropriate image sizes for markers
5. **List Virtualization**: Use FlatList for transcript (if >50 items)
6. **Network Caching**: Cache GIS responses for 5 minutes

### Platform-Specific Considerations

**iOS**:

- Request microphone permission in Info.plist
- Request location permission (WhenInUse)
- Handle background audio if needed
- Test on iPhone SE (low-end) and iPhone 14 Pro

**Android**:

- Request RECORD_AUDIO permission
- Request ACCESS_FINE_LOCATION permission
- Handle different screen sizes and densities
- Test on devices with Android 8.0+ and various RAM configurations

## Security Considerations

1. **Data Privacy**: Never log or store audio content
2. **Location Privacy**: Only send coordinates when necessary
3. **HTTPS Only**: All network requests over HTTPS
4. **Input Validation**: Validate all API responses
5. **Permission Handling**: Request permissions with clear explanations
6. **Error Messages**: Avoid exposing internal system details

## Deployment Considerations

1. **Environment Variables**: Use .env files for endpoints
2. **Build Configurations**: Separate dev/staging/production builds
3. **Code Signing**: Proper certificates for iOS and Android
4. **App Store Guidelines**: Ensure compliance with store policies
5. **Analytics**: Implement basic usage tracking (privacy-compliant)
6. **Crash Reporting**: Integrate Sentry or similar (sanitize PII)
