/**
 * Get Settings Edge Function
 * 
 * PURPOSE:
 * Retrieves user accessibility settings to customize the kiosk interface.
 * Returns default settings for new users who haven't configured preferences yet.
 * 
 * ACCESSIBILITY SETTINGS:
 * - voice_on: Enable voice output for screen reading
 * - text_mode: Enable text display (can be used with or without voice)
 * - language_pref: Preferred language (ISO 639-1 code)
 * - high_contrast: Enable high contrast mode for visual impairments
 * - font_size: Text size (small, medium, large, xlarge)
 * 
 * DEFAULT SETTINGS:
 * - voice_on: false (user must opt-in to voice)
 * - text_mode: true (text enabled by default)
 * - language_pref: "en" (English default)
 * - high_contrast: false (standard contrast default)
 * - font_size: "medium" (standard size default)
 * 
 * SECURITY:
 * - Uses service role key to bypass RLS (settings are user-specific)
 * - Validates user_id is a valid UUID
 * - In production, should verify user authentication
 * 
 * USER EXPERIENCE:
 * - Returns defaults immediately for new users (no setup required)
 * - Allows users to start using kiosk without configuration
 * - Settings can be updated later via update-settings endpoint
 * 
 * Requirements: 4.2, 4.4
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
  isValidUUID,
  ValidationResult,
} from "../_shared/validation.ts";

interface UserSettings {
  user_id: string;
  voice_on: boolean;
  text_mode: boolean;
  language_pref: string;
  high_contrast: boolean;
  font_size: string;
  created_at?: string;
  updated_at?: string;
}

interface SettingsResponse {
  success: boolean;
  settings?: UserSettings;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Default settings for new users
const DEFAULT_SETTINGS: Partial<UserSettings> = {
  voice_on: false,
  text_mode: true,
  language_pref: "en",
  high_contrast: false,
  font_size: "medium",
};

serve(withErrorHandling(async (req) => {
  // Validate HTTP method
  const methodError = validateMethod(req, ["GET"]);
  if (methodError) return methodError;

  // Parse URL to get user_id from path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const userId = pathParts[pathParts.length - 1];

  // Validate user_id using shared validation utilities
  const validation = new ValidationResult();

  if (!userId || userId === "get-settings") {
    validation.addError("user_id", "user_id is required in the URL path (e.g., /get-settings/{user_id})");
  } else if (!isValidUUID(userId)) {
    validation.addError("user_id", "user_id must be a valid UUID");
  }

  // Return validation errors if any
  if (!validation.isValid()) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      validation.getErrorMessage()
    );
  }

    console.log(`Fetching settings for user: ${userId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query user settings
    const { data: settings, error: dbError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    // If no settings found, return default settings
    if (dbError && dbError.code === "PGRST116") {
      console.log(`No settings found for user ${userId}, returning defaults`);
      return createSuccessResponse({
        settings: {
          user_id: userId,
          ...DEFAULT_SETTINGS,
        },
      });
    }

    if (dbError) {
      console.error("Database error:", dbError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch user settings",
        dbError.message
      );
    }

    console.log(`Settings found for user ${userId}`);

    // Return settings
    return createSuccessResponse({
      settings: settings,
    });
}));
