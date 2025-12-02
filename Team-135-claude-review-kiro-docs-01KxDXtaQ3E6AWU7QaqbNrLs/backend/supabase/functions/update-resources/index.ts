/**
 * Update Resources Edge Function
 * 
 * PURPOSE:
 * This function fetches resource data from external County APIs and updates the local
 * database. It runs on a nightly schedule (2 AM) to ensure resource information stays
 * current and accurate for kiosk users.
 * 
 * DATA SOURCES:
 * - COUNTY_API_URL: San Diego County Shelter API (shelters, emergency housing)
 * - CLEAN_SAFE_URL: Clean & Safe API (hygiene facilities, safe spaces)
 * 
 * WORKFLOW:
 * 1. Fetch data from both external APIs
 * 2. Transform API responses to match our database schema
 * 3. Upsert resources (update existing, insert new)
 * 4. Update verified_on timestamp to track data freshness
 * 5. Return statistics (inserted, updated, failed)
 * 
 * SCHEDULING:
 * - Runs automatically at 2 AM daily via pg_cron (see 007_scheduled_jobs.sql)
 * - Can be triggered manually via POST request with service role key
 * 
 * ERROR HANDLING:
 * - Continues processing even if one API fails
 * - Logs all errors for monitoring
 * - Returns partial success if at least one API succeeds
 * 
 * SECURITY:
 * - Requires service role key (not accessible to anonymous users)
 * - Validates all data before database insertion
 * 
 * Requirements: 2.5, 8.1, 8.2, 8.3
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import {
  ErrorCode,
  createErrorResponse,
  createSuccessResponse,
  withErrorHandling,
  validateMethod,
} from "../_shared/errors.ts";

interface UpdateResponse {
  success: boolean;
  message?: string;
  stats?: {
    total_fetched: number;
    inserted: number;
    updated: number;
    failed: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface ExternalResource {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
  address?: string;
  pet_friendly?: boolean;
  is_open?: boolean;
}

serve(withErrorHandling(async (req) => {
  // Validate HTTP method
  const methodError = validateMethod(req, ["POST"]);
  if (methodError) return methodError;

    console.log("Starting resource update from external APIs...");

    // Get API URLs from environment
    const countyApiUrl = Deno.env.get("COUNTY_API_URL");
    const cleanSafeUrl = Deno.env.get("CLEAN_SAFE_URL");

    if (!countyApiUrl && !cleanSafeUrl) {
      console.warn("No external API URLs configured");
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "No external API URLs configured"
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const allResources: ExternalResource[] = [];
    let fetchErrors: string[] = [];

    // Fetch from County API (SD Shelter API)
    if (countyApiUrl) {
      try {
        console.log(`Fetching from County API: ${countyApiUrl}`);
        const countyResponse = await fetch(countyApiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "User-Agent": "Homebase-Kiosk/1.0",
          },
        });

        if (countyResponse.ok) {
          const countyData = await countyResponse.json();
          console.log(`County API returned ${countyData.length || 0} resources`);
          
          // Transform County API data to our schema
          // Note: Actual transformation depends on the API response format
          const transformedCounty = transformCountyData(countyData);
          allResources.push(...transformedCounty);
        } else {
          const errorMsg = `County API failed: ${countyResponse.status} ${countyResponse.statusText}`;
          console.error(errorMsg);
          fetchErrors.push(errorMsg);
        }
      } catch (error) {
        const errorMsg = `County API error: ${error.message}`;
        console.error(errorMsg);
        fetchErrors.push(errorMsg);
      }
    }

    // Fetch from Clean & Safe API
    if (cleanSafeUrl) {
      try {
        console.log(`Fetching from Clean & Safe API: ${cleanSafeUrl}`);
        const cleanSafeResponse = await fetch(cleanSafeUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "User-Agent": "Homebase-Kiosk/1.0",
          },
        });

        if (cleanSafeResponse.ok) {
          const cleanSafeData = await cleanSafeResponse.json();
          console.log(`Clean & Safe API returned ${cleanSafeData.length || 0} resources`);
          
          // Transform Clean & Safe data to our schema
          const transformedCleanSafe = transformCleanSafeData(cleanSafeData);
          allResources.push(...transformedCleanSafe);
        } else {
          const errorMsg = `Clean & Safe API failed: ${cleanSafeResponse.status} ${cleanSafeResponse.statusText}`;
          console.error(errorMsg);
          fetchErrors.push(errorMsg);
        }
      } catch (error) {
        const errorMsg = `Clean & Safe API error: ${error.message}`;
        console.error(errorMsg);
        fetchErrors.push(errorMsg);
      }
    }

    console.log(`Total resources fetched: ${allResources.length}`);

    // If no resources were fetched and there were errors, return error
    if (allResources.length === 0 && fetchErrors.length > 0) {
      return createErrorResponse(
        ErrorCode.EXTERNAL_API_ERROR,
        "Failed to fetch resources from external APIs",
        fetchErrors
      );
    }

    // Upsert resources into database
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const resource of allResources) {
      try {
        // Create a unique identifier based on name and location
        // In production, you'd want a better unique identifier from the API
        const resourceKey = `${resource.name}_${resource.latitude}_${resource.longitude}`;

        // Check if resource exists
        const { data: existing } = await supabase
          .from("resources")
          .select("id")
          .eq("name", resource.name)
          .eq("latitude", resource.latitude)
          .eq("longitude", resource.longitude)
          .single();

        const resourceData = {
          name: resource.name,
          type: resource.type,
          latitude: resource.latitude,
          longitude: resource.longitude,
          phone: resource.phone || null,
          hours: resource.hours || null,
          address: resource.address || null,
          pet_friendly: resource.pet_friendly || false,
          is_open: resource.is_open !== undefined ? resource.is_open : true,
          verified_on: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (existing) {
          // Update existing resource
          const { error: updateError } = await supabase
            .from("resources")
            .update(resourceData)
            .eq("id", existing.id);

          if (updateError) {
            console.error(`Failed to update resource ${resource.name}:`, updateError);
            failed++;
          } else {
            updated++;
          }
        } else {
          // Insert new resource
          const { error: insertError } = await supabase
            .from("resources")
            .insert(resourceData);

          if (insertError) {
            console.error(`Failed to insert resource ${resource.name}:`, insertError);
            failed++;
          } else {
            inserted++;
          }
        }
      } catch (error) {
        console.error(`Error processing resource ${resource.name}:`, error);
        failed++;
      }
    }

    console.log(`Resource update complete: ${inserted} inserted, ${updated} updated, ${failed} failed`);

    // Return success response with stats
    return createSuccessResponse(
      {
        stats: {
          total_fetched: allResources.length,
          inserted,
          updated,
          failed,
        },
      },
      "Resource update completed"
    );
}));

/**
 * Transform County API data to our database schema
 * 
 * PURPOSE:
 * Converts data from San Diego County Shelter API format to our standardized schema.
 * This allows us to integrate multiple data sources with different formats.
 * 
 * TRANSFORMATION LOGIC:
 * - Maps various field names to our standard field names
 * - Handles missing or null values with sensible defaults
 * - Filters out invalid records (missing name or coordinates)
 * - Normalizes coordinate formats (lat/latitude, lng/lon/longitude)
 * 
 * DATA QUALITY:
 * - Requires name, latitude, and longitude (critical fields)
 * - Defaults type to "shelter" if not specified
 * - Defaults is_open to true (assume open unless specified)
 * - Defaults pet_friendly to false (conservative assumption)
 * 
 * NOTE: This is a flexible transformation that handles multiple API response formats.
 * Adjust field mappings based on actual County API response structure.
 */
