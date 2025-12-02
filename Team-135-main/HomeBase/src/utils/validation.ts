// Validation Utilities

import { VoiceAgentResponse, GISLookupResponse, ErrorResponse } from '../types/api';

/**
 * Validates Voice Agent Response structure
 */
export const validateVoiceAgentResponse = (
  response: any
): VoiceAgentResponse | ErrorResponse => {
  if (!response || typeof response !== 'object') {
    return {
      error: 'Malformed response: Invalid response object',
      retryable: false,
    };
  }

  // Check required fields
  if (!Array.isArray(response.transcript)) {
    return {
      error: 'Missing required field: transcript',
      retryable: false,
    };
  }

  if (typeof response.intent !== 'string') {
    return {
      error: 'Missing required field: intent',
      retryable: false,
    };
  }

  if (response.error !== null && typeof response.error !== 'string') {
    return {
      error: 'Malformed response: invalid error field',
      retryable: false,
    };
  }

  if (!Array.isArray(response.resources)) {
    return {
      error: 'Missing required field: resources',
      retryable: false,
    };
  }

  // Validate transcript entries
  for (const entry of response.transcript) {
    if (
      typeof entry.text !== 'string' ||
      typeof entry.timestamp !== 'number' ||
      !['user', 'agent'].includes(entry.speaker)
    ) {
      return {
        error: 'Malformed response: invalid transcript entry',
        retryable: false,
      };
    }
  }

  return response as VoiceAgentResponse;
};

/**
 * Validates GIS Lookup Response structure
 */
export const validateGISResponse = (
  response: any
): GISLookupResponse | ErrorResponse => {
  if (!response || typeof response !== 'object') {
    return {
      error: 'Malformed response: Invalid response object',
      retryable: false,
    };
  }

  if (!Array.isArray(response.resources)) {
    return {
      error: 'Missing required field: resources',
      retryable: false,
    };
  }

  if (response.error !== null && typeof response.error !== 'string') {
    return {
      error: 'Malformed response: invalid error field',
      retryable: false,
    };
  }

  // Validate resource entries
  for (const resource of response.resources) {
    if (
      typeof resource.name !== 'string' ||
      typeof resource.type !== 'string' ||
      typeof resource.latitude !== 'number' ||
      typeof resource.longitude !== 'number' ||
      typeof resource.address !== 'string' ||
      typeof resource.distanceMeters !== 'number'
    ) {
      return {
        error: 'Malformed response: invalid resource entry',
        retryable: false,
      };
    }
  }

  return response as GISLookupResponse;
};

/**
 * Checks if an error is retryable based on error type
 */
export const isRetryableError = (error: any): boolean => {
  if (error?.retryable !== undefined) {
    return error.retryable;
  }

  // Network errors are typically retryable
  if (
    error?.message?.includes('timeout') ||
    error?.message?.includes('network') ||
    error?.message?.includes('ECONNREFUSED')
  ) {
    return true;
  }

  return false;
};

/**
 * Formats error messages for user display
 */
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.error) {
    return error.error;
  }

  if (error?.message) {
    // Convert technical errors to user-friendly messages
    if (error.message.includes('timeout')) {
      return 'Connection issue. Please try again.';
    }
    if (error.message.includes('network') || error.message.includes('fetch failed')) {
      return 'Connection issue. Please try again.';
    }
    return 'Something went wrong. Let\'s try again.';
  }

  return 'Something went wrong. Let\'s try again.';
};
