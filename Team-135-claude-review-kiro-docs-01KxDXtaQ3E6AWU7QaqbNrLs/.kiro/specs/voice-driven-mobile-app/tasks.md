# Implementation Plan

**IMPORTANT**: All implementation work should be done in a new `front-end` folder at the workspace root. Do NOT modify the existing `frontend` folder.

**MOBILE & KIOSK OPTIMIZATION**: This app is optimized for low-end Android/iOS devices and public kiosks. All tasks include performance considerations, large touch targets, and resilient error handling.

- [ ] 1. Initialize React Native project structure and dependencies

  - Create new `front-end` folder at workspace root
  - Initialize React Native project with TypeScript template inside `front-end`
  - Install core dependencies: react-native-maps, axios, react-native-tts, @react-native-community/geolocation, react-native-audio-recorder-player
  - Install performance monitoring: @react-native-community/netinfo for connectivity detection
  - Configure TypeScript with strict mode enabled
  - Set up project folder structure: /src/components, /src/services, /src/utils, /src/types, /src/config
  - Create .env.example file with placeholder endpoints
  - Configure metro bundler for optimal performance on low-end devices
  - _Requirements: 1.1, 1.5, 6.1, 6.3_

- [ ] 2. Define TypeScript types and interfaces

  - Create types/api.ts with VoiceAgentRequest, VoiceAgentResponse, GISLookupRequest, GISLookupResponse interfaces
  - Create types/state.ts with AppState, AppMode, TranscriptEntry, Resource, Location interfaces
  - Create types/components.ts with all component prop interfaces
  - Create types/config.ts with AppConfig interface
  - Add strict null checks and proper error types
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 3. Implement configuration management

  - Create config/app.config.ts with APP_CONFIG object
  - Add environment variable support for vapiEndpoint and gisEndpoint
  - Implement enable911Calling flag with **DEV** check
  - Add maxRetries, requestTimeout, and initialPrompt constants
  - Configure kiosk mode settings (screen timeout, wake lock if needed)
  - _Requirements: 2.4, 7.2_

- [ ] 4. Build session management utility

  - Create utils/sessionManager.ts with generateSessionId function using UUID
  - Implement session timeout tracking (30 minutes)
  - Add session validation logic
  - Create session reset functionality
  - Add session persistence check for app backgrounding/foregrounding
  - _Requirements: 7.4, 7.5, 8.5_

- [ ] 5. Create validation utilities

  - Create utils/validation.ts with schema validation functions
  - Implement validateVoiceAgentResponse function checking required fields
  - Implement validateGISResponse function checking resources array and error field
  - Add error message formatting functions for missing fields, malformed requests
  - Include defensive checks for malformed data from poor network conditions
  - _Requirements: 6.5, 8.2, 8.3_

- [ ] 6. Implement VapiService

  - Create services/VapiService.ts with sendAudioRequest method
  - Implement axios instance with 10-second timeout
  - Add retry logic with 2 attempts and exponential backoff
  - Implement validateResponse method using validation utilities
  - Add error handling returning structured ErrorResponse objects
  - Include network connectivity checks before requests
  - Add request/response logging for debugging (sanitize PII)
  - _Requirements: 1.4, 6.1, 6.2, 6.5, 8.1_

- [ ] 7. Implement GISService

  - Create services/GISService.ts with lookupResources method
  - Implement axios instance with 8-second timeout
  - Add retry logic with 1 attempt
  - Implement validateResponse method using validation utilities
  - Add error handling for "GIS lookup failed" scenarios
  - Include network connectivity checks before requests
  - Implement response caching (5 minutes) to reduce network load
  - _Requirements: 3.2, 6.3, 6.4, 6.5, 8.4_

- [ ] 8. Implement AudioManager service

  - Create services/AudioManager.ts with audio recording functionality
  - Implement startRecording and stopRecording methods returning base64 audio
  - Configure audio format (AAC/MP3) with 16kHz sample rate optimized for voice
  - Implement playTTS and stopTTS methods using react-native-tts
  - Add requestPermissions method for microphone access
  - Handle permission denied errors with clear messaging
  - Add audio quality checks and compression for poor network conditions
  - Implement audio buffer management for low-memory devices
  - _Requirements: 1.4, 5.5, 7.3, 8.1_

