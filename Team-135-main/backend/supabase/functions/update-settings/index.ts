/**
 * Update Settings Edge Function
 * 
 * PURPOSE:
 * Updates or creates user accessibility settings. Uses upsert logic to handle both
 * new users (insert) and existing users (update) with a single operation.
 * 
 * ACCESSIBILITY SETTINGS:
 * - voice_on: Enable/disable voice output
 * - text_mode: Enable/disable text display
 * - language_pref: Change interface language (ISO 639-1 code)
 * - high_contrast: Enable/disable high contrast mode
 * - font_size: Change text size (small, medium, large, xlarge)
 * 
 * VALIDATION:
 * - font_size: Must be one of: small, medium, large, xlarge
 * - language_pref: Must be 2-letter ISO 639-1 code (e.g., "en", "es")
 * - Boolean fields: Must be true or false
 * - user_id: Must be valid UUID
 * 
 * UPSERT LOGIC:
 * - If user_id exists: Updates existing settings
 * - If user_id doesn't exist: Creates new settings record
 * - Automatically updates updated_at timestamp
 * - Preserves fields not included in update request
 * 
 * PARTIAL UPDATES:
 * - Users can update individual settings without sending all fields
 * - Example: Update only font_size without changing other settings
 * - Unspecified fields retain their current values
 * 
 * PERFORMANCE:
 * - Single database operation (upsert) instead of check + insert/update
 * - Completes within 1 second (Requirement 4.3)
 * 
 * Requirements: 4.2, 4.3
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
  isBoolean,
  isValidLanguageCode,
  isOneOf,
  ValidationResult,
} from "../_shared/validation.ts";

interface UserSettingsUpdate {
  user_id: string;
  voice_on?: boolean;
  text_mode?: boolean;
  language_pref?: string;
  high_contrast?: boolean;
  font_size?: string;
}

interface UserSettings {
  user_id: string;
  voice_on: boolean;
  text_mode: boolean;
  language_pref: string;
  high_contrast: boolean;
  font_size: string;
  created_at: string;
  updated_at: string;
}

interface SettingsResponse {
  success: boolean;
  settings?: UserSettings;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

serve(withErrorHandling(async (req) => {
  // Validate HTTP method
  const methodError = validateMethod(req, ["PUT", "PATCH"]);
  if (methodError) return methodError;

  // Parse URL to get user_id from path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const userId = pathParts[pathParts.length - 1];

  // Parse request body
  const updates: UserSettingsUpdate = await req.json();

  // Validate using shared validation utilities
  const validation = new ValidationResult();
  const validFontSizes = ["small", "medium", "large", "xlarge"];

  if (!userId || userId === "update-settings") {
    validation.addError("user_id", "user_id is required in the URL path (e.g., /update-settings/{user_id})");
  } else if (!isValidUUID(userId)) {
    validation.addError("user_id", "user_id must be a valid UUID");
  }

  if (updates.font_size && !isOneOf(updates.font_size, validFontSizes)) {
    validation.addError("font_size", `font_size must be one of: ${validFontSizes.join(", ")}`);
  }

  if (updates.language_pref && !isValidLanguageCode(updates.language_pref)) {
    validation.addError("language_pref", "language_pref must be a 2-letter ISO 639-1 code (e.g., 'en', 'es')");
  }

  if (updates.voice_on !== undefined && !isBoolean(updates.voice_on)) {
    validation.addError("voice_on", "voice_on must be a boolean value");
  }

  if (updates.text_mode !== undefined && !isBoolean(updates.text_mode)) {
    validation.addError("text_mode", "text_mode must be a boolean value");
  }

  if (updates.high_contrast !== undefined && !isBoolean(updates.high_contrast)) {
    validation.addError("high_contrast", "high_contrast must be a boolean value");
  }

  // Return validation errors if any
  if (!validation.isValid()) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      validation.getErrorMessage()
    );
  }

    console.log(`Updating settings for user: ${userId}`, updates);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare settings data for upsert
    // Remove user_id from updates if present to avoid conflicts
    const { user_id: _, ...updateFields } = updates as any;
    const settingsData = {
      user_id: userId,
      ...updateFields,
      updated_at: new Date().toISOString(),
    };

    // Upsert settings (insert if not exists, update if exists)
    const { data: settings, error: dbError } = await supabase
      .from("user_settings")
      .upsert(settingsData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to update user settings",
        dbError.message
      );
    }

    console.log(`Settings updated successfully for user ${userId}`);

    // Return updated settings
    return createSuccessResponse(
      {
        settings: settings,
      },
      "Settings updated successfully"
    );
}));
