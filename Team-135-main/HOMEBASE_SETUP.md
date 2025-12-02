# HomeBase Mobile App - Backend Integration Complete! 🎉

The HomeBase React Native/Expo app is now fully integrated with the Supabase backend.

## Quick Start

### 1. Start Backend
```bash
cd backend
supabase start
supabase db push
```

### 2. Start HomeBase App
```bash
cd HomeBase
npm install
npm run ios    # or npm run android, or npm run web
```

## What's Integrated

### ✅ Backend Services
- **Emergency Handler** - Submit 911 or outreach requests
- **Resource Finder** - Find nearby shelters, food banks (powered by PostGIS)
- **Programs/Info** - Get educational content
- **Settings** - User accessibility preferences
- **Analytics** - Usage tracking

### ✅ Files Created
- `src/services/SupabaseClient.ts` - Supabase client
- `src/services/BackendService.ts` - Complete API wrapper
- Updated `src/services/GISService.ts` - Now uses real backend
- `.env` - Environment configuration
- `BACKEND_INTEGRATION.md` - Detailed integration guide

## Project Structure

```
Team-135/
├── backend/           # Supabase backend (PostgreSQL + Edge Functions)
├── HomeBase/          # React Native/Expo mobile app ⭐ MAIN APP
└── frontend/          # Next.js web app (development iterations)
```

## Using the Backend

```typescript
import BackendService from '../services/BackendService';

// Find resources
const { resources } = await BackendService.resources.find(lat, lng, {
  type: 'shelter',
  radius: 5000
});

// Submit emergency
const response = await BackendService.emergency.submit({
  user_id: userId,
  is_danger: false,
  location_lat: lat,
  location_lng: lng
});

// Get programs
const { programs } = await BackendService.programs.get({
  language: 'en'
});
```

## Documentation

- **[HomeBase/BACKEND_INTEGRATION.md](HomeBase/BACKEND_INTEGRATION.md)** - Complete integration guide
- **[backend/docs/](backend/docs/)** - Backend API documentation
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues

## Testing

1. **Start backend:** `cd backend && supabase start`
2. **Start app:** `cd HomeBase && npm run ios`
3. **Test resource finder** - Should show real resources from database
4. **Check Supabase Studio:** http://localhost:54323

## Architecture

```
HomeBase App (React Native)
    ↓
BackendService.ts
    ↓
Supabase Edge Functions
    ↓
PostgreSQL + PostGIS
```

## Features

- ✅ Real-time geospatial queries
- ✅ Emergency request handling
- ✅ Multi-language support
- ✅ Automatic caching
- ✅ Retry logic
- ✅ Error handling

Your HomeBase app is production-ready! 🚀
