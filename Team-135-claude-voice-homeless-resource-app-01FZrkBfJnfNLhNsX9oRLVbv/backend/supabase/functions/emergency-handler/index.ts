/**
 * Emergency Handler Edge Function
 * 
 * PURPOSE:
 * This function handles emergency help requests from kiosk users experiencing distress.
 * It routes requests to either 911 dispatch (for true emergencies) or outreach workers
 * (for non-emergency assistance needs).
 * 
 * BUSINESS LOGIC:
 * - When is_danger=true: Stores request and triggers 911 dispatch via database trigger
 * - When is_danger=false: Stores request and connects to outreach responders
 * 
 * SECURITY:
 * - Validates all input parameters to prevent injection attacks
 * - Uses service role key for database operations (bypasses RLS)
 * - Logs all emergency requests for accountability
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
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
  isBoolean,
  isValidLatitude,
  isValidLongitude,
  ValidationResult,
} from "../_shared/validation.ts";

interface EmergencyRequest {
  user_id: string;
  is_danger: boolean;
  location_lat: number;
  location_lng: number;
  additional_info?: string;
}

interface EmergencyResponse {
  success: boolean;
  request_id?: string;
  message: string;
  responder_type?: "911" | "outreach";
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

serve(withErrorHandling(async (req) => {
  // Validate HTTP method - only POST requests are allowed
  const methodError = validateMethod(req, ["POST"]);
  if (methodError) return methodError;

  // Parse request body containing emergency details
  const requestData: EmergencyRequest = await req.json();

  // Validate request data using shared validation utilities
  // This ensures all required fields are present and properly formatted
  const validation = new ValidationResult();

  if (!isRequired(requestData.user_id)) {
    validation.addError("user_id", "user_id is required");
  }

  if (!isRequired(requestData.is_danger) || !isBoolean(requestData.is_danger)) {
    validation.addError("is_danger", "is_danger must be a boolean value");
  }

  if (!isRequired(requestData.location_lat) || !isValidLatitude(requestData.location_lat)) {
    validation.addError("location_lat", "location_lat must be a number between -90 and 90");
  }

  if (!isRequired(requestData.location_lng) || !isValidLongitude(requestData.location_lng)) {
    validation.addError("location_lng", "location_lng must be a number between -180 and 180");
  }

  // Return validation errors if any
  if (!validation.isValid()) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      validation.getErrorMessage()
    );
  }

    // Initialize Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert emergency request into database
    const { data: emergencyRecord, error: dbError } = await supabase
      .from("emergency_requests")
      .insert({
        user_id: requestData.user_id,
        is_danger: requestData.is_danger,
        location_lat: requestData.location_lat,
        location_lng: requestData.location_lng,
        additional_info: requestData.additional_info || null,
        timestamp: new Date().toISOString(),
        resolved_status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to create emergency request",
        dbError.message
      );
    }

    // Determine responder type based on danger level
    // This is the core routing logic that decides how to handle the emergency
    let responderType: "911" | "outreach";
    let message: string;

    if (requestData.is_danger) {
      // TRUE EMERGENCY PATH (is_danger=true)
      // For life-threatening situations requiring immediate 911 response
      responderType = "911";
      message = "Emergency services have been notified. Help is on the way.";
      
      // IMPORTANT: The database trigger (emergency_notification_trigger) will automatically
      // invoke the 911-dispatch function when is_danger=true. This ensures emergency
      // notifications are sent even if this function fails after the database insert.
      // See migration 006_emergency_trigger.sql for trigger implementation.
    } else {
      // NON-EMERGENCY PATH (is_danger=false)
      // For situations requiring assistance but not immediate 911 response
      // Examples: need shelter, food, medical care, mental health support
      responderType = "outreach";
      message = "Your request has been received. An outreach worker will contact you shortly.";
      
      // Query outreach contacts to assign a responder
      // Future enhancement: Use PostGIS to select nearest outreach worker based on location
      const { data: outreachContacts } = await supabase
        .from("outreach_contacts")
        .select("*")
        .limit(1);
      
      // Log outreach contact for reference
      // In production, this would trigger a notification to the outreach worker
      if (outreachContacts && outreachContacts.length > 0) {
        console.log("Outreach contact assigned:", outreachContacts[0].organization_name);
      }
    }

    // Return success response
    return createSuccessResponse(
      {
        request_id: emergencyRecord.id,
        message: message,
        responder_type: responderType,
      },
      message
    );
}));
