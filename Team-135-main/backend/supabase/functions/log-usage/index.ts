/**
 * Log Usage Edge Function
 * 
 * PURPOSE:
 * Logs system usage patterns for analytics while protecting user privacy.
 * Helps administrators understand how the kiosk is being used and identify
 * service gaps or areas for improvement.
 * 
 * PRIVACY PROTECTION:
 * - Location coordinates rounded to 3 decimal places (~100m precision)
 * - No personally identifiable information (PII) stored
 * - No user_id tracked (anonymous usage logging)
 * - Aggregated data only for reporting
 * 
 * LOGGED DATA:
 * - module: Which kiosk module was used (emergency, resources, info, settings)
 * - language: User's language preference (helps identify language needs)
 * - location: Approximate location (rounded for privacy)
 * - timestamp: When the interaction occurred
 * 
 * USE CASES:
 * - Identify most-used kiosk features
 * - Understand language preferences in different areas
 * - Detect service gaps in specific locations
 * - Track usage patterns over time
 * - Support data-driven policy decisions
 * 
 * PRIVACY DESIGN:
 * - Rounding coordinates to 3 decimals provides ~100m precision
 * - This is enough for area-level analysis but protects exact location
 * - Example: 32.715678 becomes 32.716 (loses ~67m of precision)
 * - Prevents tracking of individual users while enabling useful analytics
 * 
 * Requirements: 5.3
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
import {
  isRequired,
  isValidLatitude,
  isValidLongitude,
  isOneOf,
  ValidationResult,
} from "../_shared/validation.ts";

interface LogUsageRequest {
  module: string;
  language?: string;
  location_lat?: number;
  location_lng?: number;
}

interface LogUsageResponse {
  success: boolean;
  log_id?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Round coordinates to 3 decimal places for privacy
 * 
 * PURPOSE:
 * Protects user privacy by reducing location precision while maintaining
 * useful area-level analytics.
 * 
 * PRECISION LEVELS:
 * - 1 decimal place: ~11 km precision
 * - 2 decimal places: ~1.1 km precision
 * - 3 decimal places: ~110 m precision (our choice)
 * - 4 decimal places: ~11 m precision
 * - 5 decimal places: ~1.1 m precision
 * 
 * WHY 3 DECIMAL PLACES:
 * - Provides neighborhood-level precision (useful for analytics)
 * - Prevents tracking of specific individuals
 * - Balances privacy with data utility
 * - Meets privacy best practices for location data
 * 
 * EXAMPLE:
 * - Input: 32.715678, -117.161234
 * - Output: 32.716, -117.161
 * - Lost precision: ~67m (acceptable for area analysis)
 * 
 * @param coord - Latitude or longitude coordinate
 * @returns Rounded coordinate with 3 decimal places
 */
function roundCoordinate(coord: number): number {
  return Math.round(coord * 1000) / 1000;
}

serve(withErrorHandling(async (req) => {
  // Validate HTTP method
  const methodError = validateMethod(req, ["POST"]);
  if (methodError) return methodError;

  // Parse request body
  const body: LogUsageRequest = await req.json();

  // Validate using shared validation utilities
  const validation = new ValidationResult();
  const validModules = ["emergency", "resources", "info", "settings"];

  if (!isRequired(body.module)) {
    validation.addError("module", "module field is required");
  } else if (!isOneOf(body.module, validModules)) {
    validation.addError("module", "module must be one of: emergency, resources, info, settings");
  }

  if (body.location_lat !== undefined && !isValidLatitude(body.location_lat)) {
    validation.addError("location_lat", "location_lat must be between -90 and 90");
  }

  if (body.location_lng !== undefined && !isValidLongitude(body.location_lng)) {
    validation.addError("location_lng", "location_lng must be between -180 and 180");
  }

  // Return validation errors if any
  if (!validation.isValid()) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      validation.getErrorMessage()
    );
  }

    // Round location coordinates to 3 decimal places for privacy
    const roundedLat = body.location_lat !== undefined 
      ? roundCoordinate(body.location_lat) 
      : null;
    const roundedLng = body.location_lng !== undefined 
      ? roundCoordinate(body.location_lng) 
      : null;

    console.log("Logging usage:", {
      module: body.module,
      language: body.language || "not specified",
      location_provided: roundedLat !== null && roundedLng !== null,
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert usage log record
    const { data: logRecord, error: dbError } = await supabase
      .from("usage_logs")
      .insert({
        module: body.module,
        language: body.language || null,
        location_lat: roundedLat,
        location_lng: roundedLng,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to log usage",
        dbError.message
      );
    }

    console.log("Usage logged successfully:", logRecord.id);

    // Return success response
    return createSuccessResponse(
      {
        log_id: logRecord.id,
      },
      undefined,
      201
    );
}));
