# Vapi Integration Guide for HomeBase

## Overview
This guide walks you through integrating Vapi (Voice AI Platform) into the HomeBase app for real voice interactions with homeless individuals.

## What is Vapi?
Vapi is a voice AI platform that handles:
- Real-time voice transcription (speech-to-text)
- Natural language understanding (intent detection)
- Text-to-speech responses
- Conversational AI flows

---

## Prerequisites

### 1. Vapi Account Setup
1. Go to [https://vapi.ai](https://vapi.ai)
2. Sign up for an account
3. Navigate to your dashboard
4. Get your **API Key** from Settings → API Keys

### 2. Required Information
You'll need:
- ✅ Vapi API Key (from dashboard)
- ✅ Vapi Assistant ID (created in next steps)
- ✅ Your HomeBase backend endpoint (if using a proxy)

---

## Step 1: Create a Vapi Assistant

### 1.1 Log into Vapi Dashboard
- Go to [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
- Navigate to "Assistants" section

### 1.2 Create New Assistant
Click "Create Assistant" and configure:

**Basic Settings:**
```
Name: HomeBase Emergency Assistant
Model: GPT-4 (recommended) or GPT-3.5-turbo (cost-effective)
Voice: Select a clear, calm voice (e.g., "Alloy" or "Nova")
```

**System Prompt:**
```
You are a compassionate AI assistant helping homeless individuals in emergency situations.

Your job:
1. First, determine if this is an EMERGENCY or if they need RESOURCES
2. If EMERGENCY: Stay calm, gather location info, prepare to call 911
3. If RESOURCES: Ask what type of resource they need (shelter, food, medical, etc.)

Important rules:
- Speak clearly and calmly
- Use simple language
- Be empathetic and non-judgmental
- Keep responses brief (1-2 sentences)
- Always confirm you understood correctly

Example flow:
User: "Help"
You: "I'm here to help. Is this an emergency, or do you need resources like shelter or food?"

User: "I need food"
You: "I understand you need food. I'm looking up nearby food banks and soup kitchens for you now."
```

**Function Calling (Advanced):**
Enable function calling and add:
```json
{
  "name": "detect_intent",
  "description": "Detects user intent from their speech",
  "parameters": {
    "type": "object",
    "properties": {
      "intent": {
        "type": "string",
        "enum": ["emergency", "get_resources", "unknown"],
        "description": "The detected user intent"
      },
      "resource_type": {
        "type": "string",
        "enum": ["shelter", "food", "medical", "other"],
        "description": "Type of resource needed (only if intent is get_resources)"
      }
    },
    "required": ["intent"]
  }
}
```

### 1.3 Save and Copy Assistant ID
- Save your assistant
- Copy the **Assistant ID** (starts with `asst_`)
- Keep this for Step 3

---

## Step 2: Set Up Environment Variables

### 2.1 Create .env File
Navigate to your HomeBase directory and create `.env`:

```bash
cd /Users/pavankumar/Developer/SDSU\ Hackathon/Team-135/HomeBase
touch .env
```

### 2.2 Add Vapi Configuration
Edit `.env` and add:

```env
# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key_here
VAPI_ASSISTANT_ID=asst_your_assistant_id_here
VAPI_ENDPOINT=https://api.vapi.ai

# GIS Configuration (for later)
GIS_ENDPOINT=https://your-backend.com/api/gis

# Features
ENABLE_911_CALLING=false
```

**⚠️ IMPORTANT:** Never commit `.env` to git! It's already in `.gitignore`.

---

## Step 3: Update Vapi Service Implementation

### 3.1 Current State
Your `VapiService.ts` currently:
- ✅ Has retry logic
- ✅ Has timeout handling
- ✅ Falls back to demo mode
- ❌ Doesn't send real API key
- ❌ Uses placeholder endpoint

### 3.2 What Needs to Change

Open `src/services/VapiService.ts` and update:

**Add API Key Header:**
```typescript
const response = await fetch(`${APP_CONFIG.vapiEndpoint}/voice`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.VAPI_API_KEY}`, // ADD THIS
  },
  body: JSON.stringify(request),
  signal: controller.signal,
});
```

**Update Request Format (if using Vapi SDK):**
```typescript
const request = {
  audioInput: audioInput, // Base64 encoded audio
  timestamp: Date.now(),
  sessionId: sessionId,
  assistantId: process.env.VAPI_ASSISTANT_ID, // ADD THIS
};
```

---

## Step 4: Audio Format Configuration

### 4.1 Vapi Audio Requirements
Vapi expects audio in specific formats:
- **Format:** WAV or MP3
- **Sample Rate:** 16kHz or 48kHz
- **Channels:** Mono
- **Encoding:** PCM16 (WAV) or MP3
- **Delivery:** Base64 encoded string

### 4.2 Update AudioManager.ts

Open `src/services/AudioManager.ts` and ensure recording settings:

```typescript
const recordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 16000, // 16kHz for Vapi
    numberOfChannels: 1, // Mono
    bitRate: 64000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 16000, // 16kHz for Vapi
    numberOfChannels: 1, // Mono
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};
```

---

## Step 5: Testing Strategy

### 5.1 Test Phases

**Phase 1: API Connection Test**
- Goal: Verify Vapi API accepts requests
- Test: Send a test audio file
- Expected: 200 response with transcript

**Phase 2: Audio Quality Test**
- Goal: Ensure audio is clear enough for transcription
- Test: Record "This is a test" and check transcript
- Expected: Accurate transcription

**Phase 3: Intent Detection Test**
- Goal: Verify assistant understands emergency vs resources
- Test: Say "I need help, this is an emergency"
- Expected: Intent = "emergency"

**Phase 4: Full Flow Test**
- Goal: Test complete user journey
- Test: Resources flow from start to finish
- Expected: Mock resources displayed

### 5.2 Testing Commands

Create a test script in `src/utils/testVapi.ts`:

```typescript
import { sendAudioRequest } from '../services/VapiService';

