/**
 * Regional pricing data for recyclable materials (price per pound in USD)
 */
const REGIONAL_PRICING = {
  sanDiego: {
    aluminum: { min: 1.60, max: 1.80, crv: 0.05 },
    plastic: { min: 0.12, max: 0.18, crv: 0.05 },
    glass: { min: 0.06, max: 0.12, crv: 0.05 },
    cardboard: { min: 0.03, max: 0.06, crv: 0 },
    paper: { min: 0.02, max: 0.04, crv: 0 },
    steel: { min: 0.06, max: 0.12, crv: 0 },
    copper: { min: 3.20, max: 4.20, crv: 0 }
  },
  
  // Orange County - High density, good recycling infrastructure
  orangeCounty: {
    aluminum: { min: 1.55, max: 1.75, crv: 0.05 },
    plastic: { min: 0.11, max: 0.17, crv: 0.05 },
    glass: { min: 0.05, max: 0.11, crv: 0.05 },
    cardboard: { min: 0.02, max: 0.06, crv: 0 },
    paper: { min: 0.02, max: 0.04, crv: 0 },
    steel: { min: 0.05, max: 0.11, crv: 0 },
    copper: { min: 3.10, max: 4.10, crv: 0 }
  },
  
  // Los Angeles County - Competitive market, high volume
  losAngeles: {
    aluminum: { min: 1.50, max: 1.70, crv: 0.05 },
    plastic: { min: 0.10, max: 0.16, crv: 0.05 },
    glass: { min: 0.05, max: 0.10, crv: 0.05 },
    cardboard: { min: 0.02, max: 0.05, crv: 0 },
    paper: { min: 0.01, max: 0.03, crv: 0 },
    steel: { min: 0.05, max: 0.10, crv: 0 },
    copper: { min: 3.00, max: 4.00, crv: 0 }
  },
  
  // Riverside & San Bernardino (Inland Empire) - Moderate prices
  inlandEmpire: {
    aluminum: { min: 1.45, max: 1.65, crv: 0.05 },
    plastic: { min: 0.09, max: 0.14, crv: 0.05 },
    glass: { min: 0.04, max: 0.09, crv: 0.05 },
    cardboard: { min: 0.02, max: 0.05, crv: 0 },
    paper: { min: 0.01, max: 0.03, crv: 0 },
    steel: { min: 0.04, max: 0.09, crv: 0 },
    copper: { min: 2.90, max: 3.90, crv: 0 }
  },
  
  // San Francisco Bay Area - Tech hub, strong environmental focus
  bayArea: {
    aluminum: { min: 1.55, max: 1.75, crv: 0.05 },
    plastic: { min: 0.11, max: 0.16, crv: 0.05 },
    glass: { min: 0.05, max: 0.11, crv: 0.05 },
    cardboard: { min: 0.03, max: 0.06, crv: 0 },
    paper: { min: 0.02, max: 0.04, crv: 0 },
    steel: { min: 0.05, max: 0.11, crv: 0 },
    copper: { min: 3.10, max: 4.10, crv: 0 }
  },
  
  // Central Valley (Fresno, Bakersfield, Stockton) - Agricultural region
  centralValley: {
    aluminum: { min: 1.40, max: 1.60, crv: 0.05 },
    plastic: { min: 0.08, max: 0.13, crv: 0.05 },
    glass: { min: 0.04, max: 0.08, crv: 0.05 },
    cardboard: { min: 0.02, max: 0.04, crv: 0 },
    paper: { min: 0.01, max: 0.03, crv: 0 },
    steel: { min: 0.04, max: 0.08, crv: 0 },
    copper: { min: 2.80, max: 3.80, crv: 0 }
  },
  
  // Northern California (Sacramento, Redding)
  northernCalifornia: {
    aluminum: { min: 1.45, max: 1.65, crv: 0.05 },
    plastic: { min: 0.09, max: 0.14, crv: 0.05 },
    glass: { min: 0.04, max: 0.09, crv: 0.05 },
    cardboard: { min: 0.02, max: 0.05, crv: 0 },
    paper: { min: 0.01, max: 0.03, crv: 0 },
    steel: { min: 0.04, max: 0.09, crv: 0 },
    copper: { min: 2.90, max: 3.90, crv: 0 }
  },
  
  // Rest of West Coast (OR, WA, NV) - CRV programs vary
  westCoast: {
    aluminum: { min: 1.50, max: 1.70, crv: 0.10 }, // OR has 10¢ deposit
    plastic: { min: 0.10, max: 0.15, crv: 0.10 },
    glass: { min: 0.05, max: 0.10, crv: 0.10 },
    cardboard: { min: 0.02, max: 0.05, crv: 0 },
    paper: { min: 0.01, max: 0.03, crv: 0 },
    steel: { min: 0.05, max: 0.10, crv: 0 },
    copper: { min: 3.00, max: 4.00, crv: 0 }
  },
  
  // Northeast (NY, MA, CT, etc.) - Moderate prices with deposit programs
  northeast: {
    aluminum: { min: 1.30, max: 1.50, crv: 0.05 },
    plastic: { min: 0.08, max: 0.12, crv: 0.05 },
    glass: { min: 0.03, max: 0.08, crv: 0.05 },
    cardboard: { min: 0.01, max: 0.04, crv: 0 },
    paper: { min: 0.01, max: 0.02, crv: 0 },
    steel: { min: 0.04, max: 0.08, crv: 0 },
    copper: { min: 2.80, max: 3.80, crv: 0 }
  },
  
  // Midwest (IL, OH, MI, etc.) - Lower prices, fewer incentive programs
  midwest: {
    aluminum: { min: 1.00, max: 1.30, crv: 0 },
    plastic: { min: 0.05, max: 0.10, crv: 0 },
    glass: { min: 0.02, max: 0.05, crv: 0 },
    cardboard: { min: 0.01, max: 0.03, crv: 0 },
    paper: { min: 0.005, max: 0.02, crv: 0 },
    steel: { min: 0.03, max: 0.06, crv: 0 },
    copper: { min: 2.50, max: 3.50, crv: 0 }
  },
  
  // South (TX, FL, GA, etc.) - Variable prices, growing markets
  south: {
    aluminum: { min: 1.10, max: 1.40, crv: 0 },
    plastic: { min: 0.06, max: 0.11, crv: 0 },
    glass: { min: 0.02, max: 0.06, crv: 0 },
    cardboard: { min: 0.01, max: 0.04, crv: 0 },
    paper: { min: 0.01, max: 0.02, crv: 0 },
    steel: { min: 0.03, max: 0.07, crv: 0 },
    copper: { min: 2.60, max: 3.60, crv: 0 }
  },
  
  // Default/Other regions
  default: {
    aluminum: { min: 1.20, max: 1.50, crv: 0 },
    plastic: { min: 0.07, max: 0.12, crv: 0 },
    glass: { min: 0.03, max: 0.07, crv: 0 },
    cardboard: { min: 0.01, max: 0.04, crv: 0 },
    paper: { min: 0.01, max: 0.02, crv: 0 },
    steel: { min: 0.04, max: 0.07, crv: 0 },
    copper: { min: 2.70, max: 3.70, crv: 0 }
  }
}/**
 * Determine region based on latitude/longitude with detailed Southern California coverage
 */
