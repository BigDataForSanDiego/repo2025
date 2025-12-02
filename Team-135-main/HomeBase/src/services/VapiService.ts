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

const FALLBACK_RESPONSE = (): VoiceAgentResponse => ({
  transcript: [
    {
      text: 'We are still gathering data, please hold for updated resources.',
      timestamp: Date.now(),
      speaker: 'agent',
    },
  ],
  intent: 'get_resources',
  error: null,
  resources: [],
});

/**
 * Sends audio to Vapi backend with retry logic
 */
export const sendAudioRequest = async (
  audioInput: string,
  sessionId: string
): Promise<VoiceAgentResponse> => {
  // Get API credentials from environment
  const apiKey = process.env.VAPI_API_KEY || APP_CONFIG.vapiApiKey;
  const assistantId = process.env.VAPI_ASSISTANT_ID || APP_CONFIG.vapiAssistantId;

  // If no API key configured, use fallback in dev mode only
  if (!apiKey && __DEV__) {
    console.log('ℹ️  Demo mode: No Vapi API key configured, using fallback response');
    return FALLBACK_RESPONSE();
  }

  const request: VoiceAgentRequest = {
    audioInput,
    timestamp: Date.now(),
    sessionId,
    assistantId,
  };

  let lastError: any;

  // Retry logic: 2 attempts with exponential backoff
  for (let attempt = 0; attempt <= APP_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.requestTimeout);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if API key exists
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(`${APP_CONFIG.vapiEndpoint}/voice`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          if (__DEV__) {
            console.log('ℹ️  Demo mode: Vapi endpoint returned 404, using fallback response');
          } else {
            throw new Error('Vapi service not found (404). Check endpoint configuration.');
          }
          return FALLBACK_RESPONSE();
        }
        if (response.status === 401) {
          throw new Error('Vapi authentication failed. Check your API key.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      const validated = validateVoiceAgentResponse(data);

      if ('error' in validated && validated.error) {
        throw validated;
      }

      console.log('✅ Vapi response received:', {
        intent: validated.intent,
        resourceType: validated.resourceType,
        requires911: validated.requires911,
      });

      return validated as VoiceAgentResponse;

    } catch (error: any) {
      lastError = error;

      // In dev mode, fallback on any error
      if (__DEV__ && (error?.message?.includes('404') || error?.message?.includes('fetch failed'))) {
        console.warn('⚠️  Vapi request failed (dev mode), using fallback response:', error.message);
        return FALLBACK_RESPONSE();
      }

      // Check if error is retryable and we have attempts left
      if (isRetryableError(error) && attempt < APP_CONFIG.maxRetries) {
        // Exponential backoff: 2s, 4s
        const backoffMs = Math.pow(2, attempt + 1) * 1000;
        console.log(`Vapi request failed, retrying in ${backoffMs}ms...`, error.message);
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
