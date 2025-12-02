// Shared error handling utilities for Edge Functions
// Provides consistent error response format with error codes

/**
 * Standard error codes used across all Edge Functions
 */
export enum ErrorCode {
  // Client errors (4xx)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  NOT_FOUND = "NOT_FOUND",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  
  // Server errors (5xx)
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Standard success response structure
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * HTTP status codes for different error types
 */
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.AUTH_ERROR]: 401,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.RATE_LIMIT_ERROR]: 429,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

/**
 * CORS headers for browser requests
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any
): Response {
  const status = ERROR_STATUS_MAP[code] || 500;
  
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): Response {
  const successResponse: SuccessResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };

  return new Response(JSON.stringify(successResponse), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(): Response {
  return new Response("ok", { headers: corsHeaders });
}

/**
 * Wrap async handler with try-catch for consistent error handling
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    try {
      // Handle CORS preflight
      if (req.method === "OPTIONS") {
        return handleCorsPreflightRequest();
      }

      return await handler(req);
    } catch (error) {
      console.error("Unexpected error:", error);
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "An unexpected error occurred",
        error.message
      );
    }
  };
}

/**
 * Validate HTTP method
 */
export function validateMethod(
  req: Request,
  allowedMethods: string[]
): Response | null {
  if (!allowedMethods.includes(req.method)) {
    return createErrorResponse(
      ErrorCode.METHOD_NOT_ALLOWED,
      `Only ${allowedMethods.join(", ")} requests are allowed`
    );
  }
  return null;
}
