# Homebase Backend Setup Guide

This guide will help you set up the Homebase civic-access kiosk backend for local development and deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Supabase CLI** (v1.0+)
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # Linux
   brew install supabase/tap/supabase
   # or
   curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
   
   # Windows
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. **Deno** (v1.30+) - Required for Edge Functions
   ```bash
   # macOS/Linux
   curl -fsSL https://deno.land/install.sh | sh
   
   # Windows
   irm https://deno.land/install.ps1 | iex
   ```

3. **Docker Desktop** - Required for local Supabase instance
   - Download from: https://www.docker.com/products/docker-desktop

4. **Git** - For version control
   ```bash
   # macOS
   brew install git
   
   # Linux
   sudo apt-get install git
   ```

### Optional Tools

- **curl** - For testing API endpoints
- **jq** - For formatting JSON responses
  ```bash
  brew install jq  # macOS
  sudo apt-get install jq  # Linux
  ```

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Team-135/backend
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Supabase Configuration (will be set automatically by supabase start)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<will-be-generated>
SUPABASE_SERVICE_ROLE_KEY=<will-be-generated>

# External API URLs
COUNTY_API_URL=https://api.sandiegocounty.gov/shelters
CLEAN_SAFE_URL=https://cleanandsafe.org/api/resources

# 911 Dispatch Webhook (for testing, use a webhook.site URL)
911_WEBHOOK_URL=https://webhook.site/your-unique-id
```

### Step 3: Start Local Supabase Instance

Navigate to the backend directory and start Supabase:

```bash
cd Team-135/backend
supabase start
```

This command will:
- Start Docker containers for PostgreSQL, PostgREST, GoTrue, and other Supabase services
- Apply all database migrations from `supabase/migrations/`
- Generate API keys and display connection details

**Important:** Save the output! It contains your local API keys:

```
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: <your-jwt-secret>
anon key: <your-anon-key>
service_role key: <your-service-role-key>
```

Update your `.env` file with the generated keys.

### Step 4: Verify Database Setup

Open Supabase Studio in your browser:

```bash
open http://127.0.0.1:54323
```

Navigate to the **Table Editor** and verify that all tables are created:
- `emergency_requests`
- `resources`
- `programs`
- `user_settings`
- `outreach_contacts`
- `usage_logs`
- `voice_logs`

Check the **SQL Editor** to verify PostGIS extension:

```sql
SELECT PostGIS_Version();
```

### Step 5: Deploy Edge Functions Locally

Edge Functions are automatically available when you run `supabase start`. They are served at:

```
http://127.0.0.1:54321/functions/v1/<function-name>
```

To test if functions are deployed:

```bash
curl http://127.0.0.1:54321/functions/v1/
```

### Step 6: Test the Backend

Use the provided test scripts to verify all endpoints:

```bash
# Test emergency handler
./test-emergency.sh

# Test resource finder
./test-resource-finder.sh

# Test info handler
./test-info-handler.sh

# Test settings endpoints
./test-settings.sh

# Test usage logging
./test-log-usage.sh

# Test resource update
./test-update-resources.sh

# Run all tests
./rigorous-test.sh
```

## API Endpoint Testing

### 1. Emergency Handler

**Create Emergency Request (Non-Danger)**

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/emergency-handler \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000000",
    "is_danger": false,
    "location_lat": 32.7157,
    "location_lng": -117.1611,
    "additional_info": "Need assistance finding shelter"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "request_id": "uuid-here",
    "message": "Your request has been received. An outreach worker will contact you shortly.",
    "responder_type": "outreach"
  }
}
```

**Create Emergency Request (Danger)**

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/emergency-handler \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000000",
    "is_danger": true,
    "location_lat": 32.7157,
    "location_lng": -117.1611,
    "additional_info": "Medical emergency"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "request_id": "uuid-here",
    "message": "Emergency services have been notified. Help is on the way.",
    "responder_type": "911"
  }
}
```

### 2. Resource Finder

**Find Nearby Shelters**

```bash
curl -X GET "http://127.0.0.1:54321/functions/v1/resource-finder?lat=32.7157&lng=-117.1611&type=shelter&radius=5000" \
  -H "Authorization: Bearer <your-anon-key>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": "uuid-here",
        "name": "Downtown Shelter",
        "type": "shelter",
        "latitude": 32.7150,
        "longitude": -117.1620,
        "distance_meters": 125.5,
        "is_open": true,
        "phone": "(619) 555-0100",
        "hours": "24/7",
        "pet_friendly": true,
        "address": "123 Main St, San Diego, CA",
        "verified_on": "2025-11-13T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

**Find Pet-Friendly Resources**

```bash
curl -X GET "http://127.0.0.1:54321/functions/v1/resource-finder?lat=32.7157&lng=-117.1611&pet_friendly=true&radius=10000" \
  -H "Authorization: Bearer <your-anon-key>"
```

### 3. Information Handler

**Get Programs in English**

```bash
curl -X GET "http://127.0.0.1:54321/functions/v1/info-handler?language=en" \
  -H "Authorization: Bearer <your-anon-key>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "id": "uuid-here",
        "title": "Housing Assistance Program",
        "description": "Get help finding permanent housing",
        "language": "en",
        "voice_enabled": true,
        "contact_link": "https://example.com/housing",
        "category": "housing"
      }
    ],
    "count": 1
  }
}
```

**Get Voice-Enabled Programs in Spanish**

```bash
curl -X GET "http://127.0.0.1:54321/functions/v1/info-handler?language=es&voice_enabled=true" \
  -H "Authorization: Bearer <your-anon-key>"
```

