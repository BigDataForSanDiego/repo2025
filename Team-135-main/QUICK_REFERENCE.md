# Quick Reference Card

## 🚀 Start Everything

```bash
./start-dev.sh
```

## 📍 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Test Page | http://localhost:3000/test-api |
| Supabase Studio | http://localhost:54323 |
| API Base | http://127.0.0.1:54321 |

## 🔧 Common Commands

### Backend
```bash
cd backend
supabase start          # Start backend
supabase stop           # Stop backend
supabase status         # Check status
supabase db push        # Apply migrations
supabase db reset       # Reset database
```

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps  # Install dependencies
npm run dev                      # Start dev server
npm run build                    # Build for production
```

## 📦 API Quick Reference

### Emergency
```typescript
import { api } from '@/lib/api/client'

await api.emergency.submitEmergency({
  user_id: 'user-id',
  is_danger: false,
  location_lat: 32.7157,
  location_lng: -117.1611
})
```

### Resources
```typescript
const { resources } = await api.resources.findResources(
  32.7157, -117.1611, 
  { type: 'shelter', radius: 5000 }
)
```

### Programs
```typescript
const { programs } = await api.info.getPrograms({
  language: 'en',
  category: 'housing'
})
```

### Settings
```typescript
// Get
const { settings } = await api.settings.getSettings(userId)

// Update
await api.settings.updateSettings({
  user_id: userId,
  voice_on: true,
  font_size: 'large'
})
```

## 🎣 React Hooks

```typescript
import { useEmergency } from '@/hooks/useEmergency'
import { useResources } from '@/hooks/useResources'
import { usePrograms } from '@/hooks/usePrograms'
import { useSettings } from '@/hooks/useSettings'

// In component
const { resources, loading, error } = useResources({
  lat: 32.7157,
  lng: -117.1611,
  radius: 5000
})
```

## 🐛 Quick Fixes

### Backend not responding
```bash
cd backend && supabase start
```

### Frontend can't connect
```bash
cat frontend/.env.local  # Verify env vars
cd frontend && npm run dev  # Restart
```

### No data in database
```bash
cd backend && supabase db push
```

### TypeScript errors
```bash
cd frontend && npm install --legacy-peer-deps
```

## 📚 Documentation

- [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - What was set up
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Detailed guide
- [backend/docs/](backend/docs/) - Backend docs

## ✅ Test Checklist

- [ ] Backend running (`supabase status`)
- [ ] Frontend running (http://localhost:3000)
- [ ] Test page works (http://localhost:3000/test-api)
- [ ] All API tests pass
- [ ] No console errors

## 🎯 File Locations

```
frontend/
├── lib/api/client.ts      # API functions
├── lib/api/types.ts       # TypeScript types
├── hooks/                 # React hooks
└── app/test-api/          # Test page

backend/
├── supabase/functions/    # API endpoints
└── supabase/migrations/   # Database schema
```
