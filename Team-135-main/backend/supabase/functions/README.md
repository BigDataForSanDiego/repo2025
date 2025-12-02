# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Homebase kiosk backend.

## Emergency Help Module

### emergency-handler
**Endpoint:** `POST /functions/v1/emergency-handler`

Handles emergency help requests from kiosk users. Validates request data, stores emergency records in the database, and routes to appropriate responders based on danger level.

**Request Body:**
```json
{
  "user_id": "uuid",
  "is_danger": true,
  "location_lat": 32.7157,
  "location_lng": -117.1611,
  "additional_info": "Optional details"
}
```

**Response:**
```json
{
  "success": true,
  "request_id": "uuid",
  "message": "Emergency services have been notified. Help is on the way.",
  "responder_type": "911"
}
```

### 911-dispatch
**Endpoint:** `POST /functions/v1/911-dispatch`

Sends emergency notifications to 911 dispatch webhook. Called automatically by database trigger when `is_danger=true` emergencies are created.

**Request Body:**
```json
{
  "emergency_id": "uuid",
  "location_lat": 32.7157,
  "location_lng": -117.1611,
  "additional_info": "Emergency details",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Testing Locally

1. Start Supabase local development:
```bash
cd backend
supabase start
```

2. Test emergency-handler:
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/emergency-handler \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "is_danger": false,
    "location_lat": 32.7157,
    "location_lng": -117.1611,
    "additional_info": "Need assistance"
  }'
```

3. Test 911-dispatch:
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/911-dispatch \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emergency_id": "test-emergency-id",
    "location_lat": 32.7157,
    "location_lng": -117.1611,
    "timestamp": "2024-01-01T00:00:00Z"
  }'
```

## Deployment

Deploy functions to Supabase:
```bash
supabase functions deploy emergency-handler
supabase functions deploy 911-dispatch
```

## Environment Variables

Required environment variables (set in Supabase dashboard):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database operations
- `911_WEBHOOK_URL` - Webhook URL for 911 dispatch notifications
