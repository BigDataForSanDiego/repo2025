/**
 * Information Handler Edge Function
 * 
 * PURPOSE:
 * This function provides access to information and learning programs in multiple languages.
 * It helps kiosk users learn about available services, programs, and resources in their
 * preferred language.
 * 
 * MULTILINGUAL SUPPORT:
 * - Supports multiple languages via ISO 639-1 codes (en, es, etc.)
 * - Defaults to English (en) if no language specified
 * - Each program can be available in multiple languages
 * - Voice-enabled programs support audio playback for accessibility
 * 
 * FILTERING OPTIONS:
 * - language: Filter by language code (required, defaults to "en")
 * - category: Filter by program category (housing, health, employment, etc.)
 * - voice_enabled: Filter to only voice-enabled programs
 * 
 * ACCESSIBILITY:
 * - Voice-enabled flag indicates programs with audio support
 * - Helps users with visual impairments or reading difficulties
 * - Contact links provide direct access to program information
 * 
 * ORGANIZATION:
 * - Results sorted by category for better organization
 * - Then sorted by title within each category
 * - Makes it easier for users to find relevant programs
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5
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
  isValidLanguageCode,
  ValidationResult,
} from "../_shared/validation.ts";

interface Program {
  id: string;
  title: string;
  description: string;
  language: string;
  voice_enabled: boolean;
  contact_link: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

interface InfoResponse {
  success: boolean;
  programs?: Program[];
  count?: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

serve(withErrorHandling(async (req) => {
  // Validate HTTP method
  const methodError = validateMethod(req, ["GET"]);
  if (methodError) return methodError;

  // Parse query parameters
  const url = new URL(req.url);
  const language = url.searchParams.get("language") || "en"; // Default to English
  const category = url.searchParams.get("category");
  const voiceEnabledParam = url.searchParams.get("voice_enabled");

  // Validate language parameter using shared validation utilities
  const validation = new ValidationResult();

  if (!isValidLanguageCode(language)) {
    validation.addError("language", "language parameter must be a 2-letter ISO 639-1 code (e.g., 'en', 'es')");
  }

  // Return validation errors if any
  if (!validation.isValid()) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      validation.getErrorMessage()
    );
  }

    console.log("Fetching programs:", {
      language,
      category: category || "all",
      voice_enabled: voiceEnabledParam || "all",
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query with filters
    let query = supabase
      .from("programs")
      .select("*")
      .eq("language", language);

    // Add category filter if specified
    if (category) {
      query = query.eq("category", category);
    }

    // Add voice_enabled filter if specified
    if (voiceEnabledParam !== null) {
      const voiceEnabled = voiceEnabledParam === "true";
      query = query.eq("voice_enabled", voiceEnabled);
    }

    // Order by category for better organization
    query = query.order("category", { ascending: true });
    query = query.order("title", { ascending: true });

    // Execute query
    const { data: programs, error: dbError } = await query;

    if (dbError) {
      console.error("Database error:", dbError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch programs",
        dbError.message
      );
    }

    console.log(`Found ${programs?.length || 0} programs`);

    // Return results
    return createSuccessResponse({
      programs: programs || [],
      count: programs?.length || 0,
    });
}));
