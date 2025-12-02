-- ============================================================================
-- Initial Schema Migration
-- ============================================================================
-- Creates all core tables for the Homebase civic-access kiosk backend
-- 
-- TABLES CREATED:
-- 1. emergency_requests - Emergency help requests (911 and outreach)
-- 2. resources - Shelters, food banks, and other services
-- 3. programs - Information and learning content
-- 4. user_settings - Accessibility preferences
-- 5. outreach_contacts - Non-emergency responder information
-- 6. usage_logs - System usage analytics (optional)
-- 7. voice_logs - Voice interaction quality tracking (optional)
--
-- FEATURES:
-- - UUID primary keys for all tables
-- - Timestamp tracking (created_at, updated_at)
-- - Automatic updated_at triggers
-- - Check constraints for data validation
-- - Foreign key relationships with proper cascade rules
--
-- Requirements: 1.5, 2.3, 3.2, 4.1, 8.2
-- ============================================================================

-- ============================================================================
-- Emergency Requests Table
-- ============================================================================
-- PURPOSE: Stores emergency help requests from kiosk users
-- 
-- ROUTING LOGIC:
-- - is_danger=true: Routes to 911 dispatch (life-threatening)
-- - is_danger=false: Routes to outreach responders (assistance needed)
--
-- LOCATION DATA:
-- - Precise GPS coordinates for emergency response
-- - Validated to be within valid latitude/longitude ranges
--
-- STATUS TRACKING:
-- - pending: Request created, awaiting response
-- - in_progress: Responder en route or engaged
-- - resolved: Situation resolved
-- - cancelled: Request cancelled by user or system
-- ============================================================================
CREATE TABLE emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_danger BOOLEAN NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL CHECK (location_lat >= -90 AND location_lat <= 90),
  location_lng DECIMAL(11, 8) NOT NULL CHECK (location_lng >= -180 AND location_lng <= 180),
  additional_info TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_status TEXT NOT NULL DEFAULT 'pending' CHECK (resolved_status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Resources Table
-- ============================================================================
-- PURPOSE: Stores locations of shelters, food banks, and other services
--
-- RESOURCE TYPES:
-- - shelter: Emergency and transitional housing
-- - food: Food banks, meal programs, soup kitchens
-- - medical: Clinics, health services, mental health
-- - hygiene: Showers, restrooms, laundry facilities
-- - other: Additional community resources
--
-- DATA FRESHNESS:
-- - verified_on: Timestamp of last data verification
-- - Updated nightly by update-resources Edge Function
-- - Helps users know if information is current
--
-- GEOSPATIAL:
-- - Latitude/longitude stored as DECIMAL for precision
-- - PostGIS geography column added in migration 002
-- - Enables distance-based queries (find nearest resources)
-- ============================================================================
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('shelter', 'food', 'medical', 'hygiene', 'other')),
  latitude DECIMAL(10, 8) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DECIMAL(11, 8) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  is_open BOOLEAN NOT NULL DEFAULT true,
  verified_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  phone TEXT,
  hours TEXT,
  pet_friendly BOOLEAN NOT NULL DEFAULT false,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Programs Table
-- ============================================================================
-- PURPOSE: Stores information and learning content in multiple languages
--
-- MULTILINGUAL SUPPORT:
-- - language: ISO 639-1 code (2 letters: en, es, etc.)
-- - Same program can exist in multiple languages
-- - Enables users to access information in their preferred language
--
-- ACCESSIBILITY:
-- - voice_enabled: Indicates if audio version is available
-- - Helps users with visual impairments or reading difficulties
-- - contact_link: Direct link to program information or enrollment
--
-- CATEGORIES:
-- - housing: Housing assistance programs
-- - health: Healthcare and mental health services
-- - employment: Job training and placement
-- - education: Learning and skill development
-- - legal: Legal aid and advocacy
-- - other: Additional program types
-- ============================================================================
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (length(language) = 2),
  voice_enabled BOOLEAN NOT NULL DEFAULT false,
  contact_link TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- User Settings Table
-- ============================================================================
-- PURPOSE: Stores accessibility preferences for each user
--
-- ACCESSIBILITY OPTIONS:
-- - voice_on: Enable voice output (screen reading)
-- - text_mode: Enable text display
-- - language_pref: Interface language (ISO 639-1 code)
-- - high_contrast: High contrast mode for visual impairments
-- - font_size: Text size (small, medium, large, xlarge)
--
-- USER EXPERIENCE:
-- - Settings persist across kiosk sessions
-- - Users can customize interface to their needs
-- - Defaults provided for new users (see get-settings function)
--
-- SECURITY:
-- - user_id is primary key (one settings record per user)
-- - Foreign key to auth.users with CASCADE delete
-- - Row Level Security applied in migration 004
-- ============================================================================
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_on BOOLEAN NOT NULL DEFAULT false,
  text_mode BOOLEAN NOT NULL DEFAULT true,
  language_pref TEXT NOT NULL DEFAULT 'en' CHECK (length(language_pref) = 2),
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outreach Contacts Table
-- Stores non-emergency responder contact information
CREATE TABLE outreach_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  service_area TEXT,
  available_hours TEXT,
  specialties TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage Logs Table (Optional Analytics)
-- Tracks system usage patterns for improvement
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  module TEXT NOT NULL,
  language TEXT,
  location_lat DECIMAL(10, 8) CHECK (location_lat >= -90 AND location_lat <= 90),
  location_lng DECIMAL(11, 8) CHECK (location_lng >= -180 AND location_lng <= 180)
);

-- Voice Logs Table (Optional Analytics)
-- Tracks voice interaction quality
CREATE TABLE voice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transcript_snippet TEXT,
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1)
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_emergency_requests_updated_at
  BEFORE UPDATE ON emergency_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_contacts_updated_at
  BEFORE UPDATE ON outreach_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
