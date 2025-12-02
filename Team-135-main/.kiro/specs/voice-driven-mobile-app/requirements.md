# Requirements Document

## Introduction

This document specifies requirements for a single-screen, voice-driven React Native mobile application designed for homeless individuals. The application provides emergency assistance and resource location services through voice interaction, optimized for low-end devices and public kiosks on iOS and Android platforms.

## Glossary

- **Voice Button**: The primary circular interactive button used to initiate and control voice capture
- **Vapi Agent**: The V-A-P-I voice agent service that processes audio input and returns conversational responses
- **GIS System**: Geographic Information System backend that locates nearby resources using Google Maps API
- **Live Transcription**: Real-time text display of conversation between user and agent
- **Emergency State**: Application mode triggered when user indicates an emergency situation
- **Resources State**: Application mode for locating nearby services (food, shelter, etc.)
- **Resource Card**: Visual component displaying resource information including map, address, and distance
- **Session**: A continuous interaction period between user and Vapi Agent identified by sessionId

## Requirements

### Requirement 1

**User Story:** As a homeless individual with limited technical skills, I want a simple voice interface with one main button, so that I can easily access help without navigating complex menus.

#### Acceptance Criteria

1. THE Voice Button SHALL be the only primary interactive element on the single application screen
2. THE Voice Button SHALL be circular and large enough for easy touch interaction on low-end devices
3. THE Voice Button SHALL display in a neutral color in default state
4. THE Voice Button SHALL capture and transmit audio to Vapi Agent when pressed
5. THE Application SHALL render all interaction states (initial, emergency, resources, error, results) on a single screen without navigation

### Requirement 2

**User Story:** As a user in crisis, I want to clearly indicate an emergency, so that I can receive appropriate urgent assistance.

#### Acceptance Criteria

1. WHEN the user speaks "emergency", THE Application SHALL transition to Emergency State
2. WHILE in Emergency State, THE Voice Button SHALL display in red color
3. WHEN Vapi Agent response indicates immediate emergency requiring 911, THE Application SHALL initiate a phone call to 911
4. THE Application SHALL provide a configuration option to disable 911 calling for testing and demonstration purposes
5. WHILE in Emergency State, THE Vapi Agent SHALL ask follow-up questions with patient and supportive tone

### Requirement 3

**User Story:** As a user seeking resources, I want to tell the app what I need, so that I can find nearby services like food or shelter.

#### Acceptance Criteria

1. WHEN the user speaks "resources", THE Application SHALL transition to Resources State
2. WHEN Vapi Agent identifies a resource need, THE Application SHALL send a GIS Lookup Request with user location and resource type
3. WHEN GIS System returns resources, THE Application SHALL display a Resource Card above the Voice Button
4. THE Resource Card SHALL include resource name, type, address, distance, metadata, and a map view
5. WHEN Resource Card is displayed, THE Voice Button SHALL animate downward while maintaining its circular shape and functionality

### Requirement 4

**User Story:** As a user with hearing difficulties, I want to see what I'm saying and what the app is responding, so that I can follow the conversation.

#### Acceptance Criteria

1. THE Application SHALL display Live Transcription at all times during any interaction state
2. THE Live Transcription SHALL show entries ordered chronologically from oldest to newest
3. THE Live Transcription SHALL be scrollable when content exceeds visible area
4. WHEN Resource Card is displayed, THE Live Transcription SHALL reposition to remain fully visible without overlapping the Resource Card or Voice Button
5. THE Live Transcription SHALL append new entries from Vapi Agent transcript array to the display

### Requirement 5

**User Story:** As a user on a public kiosk with poor internet, I want the app to work despite connectivity issues, so that I can still access help when the connection is weak.

#### Acceptance Criteria

1. WHEN network connectivity fails, THE Application SHALL display a clear message indicating weak or lost connection
2. WHEN connectivity errors occur, THE Application SHALL keep the Voice Button visible and functional
3. WHEN connectivity errors occur, THE Application SHALL preserve existing Live Transcription content
4. THE Application SHALL target performance optimization for low-end phones and public kiosks
5. WHEN Vapi Agent or GIS System cannot be reached, THE Application SHALL show user-friendly error messages without freezing the UI

### Requirement 6

**User Story:** As a developer integrating with backend services, I want strict JSON schemas for all communication, so that I can ensure reliable data exchange.

#### Acceptance Criteria

1. THE Application SHALL send Voice Agent Requests containing audioInput, timestamp, and sessionId fields
2. THE Application SHALL process Voice Agent Responses containing transcript, intent, error, and resources fields
3. THE Application SHALL send GIS Lookup Requests containing latitude, longitude, and resourceType fields
4. THE Application SHALL process GIS Lookup Responses containing resources array and error field
5. WHEN a response lacks required fields, THE Application SHALL treat it as an error and display appropriate message

### Requirement 7

**User Story:** As a user starting the app, I want clear initial guidance, so that I know how to begin using the voice interface.

#### Acceptance Criteria

1. WHEN the Application launches, THE Application SHALL display the Voice Button in default neutral state
2. WHEN the Application launches, THE Application SHALL present the prompt "Is this an emergency or do you want resources? Say 'emergency' or say 'resources'"
3. THE Application SHALL present the initial prompt both visually and via text-to-speech
4. THE Application SHALL maintain a unique sessionId for each user interaction session
5. WHEN a session expires, THE Application SHALL prompt the user to start a new session

### Requirement 8

**User Story:** As a user experiencing errors, I want clear feedback about what went wrong, so that I understand the situation and can try again.

#### Acceptance Criteria

1. WHEN backend returns an error field, THE Application SHALL display the error message to the user
2. THE Application SHALL return JSON error objects for missing required fields with format "Missing required field: <fieldName>"
3. THE Application SHALL return JSON error objects for malformed requests with format "Malformed request: <reason>"
4. THE Application SHALL return JSON error objects for GIS failures with message "GIS lookup failed"
5. THE Application SHALL return JSON error objects for session expiration with message "Session expired"