function getRegion(lat, lng) {
  // San Diego County (32.5-33.5°N, -117.6 to -116.1°W)
  if (lat >= 32.5 && lat <= 33.5 && lng >= -117.6 && lng <= -116.1) {
    return 'sanDiego'
  }
  
  // Orange County (33.4-33.9°N, -118.1 to -117.4°W)
  if (lat >= 33.4 && lat <= 33.9 && lng >= -118.1 && lng <= -117.4) {
    return 'orangeCounty'
  }
  
  // Los Angeles County (33.7-34.8°N, -118.9 to -117.6°W)
  if (lat >= 33.7 && lat <= 34.8 && lng >= -118.9 && lng <= -117.6) {
    return 'losAngeles'
  }
  
  // Inland Empire - Riverside & San Bernardino Counties (33.6-34.5°N, -117.7 to -114.6°W)
  if (lat >= 33.6 && lat <= 34.5 && lng >= -117.7 && lng <= -114.6) {
    return 'inlandEmpire'
  }
  
  // San Francisco Bay Area (37.2-38.0°N, -122.6 to -121.6°W)
  if (lat >= 37.2 && lat <= 38.0 && lng >= -122.6 && lng <= -121.6) {
    return 'bayArea'
  }
  
  // Central Valley - Fresno, Bakersfield, Stockton (35.0-38.5°N, -121.5 to -118.5°W)
  if (lat >= 35.0 && lat <= 38.5 && lng >= -121.5 && lng <= -118.5) {
    return 'centralValley'
  }
  
  // Northern California - Sacramento, Redding (38.4-42.0°N, -124.0 to -120.0°W)
  if (lat >= 38.4 && lat <= 42.0 && lng >= -124.0 && lng <= -120.0) {
    return 'northernCalifornia'
  }
  
  // Rest of West Coast (OR, WA, NV)
  if (lng < -114 && lat > 32 && lat < 49) {
    return 'westCoast'
  }
  
  // Northeast (NY, MA, CT, ME, VT, NH, RI, PA, NJ)
  if (lng > -80 && lng < -66 && lat > 38 && lat < 48) {
    return 'northeast'
  }
  
  // Midwest (IL, OH, MI, IN, WI, MN, IA, MO)
  if (lng > -104 && lng < -80 && lat > 36 && lat < 49) {
    return 'midwest'
  }
  
  // South (TX, FL, GA, LA, AL, MS, TN, SC, NC, VA)
  if (lat < 40 && lat > 24) {
    return 'south'
  }
  
  return 'default'
}

