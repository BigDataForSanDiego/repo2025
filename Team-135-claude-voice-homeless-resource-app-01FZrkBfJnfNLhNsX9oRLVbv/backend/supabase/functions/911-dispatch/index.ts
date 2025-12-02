/**
 * 911 Dispatch Edge Function
 * 
 * PURPOSE:
 * This function sends emergency notifications to the 911 dispatch system via webhook.
 * It is automatically triggered by the database when an emergency request with is_danger=true
 * is created, ensuring rapid response to life-threatening situations.
 * 
 * WORKFLOW:
 * 1. Receives emergency details (ID, location, timestamp, additional info)
 * 2. Validates the request data
 * 3. Formats payload for 911 dispatch system
 * 4. Sends HTTP POST request to 911_WEBHOOK_URL
 * 5. Logs success/failure for accountability
 * 
 * INTEGRATION:
 * - Called automatically by database trigger (see 006_emergency_trigger.sql)
 * - Can also be called manually by emergency-handler function if needed
 * - Webhook URL configured via environment variable for flexibility
 * 
 * CRITICAL: This function must be highly reliable as it handles life-threatening emergencies.
 * All errors are logged but don't prevent the emergency record from being created.
 * 
 * Requirements: 1.2
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
  ValidationResult,
} from "../_shared/validation.ts";

interface DispatchRequest {
  emergency_id: string;
  location_lat: number;
  location_lng: number;
  additional_info?: string;
  timestamp: string;
}

interface DispatchResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

serve(withErrorHandling(async (req) => {
  // Validate HTTP method
  const methodError = validateMethod(req, ["POST"]);
  if (methodError) return methodError;

  // Parse request body
  const requestData: DispatchRequest = await req.json();

  // Validate using shared validation utilities
  const validation = new ValidationResult();

  if (!isRequired(requestData.emergency_id)) {
    validation.addError("emergency_id", "emergency_id is required");
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

    // Get 911 webhook URL from environment
    const webhookUrl = Deno.env.get("911_WEBHOOK_URL");
    
    if (!webhookUrl) {
      console.error("911_WEBHOOK_URL environment variable not set");
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "911 dispatch webhook not configured"
      );
    }

    // Prepare webhook payload with emergency details
    // This payload format is designed to integrate with standard 911 dispatch systems
    // and includes all critical information for emergency response
    const webhookPayload = {
      emergency_id: requestData.emergency_id,  // Unique ID for tracking
      emergency_type: "kiosk_emergency",       // Identifies source as civic kiosk
      location: {
        latitude: requestData.location_lat,    // Precise GPS coordinates
        longitude: requestData.location_lng,
        coordinates: `${requestData.location_lat}, ${requestData.location_lng}`,  // Human-readable format
      },
      timestamp: requestData.timestamp || new Date().toISOString(),  // When emergency occurred
      additional_info: requestData.additional_info || "Emergency request from Homebase kiosk",
      priority: "high",                        // All kiosk emergencies are high priority
      source: "homebase_kiosk",               // Identifies this as a civic kiosk emergency
    };

    console.log("Sending 911 dispatch notification:", {
      emergency_id: requestData.emergency_id,
      location: webhookPayload.location.coordinates,
    });

    // Send webhook to 911 dispatch system
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Homebase-Kiosk/1.0",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error("911 webhook failed:", {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          body: errorText,
        });

        return createErrorResponse(
          ErrorCode.EXTERNAL_API_ERROR,
          "Failed to notify 911 dispatch",
          {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
          }
        );
      }

      console.log("911 dispatch notification sent successfully");

      // Return success response
      return createSuccessResponse(
        undefined,
        "911 dispatch notified successfully"
      );
    } catch (fetchError) {
      console.error("Error sending webhook:", fetchError);
      
      return createErrorResponse(
        ErrorCode.EXTERNAL_API_ERROR,
        "Failed to connect to 911 dispatch system",
        fetchError.message
      );
    }
}));
