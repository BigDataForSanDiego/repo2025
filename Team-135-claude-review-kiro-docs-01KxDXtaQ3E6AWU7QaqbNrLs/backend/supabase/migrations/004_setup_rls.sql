-- Row Level Security Policies Migration
-- Enables RLS and creates security policies for all tables
-- Requirements: 7.3, 7.4, 4.4

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- EMERGENCY REQUESTS POLICIES
-- ============================================================================

-- Users can insert their own emergency requests
CREATE POLICY "Users can insert own emergency requests"
ON emergency_requests
FOR INSERT
TO authenticated, anon
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Users can view their own emergency requests
CREATE POLICY "Users can view own emergency requests"
ON emergency_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can read all emergency requests (for admin/dispatch)
CREATE POLICY "Service role can read all emergency requests"
ON emergency_requests
FOR SELECT
TO service_role
USING (true);

-- Service role can update emergency requests (for status updates)
CREATE POLICY "Service role can update emergency requests"
ON emergency_requests
FOR UPDATE
TO service_role
USING (true);

-- ============================================================================
-- RESOURCES POLICIES
-- ============================================================================

-- Anyone can read resources (public information)
CREATE POLICY "Anyone can read resources"
ON resources
FOR SELECT
TO authenticated, anon
USING (true);

-- Only service role can insert resources (from API sync)
CREATE POLICY "Service role can insert resources"
ON resources
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role can update resources (from API sync)
CREATE POLICY "Service role can update resources"
ON resources
FOR UPDATE
TO service_role
USING (true);

-- Only service role can delete resources
CREATE POLICY "Service role can delete resources"
ON resources
FOR DELETE
TO service_role
USING (true);

-- ============================================================================
-- PROGRAMS POLICIES
-- ============================================================================

-- Anyone can read programs (public information)
CREATE POLICY "Anyone can read programs"
ON programs
FOR SELECT
TO authenticated, anon
USING (true);

-- Only service role can manage programs
CREATE POLICY "Service role can insert programs"
ON programs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update programs"
ON programs
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role can delete programs"
ON programs
FOR DELETE
TO service_role
USING (true);

-- ============================================================================
-- USER SETTINGS POLICIES
-- ============================================================================

-- Users can only read their own settings
CREATE POLICY "Users can read own settings"
ON user_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
ON user_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
ON user_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete own settings"
ON user_settings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Service role can read all settings (for admin purposes)
CREATE POLICY "Service role can read all settings"
ON user_settings
FOR SELECT
TO service_role
USING (true);

-- ============================================================================
-- OUTREACH CONTACTS POLICIES
-- ============================================================================

-- Anyone can read outreach contacts (public information)
CREATE POLICY "Anyone can read outreach contacts"
ON outreach_contacts
FOR SELECT
TO authenticated, anon
USING (true);

-- Only service role can manage outreach contacts
CREATE POLICY "Service role can insert outreach contacts"
ON outreach_contacts
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update outreach contacts"
ON outreach_contacts
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role can delete outreach contacts"
ON outreach_contacts
FOR DELETE
TO service_role
USING (true);

-- ============================================================================
-- USAGE LOGS POLICIES (Analytics - Privacy Protected)
-- ============================================================================

-- Only service role can read usage logs (aggregated analytics only)
CREATE POLICY "Service role can read usage logs"
ON usage_logs
FOR SELECT
TO service_role
USING (true);

-- Anyone can insert usage logs (for tracking)
CREATE POLICY "Anyone can insert usage logs"
ON usage_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Only service role can manage usage logs
CREATE POLICY "Service role can update usage logs"
ON usage_logs
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role can delete usage logs"
ON usage_logs
FOR DELETE
TO service_role
USING (true);

-- ============================================================================
-- VOICE LOGS POLICIES (Analytics - Privacy Protected)
-- ============================================================================

-- Only service role can read voice logs
CREATE POLICY "Service role can read voice logs"
ON voice_logs
FOR SELECT
TO service_role
USING (true);

-- Anyone can insert voice logs (for tracking)
CREATE POLICY "Anyone can insert voice logs"
ON voice_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Only service role can manage voice logs
CREATE POLICY "Service role can update voice logs"
ON voice_logs
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role can delete voice logs"
ON voice_logs
FOR DELETE
TO service_role
USING (true);