### 4. User Settings

**Get User Settings**

```bash
curl -X GET "http://127.0.0.1:54321/functions/v1/get-settings/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer <your-anon-key>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "user_id": "00000000-0000-0000-0000-000000000000",
      "voice_on": false,
      "text_mode": true,
      "language_pref": "en",
      "high_contrast": false,
      "font_size": "medium"
    }
  }
}
```

**Update User Settings**

```bash
curl -X PUT "http://127.0.0.1:54321/functions/v1/update-settings/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "voice_on": true,
    "font_size": "large",
    "high_contrast": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "user_id": "00000000-0000-0000-0000-000000000000",
      "voice_on": true,
      "text_mode": true,
      "language_pref": "en",
      "high_contrast": true,
      "font_size": "large",
      "updated_at": "2025-11-13T10:30:00Z"
    }
  },
  "message": "Settings updated successfully"
}
```

### 5. Usage Logging

**Log Usage Event**

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/log-usage \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "resources",
    "language": "en",
    "location_lat": 32.7157,
    "location_lng": -117.1611
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "log_id": "uuid-here"
  }
}
```

### 6. Update Resources (Admin Only)

**Trigger Resource Update**

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/update-resources \
  -H "Authorization: Bearer <your-service-role-key>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_fetched": 10,
      "inserted": 3,
      "updated": 7,
      "failed": 0
    }
  },
  "message": "Resource update completed"
}
```

## Production Deployment

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - Name: `homebase-backend`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### Step 2: Link Local Project to Supabase

```bash
# Login to Supabase
supabase login

# Link your local project
supabase link --project-ref <your-project-ref>
```

Your project ref can be found in the Supabase dashboard URL:
`https://supabase.com/dashboard/project/<project-ref>`

### Step 3: Push Database Migrations

```bash
# Push all migrations to production
supabase db push
```

This will apply all migrations from `supabase/migrations/` to your production database.

### Step 4: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy emergency-handler
supabase functions deploy 911-dispatch
supabase functions deploy resource-finder
supabase functions deploy update-resources
supabase functions deploy info-handler
supabase functions deploy get-settings
supabase functions deploy update-settings
supabase functions deploy log-usage

# Or deploy all at once
for func in emergency-handler 911-dispatch resource-finder update-resources info-handler get-settings update-settings log-usage; do
  supabase functions deploy $func
done
```

### Step 5: Set Environment Variables

In the Supabase Dashboard:

1. Go to **Project Settings** > **Edge Functions**
2. Add environment variables:
   - `COUNTY_API_URL`
   - `CLEAN_SAFE_URL`
   - `911_WEBHOOK_URL`

### Step 6: Configure Scheduled Jobs

The nightly resource update job is configured in migration `007_scheduled_jobs.sql`. Verify it's running:

1. Go to **Database** > **Extensions**
2. Enable `pg_cron` extension if not already enabled
3. Check scheduled jobs in SQL Editor:

```sql
SELECT * FROM cron.job;
```

### Step 7: Test Production Endpoints

Replace `127.0.0.1:54321` with your production URL:

```bash
export SUPABASE_URL="https://<your-project-ref>.supabase.co"
export SUPABASE_ANON_KEY="<your-production-anon-key>"

# Test emergency endpoint
curl -X POST $SUPABASE_URL/functions/v1/emergency-handler \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"00000000-0000-0000-0000-000000000000","is_danger":false,"location_lat":32.7157,"location_lng":-117.1611}'
```

## GitHub Integration (Optional)

### Connect GitHub for CI/CD

1. In Supabase Dashboard, go to **Project Settings** > **Integrations**
2. Click **GitHub** and authorize Supabase
3. Select your repository
4. Configure automatic deployments:
   - Database migrations on push to `main`
   - Edge Functions on push to `main`

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Supabase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
      
      - name: Deploy functions
        run: |
          for func in emergency-handler 911-dispatch resource-finder update-resources info-handler get-settings update-settings log-usage; do
            supabase functions deploy $func
          done
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

## Troubleshooting

### Supabase won't start

**Issue:** Docker containers fail to start

**Solution:**
```bash
# Stop all containers
supabase stop

# Remove volumes
docker volume prune

# Restart
supabase start
```

### Migrations fail to apply

**Issue:** Migration errors during `supabase start`

**Solution:**
```bash
# Reset database
supabase db reset

# This will drop all data and reapply migrations
```

### Edge Functions not working

**Issue:** Functions return 404 or 500 errors

**Solution:**
```bash
# Check function logs
supabase functions logs <function-name>

# Verify function is deployed
supabase functions list

# Redeploy function
supabase functions deploy <function-name>
```

### PostGIS queries failing

**Issue:** ST_Distance or ST_DWithin not found

**Solution:**
```sql
-- Verify PostGIS is enabled
SELECT PostGIS_Version();

-- If not enabled, run:
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 911 Dispatch not triggering

**Issue:** Emergency requests with `is_danger=true` don't trigger webhook

**Solution:**
1. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'emergency_notification_trigger';
   ```

2. Check function logs in Supabase Dashboard

3. Verify `911_WEBHOOK_URL` is set correctly

4. Test webhook manually:
   ```bash
   curl -X POST $911_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Deno Documentation](https://deno.land/manual)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

## Support

For issues or questions:
- Check the [backend README](../README.md)
- Review [authentication-security.md](./authentication-security.md)
- Open an issue in the repository

---

**Last Updated:** November 13, 2025
