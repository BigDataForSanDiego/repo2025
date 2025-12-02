# Frontend-Backend Integration Guide

This guide explains how to connect and test the Homebase frontend with the Supabase backend on localhost.

## Prerequisites

1. **Docker Desktop** - Must be running
2. **Node.js** - v18 or higher
3. **Supabase CLI** - Installed globally (`npm install -g supabase`)

## Step 1: Start the Backend

```bash
# Navigate to backend directory
cd backend

# Start Supabase (this will start Docker containers)
supabase start

# Apply database migrations
supabase db push
```

After running `supabase start`, you'll see output like:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://localhost:54323
anon key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
service_role key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvzS
```

Keep this terminal open - Supabase needs to stay running!

## Step 2: Configure the Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies (including Supabase client)
npm install --legacy-peer-deps

# The .env.local file is already created with local development values
# Verify it exists and has the correct values:
cat .env.local
```

**Note:** We use `--legacy-peer-deps` due to React 19 compatibility. An `.npmrc` file is included to handle this automatically.

The `.env.local` should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

## Step 3: Start the Frontend

```bash
# Still in frontend directory
npm run dev
```

The frontend will start on `http://localhost:3000`

## Step 4: Test the Integration

### Option A: Using the UI

1. Open `http://localhost:3000` in your browser
2. Navigate to different sections:
   - **Emergency** - Test emergency requests
   - **Resources** - View nearby resources
   - **Map** - See resources on a map
3. Interact with the features and check if data loads from the backend

### Option B: Using the Browser Console

Open browser DevTools (F12) and test the API directly:

```javascript
// Test Emergency API
const response = await fetch('http://127.0.0.1:54321/functions/v1/emergency-handler', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    'Authorization': 'Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
  },
  body: JSON.stringify({
    user_id: '00000000-0000-0000-0000-000000000001',
    is_danger: false,
    location_lat: 32.7157,
    location_lng: -117.1611,
    additional_info: 'Test request'
  })
})
const data = await response.json()
console.log(data)

// Test Resources API
const resourcesResponse = await fetch('http://127.0.0.1:54321/functions/v1/resource-finder?lat=32.7157&lng=-117.1611&radius=5000', {
  headers: {
    'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    'Authorization': 'Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
  }
})
const resourcesData = await resourcesResponse.json()
console.log(resourcesData)

// Test Programs API
const programsResponse = await fetch('http://127.0.0.1:54321/functions/v1/info-handler?language=en', {
  headers: {
    'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    'Authorization': 'Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
  }
})
const programsData = await programsResponse.json()
console.log(programsData)
```

## API Usage in Components

The integration provides several ways to use the backend APIs:

### 1. Using React Hooks (Recommended)

```typescript
import { useEmergency } from '@/hooks/useEmergency'
import { useResources } from '@/hooks/useResources'
import { usePrograms } from '@/hooks/usePrograms'
import { useSettings } from '@/hooks/useSettings'

function MyComponent() {
  // Emergency hook
  const { submitEmergency, loading, error, response } = useEmergency()
  
  // Resources hook (auto-fetches on mount)
  const { resources, loading, error } = useResources({
    lat: 32.7157,
    lng: -117.1611,
    radius: 5000,
    type: 'shelter'
  })
  
  // Programs hook
  const { programs, loading, error } = usePrograms({
    language: 'en',
    category: 'housing'
  })
  
  // Settings hook
  const { settings, updateSettings, loading, error } = useSettings(userId)
  
  // Use the data in your component...
}
```

### 2. Using API Client Directly

