# HomeBase Backend Integration Guide

The HomeBase mobile app is now integrated with the Supabase backend!

## What Was Integrated

### ✅ Backend Services
- **Emergency Handler** - Submit emergency requests (911 or outreach)
- **Resource Finder** - Find nearby shelters, food banks, and services
- **Programs/Info** - Get educational programs and information
- **Settings** - Manage user accessibility preferences
- **Analytics** - Log usage for insights

### ✅ New Files Created
- `src/services/SupabaseClient.ts` - Supabase client configuration
- `src/services/BackendService.ts` - Complete API wrapper for all backend endpoints
- Updated `src/services/GISService.ts` - Now uses real Supabase backend instead of mock

### ✅ Configuration
- `.env` - Environment variables for local development
- `.env.example` - Template with Supabase configuration
- `app.json` - Updated with Supabase config in `extra` section

## Setup Instructions

### 1. Start the Backend

First, make sure the Supabase backend is running:

```bash
# From the project root
cd backend
supabase start
supabase db push
```

Verify it's running:
```bash
supabase status
```

You should see:
```
API URL: http://127.0.0.1:54321
Studio URL: http://localhost:54323
```

### 2. Install Dependencies

```bash
cd HomeBase
npm install
```

This will install `@supabase/supabase-js` and other dependencies.

### 3. Configure Environment

The `.env` file is already created with local development values:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

For production, update these with your Supabase project values.

### 4. Start the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Using the Backend Services

### Import the Service

```typescript
import BackendService from '../services/BackendService';
```

### Emergency Requests

```typescript
// Submit emergency request
const response = await BackendService.emergency.submit({
  user_id: 'user-id-here',
  is_danger: false, // true for 911, false for outreach
  location_lat: 32.7157,
  location_lng: -117.1611,
  additional_info: 'Need food assistance'
});

console.log(response.responder_type); // '911' or 'outreach'
console.log(response.request_id);
```

### Find Resources

```typescript
// Find nearby resources
const response = await BackendService.resources.find(
  32.7157,  // latitude
  -117.1611, // longitude
  {
    type: 'shelter',     // 'shelter', 'food', 'medical', 'hygiene'
    radius: 5000,        // meters
    is_open: true,       // only open resources
    pet_friendly: true   // optional filter
  }
);

response.resources.forEach(resource => {
  console.log(resource.name);
  console.log(resource.distance_meters);
  console.log(resource.phone);
});
```

### Get Programs

```typescript
// Get educational programs
const response = await BackendService.programs.get({
  language: 'en',        // 'en', 'es', etc.
  category: 'housing',   // optional filter
  voice_enabled: true    // optional filter
});

response.programs.forEach(program => {
  console.log(program.title);
  console.log(program.description);
});
```

### User Settings

```typescript
// Get user settings
const response = await BackendService.settings.get('user-id');
console.log(response.settings.voice_on);
console.log(response.settings.language_pref);

// Update settings
await BackendService.settings.update({
  user_id: 'user-id',
  voice_on: true,
  text_mode: true,
  language_pref: 'en',
  high_contrast: false,
  font_size: 'large'
});
```

### Log Usage

```typescript
// Log usage for analytics
await BackendService.analytics.logUsage({
  module: 'emergency',
  language: 'en',
  location_lat: 32.7157,
  location_lng: -117.1611
});
```

## GIS Service Integration

The `GISService` has been updated to use the real backend. No changes needed to existing code!

```typescript
import { GISService } from '../services/GISService';

// This now calls the Supabase backend
const resources = await GISService.lookupResources(
  32.7157,
  -117.1611,
  'shelter'
);
```

The service includes:
- ✅ Automatic caching (5 minutes)
- ✅ Retry logic with backoff
- ✅ Error handling
- ✅ Distance sorting

## API Endpoints

All endpoints are available through the `BackendService`:

| Service | Method | Description |
|---------|--------|-------------|
| `emergency.submit()` | POST | Submit emergency request |
| `resources.find()` | GET | Find nearby resources |
| `programs.get()` | GET | Get programs/info |
| `settings.get()` | GET | Get user settings |
| `settings.update()` | PUT | Update user settings |
| `analytics.logUsage()` | POST | Log usage event |

## Testing

### 1. Test Backend Connection

```typescript
// In your component
import BackendService from '../services/BackendService';

const testBackend = async () => {
  try {
    const response = await BackendService.resources.find(32.7157, -117.1611);
    console.log('Backend connected!', response.resources.length, 'resources found');
  } catch (error) {
    console.error('Backend error:', error);
  }
};
```

### 2. Check Backend Status

```bash
# In terminal
cd backend
supabase status
```

### 3. View Data in Supabase Studio

Open http://localhost:54323 to:
- View database tables
- Check sample data
- Monitor API requests
- View logs

## Troubleshooting

### Backend Not Responding

**Problem:** API calls fail or timeout

**Solution:**
```bash
# Check if backend is running
cd backend
supabase status

# If not running
supabase start
```

### Environment Variables Not Loading

**Problem:** "Missing Supabase configuration" warning

**Solution:**
1. Verify `.env` file exists in `HomeBase/` directory
2. Check values match backend output from `supabase status`
3. Restart the Expo dev server

### CORS Errors (Web Only)

**Problem:** CORS errors when running on web

**Solution:**
- Use `http://127.0.0.1:54321` instead of `localhost`
- Or run on iOS/Android where CORS doesn't apply

### No Resources Found

**Problem:** `resources.find()` returns empty array

**Solution:**
```bash
# Check if sample data exists
cd backend
supabase db execute "SELECT COUNT(*) FROM resources;"

# If empty, reapply migrations
supabase db push
```

## Production Deployment

### 1. Deploy Backend to Supabase Cloud

```bash
cd backend
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy emergency-handler
supabase functions deploy resource-finder
supabase functions deploy info-handler
supabase functions deploy get-settings
supabase functions deploy update-settings
supabase functions deploy log-usage
```

### 2. Update HomeBase Environment

Update `.env` with production values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
```

### 3. Build and Deploy App

```bash
# Build for production
eas build --platform ios
eas build --platform android

# Or use Expo Go for testing
expo publish
```

## Architecture

```
HomeBase App
    ↓
BackendService.ts (API wrapper)
    ↓
Supabase Edge Functions
    ↓
PostgreSQL + PostGIS Database
```

## Features Available

- ✅ Real-time resource lookup with PostGIS
- ✅ Emergency request handling (911 & outreach)
- ✅ Multi-language program information
- ✅ User settings persistence
- ✅ Usage analytics
- ✅ Automatic caching
- ✅ Retry logic
- ✅ Error handling

## Next Steps

1. Update your screens to use `BackendService` instead of mock data
2. Test emergency flow end-to-end
3. Test resource finder with real location
4. Implement settings UI
5. Add analytics logging to key interactions

## Support

- Backend docs: `../backend/docs/`
- Supabase docs: https://supabase.com/docs
- Expo docs: https://docs.expo.dev

Your HomeBase app is now connected to a real, production-ready backend! 🚀
