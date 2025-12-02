// Configuration for API endpoints based on environment
const isDevelopment = import.meta.env.MODE === 'development'
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// Determine the API base URL
const getApiBaseUrl = () => {
  // In development, use the development server
  if (isDevelopment && isLocalhost) {
    return 'http://localhost:3000'
  }
  
  // In production, use relative URLs so they work on any domain
  return ''
}

export const API_BASE_URL = getApiBaseUrl()

// API endpoints
export const API_ENDPOINTS = {
  analyze: `${API_BASE_URL}/api/analyze`,
  mapsConfig: `${API_BASE_URL}/api/maps-config`,
  recyclingCenters: `${API_BASE_URL}/api/recycling-centers`,
  localResources: `${API_BASE_URL}/api/local-resources`,
  seasonalPriorities: `${API_BASE_URL}/api/seasonal-priorities`,
  placesSearch: `${API_BASE_URL}/api/places/search`,
  health: `${API_BASE_URL}/api/health`
}

export default {
  API_BASE_URL,
  API_ENDPOINTS
}