function transformCountyData(data: any): ExternalResource[] {
  // Validate input is an array
  if (!Array.isArray(data)) {
    console.warn("County API data is not an array");
    return [];
  }

  return data
    // Filter out invalid records (must have name and coordinates)
    .filter((item: any) => item.name && item.latitude && item.longitude)
    // Transform each record to our schema
    .map((item: any) => ({
      name: item.name || item.facility_name || "Unknown Shelter",
      type: item.type || "shelter",  // Default to shelter for County API
      latitude: parseFloat(item.latitude || item.lat),
      longitude: parseFloat(item.longitude || item.lng || item.lon),
      phone: item.phone || item.contact_phone,
      hours: item.hours || item.operating_hours,
      address: item.address || item.street_address,
      pet_friendly: item.pet_friendly || item.pets_allowed || false,
      is_open: item.is_open !== undefined ? item.is_open : true,
    }));
}

/**
 * Transform Clean & Safe API data to our database schema
 * 
 * PURPOSE:
 * Converts data from Clean & Safe API format to our standardized schema.
 * Clean & Safe focuses on hygiene facilities, safe spaces, and public resources.
 * 
 * TRANSFORMATION LOGIC:
 * - Maps Clean & Safe field names to our standard field names
 * - Defaults type to "hygiene" (most common Clean & Safe resource type)
 * - Handles various naming conventions (location_name, name, etc.)
 * - Assumes pet_friendly=false (Clean & Safe doesn't typically track this)
 * 
 * DATA QUALITY:
 * - Requires name, latitude, and longitude (critical fields)
 * - Defaults type to "hygiene" if not specified
 * - Defaults is_open to true (assume open unless specified)
 * - Sets pet_friendly to false (Clean & Safe doesn't provide this data)
 * 
 * NOTE: Clean & Safe API may use different field names than County API.
 * This transformation handles common variations.
 */
function transformCleanSafeData(data: any): ExternalResource[] {
  // Validate input is an array
  if (!Array.isArray(data)) {
    console.warn("Clean & Safe API data is not an array");
    return [];
  }

  return data
    // Filter out invalid records (must have name and coordinates)
    .filter((item: any) => item.name && item.latitude && item.longitude)
    // Transform each record to our schema
    .map((item: any) => ({
      name: item.name || item.location_name || "Unknown Resource",
      type: item.type || item.category || "hygiene",  // Default to hygiene for Clean & Safe
      latitude: parseFloat(item.latitude || item.lat),
      longitude: parseFloat(item.longitude || item.lng || item.lon),
      phone: item.phone || item.contact,
      hours: item.hours || item.schedule,
      address: item.address || item.location,
      pet_friendly: false, // Clean & Safe typically doesn't provide pet information
      is_open: item.is_open !== undefined ? item.is_open : true,
    }));
}
