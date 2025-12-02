# Testing Voice-to-Resources Flow

## Quick Start

### 1. Start the 211 API Server (for real-time data)

```bash
cd Team-135/ml/server
npm start
```

The server should start on `http://localhost:3000`

### 2. Start Supabase (for fallback data)

```bash
cd Team-135/backend
npx supabase start
```

### 3. Start the HomeBase App

```bash
cd Team-135/HomeBase
npm start
# or
expo start
```

Then press `i` for iOS simulator or `a` for Android emulator.

## Test Scenarios

### Scenario 1: Find Food Resources

1. Open the app
2. Tap the large circular voice button
3. Say: **"I need food"** or **"Where can I eat?"**
4. Expected result:
   - Screen transitions to map view
   - Title shows "Food"
   - Map displays pink markers for food locations
   - Resource card shows nearest food resource
   - Details include hours, distance, and contact info

### Scenario 2: Find Shelter

1. Tap the voice button
2. Say: **"I need shelter"** or **"Where can I sleep?"**
3. Expected result:
   - Screen transitions to map view
   - Title shows "Shelter"
   - Map displays purple markers for shelters
   - Resource card shows nearest shelter
   - May show "Pet-friendly" badge if applicable

### Scenario 3: Find Medical Help

1. Tap the voice button
2. Say: **"I need medical help"** or **"Where is a clinic?"**
3. Expected result:
   - Screen transitions to map view
   - Title shows "Medical"
   - Map displays blue markers for medical facilities
   - Resource card shows nearest clinic/hospital

### Scenario 4: Find Hygiene Facilities

1. Tap the voice button
2. Say: **"Where can I shower?"** or **"I need hygiene facilities"**
3. Expected result:
   - Screen transitions to map view
   - Title shows "Hygiene"
   - Map displays green markers for hygiene facilities
   - Resource card shows nearest shower/bathroom location

## Verifying Data Sources

### Check 211 SDHEART API

```bash
curl http://localhost:3000/v1/211/json
```

Should return JSON with resource data.

### Check Supabase Backend

```bash
curl http://127.0.0.1:54321/functions/v1/resource-finder?lat=32.7157&lng=-117.1611&type=food \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Should return resources from Supabase.

## Expected UI Elements

### Voice Assistant Screen
- Large circular voice button (center)
- "HomeBase" title (top)
- "Ready to help" status chip
- Live transcript area (bottom)
- Mode indicator (emergency/resources)

### Resource Results Screen
- Back button (top left)
- Resource type title (top center)
- Count of resources found (top)
- Interactive map (top half)
  - User location (blue dot)
  - Resource markers (colored pins)
- Resource card (bottom half)
  - Resource name
  - "Verified Today" badge
  - Open/Closed status
  - Distance and address
  - Phone number
  - "Talk to someone" button (blue)
  - Other nearby options (horizontal scroll)

## Troubleshooting

### Voice button not responding
- Check microphone permissions
- Look for error messages in transcript area
- Check console logs for errors

### No resources showing
- Verify 211 API server is running
- Check Supabase is running
- Ensure location permissions are granted
- Check console for API errors

### Map not loading
- Verify Google Maps API key is configured
- Check location permissions
- Ensure device/simulator has location services enabled

### Wrong resource type detected
- Speak more clearly
- Use specific keywords (food, shelter, medical, shower)
- Check transcript to see what was heard

## Console Logs to Watch

Look for these log messages:

```
✓ Got X resources from 211 SDHEART
✓ Got X resources from Supabase
✓ Returning X unique resources (X from 211, X from Supabase)
Loading [type] resources near {lat, lng}
```

## Data Flow Verification

1. **Voice Input** → Check transcript shows your words
2. **Intent Detection** → Check mode changes to "Resource path"
3. **Navigation** → Screen transitions to map view
4. **Data Fetch** → Console shows API calls
5. **Map Render** → Markers appear on map
6. **Card Display** → Resource details shown at bottom

## Performance Metrics

- Voice recognition: < 2 seconds
- Screen transition: < 500ms
- Resource loading: 2-3 seconds
- Map rendering: < 1 second
- Total flow: < 5 seconds from voice to results

## Common Issues

### Issue: "No resources found nearby"
**Solution**: 
- Check if 211 API has data for your test location
- Try a different location (San Diego area recommended)
- Verify Supabase has sample data

### Issue: "Location not available"
**Solution**:
- Grant location permissions in device settings
- For simulator: Set custom location in Debug menu
- Check `.env` file has correct configuration

### Issue: Voice not being recognized
**Solution**:
- Ensure Vapi API credentials are configured
- Check microphone permissions
- Try speaking more clearly
- Check network connection

## Test Locations

Use these San Diego coordinates for testing:

- **Downtown SD**: 32.7157, -117.1611
- **Balboa Park**: 32.7341, -117.1449
- **Mission Valley**: 32.7740, -117.1656
- **La Jolla**: 32.8328, -117.2713

## Success Criteria

✅ Voice button responds to tap
✅ Audio recording starts (button pulses)
✅ Transcript shows spoken words
✅ Screen transitions to map view
✅ Map shows user location
✅ Resource markers appear on map
✅ Resource card displays with details
✅ "Talk to someone" button is functional
✅ Back button returns to voice screen
✅ Multiple resource types work correctly

## Next Steps

After successful testing:

1. Test with real device (not just simulator)
2. Test in different locations
3. Test with poor network conditions
4. Test with different accents/languages
5. Gather user feedback on UI/UX
6. Optimize performance if needed
7. Add analytics tracking
8. Deploy to TestFlight/Play Store beta

## Support

For issues or questions:
- Check `TROUBLESHOOTING.md`
- Review `VOICE_TO_RESOURCES_FLOW.md`
- Check console logs for errors
- Verify all services are running
