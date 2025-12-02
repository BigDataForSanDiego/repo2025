// 211 SDHEART API Service
// Fetches real-time resource data from 211 San Diego

import { Resource } from '../types/api';

const API_211_URL = process.env.API_211_URL || 'http://localhost:3000/v1/211/json';

export interface SDHeart211Resource {
  source: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  hours_json: string;
  eligibility_notes: string | null;
  address: string;
  contact: string;
  status: string;
  capacity_available: number | null;
  wait_minutes: number | null;
  last_verified_at: string;
}

export interface SDHeart211Response {
  data: SDHeart211Resource[];
}

/**
 * Converts 211 resource to app Resource format
 */
const convert211Resource = (resource: SDHeart211Resource, userLat: number, userLng: number): Resource => {
  // Calculate distance using Haversine formula
  const distance = calculateDistance(userLat, userLng, resource.lat, resource.lng);
  
  return {
    name: resource.name,
    type: resource.type || 'other',
    latitude: resource.lat,
    longitude: resource.lng,
    address: resource.address,
    distanceMeters: distance,
    metadata: {
      phone: resource.contact,
      hours: resource.hours_json,
      status: resource.status,
      wait_minutes: resource.wait_minutes,
      capacity_available: resource.capacity_available,
      last_verified: resource.last_verified_at,
      source: '211 San Diego',
    },
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Fetch resources from 211 SDHEART API
 */
export const fetch211Resources = async (
  latitude: number,
  longitude: number,
  options: {
    type?: string;
    radius?: number; // in meters
  } = {}
): Promise<Resource[]> => {
  try {
    console.log('Fetching 211 SDHEART data from:', API_211_URL);
    
    const response = await fetch(API_211_URL, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`211 API returned ${response.status}: ${response.statusText}`);
    }

    const data: SDHeart211Response = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid 211 API response format');
    }

    console.log(`Received ${data.data.length} resources from 211 SDHEART`);

    // Convert all resources to app format with distance
    let resources = data.data.map(r => convert211Resource(r, latitude, longitude));

    // Filter by type if specified
    if (options.type && options.type !== 'other') {
      resources = resources.filter(r => r.type === options.type);
    }

    // Filter by radius if specified (default 5km)
    const radius = options.radius || 5000;
    resources = resources.filter(r => r.distanceMeters <= radius);

    // Sort by distance (closest first)
    resources.sort((a, b) => a.distanceMeters - b.distanceMeters);

    console.log(`Filtered to ${resources.length} resources within ${radius}m`);

    return resources;
  } catch (error) {
    console.error('211 SDHEART API error:', error);
    throw new Error(`Failed to fetch 211 data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Service object
 */
export const SDHeart211Service = {
  fetchResources: fetch211Resources,
};

export default SDHeart211Service;
