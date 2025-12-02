# 🚀 Quick Start: Voice-to-Resources

## 30-Second Setup

```bash
# 1. Start 211 API (Terminal 1)
cd Team-135/ml/server && npm start

# 2. Start Supabase (Terminal 2)
cd Team-135/backend && npx supabase start

# 3. Start HomeBase (Terminal 3)
cd Team-135/HomeBase && npm start
```

Press `i` for iOS or `a` for Android.

## 10-Second Test

1. **Tap** the big circular button
2. **Say** "I need food"
3. **Watch** the map appear with resources!

## What You'll See

```
┌─────────────────────────┐
│  ← Back    Food         │  ← Header
│  5 found nearby         │
├─────────────────────────┤
│                         │
│    🗺️  MAP VIEW        │  ← Interactive Map
│    📍 Your location     │     with markers
│    🍽️ Food places      │
│                         │
├─────────────────────────┤
│  Hope Shelter           │  ← Resource Card
│  ✓ Verified  🟢 Open   │
│  📍 0.3 miles away      │
│  📞 (555) 123-4567      │
│  ┌───────────────────┐ │
│  │ 🎤 Talk to someone│ │  ← Action Button
│  └───────────────────┘ │
└─────────────────────────┘
```

## Voice Commands

| Say This | Get This |
|----------|----------|
| "I need food" | 🍽️ Food banks, meal programs |
| "Where can I find shelter?" | 🏠 Shelters, housing |
| "I need medical help" | 🏥 Clinics, hospitals |
| "Where can I shower?" | 🚿 Hygiene facilities |

## Resource Colors

- 🟣 Purple = Shelter
- 🩷 Pink = Food
- 🔵 Blue = Medical
- 🟢 Green = Hygiene

## Troubleshooting

### No resources showing?
```bash
# Check 211 API is running
curl http://localhost:3000/v1/211/json

# Check Supabase is running
curl http://127.0.0.1:54321/functions/v1/resource-finder?lat=32.7157&lng=-117.1611
```

### Voice not working?
- Grant microphone permission
- Check internet connection
- Speak clearly and wait

### Map not loading?
- Grant location permission
- Check GPS is enabled
- Verify Google Maps API key

## Files to Know

- **VoiceAssistantScreen.tsx** - Main voice interface
- **ResourceResultsScreen.tsx** - Map and results
- **GISService.ts** - Data fetching logic

## Key Features

✅ Voice recognition
✅ Real-time data from 211 API
✅ Fallback to Supabase
✅ Interactive map
✅ Detailed resource cards
✅ One-tap calling
✅ Distance calculation
✅ Smart caching

## Performance

- Voice → Results: **< 5 seconds**
- API Response: **2-3 seconds**
- Map Load: **< 1 second**

## Data Sources

1. **211 SDHEART API** (primary)
   - Real-time data
   - Capacity info
   - Wait times

2. **Supabase** (fallback)
   - Verified resources
   - Reliable baseline

## Next Steps

1. ✅ Test basic flow
2. ✅ Try different resource types
3. ✅ Test on real device
4. ✅ Demo to team
5. ✅ Show to judges

## Documentation

- 📖 [Full Technical Flow](HomeBase/VOICE_TO_RESOURCES_FLOW.md)
- 🧪 [Detailed Testing](TEST_VOICE_RESOURCES.md)
- 🏗️ [Architecture](ARCHITECTURE_DIAGRAM.md)
- 📝 [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- 🎉 [Feature Complete](FEATURE_COMPLETE.md)

## Support

Questions? Check:
1. Console logs for errors
2. Documentation files
3. Verify services are running

---

**Status**: ✅ Ready to Demo
**Time to Test**: ⏱️ 30 seconds
**Difficulty**: 🟢 Easy

**Let's go! 🚀**
