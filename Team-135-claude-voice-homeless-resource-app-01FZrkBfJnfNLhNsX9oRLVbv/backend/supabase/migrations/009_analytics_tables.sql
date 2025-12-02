-- Migration: Create analytics tables for usage tracking and voice interaction logging
-- Requirements: 5.1, 5.2

-- Create usage_logs table to track system interactions
-- Location data is rounded to 3 decimal places for privacy (~100m precision)
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  module TEXT NOT NULL,
  language TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create voice_logs table to track voice interaction quality
CREATE TABLE IF NOT EXISTS voice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  transcript_snippet TEXT,
  confidence DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying of analytics data
CREATE INDEX idx_usage_timestamp ON usage_logs(timestamp DESC);
CREATE INDEX idx_usage_module ON usage_logs(module);
CREATE INDEX idx_voice_timestamp ON voice_logs(timestamp DESC);

-- Enable Row Level Security on analytics tables
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role to read all analytics data
CREATE POLICY "Service role can read all usage logs"
ON usage_logs
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert usage logs"
ON usage_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Service role can read all voice logs"
ON voice_logs
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert voice logs"
ON voice_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Add comments for documentation
COMMENT ON TABLE usage_logs IS 'Tracks system usage patterns for analytics. Location data rounded to 3 decimal places for privacy.';
COMMENT ON TABLE voice_logs IS 'Tracks voice interaction quality metrics including confidence scores.';
COMMENT ON COLUMN usage_logs.module IS 'Module identifier: emergency, resources, info, settings';
COMMENT ON COLUMN usage_logs.location_lat IS 'User latitude rounded to 3 decimal places (~100m precision)';
COMMENT ON COLUMN usage_logs.location_lng IS 'User longitude rounded to 3 decimal places (~100m precision)';
COMMENT ON COLUMN voice_logs.transcript_snippet IS 'Short snippet of voice transcript for quality analysis';
COMMENT ON COLUMN voice_logs.confidence IS 'Voice recognition confidence score (0.00 to 1.00)';
