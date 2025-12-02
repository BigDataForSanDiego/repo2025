# Deployment Guide

This guide covers deploying and verifying the Homebase backend system.

## Prerequisites

Before deploying, ensure you have:

1. **Docker Desktop** installed and running
   - Download: https://docs.docker.com/desktop
   - Verify: `docker info` should run without errors

2. **Supabase CLI** installed
   - Install: `npm install -g supabase`
   - Verify: `supabase --version`

3. **Git** (for production deployment)
   - Verify: `git --version`

## Local Deployment

### Quick Start

Use the automated deployment script:

```bash
cd backend
./deploy-and-verify.sh
```

This script will:
- Check Docker status
- Start Supabase local instance
- Apply all database migrations
- Verify database schema
- Check Edge Functions
- Test API endpoints

### Manual Deployment Steps

If you prefer manual deployment:

#### 1. Start Supabase

```bash
cd backend
supabase start
```

This will start all Supabase services locally:
- PostgreSQL database (port 54322)
- API Gateway (port 54321)
- Studio UI (port 54323)
- Inbucket (email testing, port 54324)

**Note:** First start may take several minutes to download Docker images.

#### 2. Apply Database Migrations

```bash
supabase db push
```

This applies all migration files in order:
1. `001_initial_schema.sql` - Creates all tables
2. `002_enable_postgis.sql` - Enables PostGIS for geospatial queries
3. `003_create_indexes.sql` - Creates performance indexes
4. `004_setup_rls.sql` - Configures Row Level Security
5. `005_sample_data.sql` - Inserts sample resources
6. `006_emergency_trigger.sql` - Sets up emergency notification trigger
7. `007_scheduled_jobs.sql` - Configures scheduled jobs
8. `008_sample_programs.sql` - Inserts sample programs
9. `009_analytics_tables.sql` - Creates analytics tables

#### 3. Verify Database Schema

Check that all tables were created:

```bash
supabase db execute "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

Expected tables:
- `emergency_requests`
- `outreach_contacts`
- `programs`
- `resources`
- `usage_logs`
- `user_settings`
- `voice_logs`

Verify PostGIS extension:

```bash
supabase db execute "SELECT extname FROM pg_extension WHERE extname = 'postgis';"
```

#### 4. Test Edge Functions

Edge Functions are automatically available in local development. Test them using the provided test scripts:

```bash
# Test emergency handler
./test-emergency.sh

# Test resource finder
./test-resource-finder.sh

# Test info handler
./test-info-handler.sh

# Test settings
./test-settings.sh

# Test usage logging
./test-log-usage.sh

# Test resource updates
./test-update-resources.sh
```

Or run all tests:

```bash
./rigorous-test.sh
```

## Production Deployment

### 1. Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: `homebase-kiosk`
   - Database Password: (generate strong password)
   - Region: Choose closest to San Diego (e.g., `us-west-1`)
4. Wait for project to be provisioned (~2 minutes)

### 2. Link Local Project to Remote

```bash
supabase link --project-ref <your-project-ref>
```

Your project ref is in the URL: `https://app.supabase.com/project/<project-ref>`

### 3. Push Database Migrations

```bash
supabase db push
```

This applies all migrations to your production database.

### 4. Deploy Edge Functions

Deploy each function individually:

```bash
supabase functions deploy emergency-handler
supabase functions deploy 911-dispatch
supabase functions deploy resource-finder
supabase functions deploy update-resources
supabase functions deploy info-handler
supabase functions deploy get-settings
supabase functions deploy update-settings
supabase functions deploy log-usage
```

Or deploy all at once:

```bash
for func in emergency-handler 911-dispatch resource-finder update-resources info-handler get-settings update-settings log-usage; do
  supabase functions deploy $func
done
```

### 5. Configure Environment Variables

In Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add environment variables:
   - `COUNTY_API_URL` - SD County Shelter API endpoint
   - `CLEAN_SAFE_URL` - Clean & Safe resource feed
   - `911_WEBHOOK_URL` - Emergency dispatch webhook

### 6. Update Frontend Configuration

Update your frontend `.env` file with production values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
```

Get these values from:
- Project Settings > API > Project URL
- Project Settings > API > Project API keys > anon public

### 7. Enable Authentication

In Supabase Dashboard:
1. Go to Authentication > Settings
2. Enable "Anonymous sign-ins"
3. Enable "Phone" provider (if using SMS)
4. Configure site URL and redirect URLs

### 8. Verify Production Deployment

Test production endpoints:

```bash
# Set production URL and key
export SUPABASE_URL="https://your-project-ref.supabase.co"
export ANON_KEY="your-production-anon-key"

# Test emergency endpoint
curl -X POST "$SUPABASE_URL/functions/v1/emergency-handler" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000001",
    "is_danger": false,
    "location_lat": 32.7157,
    "location_lng": -117.1611
  }'

# Test resource finder
curl "$SUPABASE_URL/functions/v1/resource-finder?lat=32.7157&lng=-117.1611" \
  -H "Authorization: Bearer $ANON_KEY"
