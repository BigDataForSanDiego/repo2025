// Vapi Voice Agent Service

import { APP_CONFIG } from '../config/app.config';
import {
  VoiceAgentRequest,
  VoiceAgentResponse,
  ErrorResponse,
} from '../types/api';
import { validateVoiceAgentResponse, isRetryableError } from '../utils/validation';

/**
 * Sleep utility for retry backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sends audio to Vapi backend with retry logic
 */
export const sendAudioRequest = async (
  audioInput: string,
  sessionId: string
): Promise<VoiceAgentResponse> => {
  const request: VoiceAgentRequest = {
    audioInput,
    timestamp: Date.now(),
    sessionId,
  };

  let lastError: any;

  // Retry logic: 2 attempts with exponential backoff
  for (let attempt = 0; attempt <= APP_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.requestTimeout);

      const response = await fetch(`${APP_CONFIG.vapiEndpoint}/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      const validated = validateVoiceAgentResponse(data);

      if ('error' in validated && validated.error) {
        throw validated;
      }

      return validated as VoiceAgentResponse;

    } catch (error: any) {
      lastError = error;

      // Check if error is retryable and we have attempts left
      if (isRetryableError(error) && attempt < APP_CONFIG.maxRetries) {
        // Exponential backoff: 2s, 4s
        const backoffMs = Math.pow(2, attempt + 1) * 1000;
        console.log(`Vapi request failed, retrying in ${backoffMs}ms...`, error);
        await sleep(backoffMs);
        continue;
      }

      // Not retryable or out of attempts
      break;
    }
  }

  // All retries exhausted
  const errorResponse: ErrorResponse = {
    error: lastError?.error || lastError?.message || 'Voice agent request failed',
    code: 'VAPI_ERROR',
    retryable: isRetryableError(lastError),
  };

  throw errorResponse;
};

/**
 * Service object with all Vapi methods
 */
export const VapiService = {
  sendAudioRequest,
};
