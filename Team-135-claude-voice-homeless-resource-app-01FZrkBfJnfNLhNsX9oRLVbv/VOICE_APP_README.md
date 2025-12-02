# Voice-First Homeless Resource App

## Overview

A single-screen, voice-driven application designed specifically for homeless individuals to find nearby resources through natural voice interaction. The app features a ChatGPT-style circular voice button, live transcription, and location-based resource discovery.

## Features

✅ **Single-Screen Interface** - No tabs, navigators, or secondary views
✅ **Circular Voice Button** - ChatGPT-style with animated feedback
✅ **Live Transcription** - Always visible voice-to-text display
✅ **Vapi Voice Agent Integration** - Patient, helpful AI assistance
✅ **GIS Resource Lookup** - Location-based shelter, food, and service finder
✅ **Animated Resource Cards** - Smooth animations with detailed information
✅ **Comprehensive Error Handling** - User-friendly error messages

## Architecture

### File Structure

```
frontend/
├── app/
│   ├── voice-app/
│   │   └── page.tsx                 # Main voice-first application
│   └── api/
│       ├── vapi/
│       │   └── route.ts             # Vapi voice agent API endpoint
│       └── gis-lookup/
│           └── route.ts             # GIS resource lookup API endpoint
├── components/
│   ├── voice-button.tsx             # Circular voice interface button
│   ├── transcription-display.tsx    # Live transcription component
│   └── resource-card.tsx            # Animated resource card
└── lib/
    ├── types.ts                     # TypeScript type definitions
    ├── vapi-client.ts               # Vapi voice agent client
    └── gis-service.ts               # GIS location service
```

## API Schemas

All client-server communication uses strictly defined JSON schemas:

### Voice Agent Request
```typescript
{
  audioInput: string;      // base64 or stream token
  timestamp: number;       // unix epoch ms
  sessionId: string;       // unique per session
}
```

### Voice Agent Response
```typescript
{
  transcript: Array<{
    text: string;
    timestamp: number;
    speaker: "user" | "agent";
  }>;
  intent: string;
  error: string | null;
  resources: Resource[];
}
```

### GIS Lookup Request
```typescript
{
  latitude: number;
  longitude: number;
  resourceType: "shelter" | "food" | "other";
}
```

### GIS Lookup Response
```typescript
{
  resources: Array<{
    name: string;
    type: "shelter" | "food" | "other";
    latitude: number;
    longitude: number;
    address: string;
    distanceMeters: number;
    metadata: object;
  }>;
  error: string | null;
}
```

## User Workflow

1. **Initial State**: User sees circular voice button with prompt
2. **Voice Prompt**: "Is this an emergency or do you want resources? Say 'emergency' or say 'resources'."
3. **User Speaks**: Taps button, speaks request, agent processes
4. **Resource Display**:
   - Voice button animates downward
   - Resource card slides in from top
   - Live transcription remains visible
5. **Navigation**: User can get directions or call the resource

## Setup & Configuration

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# Vapi Voice Agent (Required for production)
VAPI_API_KEY=your_vapi_api_key
VAPI_API_URL=https://api.vapi.ai/v1/voice

# Google Maps API (Optional - for GIS fallback)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Supabase (Already configured in project)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000/voice-app`

## Integration Points

### Vapi Voice Agent

The app integrates with Vapi for voice recognition and natural language processing:

- **Client**: `/lib/vapi-client.ts`
- **API Route**: `/app/api/vapi/route.ts`
- **Mock Mode**: Enabled by default if `VAPI_API_KEY` not set

To integrate real Vapi:
1. Sign up at [vapi.ai](https://vapi.ai)
2. Get API key and URL
3. Add to `.env.local`
4. Update API route with actual Vapi response transformation

### GIS Resource Lookup

The app supports multiple GIS backends with automatic fallback:

1. **Supabase PostGIS** (Primary) - Uses existing `resource-finder` edge function
2. **Google Maps Places API** (Fallback) - Requires API key
3. **Mock Data** (Development) - Returns sample resources

**Configuration Priority**:
```
Supabase → Google Maps → Mock Data
```

### Location Services

- Uses browser `navigator.geolocation` API
- Fallback to San Diego coordinates (32.7157, -117.1611)
- High accuracy mode with 10s timeout

## Error Handling

All errors are handled gracefully with user-friendly messages:

- **Microphone Access Denied**: Prompts user to grant permission
- **Network Errors**: Displays connection issue message
- **GIS Lookup Failure**: Shows error with retry option
- **Vapi API Errors**: Fallback to mock responses or error display

Error messages appear in a red alert box above the voice button.

## Accessibility

- Voice-first design for low-literacy users
- High contrast colors (Navy, Sage Green, Coral Red)
- Large, tappable circular button (128px)
- Clear visual feedback (animations, colors)
- Always-visible transcription for deaf/hard-of-hearing users

## Mobile Optimization

- iOS safe area support
- Touch-optimized button size
- Responsive layout (mobile-first)
- Backdrop blur effects for readability
- Smooth animations with hardware acceleration

## Testing

### Manual Testing Checklist

- [ ] Voice button tap starts recording
- [ ] Microphone permission requested
- [ ] Live transcription appears while speaking
- [ ] Voice button animates during states (listening, processing)
- [ ] Resource card slides in smoothly
- [ ] Error messages display correctly
- [ ] Location permission works
- [ ] "Get Directions" opens Google Maps
- [ ] "Call Now" initiates phone call

### Development with Mock Data

By default, the app uses mock responses:
- Mock Vapi transcription
- Mock GIS resources (Downtown Shelter, Community Food Bank, etc.)

This allows full UI/UX testing without API keys.

## Deployment

### Production Checklist

1. Configure Vapi API credentials
2. Set up Supabase PostGIS backend (already configured)
3. Optional: Add Google Maps API key
4. Test microphone permissions on target devices
5. Test location services in production environment
6. Verify HTTPS (required for microphone access)

### Environment-Specific Behavior

- **Development**: Uses mock data, console warnings
- **Production**: Requires real API keys, proper error handling

## Future Enhancements

- [ ] Multi-language support (Spanish, etc.)
- [ ] Text-to-speech for agent responses
- [ ] Offline mode with cached resources
- [ ] Resource favorites/history
- [ ] Integration with emergency dispatch (911)
- [ ] SMS/text alternative for voice
- [ ] Resource availability real-time updates

## Troubleshooting

### Common Issues

**Issue**: Voice button not responding
**Solution**: Check microphone permissions in browser settings

**Issue**: No resources found
**Solution**: Verify location permissions, check API configuration

**Issue**: Transcription not appearing
**Solution**: Check Vapi API connection, review console logs

**Issue**: "GIS lookup failed" error
**Solution**: Verify Supabase or Google Maps API credentials

## Support

For issues or questions:
- Check browser console for detailed error logs
- Verify `.env.local` configuration
- Test with mock data first (no API keys)
- Review network tab for API call failures

## License

Part of the Home Base - Emergency Assistance & Civic Access Kiosk project.
