# Troubleshooting Guide

## Common Issues and Solutions

### 1. npm Install Fails with ERESOLVE Error

**Problem:**
```
npm error ERESOLVE could not resolve
npm error While resolving: vaul@0.9.9
npm error Found: react@19.2.0
```

**Solution:**
The project uses React 19, which some dependencies don't fully support yet. Use the `--legacy-peer-deps` flag:

```bash
cd frontend
npm install --legacy-peer-deps
```

An `.npmrc` file is included in the frontend directory to handle this automatically for future installs.

---

### 2. Backend Not Responding

**Problem:** API calls fail with connection errors or timeout

**Solution:**
```bash
# Check if Supabase is running
cd backend
supabase status

# If not running, start it
supabase start

# If already running but not responding, restart
supabase stop
supabase start
```

---

### 3. Docker Not Running

**Problem:**
```
Cannot connect to the Docker daemon at unix:///...
Is the docker daemon running?
```

**Solution:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar should be steady, not animated)
3. Verify: `docker info`
4. Retry: `supabase start`

---

### 4. Frontend Can't Connect to Backend

**Problem:** API calls fail with CORS or network errors

**Solution:**
```bash
# 1. Verify environment variables
cat frontend/.env.local

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# 2. Verify backend is running
cd backend
supabase status

# 3. Restart frontend
cd ../frontend
npm run dev
```

---

### 5. Database is Empty

**Problem:** Resources or programs return empty arrays

**Solution:**
```bash
cd backend

# Option 1: Reapply migrations
supabase db push

# Option 2: Reset and reapply (WARNING: deletes all data)
supabase db reset
supabase db push

# Verify data in Supabase Studio
# Open http://localhost:54323
# Go to Table Editor > resources (should have 5 rows)
# Go to Table Editor > programs (should have 6 rows)
```

---

### 6. Port Already in Use

**Problem:**
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

### 7. TypeScript Errors

**Problem:** Import errors or type errors in the frontend

**Solution:**
```bash
cd frontend

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Restart your IDE/editor
# VS Code: Cmd+Shift+P > "Reload Window"
```

---

### 8. Supabase CLI Not Found

**Problem:**
```
command not found: supabase
```

**Solution:**
```bash
# Install Supabase CLI globally
npm install -g supabase

# Verify installation
supabase --version
```

---

### 9. Migration Fails

**Problem:**
```
Error applying migration: relation already exists
```

**Solution:**
```bash
cd backend

# Reset database (WARNING: deletes all data)
supabase db reset

# Reapply migrations
supabase db push
```

---

### 10. API Returns 404

**Problem:** Edge Functions return 404 errors

**Solution:**
```bash
# 1. Verify Supabase is running
cd backend
supabase status

# 2. Check function exists
ls supabase/functions/

# 3. For local dev, functions are automatically available
# No deployment needed

# 4. Verify the URL format
# Correct: http://127.0.0.1:54321/functions/v1/emergency-handler
# Wrong: http://localhost:54321/functions/v1/emergency-handler
```

---

### 11. Environment Variables Not Loading

**Problem:** "Missing Supabase environment variables" error

**Solution:**
```bash
# 1. Verify .env.local exists
ls -la frontend/.env.local

# 2. Check contents
cat frontend/.env.local

# 3. Restart Next.js dev server
cd frontend
# Press Ctrl+C to stop
npm run dev

# 4. Clear Next.js cache if needed
rm -rf .next
npm run dev
```

---

### 12. Can't Access Supabase Studio

**Problem:** http://localhost:54323 doesn't load

**Solution:**
```bash
# 1. Check if Supabase is running
cd backend
supabase status

# 2. Look for Studio URL in output
# Should show: Studio URL: http://localhost:54323

# 3. If different port, use that URL

# 4. If not running, start it
supabase start
```

---

### 13. Test Page Shows Errors

**Problem:** http://localhost:3000/test-api shows API errors

**Solution:**
```bash
# 1. Verify both services are running
cd backend && supabase status
cd ../frontend && lsof -i:3000

# 2. Check browser console (F12) for detailed errors

# 3. Test API directly in terminal
curl http://127.0.0.1:54321/functions/v1/resource-finder?lat=32.7157&lng=-117.1611 \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"

# 4. If curl works but browser doesn't, clear browser cache
```

---

### 14. Build Fails

**Problem:** `npm run build` fails

**Solution:**
```bash
cd frontend

# 1. Clear cache and rebuild
rm -rf .next
npm run build

# 2. If still fails, check for TypeScript errors
npm run lint

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

---

## Getting Help

If you're still stuck:

1. **Check the logs:**
   - Backend: `cd backend && supabase logs`
   - Frontend: Check terminal where `npm run dev` is running
   - Browser: Open DevTools (F12) > Console tab

2. **Verify setup:**
   - Run through [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) step by step
   - Check [SETUP_COMPLETE.md](SETUP_COMPLETE.md) for what should be working

3. **Test components individually:**
   - Backend only: Test with curl commands
   - Frontend only: Check if it starts without API calls
   - Integration: Use http://localhost:3000/test-api

4. **Start fresh:**
   ```bash
   # Stop everything
   cd backend && supabase stop
   cd ../frontend && pkill -f "next dev"
   
   # Start from scratch
   ./start-dev.sh
   ```

## Quick Diagnostic Commands

```bash
# Check if Docker is running
docker info

# Check if Supabase is running
cd backend && supabase status

# Check if frontend is running
lsof -i:3000

# Check environment variables
cat frontend/.env.local

# Test backend API directly
curl http://127.0.0.1:54321/functions/v1/resource-finder?lat=32.7157&lng=-117.1611 \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"

# View backend logs
cd backend && supabase logs

# Check database has data
cd backend && supabase db execute "SELECT COUNT(*) FROM resources;"
```
