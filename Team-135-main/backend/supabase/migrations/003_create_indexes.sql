-- Indexes Migration
-- Creates performance indexes for efficient queries
-- Requirements: 2.4

-- Emergency Requests Indexes
-- Index for timestamp-based queries (recent emergencies)
CREATE INDEX idx_emergency_timestamp ON emergency_requests(timestamp DESC);

-- Index for filtering by resolved status
CREATE INDEX idx_emergency_resolved ON emergency_requests(resolved_status);

-- Index for danger flag queries
CREATE INDEX idx_emergency_danger ON emergency_requests(is_danger);

-- Resources Indexes
-- GiST index for geospatial queries (most critical for performance)
CREATE INDEX idx_resources_location ON resources USING GIST(location);

-- Index for filtering by resource type
CREATE INDEX idx_resources_type ON resources(type);

-- Index for filtering by open status
CREATE INDEX idx_resources_is_open ON resources(is_open);

-- Index for verified_on timestamp queries
CREATE INDEX idx_resources_verified ON resources(verified_on DESC);

-- Composite index for common query pattern (type + open status)
CREATE INDEX idx_resources_type_open ON resources(type, is_open);

-- Programs Indexes
-- Index for language filtering
CREATE INDEX idx_programs_language ON programs(language);

-- Index for category filtering
CREATE INDEX idx_programs_category ON programs(category);

-- Composite index for common query pattern (language + category)
CREATE INDEX idx_programs_lang_category ON programs(language, category);

-- Index for voice-enabled filtering
CREATE INDEX idx_programs_voice ON programs(voice_enabled);

-- Usage Logs Indexes (Analytics)
-- Index for timestamp-based analytics queries
CREATE INDEX idx_usage_timestamp ON usage_logs(timestamp DESC);

-- Index for module-based analytics
CREATE INDEX idx_usage_module ON usage_logs(module);

-- Composite index for time-series analytics by module
CREATE INDEX idx_usage_module_timestamp ON usage_logs(module, timestamp DESC);

-- Voice Logs Indexes (Analytics)
-- Index for timestamp-based queries
CREATE INDEX idx_voice_timestamp ON voice_logs(timestamp DESC);

-- Index for confidence-based filtering
CREATE INDEX idx_voice_confidence ON voice_logs(confidence DESC);

-- Add comments to explain index purposes
COMMENT ON INDEX idx_resources_location IS 'GiST index for efficient geospatial distance queries using PostGIS';
COMMENT ON INDEX idx_emergency_timestamp IS 'B-tree index for retrieving recent emergency requests';
COMMENT ON INDEX idx_resources_type_open IS 'Composite index for filtering resources by type and availability';