- [ ] 9. Create application state management

  - Create context/AppContext.tsx with React Context and useReducer
  - Define state reducer with actions: SET_MODE, UPDATE_TRANSCRIPT, SET_RESOURCES, SET_ERROR, SET_RECORDING, SET_LOCATION
  - Implement state transition logic (initial → emergency, initial → resources, any → error)
  - Add AppProvider component wrapping application
  - Create useAppState custom hook for consuming context
  - Implement state persistence for app backgrounding scenarios
  - _Requirements: 1.5, 2.1, 3.1, 5.2, 5.3_

- [ ] 10. Build VoiceButton component

  - Create components/VoiceButton.tsx with circular button (120px diameter minimum, 150px for kiosks)
  - Implement mode prop handling: default (neutral blue/gray) vs emergency (red #DC2626)
  - Add pulsing animation for recording state using Animated API (optimized for 60fps)
  - Implement disabled state with 50% opacity
  - Add haptic feedback on press using React Native Haptics
  - Handle onPress callback for recording control
  - Ensure touch target is minimum 44x44 points (iOS) and 48x48dp (Android)
  - Add visual feedback for touch states (pressed, released)
  - _Requirements: 1.1, 1.2, 1.3, 2.2, 3.5_

- [ ] 11. Build TranscriptView component

  - Create components/TranscriptView.tsx with FlatList for transcript entries
  - Implement TranscriptItem sub-component with speaker-based styling
  - Add auto-scroll to bottom when new entries added
  - Implement dynamic height adjustment based on resourceCardVisible prop
  - Style user messages (left-aligned, light background) and agent messages (right-aligned, darker background)
  - Ensure minimum visible height of 150px
  - Use FlatList performance optimizations: windowSize, maxToRenderPerBatch, removeClippedSubviews
  - Implement React.memo for TranscriptItem to prevent unnecessary re-renders
  - Add large, readable fonts (minimum 16sp) for kiosk visibility
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 12. Build ResourceCard component

  - Create components/ResourceCard.tsx with slide-in animation from top
  - Implement fixed height at 40% of screen height (responsive to device size)
  - Integrate react-native-maps MapView showing user location and resource marker
  - Create ResourceDetails sub-component displaying name, address, distance, type, metadata
  - Add optional onClose callback for dismissing card
  - Ensure map takes 60% of card height and details take 40%
  - Implement lazy loading for MapView (only render when needed)
  - Add loading states and error handling for map rendering
  - Use large, readable text for kiosk displays
  - _Requirements: 3.3, 3.4_

- [ ] 13. Build ErrorMessage component

  - Create components/ErrorMessage.tsx with toast-style display
  - Implement auto-dismiss after 5 seconds using setTimeout
  - Add manual dismiss via tap gesture
  - Ensure error message doesn't block voice button interaction
  - Style with clear visibility and appropriate positioning
  - Use large fonts and high contrast colors for visibility
  - Add accessibility announcements for screen readers
  - _Requirements: 5.1, 5.5, 8.1_

- [ ] 14. Implement VoiceAssistantScreen main screen

  - Create screens/VoiceAssistantScreen.tsx as main container component
  - Initialize session on component mount using sessionManager
  - Request location permissions and get user location on mount
  - Request microphone permissions on mount
  - Implement layout with TranscriptView, ResourceCard (conditional), VoiceButton, ErrorMessage (conditional)
  - Add state management integration using useAppState hook
  - Implement responsive layout for different screen sizes (phones, tablets, kiosks)
  - Add network connectivity monitoring using NetInfo
  - Implement app state handling (foreground/background transitions)
  - _Requirements: 1.5, 7.1, 7.4_

- [ ] 15. Implement voice recording and Vapi integration flow

  - Add handleVoiceButtonPress function in VoiceAssistantScreen
  - Implement recording start/stop logic using AudioManager
  - Send audio to VapiService when recording stops
  - Process VoiceAgentResponse and update transcript state
  - Handle intent field to trigger mode transitions (emergency, get_resources)
  - Display errors from Vapi responses using ErrorMessage component
  - Add loading indicators during audio processing
  - Implement debouncing to prevent rapid button presses
  - Add offline queue for requests when network is unavailable
  - _Requirements: 1.4, 2.1, 3.1, 4.5, 6.1, 6.2_

- [ ] 16. Implement emergency flow logic

  - Add handleEmergencyIntent function detecting "emergency" intent
  - Transition app mode to "emergency" state
  - Update VoiceButton mode to display red color
  - Implement handle911Call function using React Native Linking API
  - Add configuration check for enable911Calling flag
  - Implement fallback showEmergencyInstructions for unsupported devices
  - Add confirmation dialog before initiating 911 call (safety measure)
  - Log emergency events for audit purposes (sanitize PII)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 17. Implement resources flow and GIS integration

  - Add handleResourcesIntent function detecting resource-related intents
  - Transition app mode to "resources" state
  - Extract resource type from Vapi response or transcript
  - Call GISService.lookupResources with user location and resource type
  - Update resources state with GIS response
  - Display ResourceCard when resources found
  - Handle "No nearby resources found" scenario
  - Implement sorting by distance (closest first)
  - Add retry mechanism for failed GIS lookups
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.4_

- [ ] 18. Implement layout animations for resource card

  - Add Animated.Value for voice button position in VoiceAssistantScreen
  - Implement animateButtonDown function using Animated.timing (300ms, easeInOut)
  - Calculate new button position based on resource card height
  - Simultaneously adjust TranscriptView height during animation
  - Ensure transcript auto-scrolls to bottom after layout change
  - Implement reverse animation when resource card is dismissed
  - Use native driver for animations (better performance on low-end devices)
  - Add animation completion callbacks for state updates
  - _Requirements: 3.5, 4.4_

- [ ] 19. Implement initial prompt and TTS

  - Add useEffect hook to play initial prompt on app launch
  - Use AudioManager.playTTS with initialPrompt text
  - Display initial prompt text visually above voice button
  - Ensure prompt is accessible and clear
  - Add option to replay prompt via tap gesture
  - Implement TTS queue management for multiple messages
  - Add volume checks and fallback to visual-only mode if TTS fails
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 20. Implement error handling and recovery

  - Add network error detection in VapiService and GISService
  - Implement error state preservation (keep transcript, keep button functional)
  - Add user-friendly error messages for each error category
  - Implement retry logic for transient failures
  - Add session expiration handling with restart prompt
  - Ensure errors don't freeze UI or clear user progress
  - Implement exponential backoff for repeated failures
  - Add offline mode indicator in UI
  - Log errors for debugging (sanitize PII)
  - _Requirements: 5.1, 5.2, 5.3, 5.5, 8.1, 8.5_

- [ ] 21. Configure platform-specific permissions

  - Add microphone permission to iOS Info.plist (NSMicrophoneUsageDescription)
  - Add location permission to iOS Info.plist (NSLocationWhenInUseUsageDescription)
  - Add RECORD_AUDIO permission to Android AndroidManifest.xml
  - Add ACCESS_FINE_LOCATION permission to Android AndroidManifest.xml
  - Implement permission request flows with clear explanations
  - Add permission status checking and re-request logic
  - Handle permission denial gracefully with alternative flows
  - _Requirements: 5.4, 8.1_

- [ ] 22. Optimize for low-end devices and kiosks

  - Implement lazy loading for MapView component
  - Add React.memo to TranscriptItem component
  - Implement debouncing for audio input processing
  - Use FlatList with appropriate performance props for transcript
  - Optimize image sizes for map markers
  - Test memory usage and ensure <150MB target
  - Reduce bundle size by removing unused dependencies
  - Implement code splitting where possible
  - Add memory leak detection and cleanup
  - Test on devices with <2GB RAM
  - Optimize for tablet/kiosk screen sizes (10-15 inch displays)
  - Add battery optimization settings
  - _Requirements: 1.2, 5.4_

- [ ] 23. Add accessibility features

  - Add accessibility labels to VoiceButton
  - Ensure minimum touch target size of 44x44 points (iOS) and 48x48dp (Android)
  - Verify color contrast ratio of 4.5:1 for all text
  - Test with VoiceOver (iOS) and TalkBack (Android)
  - Add text scaling support (respect system font size settings)
  - Implement focus management for screen readers
  - Add semantic labels for all interactive elements
  - Test with accessibility scanner tools
  - Add haptic feedback for important actions
  - _Requirements: 1.1, 1.2_

- [ ] 24. Configure build and deployment settings

  - Set up environment-specific configurations (dev, staging, production)
  - Configure code signing for iOS
  - Configure signing for Android
  - Add .env files for different environments
  - Create build scripts for iOS and Android
  - Configure ProGuard/R8 for Android release builds
  - Set up crash reporting (Sentry or similar, sanitize PII)
  - Add analytics tracking (privacy-compliant)
  - Configure app icons and splash screens for both platforms
  - Set up CI/CD pipeline configuration files
  - _Requirements: 2.4, 7.2_

- [ ] 25. Write service unit tests

  - [ ] 25.1 Create services/**tests**/VapiService.test.ts

    - Test sendAudioRequest with valid and invalid inputs
    - Test retry logic and timeout behavior
    - Test validateResponse with various response formats
    - Test error handling and ErrorResponse formatting
    - Test network connectivity checks
    - _Requirements: 6.1, 6.2, 6.5_

  - [ ] 25.2 Create services/**tests**/GISService.test.ts

    - Test lookupResources with valid coordinates and resource types
    - Test retry logic and timeout behavior
    - Test validateResponse with valid and invalid responses
    - Test error handling for GIS failures
    - Test response caching mechanism
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 25.3 Create services/**tests**/AudioManager.test.ts
    - Test startRecording and stopRecording functionality
    - Test base64 encoding of audio
    - Test playTTS and stopTTS methods
    - Test permission request handling
    - Test audio compression and quality settings
    - _Requirements: 1.4, 7.3_

- [ ] 26. Write utility unit tests

  - [ ] 26.1 Create utils/**tests**/validation.test.ts

    - Test validateVoiceAgentResponse with valid and missing fields
    - Test validateGISResponse with various response formats
    - Test error message formatting functions
    - Test edge cases and malformed data
    - _Requirements: 6.5, 8.2, 8.3_

  - [ ] 26.2 Create utils/**tests**/sessionManager.test.ts
    - Test generateSessionId uniqueness
    - Test session timeout tracking
    - Test session validation logic
    - Test session reset functionality
    - Test session persistence across app states
    - _Requirements: 7.4, 7.5_

- [ ] 27. Write component integration tests

  - [ ] 27.1 Create components/**tests**/VoiceButton.test.tsx

    - Test mode prop changes (default vs emergency)
    - Test recording state animation
    - Test disabled state rendering
    - Test onPress callback invocation
    - Test accessibility features
    - Test touch target sizes
    - _Requirements: 1.1, 1.2, 1.3, 2.2_

  - [ ] 27.2 Create components/**tests**/TranscriptView.test.tsx

    - Test transcript entry rendering
    - Test auto-scroll behavior
    - Test height adjustment when resource card visible
    - Test speaker-based styling
    - Test performance with large transcript lists
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 27.3 Create components/**tests**/ResourceCard.test.tsx

    - Test slide-in animation
    - Test map rendering with markers
    - Test resource details display
    - Test onClose callback
    - Test lazy loading behavior
    - _Requirements: 3.3, 3.4_

  - [ ] 27.4 Create components/**tests**/VoiceAssistantScreen.test.tsx
    - Test state transitions (initial → emergency → resources)
    - Test Vapi integration flow
    - Test GIS integration flow
    - Test error handling and display
    - Test layout animations
    - Test network connectivity handling
    - Test app state transitions (foreground/background)
    - _Requirements: 1.5, 2.1, 3.1, 5.1, 5.2_

- [ ] 28. Perform end-to-end testing and optimization
  - Test complete emergency flow on physical devices (iOS and Android)
  - Test complete resources flow on physical devices
  - Test on low-end devices (<2GB RAM, older OS versions)
  - Test on tablets and kiosk-sized displays (10-15 inch screens)
  - Test with poor network conditions (throttled, intermittent)
  - Test with airplane mode and network recovery
  - Verify memory usage stays under 150MB
  - Verify smooth 60fps animations
  - Test battery consumption over extended use
  - Verify accessibility with VoiceOver and TalkBack
  - Test permission flows on both platforms
  - Verify 911 calling behavior (with flag disabled for testing)
  - Test TTS functionality across different devices
  - Verify map rendering performance
  - Test session timeout and recovery
  - Document any device-specific issues and workarounds
  - _Requirements: All requirements_
