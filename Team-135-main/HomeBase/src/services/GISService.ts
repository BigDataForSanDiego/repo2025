// GIS Lookup Service with Caching
// Powered by 211 SDHEART API with Supabase Backend fallback

import { PERFORMANCE_CONFIG } from '../config/app.config';
import { Resource, ErrorResponse } from '../types/api';
import { isRetryableError } from '../utils/validation';
import BackendService from './BackendService';
import SDHeart211Service from './SDHeart211Service';

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
 * Converts backend Resource to app Resource format
 */
const convertResource = (backendResource: any): Resource => {
  return {
    name: backendResource.name,
    type: backendResource.type,
    latitude: backendResource.latitude,
    longitude: backendResource.longitude,
    address: backendResource.address || '',
    distanceMeters: backendResource.distance_meters || 0,
    metadata: {
      phone: backendResource.phone,
      hours: backendResource.hours,
      pet_friendly: backendResource.pet_friendly,
      is_open: backendResource.is_open,
      status: backendResource.is_open ? 'Open' : 'Closed',
    },
  };
};

/**
 * Looks up nearby resources with smart fallback strategy:
 * 1. Try 211 SDHEART API first (real-time data)
 * 2. Fall back to Supabase backend if 211 fails
 * 3. Merge and deduplicate results from both sources
 */
export const lookupResources = async (
  latitude: number,
  longitude: number,
  resourceType: 'shelter' | 'food' | 'medical' | 'hygiene' | 'other'
): Promise<Resource[]> => {
  // Check cache first
  const cacheKey = getCacheKey(latitude, longitude, resourceType);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('✅ GIS cache hit:', cacheKey);
    return cached;
  }

  let resources211: Resource[] = [];
  let resourcesSupabase: Resource[] = [];
  let lastError: any;

  // Map resource types to 211 API types
  const type211Map: Record<string, string> = {
    shelter: 'shelter',
    food: 'food',
    medical: 'medical',
    hygiene: 'hygiene',
    other: 'other',
  };

  // Try 211 SDHEART API first (real-time data)
  try {
    console.log(`Fetching ${resourceType} resources from 211 SDHEART...`);
    resources211 = await SDHeart211Service.fetchResources(latitude, longitude, {
      type: type211Map[resourceType],
      radius: 5000, // 5km radius
    });
    console.log(`✓ Got ${resources211.length} resources from 211 SDHEART`);
  } catch (error211) {
    console.warn('211 SDHEART API failed, will try Supabase fallback:', error211);
    lastError = error211;
  }

  // Try Supabase backend as fallback or supplement
  try {
    console.log(`Fetching ${resourceType} resources from Supabase...`);
    const response = await BackendService.resources.find(latitude, longitude, {
      type: resourceType === 'hygiene' ? 'other' : resourceType,
      radius: 5000,
      is_open: true,
    });
    resourcesSupabase = response.resources.map(convertResource);
    console.log(`✓ Got ${resourcesSupabase.length} resources from Supabase`);
  } catch (errorSupabase) {
    console.warn('Supabase backend failed:', errorSupabase);
    if (!resources211.length) {
      lastError = errorSupabase;
    }
  }

  // Merge results from both sources
  const allResources = [...resources211, ...resourcesSupabase];

  // Deduplicate by name and location (within 50m)
  const uniqueResources: Resource[] = [];
  const seen = new Set<string>();

  for (const resource of allResources) {
    // Create a key based on name and approximate location
    const locationKey = `${resource.name.toLowerCase()}_${resource.latitude.toFixed(3)}_${resource.longitude.toFixed(3)}`;
    
    if (!seen.has(locationKey)) {
      seen.add(locationKey);
      uniqueResources.push(resource);
    }
  }

  // If we got no resources from either source, throw error
  if (uniqueResources.length === 0) {
    const errorResponse: ErrorResponse = {
      error: 'No resources found from any source',
      code: 'GIS_ERROR',
      retryable: isRetryableError(lastError),
    };
    throw errorResponse;
  }

  // Sort by distance (closest first)
  const sortedResources = uniqueResources.sort(
    (a, b) => a.distanceMeters - b.distanceMeters
  );

  // Cache the result
  setCache(cacheKey, sortedResources);

  console.log(`✓ Returning ${sortedResources.length} unique resources (${resources211.length} from 211, ${resourcesSupabase.length} from Supabase)`);

  return sortedResources;
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
