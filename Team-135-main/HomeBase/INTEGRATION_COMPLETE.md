# HomeBase Integration - READY TO GO! 🚀

## ✅ What I Just Implemented (45 minutes)

### 1. Type Definitions Updated
**File:** `src/types/api.ts`
- ✅ Added `resourceType?: string` to VoiceAgentResponse
- ✅ Added `requires911?: boolean` to VoiceAgentResponse
- ✅ Added `assistantId?: string` to VoiceAgentRequest
- ✅ Updated GISLookupRequest to support 'medical' resource type

### 2. Real Audio Recording
**File:** `src/services/AudioManager.ts`
- ✅ Implemented real audio recording using expo-audio
- ✅ Configured for 16kHz mono WAV (Vapi optimized)
- ✅ Returns Base64 encoded audio
- ✅ Automatic file cleanup after recording
- ✅ Platform-specific recording options (iOS/Android/Web)

### 3. Vapi Service Integration
**File:** `src/services/VapiService.ts`
- ✅ Added Authorization header with Bearer token
- ✅ Sends assistant ID in requests
- ✅ Handles 401 authentication errors
- ✅ Falls back to demo mode in development (when no API key)
- ✅ Logs successful responses with intent/resourceType
- ✅ Production-ready error handling

### 4. GIS Service Integration
**File:** `src/services/GISService.ts`
- ✅ Added 'medical' as supported resource type
- ✅ Authorization header support (if GIS API needs it)
- ✅ Better error messages for production
- ✅ Falls back to mock data only in dev mode
- ✅ Enhanced logging with emojis for clarity

### 5. Configuration Setup
**Files:** `src/config/app.config.ts`, `src/types/state.ts`
- ✅ Added vapiApiKey, vapiAssistantId, gisApiKey to AppConfig
- ✅ Updated initial greeting prompt (casual, patient, helpful)
- ✅ Environment variable support for all API credentials

### 6. Environment Files
**Files:** `.env`, `.env.example`
- ✅ Created .env template with placeholder values
- ✅ Created .env.example for documentation
- ✅ Ready for you to fill in API credentials

### 7. Documentation
**Files:** `SystemPrompt.md`, `VAPI_INTEGRATION_GUIDE.md`
- ✅ Complete system prompt for Vapi assistant (copy-paste ready)
- ✅ Full integration guide with step-by-step instructions

---

## 🎯 NEXT STEPS (Your Turn - 15 minutes)

### Step 1: Complete Vapi Assistant Setup

1. **Go to Vapi Dashboard:** https://dashboard.vapi.ai

2. **Create Assistant:**
   - Name: "HomeBase Emergency Assistant"
   - Copy the system prompt from `SystemPrompt.md`
   - Paste it into the System Prompt field
   - Choose a voice (recommend: "Alloy" or "Nova" for calm tone)
   - Save

3. **Copy Credentials:**
   - Copy your Assistant ID (starts with `asst_`)
   - Go to Settings → API Keys
   - Create new API key and copy it

### Step 2: Configure Environment

1. **Open `.env` file** in HomeBase directory

2. **Fill in your credentials:**
```env
VAPI_API_KEY=sk_your_actual_vapi_key_here
VAPI_ASSISTANT_ID=asst_your_actual_assistant_id_here
VAPI_ENDPOINT=https://api.vapi.ai

GIS_ENDPOINT=https://your-actual-gis-endpoint.com/api
GIS_API_KEY=your_gis_key_if_needed

ENABLE_911_CALLING=false
```

3. **Save the file**

### Step 3: Test the Integration

1. **Start the app:**
```bash
cd /Users/pavankumar/Developer/SDSU\ Hackathon/Team-135/HomeBase
npm start
```

2. **Press `i` for iOS simulator or `a` for Android**

3. **Test Voice Flow:**
   - Press the voice button
   - Say: "I need food"
   - Expected: Vapi transcribes → detects intent='get_resources', resourceType='food' → GIS looks up food banks → Map displays

4. **Test Emergency Flow:**
   - Press voice button
   - Say: "Emergency, someone's hurt"
   - Expected: Vapi detects intent='emergency', requires911=true → App shows 911 prompt

---

## 🔍 How to Verify It's Working

### Check Console Logs

**Successful Vapi Integration:**
```
✅ Real audio recording started
✅ Recording stopped: 125.4KB
✅ Vapi response received: { intent: 'get_resources', resourceType: 'food', requires911: false }
```