```typescript
import { api } from '@/lib/api/client'

async function handleEmergency() {
  try {
    const response = await api.emergency.submitEmergency({
      user_id: userId,
      is_danger: false,
      location_lat: 32.7157,
      location_lng: -117.1611,
      additional_info: 'Need assistance'
    })
    console.log('Emergency submitted:', response)
  } catch (error) {
    console.error('Failed to submit emergency:', error)
  }
}

async function loadResources() {
  try {
    const { resources } = await api.resources.findResources(32.7157, -117.1611, {
      type: 'shelter',
      radius: 5000,
      pet_friendly: true
    })
    console.log('Found resources:', resources)
  } catch (error) {
    console.error('Failed to load resources:', error)
  }
}

async function loadPrograms() {
  try {
    const { programs } = await api.info.getPrograms({
      language: 'en',
      category: 'housing'
    })
    console.log('Programs:', programs)
  } catch (error) {
    console.error('Failed to load programs:', error)
  }
}
```

## Available APIs

### Emergency API
- `api.emergency.submitEmergency(request)` - Submit emergency request

### Resources API
- `api.resources.findResources(lat, lng, options)` - Find nearby resources
  - Options: `type`, `radius`, `pet_friendly`, `is_open`

### Info/Programs API
- `api.info.getPrograms(options)` - Get programs and information
  - Options: `language`, `category`, `voice_enabled`

### Settings API
- `api.settings.getSettings(userId)` - Get user settings
- `api.settings.updateSettings(settings)` - Update user settings

### Analytics API
- `api.analytics.logUsage(log)` - Log usage event

## Troubleshooting

### Backend Not Responding

**Problem:** API calls fail with connection errors

**Solution:**
1. Check if Supabase is running: `supabase status`
2. If not running: `supabase start`
3. Verify the URL in `.env.local` matches the API URL from `supabase status`

### CORS Errors

**Problem:** Browser shows CORS policy errors

**Solution:**
- This shouldn't happen with local development
- If it does, make sure you're using `http://127.0.0.1:54321` (not `localhost`)
- Check that both frontend and backend are running

### Environment Variables Not Loading

**Problem:** "Missing Supabase environment variables" error

**Solution:**
1. Verify `.env.local` exists in the frontend directory
2. Restart the Next.js dev server: `npm run dev`
3. Check the file has the correct format (no quotes around values)

### Database Empty

**Problem:** Resources or programs return empty arrays

**Solution:**
1. Make sure migrations were applied: `cd backend && supabase db push`
2. Check sample data was inserted: Open Supabase Studio at `http://localhost:54323`
3. Navigate to Table Editor and verify `resources` and `programs` tables have data

### TypeScript Errors

**Problem:** Import errors for API types

**Solution:**
1. Make sure you ran `npm install` in the frontend directory
2. Restart your IDE/editor
3. Check that `@/lib/api/types` path is correct in your `tsconfig.json`

## Viewing Backend Data

### Supabase Studio
Open `http://localhost:54323` to access Supabase Studio where you can:
- View all database tables
- Run SQL queries
- Check Edge Function logs
- Monitor API requests

### Database Direct Access
```bash
# Connect to PostgreSQL directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# View resources
SELECT * FROM resources;

# View programs
SELECT * FROM programs;

# View emergency requests
SELECT * FROM emergency_requests;
```

## Testing Checklist

- [ ] Backend is running (`supabase status` shows all services running)
- [ ] Frontend is running (`npm run dev` in frontend directory)
- [ ] Can access frontend at `http://localhost:3000`
- [ ] Can access Supabase Studio at `http://localhost:54323`
- [ ] Emergency requests work (check in Studio > Table Editor > emergency_requests)
- [ ] Resources load and display
- [ ] Programs load and display
- [ ] Settings can be read and updated
- [ ] No console errors in browser DevTools

## Production Deployment

When ready to deploy to production:

1. **Deploy Backend to Supabase Cloud:**
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
   supabase functions deploy 911-dispatch
   supabase functions deploy update-resources
   ```

2. **Update Frontend Environment Variables:**
   - Create `.env.production` or update Vercel/Netlify environment variables
   - Use production Supabase URL and anon key from your Supabase project settings

3. **Deploy Frontend:**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## Next Steps

1. Update your components to use the API hooks
2. Add error handling and loading states
3. Implement user authentication if needed
4. Add analytics tracking
5. Test all features end-to-end

## Support

- Backend docs: `backend/docs/`
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
