# Voice AI to Resource Results Flow

## Overview

This document explains how the voice-driven resource discovery flow works in the HomeBase app, connecting voice input to real-time resource data from 211 San Diego and Supabase.

## User Flow

1. **User opens the app** → VoiceAssistantScreen is displayed
2. **User taps the voice button** → Audio recording starts
3. **User speaks their need** → e.g., "I need food" or "Where can I find shelter?"
4. **Audio is processed** → Sent to Vapi AI service for intent detection
5. **Intent is detected** → System identifies resource type (shelter, food, medical, hygiene)
6. **Navigation occurs** → User is taken to ResourceResultsScreen
7. **Resources are loaded** → Real-time data from 211 SDHEART API + Supabase
8. **Map is displayed** → Shows user location and nearby resources with markers
9. **User selects resource** → Details card appears with info and "Talk to someone" button

## Resource Types Detected

The system automatically detects the following resource types from voice input:

- **Shelter**: Keywords like "shelter", "housing", "sleep", "place to stay"
- **Food**: Keywords like "food", "meal", "eat", "hungry"
- **Medical**: Keywords like "medical", "doctor", "health", "clinic", "sick"
- **Hygiene**: Keywords like "shower", "hygiene", "bathroom", "clean"
- **Other**: Default fallback for general resources

## Data Sources

### Primary: 211 SDHEART API
- Real-time resource data from 211 San Diego
- Includes capacity, wait times, and verification status
- Updated frequently with current availability

### Fallback: Supabase Backend
- Curated resource database
- Used when 211 API is unavailable
- Provides consistent baseline data

### Smart Merging
- Results from both sources are combined
- Duplicates are removed (within 50m radius)
- Sorted by distance (closest first)
- Cached for 5 minutes to improve performance

## Technical Implementation

### Files Modified

1. **GISService.ts** - Enhanced with dual-source data fetching
   - Tries 211 SDHEART API first
   - Falls back to Supabase if needed
   - Merges and deduplicates results

2. **VoiceAssistantScreen.tsx** - Added navigation logic
   - Detects resource type from voice input
   - Navigates to ResourceResultsScreen
   - Handles back navigation

3. **ResourceResultsScreen.tsx** - Enhanced UI
   - Displays map with resource markers
   - Shows detailed resource cards
   - Provides "Talk to someone" action
   - Supports all resource types

## Resource Card Features

The resource card (matching your reference image) includes:

- **Resource name** - Clear title
- **Status badges** - "Verified Today", "Open/Closed"
- **Special features** - "Pet-friendly" badge if applicable
- **Distance** - Walking distance in miles
- **Address** - Full street address
- **Phone number** - Clickable to call
- **Map view** - Shows location with markers
- **Action button** - "Talk to someone" to initiate contact

## Testing the Flow

### Manual Test Steps

1. Start the app: `npm start` or `expo start`
2. Tap the voice button (large circular button)
3. Say one of these phrases:
   - "I need food"
   - "Where can I find shelter?"
   - "I need medical help"
   - "Where can I shower?"
4. Observe the transition to ResourceResultsScreen
5. Verify the map shows your location and nearby resources
6. Tap a marker to see resource details
7. Tap "Talk to someone" to initiate contact

### Expected Behavior

- Voice button should pulse while recording
- Transcript should appear showing your words
- Screen should transition smoothly to map view
- Resources should load within 2-3 seconds
- Map should show colored markers for different resource types
- Selected resource card should slide up from bottom
- Back button should return to voice assistant

## Resource Type Colors

- **Shelter** - Purple (#8B5CF6)
- **Food** - Pink (#EC4899)
- **Medical** - Blue (#3B82F6)
- **Hygiene** - Green (#10B981)
- **Other** - Gray (#6B7280)

## Error Handling

The system gracefully handles:

- No internet connection → Shows cached results if available
- 211 API down → Falls back to Supabase
- No resources found → Shows friendly message with retry option
- Location unavailable → Prompts for permission
- Voice recognition fails → Shows error with retry option

## Performance Optimizations

- **Caching**: Results cached for 5 minutes
- **Deduplication**: Removes duplicate resources
- **Distance sorting**: Closest resources shown first
- **Lazy loading**: Map only loads when needed
- **Smart fallback**: Multiple data sources ensure reliability

## Future Enhancements

- Voice-guided navigation to resources
- Real-time capacity updates
- User reviews and ratings
- Multi-language support
- Offline mode with cached data
- Push notifications for resource availability

## Troubleshooting

### Resources not loading
- Check internet connection
- Verify 211 API server is running: `http://localhost:3000/v1/211/json`
- Check Supabase connection in `.env` file

### Voice not working
- Ensure microphone permissions are granted
- Check Vapi API credentials
- Verify audio recording is enabled on device

### Map not displaying
- Ensure location permissions are granted
- Check Google Maps API key in configuration
- Verify device has GPS enabled

## Related Files

- `Team-135/HomeBase/src/screens/VoiceAssistantScreen.tsx`
- `Team-135/HomeBase/src/screens/ResourceResultsScreen.tsx`
- `Team-135/HomeBase/src/services/GISService.ts`
- `Team-135/HomeBase/src/services/SDHeart211Service.ts`
- `Team-135/HomeBase/src/services/BackendService.ts`
- `Team-135/211_INTEGRATION.md`
- `Team-135/HOMEBASE_SETUP.md`