```

## Verification Checklist

Use this checklist to verify successful deployment:

### Database
- [ ] All 7 tables created (emergency_requests, resources, programs, user_settings, outreach_contacts, usage_logs, voice_logs)
- [ ] PostGIS extension enabled
- [ ] Indexes created (check with `\di` in psql)
- [ ] RLS policies active (check with `\dp` in psql)
- [ ] Sample data inserted (5 resources, 6 programs)
- [ ] Emergency trigger created

### Edge Functions
- [ ] emergency-handler deployed and accessible
- [ ] 911-dispatch deployed
- [ ] resource-finder deployed and returns results
- [ ] update-resources deployed
- [ ] info-handler deployed and returns programs
- [ ] get-settings deployed
- [ ] update-settings deployed
- [ ] log-usage deployed

### API Endpoints
- [ ] POST /emergency-handler accepts requests
- [ ] GET /resource-finder returns nearby resources
- [ ] GET /info-handler returns programs
- [ ] GET /get-settings returns user settings
- [ ] PUT /update-settings updates settings
- [ ] POST /log-usage logs interactions

### Authentication
- [ ] Anonymous sign-ins enabled
- [ ] Phone authentication configured (if needed)
- [ ] RLS policies enforcing access control

### External Integrations
- [ ] 911 webhook URL configured
- [ ] County API URL configured
- [ ] Clean & Safe URL configured
- [ ] Scheduled job running (check logs after 2 AM)

## Troubleshooting

### Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
1. Start Docker Desktop
2. Wait for Docker to fully start
3. Verify with `docker info`
4. Retry `supabase start`

### Migration Fails

**Error:** `Migration failed: relation already exists`

**Solution:**
```bash
# Reset local database
supabase db reset

# Reapply migrations
supabase db push
```

### Edge Function Deployment Fails

**Error:** `Failed to deploy function`

**Solution:**
1. Check function syntax: `deno check supabase/functions/<function-name>/index.ts`
2. Verify dependencies in `supabase/functions/deno.json`
3. Check function logs: `supabase functions logs <function-name>`

### PostGIS Not Enabled

**Error:** `function st_distance does not exist`

**Solution:**
```bash
# Manually enable PostGIS
supabase db execute "CREATE EXTENSION IF NOT EXISTS postgis;"

# Rerun migration
supabase db push
```

### RLS Blocking Queries

**Error:** `new row violates row-level security policy`

**Solution:**
1. Check RLS policies: `supabase db execute "\dp"`
2. Verify user authentication
3. Use service role key for admin operations
4. Check policy conditions match your use case

### Scheduled Job Not Running

**Error:** Resource updates not happening

**Solution:**
1. Check pg_cron extension: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
2. Verify job schedule: `SELECT * FROM cron.job;`
3. Check job logs: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
4. Manually trigger: `SELECT cron.schedule('test', '* * * * *', 'SELECT 1');`

## Monitoring

### Local Development

Access Supabase Studio:
```
http://localhost:54323
```

View logs:
```bash
# All logs
supabase logs

# Specific service
supabase logs postgres
supabase logs api
```

### Production

Access Supabase Dashboard:
```
https://app.supabase.com/project/<your-project-ref>
```

Monitor:
- **Database**: Project > Database > Query Performance
- **API**: Project > API > Logs
- **Functions**: Project > Edge Functions > Logs
- **Auth**: Project > Authentication > Users

Set up alerts:
1. Go to Project Settings > Integrations
2. Configure webhook for critical events
3. Set up email notifications

## Rollback Procedure

If deployment fails or issues arise:

### Local
```bash
# Stop Supabase
supabase stop

# Reset database
supabase db reset

# Restart
supabase start
supabase db push
```

### Production
```bash
# Revert to previous migration
supabase db reset --version <previous-version>

# Redeploy specific function
supabase functions deploy <function-name>
```

## Performance Optimization

After deployment, optimize performance:

1. **Analyze Query Performance**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM resources 
   WHERE ST_DWithin(location, ST_MakePoint(-117.1611, 32.7157)::geography, 5000);
   ```

2. **Monitor Index Usage**
   ```sql
   SELECT schemaname, tablename, indexname, idx_scan 
   FROM pg_stat_user_indexes 
   ORDER BY idx_scan DESC;
   ```

3. **Check Connection Pool**
   - Monitor active connections in Supabase Dashboard
   - Adjust pool size if needed in config.toml

4. **Enable Query Caching**
   - Use Supabase's built-in caching for frequently accessed data
   - Implement client-side caching for static content

## Security Checklist

Before going live:

- [ ] Service role key never exposed to frontend
- [ ] RLS policies tested and verified
- [ ] Input validation on all Edge Functions
- [ ] Rate limiting configured
- [ ] HTTPS enforced (automatic in production)
- [ ] Environment variables secured
- [ ] Database backups enabled (automatic in Supabase)
- [ ] Audit logging enabled for sensitive operations

## Next Steps

After successful deployment:

1. **Test with Frontend**: Connect your kiosk frontend and test end-to-end flows
2. **Load Testing**: Use tools like `wrk` or `artillery` to test under load
3. **Monitor Usage**: Check analytics and usage patterns
4. **Iterate**: Based on feedback, update migrations and redeploy
5. **Documentation**: Keep this guide updated with any changes

## Support

For issues:
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- PostGIS Docs: https://postgis.net/documentation
- Project Issues: [Your GitHub repo]

## Automated Scripts Reference

- `deploy-and-verify.sh` - Full deployment and verification
- `verify-migrations.sh` - Check migration files only
- `test-emergency.sh` - Test emergency handler
- `test-resource-finder.sh` - Test resource finder
- `test-info-handler.sh` - Test info handler
- `test-settings.sh` - Test settings endpoints
- `test-log-usage.sh` - Test usage logging
- `test-update-resources.sh` - Test resource updates
- `rigorous-test.sh` - Run all tests
