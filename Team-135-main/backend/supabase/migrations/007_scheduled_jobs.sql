-- Scheduled Jobs Migration
-- Configures cron jobs for automated tasks
-- Requirements: 2.5, 8.3

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to trigger the update-resources Edge Function
CREATE OR REPLACE FUNCTION trigger_resource_update()
RETURNS void AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  http_request_id BIGINT;
BEGIN
  -- Get environment variables (these should be set in Supabase dashboard)
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- If environment variables are not set, use defaults for local development
  IF supabase_url IS NULL THEN
    supabase_url := 'http://127.0.0.1:54321';
  END IF;
  
  -- Log the scheduled job execution
  RAISE NOTICE 'Triggering nightly resource update at %', NOW();
  
  -- Use pg_net to make async HTTP request to update-resources function
  BEGIN
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/update-resources',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
      ),
      body := '{}'::jsonb
    ) INTO http_request_id;
    
    RAISE NOTICE 'Resource update job queued with request ID: %', http_request_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- If pg_net is not available, log the error
      RAISE WARNING 'Failed to queue resource update job: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- Schedule the nightly resource update job
-- Runs every day at 2:00 AM
-- Note: pg_cron uses UTC time by default
SELECT cron.schedule(
  'nightly-resource-update',
  '0 2 * * *',  -- Cron expression: At 02:00 every day
  $$SELECT trigger_resource_update();$$
);

-- Add comments for documentation
COMMENT ON FUNCTION trigger_resource_update() IS 
  'Triggers the update-resources Edge Function to refresh resource data from external APIs. 
   Called by the nightly-resource-update cron job.';

COMMENT ON EXTENSION pg_cron IS 
  'PostgreSQL extension for scheduling jobs using cron syntax.';

COMMENT ON EXTENSION pg_net IS 
  'PostgreSQL extension for making HTTP requests from the database.';

-- Create a table to log scheduled job executions (optional, for monitoring)
CREATE TABLE IF NOT EXISTS scheduled_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running')),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scheduled_job_logs_executed_at ON scheduled_job_logs(executed_at DESC);
CREATE INDEX idx_scheduled_job_logs_job_name ON scheduled_job_logs(job_name);

-- Create a function to log job executions
CREATE OR REPLACE FUNCTION log_scheduled_job(
  p_job_name TEXT,
  p_status TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO scheduled_job_logs (job_name, status, details)
  VALUES (p_job_name, p_status, p_details);
END;
$$ LANGUAGE plpgsql;

-- Update the trigger function to include logging
CREATE OR REPLACE FUNCTION trigger_resource_update()
RETURNS void AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  http_request_id BIGINT;
BEGIN
  -- Log job start
  PERFORM log_scheduled_job('nightly-resource-update', 'running', NULL);
  
  -- Get environment variables
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  IF supabase_url IS NULL THEN
    supabase_url := 'http://127.0.0.1:54321';
  END IF;
  
  RAISE NOTICE 'Triggering nightly resource update at %', NOW();
  
  BEGIN
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/update-resources',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
      ),
      body := '{}'::jsonb
    ) INTO http_request_id;
    
    RAISE NOTICE 'Resource update job queued with request ID: %', http_request_id;
    
    -- Log success
    PERFORM log_scheduled_job(
      'nightly-resource-update', 
      'success', 
      jsonb_build_object('http_request_id', http_request_id)
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to queue resource update job: %', SQLERRM;
      
      -- Log failure
      PERFORM log_scheduled_job(
        'nightly-resource-update', 
        'failed', 
        jsonb_build_object('error', SQLERRM)
      );
  END;
END;
$$ LANGUAGE plpgsql;

-- View scheduled jobs (for verification)
-- To check if the job is scheduled, run: SELECT * FROM cron.job;
