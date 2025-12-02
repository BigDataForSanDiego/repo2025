-- ============================================================================
-- PostGIS Extension Migration
-- ============================================================================
-- Enables PostGIS for geospatial queries and adds geography column to resources table
--
-- WHAT IS POSTGIS:
-- PostGIS is a PostgreSQL extension that adds support for geographic objects,
-- allowing location queries to be run in SQL. It's essential for our resource
-- finder feature that locates nearby shelters and services.
--
-- KEY FEATURES USED:
-- - ST_MakePoint: Creates a point geometry from longitude and latitude
-- - ST_SetSRID: Sets the Spatial Reference System ID (4326 = WGS 84)
-- - ST_Distance: Calculates distance between two points
-- - ST_DWithin: Filters points within a specified distance
-- - GEOGRAPHY type: Uses Earth's spheroid for accurate distance calculations
--
-- SRID 4326 (WGS 84):
-- - World Geodetic System 1984
-- - Standard coordinate system used by GPS
-- - Latitude: -90 to 90 degrees
-- - Longitude: -180 to 180 degrees
--
-- Requirements: 2.1
-- ============================================================================

-- Enable PostGIS extension for geospatial operations
-- This adds ~1000 new functions and types to PostgreSQL
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- Add Generated Geography Column
-- ============================================================================
-- PURPOSE: Automatically creates a POINT geometry from latitude/longitude
--
-- WHY GENERATED COLUMN:
-- - Automatically updates when latitude or longitude changes
-- - No need to manually maintain geometry data
-- - Ensures geometry always matches coordinate values
-- - STORED means it's physically stored (faster queries)
--
-- GEOGRAPHY vs GEOMETRY:
-- - GEOGRAPHY: Uses Earth's spheroid (accurate distances)
-- - GEOMETRY: Uses flat plane (faster but less accurate)
-- - We use GEOGRAPHY for accurate distance calculations
--
-- PERFORMANCE:
-- - GiST index added in migration 003 for fast spatial queries
-- - Enables efficient "find nearest" queries
-- ============================================================================
ALTER TABLE resources
ADD COLUMN location GEOGRAPHY(POINT, 4326) 
GENERATED ALWAYS AS (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
) STORED;

-- Add comment to explain the geography column for future developers
COMMENT ON COLUMN resources.location IS 'Auto-generated geography point from longitude and latitude coordinates using SRID 4326 (WGS 84). Used for distance-based queries in resource-finder function.';