/**
 * Find recycling centers near a location using Google Places API
 * @param {number} lat - Latitude of search location
 * @param {number} lng - Longitude of search location
 * @param {number} radiusKm - Search radius in kilometers (default: 10)
 * @param {string} apiKey - Google Places API key
 * @param {string} materialType - Type of material: 'aluminum', 'plastic', 'glass', 'cardboard', 'paper', 'steel', 'copper', or 'all' (default: 'all')
 * @returns {Promise<Array>} Array of recycling centers with details
 */
async function findRecyclingCenters(lat, lng, radiusKm = 10, apiKey, materialType = 'all') {
  if (!apiKey) {
    throw new Error('Google Places API key is required')
  }

  // Determine regional pricing
  const region = getRegion(lat, lng)
  const regionalPrices = REGIONAL_PRICING[region]

  const radiusMeters = radiusKm * 1000
  
  // Build search keyword based on material type
  let keyword = 'recycling+center'
  if (materialType !== 'all') {
    keyword += `+${materialType}`
  }
  
  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${keyword}&type=point_of_interest&key=${apiKey}`

  try {
    // Note: In browser, you'll need to use a CORS proxy or backend to avoid CORS issues
    const response = await fetch(placesUrl)
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API returned status: ${data.status} - ${data.error_message || ''}`)
    }

    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      console.log('No recycling centers found in this area')
      return []
    }

    // Process results
    const centers = data.results.map((place, index) => {
      const distance = calculateDistance(
        lat, 
        lng, 
        place.geometry.location.lat, 
        place.geometry.location.lng
      )

      // Generate prices for all materials or specific material
      const prices = {}
      if (materialType === 'all') {
        // Generate prices for all materials
        Object.keys(regionalPrices).forEach(material => {
          prices[material] = generatePrice(index, regionalPrices[material])
        })
      } else {
        // Generate price for specific material
        prices[materialType] = generatePrice(index, regionalPrices[materialType])
      }

      return {
        // Basic info
        name: place.name,
        address: place.vicinity || place.formatted_address || 'Address not available',
        
        // Location
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        distance: distance, // in kilometers
        region: region,
        
        // Google Places details
        placeId: place.place_id,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        isOpen: place.opening_hours?.open_now !== false,
        types: place.types || [],
        
        // Pricing by material type
        prices: prices,
        acceptsMaterials: materialType === 'all' ? Object.keys(regionalPrices) : [materialType],
        
        // Additional info
        photoReference: place.photos?.[0]?.photo_reference || null,
        icon: place.icon || null
      }
    })

    // Sort by best price for the requested material
    if (materialType !== 'all') {
      centers.sort((a, b) => b.prices[materialType]?.pricePerLb - a.prices[materialType]?.pricePerLb)
    } else {
      // Sort by average price across all materials
      centers.sort((a, b) => {
        const avgA = Object.values(a.prices).reduce((sum, p) => sum + p.pricePerLb, 0) / Object.keys(a.prices).length
        const avgB = Object.values(b.prices).reduce((sum, p) => sum + p.pricePerLb, 0) / Object.keys(b.prices).length
        return avgB - avgA
      })
    }

    return centers

  } catch (error) {
    console.error('Error finding recycling centers:', error)
    throw error
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Generate estimated price for recyclable materials based on regional pricing
 * @param {number} index - Center index for variation
 * @param {Object} materialPricing - Material pricing object with min, max, and crv
 * @returns {Object} Price details including per-pound price and CRV
 */
function generatePrice(index, materialPricing) {
  if (!materialPricing) {
    return { pricePerLb: 0, crv: 0 }
  }
  
  const { min, max, crv } = materialPricing
  
  // Add variation between centers (some pay more than others)
  const variation = Math.sin(index * 0.5) * 0.1
  const randomFactor = Math.random() * 0.1
  const range = max - min
  const basePrice = min + (range * 0.5) // Middle of the range
  
  const pricePerLb = parseFloat(
    Math.max(min, Math.min(max, basePrice + (variation * range) + (randomFactor * range))).toFixed(3)
  )
  
  return {
    pricePerLb: pricePerLb,
    crv: crv, // California Redemption Value (or equivalent deposit)
    displayPrice: `$${pricePerLb}/lb${crv > 0 ? ` + $${crv} CRV` : ''}`
  }
}

/**
 * Calculate estimated value for recyclable materials
 * @param {number} itemCount - Number of items (e.g., cans, bottles)
 * @param {string} materialType - Type of material
 * @param {Object} pricing - Pricing object from generatePrice
 * @param {number} itemsPerPound - How many items per pound (default varies by material)
 * @returns {Object} Value breakdown
 */
function calculateMaterialValue(itemCount, materialType, pricing, itemsPerPound = null) {
  // Default items per pound for common materials
  const defaultItemsPerPound = {
    aluminum: 32,    // Aluminum cans
    plastic: 20,     // Plastic bottles (PET)
    glass: 5,        // Glass bottles
    cardboard: 1,    // Per pound (no item count)
    paper: 1,        // Per pound (no item count)
    steel: 10,       // Steel cans
    copper: 1        // Per pound (no item count)
  }
  
  const itemsPer = itemsPerPound || defaultItemsPerPound[materialType] || 1
  const pounds = itemCount / itemsPer
  const crvValue = pricing.crv ? itemCount * pricing.crv : 0
  const scrapValue = pounds * pricing.pricePerLb
  const totalValue = crvValue + scrapValue
  
  return {
    material: materialType,
    itemCount: itemCount,
    pounds: parseFloat(pounds.toFixed(2)),
    crvValue: parseFloat(crvValue.toFixed(2)),
    scrapValue: parseFloat(scrapValue.toFixed(2)),
    totalValue: parseFloat(totalValue.toFixed(2)),
    pricePerLb: pricing.pricePerLb,
    breakdown: {
      crvPortion: crvValue > 0 ? `$${crvValue.toFixed(2)} (deposit)` : 'N/A',
      scrapPortion: `$${scrapValue.toFixed(2)} (scrap value)`
    }
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findRecyclingCenters,
    calculateDistance,
    calculateMaterialValue,
    generatePrice,
    getRegion,
    REGIONAL_PRICING
  }
}
