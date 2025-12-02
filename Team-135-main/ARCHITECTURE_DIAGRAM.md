# HomeBase Voice-to-Resources Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           HomeBase Mobile App (React Native)            │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │      VoiceAssistantScreen                        │  │    │
│  │  │  ┌────────────────────────────────────────────┐ │  │    │
│  │  │  │  🎤 Voice Button                           │ │  │    │
│  │  │  │  - Tap to record                           │ │  │    │
│  │  │  │  - Speaks: "I need food"                   │ │  │    │
│  │  │  └────────────────────────────────────────────┘ │  │    │
│  │  │  ┌────────────────────────────────────────────┐ │  │    │
│  │  │  │  📝 Live Transcript                        │ │  │    │
│  │  │  │  - Shows user words                        │ │  │    │
│  │  │  │  - Shows agent responses                   │ │  │    │
│  │  │  └────────────────────────────────────────────┘ │  │    │
│  │  │  ┌────────────────────────────────────────────┐ │  │    │
│  │  │  │  🧠 Intent Detection                       │ │  │    │
│  │  │  │  - Detects: food, shelter, medical, etc.  │ │  │    │
│  │  │  └────────────────────────────────────────────┘ │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                        │                                 │    │
│  │                        ▼ (Navigation)                    │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │      ResourceResultsScreen                       │  │    │
│  │  │  ┌────────────────────────────────────────────┐ │  │    │
│  │  │  │  🗺️  Interactive Map                       │ │  │    │
│  │  │  │  - User location (blue dot)                │ │  │    │
│  │  │  │  - Resource markers (colored pins)         │ │  │    │
│  │  │  │  - Tap to select                           │ │  │    │
│  │  │  └────────────────────────────────────────────┘ │  │    │
│  │  │  ┌────────────────────────────────────────────┐ │  │    │
│  │  │  │  📋 Resource Card                          │ │  │    │
│  │  │  │  - Name, address, distance                 │ │  │    │
│  │  │  │  - Hours, phone, status                    │ │  │    │
│  │  │  │  - "Talk to someone" button                │ │  │    │
│  │  │  └────────────────────────────────────────────┘ │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                Service Layer                            │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ GISService   │  │ AudioManager │  │ VapiService │ │    │
│  │  │ - Fetch data │  │ - Record     │  │ - Process   │ │    │
│  │  │ - Merge      │  │ - Playback   │  │   audio     │ │    │
│  │  │ - Cache      │  │ - TTS        │  │ - Detect    │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌────────────────┐     ┌──────────────┐
│  211 SDHEART  │      │    Supabase    │     │  Vapi AI     │
│     API       │      │    Backend     │     │   Service    │
│               │      │                │     │              │
│ - Real-time   │      │ - Edge Funcs   │     │ - Voice      │
│   resource    │      │ - PostGIS      │     │   recognition│
│   data        │      │ - Database     │     │ - Intent     │
│ - Capacity    │      │ - Auth         │     │   detection  │
│ - Wait times  │      │ - Analytics    │     │              │
│               │      │                │     │              │
│ Port: 3000    │      │ Port: 54321    │     │ Cloud API    │
└───────────────┘      └────────────────┘     └──────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌───────────────────────────────────────┐
│         Data Sources                   │
│                                        │
│  - 211 San Diego Database             │
│  - SANDAG GIS Data                    │
│  - Community Resources                │
│  - Verified Locations                 │
└───────────────────────────────────────┘
```

## Data Flow Sequence

### 1. Voice Input Flow
```
User → Tap Button → Start Recording → Speak → Stop Recording
  → AudioManager.stopRecording()
  → Base64 Audio
  → VapiService.sendAudioRequest()
  → Vapi AI API
  → Response with transcript + intent
  → Update UI with transcript
```

### 2. Resource Discovery Flow
```
Intent Detected (e.g., "food")
  → VoiceAssistantScreen.handleIntent()
  → Detect resource type from keywords
  → Navigate to ResourceResultsScreen
  → GISService.lookupResources()
  ├─→ Try 211 SDHEART API
  │   └─→ SDHeart211Service.fetchResources()
  │       └─→ GET http://localhost:3000/v1/211/json
  │           └─→ Parse CSV data
  │               └─→ Filter by type & distance
  │                   └─→ Return resources[]
  └─→ Try Supabase Backend (fallback)
      └─→ BackendService.resources.find()
          └─→ POST /functions/v1/resource-finder
              └─→ Query PostGIS database
                  └─→ Return resources[]
  → Merge results from both sources
  → Deduplicate by location
  → Sort by distance
  → Cache for 5 minutes
  → Display on map with markers
  → Show resource card for nearest
```

### 3. User Interaction Flow
```
Map Displayed
  → User taps marker
  → Select resource
  → Display resource card
  → User taps "Talk to someone"
  → Alert with phone number
  → User confirms
  → Open phone dialer
  → Call resource
