-- Emergency Notification Trigger Migration
-- Creates trigger to automatically notify 911 dispatch when is_danger=true
-- Requirements: 1.2

-- Create function to notify emergency dispatch
-- This function is triggered when a new emergency request with is_danger=true is inserted
CREATE OR REPLACE FUNCTION notify_emergency_dispatch()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
  payload JSONB;
  http_request_id BIGINT;
BEGIN
  -- Only proceed if this is a danger emergency
  IF NEW.is_danger = true THEN
    -- Get environment variables (these should be set in Supabase dashboard)
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- If environment variables are not set, use defaults for local development
    IF supabase_url IS NULL THEN
      supabase_url := 'http://127.0.0.1:54321';
    END IF;
    
    -- Prepare payload for 911-dispatch edge function
    payload := jsonb_build_object(
      'emergency_id', NEW.id,
      'location_lat', NEW.location_lat,
      'location_lng', NEW.location_lng,
      'additional_info', NEW.additional_info,
      'timestamp', NEW.timestamp
    );
    
    -- Log the emergency notification attempt
    RAISE NOTICE 'Emergency notification triggered for request ID: %', NEW.id;
    
    -- Use pg_net extension to make async HTTP request to 911-dispatch function
    -- Note: In production, this requires the pg_net extension to be enabled
    -- For local development, the edge function can be called directly via HTTP
    BEGIN
      -- Attempt to use pg_net if available
      SELECT net.http_post(
        url := supabase_url || '/functions/v1/911-dispatch',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
        ),
        body := payload
      ) INTO http_request_id;
      
      RAISE NOTICE '911 dispatch webhook queued with request ID: %', http_request_id;
    EXCEPTION
      WHEN OTHERS THEN
        -- If pg_net is not available, log the error but don't fail the insert
        RAISE WARNING 'Failed to queue 911 dispatch notification: %. Emergency record still created.', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on emergency_requests table
-- Fires AFTER INSERT to ensure the record is committed before notification
DROP TRIGGER IF EXISTS emergency_notification_trigger ON emergency_requests;

CREATE TRIGGER emergency_notification_trigger
  AFTER INSERT ON emergency_requests
  FOR EACH ROW
  WHEN (NEW.is_danger = true)
  EXECUTE FUNCTION notify_emergency_dispatch();

-- Add comment for documentation
COMMENT ON FUNCTION notify_emergency_dispatch() IS 
  'Automatically notifies 911 dispatch system when a danger emergency is created. 
   Triggered by emergency_notification_trigger on emergency_requests table.';

COMMENT ON TRIGGER emergency_notification_trigger ON emergency_requests IS
  'Automatically invokes notify_emergency_dispatch() function when is_danger=true emergency is inserted.';
