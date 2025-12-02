# HomeBase - Voice-Driven Assistance App

A React Native mobile application designed to provide emergency assistance and resource location services for homeless individuals through voice interaction. Built with React 19, optimized for low-end devices and public kiosks.

## 🎯 Features

- **Single-Screen Voice Interface**: Large, accessible voice button for easy interaction
- **Emergency Mode**: Direct 911 calling capability with configurable safety settings
- **Resource Finder**: GIS-powered location of nearby shelters, food banks, and services
- **Live Transcription**: Real-time conversation display for accessibility
- **Offline-First**: Resilient to poor network conditions with retry logic and caching
- **Accessibility**: Large touch targets, high contrast, screen reader compatible
- **Performance Optimized**: Runs smoothly on devices with <2GB RAM

## 🏗️ Architecture

### Technology Stack

- **React Native 0.81.5** with **React 19.1.0**
- **Expo 54** for simplified development and deployment
- **TypeScript** for type safety
- **Context API + useReducer** for state management
- **Expo Audio (expo-av)** for voice recording
- **Expo Speech** for text-to-speech
- **Expo Location** for geolocation
- **React Native Maps** for resource visualization
- **Native Fetch API** for HTTP requests (zero dependencies)

### Project Structure

```
HomeBase/
├── src/
│   ├── components/       # UI Components
│   │   ├── VoiceButton.tsx
│   │   ├── TranscriptView.tsx
│   │   ├── ResourceCard.tsx
│   │   └── ErrorMessage.tsx
│   ├── screens/         # Main Screens
│   │   └── VoiceAssistantScreen.tsx
│   ├── services/        # Backend Services
│   │   ├── VapiService.ts      # Voice agent integration
│   │   ├── GISService.ts       # Resource lookup with caching
│   │   └── AudioManager.ts     # Audio recording & TTS
│   ├── context/         # State Management
│   │   └── AppContext.tsx
│   ├── utils/           # Utilities
│   │   ├── sessionManager.ts
│   │   └── validation.ts
│   ├── types/           # TypeScript Definitions
│   │   ├── api.ts
│   │   ├── state.ts
│   │   └── components.ts
│   └── config/          # Configuration
│       └── app.config.ts
├── app/                 # Expo Router
│   ├── _layout.tsx     # Root layout with AppProvider
│   └── index.tsx       # Main entry point
└── app.json            # Expo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- iOS Simulator (Mac) or Android Studio
- Expo Go app (for physical device testing)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the values:
   ```
   VAPI_ENDPOINT=https://your-vapi-endpoint.com
   GIS_ENDPOINT=https://your-gis-endpoint.com
   ENABLE_911_CALLING=false
   ```

3. **Configure Google Maps API**

   Update `app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
       }
     }
   }
   ```

### Running the App

**Start Expo development server:**
```bash
npm start
```

**Run on specific platforms:**
```bash
npm run android  # Android emulator or device
npm run ios      # iOS simulator (Mac only)
npm run web      # Web browser
```

## 📱 Usage

### Initial Launch

1. App requests microphone and location permissions
2. Initial prompt plays: *"Is this an emergency or do you want resources? Say 'emergency' or say 'resources'"*
3. Tap the large circular button to speak

### Emergency Flow

1. Say "emergency"
2. Voice button turns **red**
3. Voice agent asks follow-up questions
4. If immediate danger detected, 911 call dialog appears (when enabled)

### Resources Flow

1. Say "resources"
2. Describe what you need (e.g., "I need food", "where is a shelter")
3. GIS system finds nearby resources
4. Resource card displays:
   - Map showing your location and resource
   - Name, address, distance
   - Resource type and metadata

## 🔧 Configuration

### App Configuration (`src/config/app.config.ts`)

```typescript
{
  enable911Calling: false,        // Disable in dev for safety
  vapiEndpoint: string,           // Voice agent API
  gisEndpoint: string,            // GIS lookup API
  maxRetries: 2,                  // Network retry attempts
  requestTimeout: 10000,          // 10 second timeout
  initialPrompt: string           // TTS prompt on launch
}
```

### Performance Tuning

- **Session timeout**: 30 minutes (configurable in `SESSION_TIMEOUT_MS`)
- **GIS cache**: 5 minutes (configurable in `PERFORMANCE_CONFIG.cacheTimeout`)
- **Audio quality**: 16kHz AAC, optimized for voice
- **Map performance**: Lazy loading, gesture controls

## 🎨 UI Customization

### Voice Button Sizing
```typescript
UI_CONFIG.voiceButtonSize = 150  // 150px for kiosks, 120px for phones
```

### Colors
```typescript
voiceButtonColor: {
  default: '#4B5563',     // Neutral gray
  emergency: '#DC2626'    // Bright red
}
```

### Accessibility
- Minimum touch target: 48dp (Android) / 44pt (iOS)
- Color contrast ratio: 4.5:1 minimum
- Large fonts (16sp minimum) for kiosk visibility
- Screen reader labels on all interactive elements

## 📡 API Integration

### Vapi Voice Agent API

**Endpoint**: `POST /voice`

**Request**:
```json
{
  "audioInput": "base64_encoded_audio",
  "timestamp": 1234567890,
  "sessionId": "uuid-v4"
}
```

**Response**:
```json
{
  "transcript": [
    {
      "text": "I need help",
      "timestamp": 1234567890,
      "speaker": "user"
    }
  ],
  "intent": "emergency" | "get_resources",
  "error": null,
  "resources": []
}
```

### GIS Lookup API

**Endpoint**: `POST /lookup`

**Request**:
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "resourceType": "shelter" | "food" | "other"
}
```

**Response**:
```json
{
  "resources": [
    {
      "name": "Community Shelter",
      "type": "shelter",
      "latitude": 37.7750,
      "longitude": -122.4195,
      "address": "123 Main St, San Francisco, CA",
      "distanceMeters": 150,
      "metadata": {
        "capacity": 50,
        "open24Hours": true
      }
    }
  ],
  "error": null
}
```

## 🔒 Security & Privacy

- Audio is **never logged or stored** (privacy by design)
- Location coordinates only sent when requesting resources
- All network requests over **HTTPS only**
- Input validation on all API responses
- No analytics or tracking (optional, privacy-compliant options available)

## 🐛 Troubleshooting

### Permissions Issues
- **iOS**: Check `Info.plist` has microphone and location usage descriptions
- **Android**: Verify `AndroidManifest.xml` includes RECORD_AUDIO and location permissions

### Map Not Displaying
- Verify Google Maps API key in `app.json`
- Enable "Maps SDK for Android" and "Maps SDK for iOS" in Google Cloud Console

### Audio Recording Fails
- Check microphone permissions granted
- Verify device has working microphone
- Test on physical device (some emulators have limited audio support)

### Network Timeouts
- Check backend endpoints are reachable
- Verify timeout settings in `app.config.ts`
- Test with good network connection first

## 📋 Requirements Traceability

This implementation fulfills all requirements from `.kiro/specs/voice-driven-mobile-app/`:

- ✅ **Req 1**: Single-screen voice interface with large button
- ✅ **Req 2**: Emergency state with red button and 911 calling
- ✅ **Req 3**: Resources state with GIS integration and map display
- ✅ **Req 4**: Live transcription with auto-scroll
- ✅ **Req 5**: Resilient error handling for poor connectivity
- ✅ **Req 6**: Strict JSON schema validation for all APIs
- ✅ **Req 7**: Initial prompt with TTS and session management
- ✅ **Req 8**: User-friendly error messages

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the homeless community**