export async function testVapiConnection() {
  try {
    console.log('🧪 Testing Vapi connection...');

    // Create a small test audio (silence)
    const testAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

    const response = await sendAudioRequest(testAudio, 'test-session');

    console.log('✅ Vapi connection successful!');
    console.log('Response:', response);
    return true;
  } catch (error) {
    console.error('❌ Vapi connection failed:', error);
    return false;
  }
}
```

---

## Step 6: Implementation Checklist

### Pre-Integration
- [ ] Vapi account created
- [ ] API key obtained
- [ ] Assistant created and configured
- [ ] Assistant ID copied
- [ ] `.env` file created with credentials

### Code Updates
- [ ] `VapiService.ts` updated with API key header
- [ ] `AudioManager.ts` configured for correct audio format
- [ ] `app.config.ts` reading from `.env` properly
- [ ] Test script created

### Testing
- [ ] API connection test passes
- [ ] Audio recording works on device
- [ ] Transcription is accurate
- [ ] Intent detection works
- [ ] Fallback mode still works if API fails

### Production Ready
- [ ] Error handling tested
- [ ] Retry logic tested
- [ ] Network failure scenarios handled
- [ ] Demo mode can be disabled for production

---

## Step 7: Troubleshooting

### Common Issues

**Issue 1: 401 Unauthorized**
- ✅ Check API key is correct in `.env`
- ✅ Verify API key has proper permissions
- ✅ Ensure `Authorization` header is formatted correctly

**Issue 2: Audio Not Transcribing**
- ✅ Check audio format (16kHz, mono, PCM16/MP3)
- ✅ Verify Base64 encoding is correct
- ✅ Test with a known-good audio file
- ✅ Check audio file size (keep under 10MB)

**Issue 3: Wrong Intent Detected**
- ✅ Review system prompt clarity
- ✅ Add more examples to prompt
- ✅ Test with clear, unambiguous phrases
- ✅ Consider fine-tuning the model

**Issue 4: Slow Response Times**
- ✅ Check network latency
- ✅ Reduce audio file size
- ✅ Consider using GPT-3.5-turbo instead of GPT-4
- ✅ Enable streaming responses

---

## Step 8: Going Live

### When Everything Works

1. **Update Config:**
```typescript
// src/config/app.config.ts
export const APP_CONFIG: AppConfig = {
  // Change this to false to disable demo mode in production
  useDemoMode: __DEV__, // Only demo in development

  vapiEndpoint: process.env.VAPI_ENDPOINT || 'https://api.vapi.ai',
  // ... rest of config
};
```

2. **Add Demo Mode Toggle:**
```typescript
// src/services/VapiService.ts
export const sendAudioRequest = async (
  audioInput: string,
  sessionId: string
): Promise<VoiceAgentResponse> => {
  // If demo mode is enabled, use fallback
  if (APP_CONFIG.useDemoMode) {
    console.log('ℹ️  Demo mode enabled, using fallback response');
    return FALLBACK_RESPONSE();
  }

  // Real Vapi API call
  // ... existing code
};
```

3. **Test Production Build:**
```bash
# Build for production
npx expo build:web
npx expo build:android
npx expo build:ios
```

---

## Next Steps After Vapi

Once Vapi is working, you'll need to integrate:

1. **GIS Service** - Real resource location lookup
2. **911 Calling** - Emergency call integration
3. **Analytics** - Track usage and success rates
4. **Error Monitoring** - Sentry or similar

---

## Support Resources

- **Vapi Documentation:** https://docs.vapi.ai
- **Vapi Discord:** https://discord.gg/vapi
- **Expo Audio Docs:** https://docs.expo.dev/versions/latest/sdk/audio/
- **HomeBase Issues:** Create an issue in your repo

---

## Summary

**Current State:**
- ✅ UI is complete and beautiful
- ✅ Demo mode works perfectly
- ✅ Code structure is ready for real integration
- ❌ No real Vapi connection yet

**After Following This Guide:**
- ✅ Real voice transcription working
- ✅ Intent detection functional
- ✅ Fallback mode as safety net
- ✅ Ready for GIS integration

**Time Estimate:** 2-4 hours for full Vapi integration

---

Good luck! 🚀

*Last updated: November 14, 2025*
