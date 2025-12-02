// GIS Lookup Service with Caching

import { APP_CONFIG, PERFORMANCE_CONFIG } from '../config/app.config';
import {
  GISLookupRequest,
  GISLookupResponse,
  ErrorResponse,
  Resource,
} from '../types/api';
import { validateGISResponse, isRetryableError } from '../utils/validation';

// Simple cache for GIS responses
interface CacheEntry {
  data: Resource[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Generates cache key from request parameters
 */
const getCacheKey = (latitude: number, longitude: number, resourceType: string): string => {
  // Round coordinates to 3 decimal places (~110m precision)
  const lat = latitude.toFixed(3);
  const lng = longitude.toFixed(3);
  return `${lat},${lng},${resourceType}`;
};

/**
 * Gets cached response if valid
 */
const getFromCache = (key: string): Resource[] | null => {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  const age = Date.now() - entry.timestamp;
  if (age > PERFORMANCE_CONFIG.cacheTimeout) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

/**
 * Stores response in cache
 */
const setCache = (key: string, data: Resource[]): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Sleep utility for retry backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Looks up nearby resources via GIS backend
 */
export const lookupResources = async (
  latitude: number,
  longitude: number,
  resourceType: 'shelter' | 'food' | 'other'
): Promise<Resource[]> => {
  // Check cache first
  const cacheKey = getCacheKey(latitude, longitude, resourceType);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('GIS cache hit:', cacheKey);
    return cached;
  }

  const request: GISLookupRequest = {
    latitude,
    longitude,
    resourceType,
  };

  let lastError: any;

  // Retry logic: 1 retry attempt
  const maxAttempts = 2;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`${APP_CONFIG.gisEndpoint}/lookup`, {
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
      const validated = validateGISResponse(data);

      if ('error' in validated && validated.error) {
        throw {
          error: validated.error,
          code: 'GIS_ERROR',
          retryable: false,
        };
      }

      const gisResponse = validated as GISLookupResponse;

      // Sort by distance (closest first)
      const sortedResources = gisResponse.resources.sort(
        (a, b) => a.distanceMeters - b.distanceMeters
      );

      // Cache the result
      setCache(cacheKey, sortedResources);

      return sortedResources;

    } catch (error: any) {
      lastError = error;

      // Check if error is retryable and we have attempts left
      if (isRetryableError(error) && attempt < maxAttempts - 1) {
        const backoffMs = 2000; // 2 second backoff
        console.log(`GIS request failed, retrying in ${backoffMs}ms...`, error);
        await sleep(backoffMs);
        continue;
      }

      break;
    }
  }

  // All retries exhausted
  const errorResponse: ErrorResponse = {
    error: 'GIS lookup failed',
    code: 'GIS_ERROR',
    retryable: isRetryableError(lastError),
  };

  throw errorResponse;
};

/**
 * Clears the GIS cache
 */
export const clearCache = (): void => {
  cache.clear();
};

/**
 * Service object with all GIS methods
 */
export const GISService = {
  lookupResources,
  clearCache,
};
