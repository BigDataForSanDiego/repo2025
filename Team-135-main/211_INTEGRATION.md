# 211 SDHEART Integration Guide

The HomeBase app now integrates with the 211 San Diego HEART API for real-time resource data!

## ✅ What Was Integrated

- **211 SDHEART Service** - Fetches real-time resource data from 211 San Diego
- **Smart Fallback** - Uses 211 data first, falls back to Supabase if unavailable
- **Distance Calculation** - Haversine formula for accurate distance sorting
- **Type Filtering** - Filter by shelter, food, or other resource types
- **Radius Filtering** - Only show resources within 5km

## 🚀 How to Test

### Step 1: Start the 211 API Server

```bash
cd Team-135/ml/server
npm install
npm start
```

The 211 API will be available at: `http://localhost:3000/v1/211/json`

### Step 2: Start Supabase Backend (Fallback)

```bash
cd Team-135/backend
supabase start
```

### Step 3: Start HomeBase App

```bash
cd Team-135/HomeBase
npm run web
```

## 📊 How It Works

The GIS service now uses a **smart fallback strategy**:

1. **Primary:** Try 211 SDHEART API first
   - Fetches real-time data from 211 San Diego
   - Calculates distances using Haversine formula
   - Filters by type and radius
   
2. **Fallback:** If 211 fails, use Supabase backend
   - Uses PostGIS for geospatial queries
   - Returns sample resources from database

3. **Cache:** Results are cached for 5 minutes

## 🔧 Configuration

### Environment Variables

In `HomeBase/.env`:

```env
# 211 SDHEART API
API_211_URL=http://localhost:3000/v1/211/json

# Supabase Backend (fallback)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 211 API Server Configuration

In `ml/server/.env`:

```env
API_211_CSV_URL=https://your-211-data-source.com/data.csv
PORT=3000
```

## 📁 New Files Created

- `HomeBase/src/services/SDHeart211Service.ts` - 211 API client
- Updated `HomeBase/src/services/GISService.ts` - Smart fallback logic
- Updated `HomeBase/.env` - 211 API configuration

## 🧪 Testing the Integration

### Test 211 API Directly

```bash
curl http://localhost:3000/v1/211/json
```

Should return:
```json
{
  "data": [
    {
      "source": "211",
      "name": "Community Meal Center",
      "type": "food",
      "lat": 32.7175,
      "lng": -117.1570,
      "hours_json": "Daily 5-7pm",
      "address": "456 Sample Ave",
      "contact": "(555) 222-3333",
      "status": "open",
      "wait_minutes": 10
    }
  ]
}
```

### Test in HomeBase App

Open browser console (F12) and run:

```javascript
import { GISService } from '../services/GISService';

// This will try 211 first, then Supabase
const resources = await GISService.lookupResources(
  32.7157,  // San Diego latitude
  -117.1611, // San Diego longitude
  'food'     // resource type
);

console.log('Found resources:', resources);
```

## 📊 Console Output

When working correctly, you'll see:

```
Attempting to fetch from 211 SDHEART API...
Received 1 resources from 211 SDHEART
Filtered to 1 resources within 5000m
✓ 211 SDHEART: Found 1 resources
```

If 211 fails:

```
211 SDHEART API failed, falling back to Supabase backend: Failed to fetch
Attempting Supabase backend (attempt 1/2)...
✓ Supabase backend: Found 5 resources
```

## 🐛 Troubleshooting

### 211 API Not Responding

**Check if server is running:**
```bash
curl http://localhost:3000/v1/211/json
```

**Start the server:**
```bash
cd Team-135/ml/server
npm start
```

### No Resources Found

**Check the data file:**
```bash
cat Team-135/ml/server/cache/211.sample.json
```

**Verify environment variable:**
```bash
echo $API_211_URL
```

### CORS Errors (Web Only)

If running on web, you may need to enable CORS in the 211 API server.

Add to `ml/server/index.js`:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});
```

## 🎯 Resource Type Mapping

211 data types map to app types:

| 211 Type | App Type |
|----------|----------|
| food | food |
| shelter | shelter |
| medical | other |
| hygiene | other |
| (any other) | other |

## 📈 Data Flow

```
HomeBase App
    ↓
GISService.lookupResources()
    ↓
Try: SDHeart211Service.fetchResources()
    ↓ (if fails)
Fallback: BackendService.resources.find()
    ↓
Return sorted resources by distance
```

## ✅ Success Indicators

You'll know it's working when:

1. ✅ 211 API server responds at http://localhost:3000/v1/211/json
2. ✅ HomeBase console shows "✓ 211 SDHEART: Found X resources"
3. ✅ Resources appear in the app with 211 data
4. ✅ No "GIS failed" errors

## 🚀 Production Deployment

For production:

1. **Deploy 211 API server** to a cloud service
2. **Update environment variable** in HomeBase:
   ```env
   API_211_URL=https://your-211-api.com/v1/211/json
   ```
3. **Configure real 211 data source** in the API server

Your HomeBase app now has real-time 211 SDHEART data integration! 🎉