**Successful GIS Integration:**
```
✅ GIS lookup successful: 5 food resources found
```

**Demo Mode (if no credentials):**
```
ℹ️  Demo mode: No Vapi API key configured, using fallback response
ℹ️  Demo mode: No GIS endpoint configured, using mock data
```

### Test Checklist

- [ ] Audio recording works (press button, see "Listening" state)
- [ ] Audio stops and sends to Vapi
- [ ] Vapi returns transcript in UI
- [ ] Intent detected correctly (emergency vs resources)
- [ ] GIS called with correct resource type
- [ ] Map displays with resource markers
- [ ] Emergency mode shows 911 option
- [ ] Error handling works gracefully

---

## 🐛 Troubleshooting

### Issue: "Vapi authentication failed"
**Fix:** Double-check your VAPI_API_KEY in `.env` file. Make sure there are no spaces or quotes around the key.

### Issue: "GIS endpoint not configured"
**Fix:** Add your GIS endpoint URL to `.env` file. If you don't have one yet, the app will use mock data in development.

### Issue: "Microphone permission denied"
**Fix:**
- iOS: Check Settings → Privacy → Microphone
- Android: Check App Permissions in Settings
- Make sure `app.json` has the right permissions (already configured)

### Issue: App shows demo mode
**Fix:** This means `.env` credentials aren't loaded. Make sure:
1. `.env` file exists in HomeBase root
2. File is named exactly `.env` (not `.env.txt`)
3. You've restarted the Metro bundler after adding credentials

### Issue: "Network request failed"
**Fix:**
- Check your internet connection
- Verify API endpoints are reachable
- In dev mode, app will automatically fall back to mock data

---

## 📊 Current State

### ✅ Fully Implemented
- Type definitions with new fields
- Real audio recording (16kHz WAV)
- Vapi API integration with auth
- GIS API integration with auth
- Configuration system
- Environment variables
- Demo mode fallbacks
- Error handling
- Logging system
- Patient, casual initial prompt

### 🔄 Needs Your Input
- Vapi API key and Assistant ID (from dashboard)
- GIS endpoint URL (your backend)
- GIS API key (if required)

### ⏭️ Optional Enhancements (Post-Integration)
- Timeout logic for voice inactivity
- More resource types (hygiene, legal, etc.)
- Better error messages for users
- Analytics tracking
- Testing suite

---

## 📝 Architecture Overview

```
User speaks
    ↓
AudioManager records (real audio, 16kHz WAV)
    ↓
Base64 encoding
    ↓
VapiService.sendAudioRequest()
    ├→ Authorization: Bearer {VAPI_API_KEY}
    ├→ assistantId: {VAPI_ASSISTANT_ID}
    └→ audioInput: {base64Audio}
    ↓
Vapi AI processes
    ↓
Returns: { intent, resourceType, requires911, transcript }
    ↓
If intent === 'emergency':
    └→ Show 911 alert
If intent === 'get_resources':
    ↓
    GISService.lookupResources(lat, lng, resourceType)
        ├→ Check cache first (5-min TTL)
        ├→ Authorization: Bearer {GIS_API_KEY}
        └→ POST /lookup
    ↓
    Returns: [ Resource[], sorted by distance ]
    ↓
    Display map with markers
```

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ You press the voice button and see "Listening..."
2. ✅ You speak and see live transcript appear
3. ✅ Vapi correctly identifies your intent
4. ✅ Map appears with real resource locations
5. ✅ Resources are sorted by distance
6. ✅ Emergency mode triggers 911 prompt
7. ✅ No "demo mode" warnings in console

---

## ⏱️ Time Estimate

- **Vapi Setup:** 10-15 minutes
- **Environment Config:** 2-3 minutes
- **Testing:** 5-10 minutes
- **Debugging (if needed):** 5-10 minutes

**Total:** ~20-30 minutes to full integration

---

## 🆘 Need Help?

1. **Check logs first** - Console will tell you exactly what's wrong
2. **Verify .env file** - Most issues come from missing/wrong credentials
3. **Test in dev mode** - App will fall back to mock data for easier debugging
4. **Read error messages** - They're designed to be helpful and actionable

---

## 🚀 You're Almost There!

Everything is coded and ready. Just:
1. Copy system prompt to Vapi
2. Get your API credentials
3. Fill in `.env`
4. Test

That's it! The hard part is done. 💪

Good luck! 🍀