```

## Component Hierarchy

```
App
└── VoiceAssistantScreen
    ├── VoiceButton
    │   └── Animated.View (pulse effect)
    ├── TranscriptView
    │   └── TranscriptItem[] (scrollable)
    ├── ErrorMessage (conditional)
    └── ResourceResultsScreen (conditional navigation)
        ├── Header
        │   ├── Back Button
        │   └── Title + Count
        ├── MapView
        │   ├── User Location Marker
        │   └── Resource Markers[]
        └── ResourceCard
            ├── Resource Details
            │   ├── Name + Badges
            │   ├── Status + Hours
            │   ├── Distance + Address
            │   └── Phone Number
            ├── Action Button ("Talk to someone")
            └── Other Resources (horizontal scroll)
```

## State Management

```
AppContext (React Context + useReducer)
├── state
│   ├── mode: 'initial' | 'emergency' | 'resources'
│   ├── sessionId: string
│   ├── transcript: TranscriptEntry[]
│   ├── resources: Resource[]
│   ├── selectedResource: Resource | null
│   ├── isRecording: boolean
│   ├── error: string | null
│   └── userLocation: Location | null
└── dispatch
    ├── SET_MODE
    ├── UPDATE_TRANSCRIPT
    ├── SET_RESOURCES
    ├── SELECT_RESOURCE
    ├── SET_RECORDING
    ├── SET_ERROR
    ├── SET_LOCATION
    └── RESET_SESSION
```

## API Endpoints

### 211 SDHEART API
```
GET http://localhost:3000/v1/211/json
Response: {
  data: [
    {
      source: "211",
      name: "Resource Name",
      type: "food" | "shelter" | "medical" | "hygiene",
      lat: number,
      lng: number,
      hours_json: string,
      address: string,
      contact: string,
      status: "Open" | "Closed",
      capacity_available: number,
      wait_minutes: number,
      last_verified_at: string
    }
  ]
}
```

### Supabase Resource Finder
```
GET http://127.0.0.1:54321/functions/v1/resource-finder
Query Params:
  - lat: number
  - lng: number
  - type: string (optional)
  - radius: number (optional, default 5000m)
  - is_open: boolean (optional)

Response: {
  resources: [
    {
      id: string,
      name: string,
      type: string,
      latitude: number,
      longitude: number,
      distance_meters: number,
      is_open: boolean,
      phone: string,
      hours: string,
      pet_friendly: boolean,
      verified_on: string,
      address: string
    }
  ]
}
```

### Vapi AI Service
```
POST https://api.vapi.ai/audio
Headers:
  - Authorization: Bearer <token>
Body: {
  audioInput: string (base64),
  timestamp: number,
  sessionId: string
}

Response: {
  transcript: [
    {
      text: string,
      timestamp: number,
      speaker: "user" | "agent"
    }
  ],
  intent: "emergency" | "get_resources" | "other",
  resourceType: "shelter" | "food" | "medical" | "hygiene",
  requires911: boolean,
  error: string | null
}
```

## Caching Strategy

```
Cache Key: "${lat.toFixed(3)},${lng.toFixed(3)},${resourceType}"
Cache Duration: 5 minutes (300,000ms)
Cache Storage: In-memory Map

Flow:
1. Check cache for key
2. If found and not expired → return cached data
3. If not found or expired → fetch from APIs
4. Store result in cache with timestamp
5. Return data
```

## Error Handling Strategy

```
Try 211 API
  ├─ Success → Use 211 data
  └─ Failure → Log error, continue to Supabase

Try Supabase
  ├─ Success → Use Supabase data
  └─ Failure → Log error

Merge Results
  ├─ Has data → Display resources
  └─ No data → Show "No resources found" message

User sees:
  - Loading indicator while fetching
  - Resources if found
  - Friendly error message if none found
  - Retry option
```

## Performance Optimizations

1. **Caching**: 5-minute cache reduces API calls
2. **Deduplication**: Removes duplicate resources
3. **Distance Sorting**: Shows closest resources first
4. **Lazy Loading**: Map only loads when needed
5. **Memoization**: React.memo for transcript items
6. **Debouncing**: Prevents rapid button presses
7. **Native Driver**: Animations use native driver
8. **Smart Fallback**: Multiple data sources ensure reliability

## Security Considerations

1. **API Keys**: Stored in environment variables
2. **HTTPS**: All API calls over HTTPS
3. **Input Validation**: All user input validated
4. **Error Sanitization**: No sensitive data in errors
5. **Permission Checks**: Location and microphone permissions
6. **Rate Limiting**: Caching prevents excessive API calls

## Scalability

- **Horizontal**: Can add more data sources
- **Vertical**: Caching reduces server load
- **Geographic**: Works in any location with data
- **Resource Types**: Easy to add new types
- **Languages**: Architecture supports i18n

## Monitoring & Analytics

Potential metrics to track:
- Voice recognition success rate
- Resource discovery time
- API response times
- Cache hit rate
- User location accuracy
- Resource selection patterns
- Error frequency
- User session duration

## Deployment Architecture

```
Production:
  - Mobile App → App Store / Play Store
  - 211 API → Cloud hosting (AWS/GCP)
  - Supabase → Managed cloud instance
  - Vapi AI → Cloud API service

Development:
  - Mobile App → Expo Go / Simulator
  - 211 API → localhost:3000
  - Supabase → localhost:54321
  - Vapi AI → Cloud API service
```

This architecture provides a robust, scalable, and user-friendly solution for voice-driven resource discovery.
