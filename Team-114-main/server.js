// Heroku-oriented server variant that proxies Gemini calls through a remote Heroku service
// instead of using a local GEMINI_API_KEY. Mirrors core behavior of server_cloud_test.js
// but swaps direct Gemini model usage for HTTP calls to the Heroku endpoint.

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { hudHomelessData2024, localResources, seasonalPriorities } = require('./bigDataSources');

// Firebase initialization for server-side
const { initializeApp: initializeFirebaseApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const HEROKU_BASE = 'https://create-project-28cd8dec4770.herokuapp.com';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS
const cors = require('cors');
app.use(cors({
  origin: isProduction 
    ? [
        'https://resourcify-63eecee72dbb.herokuapp.com', // Heroku
        'https://resourcify.onrender.com', // Render (update with your actual Render URL)
        process.env.FRONTEND_URL // Allow custom frontend URL from env vars
      ].filter(Boolean) // Remove undefined values
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true
}));

// Static + body parsing
app.use(express.static(path.join(__dirname, 'public')));
if (isProduction) {
  // Configure proper MIME types for static assets
  app.use(express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.jsx')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    }
  }));
}
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve React app for all non-API routes
app.get('/', (req, res) => {
  if (isProduction) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Logging
const morgan = require('morgan');
app.use(morgan('dev'));

// Rate limit
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

// Multer (memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Load Google credentials for Maps API - try environment variables first, then file
let googleCredentials = null;

// First, try to load from environment variables (for production deployment)
if (process.env.maps_api_key || process.env.MAPS_API_KEY) {
  googleCredentials = {
    maps_api_key: process.env.maps_api_key || process.env.MAPS_API_KEY,
    places_api_key: process.env.places_api_key || process.env.PLACES_API_KEY
  };
  console.log('Google credentials loaded from environment variables');
} else {
  // Fallback to JSON file (for local development)
  try {
    const credentialsPath = path.join(__dirname, 'src', 'resourcify-adminapi.json');
    if (fs.existsSync(credentialsPath)) {
      googleCredentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      console.log('Google credentials loaded from JSON file');
    }
  } catch (e) {
    console.warn('Failed to load Google credentials from file:', e.message);
  }
}

if (!googleCredentials?.maps_api_key) {
  console.warn('No Google Maps API key found! Set maps_api_key environment variable or add to resourcify-adminapi.json');
}

// Initialize Firebase for server-side access
let firebaseDb = null;
try {
  const firebaseConfig = {
    apiKey: "AIzaSyBU0jVri8KrtW6650dTkkaIJJEHsdyRdG0",
    authDomain: "resourcerecognition.firebaseapp.com",
    projectId: "resourcerecognition",
    storageBucket: "resourcerecognition.appspot.com",
    messagingSenderId: "12345678901",
    appId: "1:12345678901:web:abcdef123456"
  };
  
  const firebaseApp = initializeFirebaseApp(firebaseConfig);
  firebaseDb = getFirestore(firebaseApp);
  console.log('Firebase initialized for server-side access');
} catch (error) {
  console.warn('Failed to initialize Firebase:', error.message);
}

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mapsAPI: googleCredentials?.maps_api_key ? 'configured' : 'not configured',
    geminiViaHeroku: true,
    herokuBase: HEROKU_BASE,
    mode: 'AI-powered classification (Heroku Gemini)',
    bigDataSources: ['HUD Homeless Data 2024', 'Local Resources DB', 'Seasonal Priorities']
  });
});

// Secure Maps API key endpoint
app.get('/api/maps-config', (req, res) => {
  const apiKey = googleCredentials?.maps_api_key;
  
  if (!apiKey) {
    console.error('Maps API key request failed - no key available');
    return res.status(500).json({ 
      error: 'Maps API key not configured',
      hint: 'Set maps_api_key environment variable or add to resourcify-adminapi.json',
      envCheck: {
        maps_api_key: !!process.env.maps_api_key,
        MAPS_API_KEY: !!process.env.MAPS_API_KEY
      }
    });
  }
  
  console.log('Maps API key provided successfully');
  res.json({
    mapsApiKey: apiKey
  });
});

// Local resources
app.get('/api/local-resources', (req, res) => {
  const location = req.query.location || 'San Diego, CA';
  const resources = localResources[location];
  const homelessStats = hudHomelessData2024[location];
  if (!resources) {
    return res.json({
      error: 'Location not in database yet',
      availableLocations: Object.keys(localResources),
      message: 'Try: San Diego, CA'
    });
  }
  res.json({ location, homelessStats, resources });
});

// Seasonal priorities
app.get('/api/seasonal-priorities', (req, res) => {
  const now = new Date();
  const m = now.getMonth();
  const season = m >= 10 || m <= 2 ? 'winter' : m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : 'fall';
  res.json({ currentSeason: season, priorities: seasonalPriorities[season] });
});

// Google Maps API key endpoint
app.get('/api/maps-key', (req, res) => {
  try {
    const mapsApiKey = googleCredentials?.maps_api_key;
    
    if (mapsApiKey) {
      return res.json({ key: mapsApiKey });
    }
    
    res.status(404).json({ 
      error: 'Google Maps API key not configured',
      message: 'Add maps_api_key to src/resourcify-adminapi.json'
    });
  } catch (error) {
    console.error('Error serving Maps API key:', error);
    res.status(500).json({ error: 'Failed to get Maps API key' });
  }
});

// Google Places API key endpoint
app.get('/api/places-key', (req, res) => {
  try {
    const placesApiKey = googleCredentials?.places_api_key;
    
    if (placesApiKey) {
      return res.json({ key: placesApiKey });
    }
    
    res.status(404).json({ 
      error: 'Google Places API key not configured',
      message: 'Add places_api_key to src/resourcify-adminapi.json'
    });
  } catch (error) {
    console.error('Error serving Places API key:', error);
    res.status(500).json({ error: 'Failed to get Places API key' });
  }
});

// General Places API search endpoint - using NEW Places API
app.post('/api/places/search', async (req, res) => {
  try {
    const { lat, lng, radius, types, maxResults = 20 } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const placesApiKey = googleCredentials?.places_api_key;
    
    if (!placesApiKey) {
      return res.status(500).json({ error: 'Places API key not configured' });
    }

    const radiusMeters = radius ? parseFloat(radius) * 1000 : 10000; // Default 10km
    // Use new Places API supported types
    const includedTypes = types || ["grocery_store", "supermarket", "pharmacy", "clothing_store", "department_store"];

    // Validate maxResults (must be between 1-20)
    const validMaxResults = Math.min(20, Math.max(1, maxResults));

    console.log(`Searching for places near ${lat}, ${lng} within ${radiusMeters}m, types: ${includedTypes.join(', ')}`);

    // Use NEW Google Places API
    const placesUrl = `https://places.googleapis.com/v1/places:searchNearby`;
    
    const requestBody = {
      includedTypes: includedTypes,
      maxResultCount: validMaxResults,
      locationRestriction: {
        circle: {
          center: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
          },
          radius: radiusMeters
        }
      }
    };

    const response = await fetch(placesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': placesApiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.businessStatus,places.priceLevel'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Places API error: ${response.status} - ${errorText}`);
      return res.status(500).json({ error: `Places API error: ${response.status}` });
    }
    
    const data = await response.json();
    
    // Check if we have results
    if (!data.places || data.places.length === 0) {
      console.log('No places found in the area');
      return res.json({
        count: 0,
        places: [],
        searchRadius: radiusMeters / 1000,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) }
      });
    }

    // Calculate distance for each place
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const places = data.places.map(place => {
      const distance = calculateDistance(
        parseFloat(lat), 
        parseFloat(lng), 
        place.location.latitude, 
        place.location.longitude
      );

      return {
        id: place.id,
        name: place.displayName?.text || 'Store',
        address: place.formattedAddress || 'Address not available',
        lat: place.location.latitude,
        lng: place.location.longitude,
        distance: distance,
        rating: place.rating || 0,
        userRatingsTotal: place.userRatingCount || 0,
        isOpen: place.businessStatus !== 'CLOSED_PERMANENTLY',
        types: place.types || [],
        priceLevel: place.priceLevel || 2
      };
    });

    // Sort by distance
    places.sort((a, b) => a.distance - b.distance);

    console.log(`Found ${places.length} places`);

    res.json({
      count: places.length,
      places: places,
      searchRadius: radiusMeters / 1000,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });

  } catch (error) {
    console.error('Places search API error:', error);
    res.status(500).json({ 
      error: 'Failed to search for places', 
      details: error.message 
    });
  }
});

// Weather API endpoint - using Open-Meteo (free, no API key needed)
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Open-Meteo API - free weather data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&timezone=auto`;
    
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    const current = data.current;
    
    // Weather code interpretation
    const weatherCodes = {
      0: 'Clear',
      1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Foggy',
      51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
      61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
      71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
      85: 'Light Snow Showers', 86: 'Snow Showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Severe Thunderstorm'
    };
    
    res.json({
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      windSpeed: Math.round(current.wind_speed_10m),
      condition: weatherCodes[current.weather_code] || 'Unknown',
      weatherCode: current.weather_code,
      timestamp: current.time
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
  }
});

// Recycling Centers API endpoint - finds nearby recycling centers using Google Places
app.get('/api/recycling-centers', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const radiusMeters = radius ? parseFloat(radius) * 1000 : 10000; // Default 10km
    const placesApiKey = googleCredentials?.places_api_key;
    
    if (!placesApiKey) {
      return res.status(500).json({ error: 'Places API key not configured' });
    }

    console.log(`Searching for recycling centers near ${lat}, ${lng} within ${radiusMeters}m`);

    // Search for recycling centers using NEW Google Places API with supported types
    const placesUrl = `https://places.googleapis.com/v1/places:searchNearby`;
    
    const requestBody = {
      includedTypes: ["establishment"],  // Use generic type and filter with text search
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
          },
          radius: radiusMeters
        }
      }
    };

    // Add text search for recycling-related terms
    const textSearchBody = {
      textQuery: "recycling center for cash",
      maxResultCount: 15,
      locationBias: {
        circle: {
          center: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
          },
          radius: radiusMeters
        }
      }
    };

    // Try text search first for better recycling center results
    let response;
    try {
      const textSearchUrl = `https://places.googleapis.com/v1/places:searchText`;
      response = await fetch(textSearchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': placesApiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.businessStatus'
        },
        body: JSON.stringify(textSearchBody)
      });
    } catch (textSearchError) {
      console.log('Text search failed, falling back to nearby search');
      // Fallback to nearby search
      response = await fetch(placesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': placesApiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.businessStatus'
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Places API error: ${response.status} - ${errorText}`);
      throw new Error(`Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have results (new Places API doesn't use status field)
    if (!data.places) {
      console.log('No recycling centers found in the area');
      return res.json({
        count: 0,
        centers: [],
        searchRadius: radiusMeters / 1000,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) }
      });
    }

    // Calculate distance for each place
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Generate price variations (in production, you'd get this from a database)
    const generatePrice = (index, basePrice = 1.60) => {
      // Vary prices slightly for each center (between $1.50-$1.70/lb)
      const variation = (Math.sin(index * 0.5) * 0.1) + (Math.random() * 0.05);
      return Math.max(1.50, Math.min(1.70, basePrice + variation));
    };

    const centers = data.places.map((place, index) => {
      const distance = calculateDistance(
        parseFloat(lat), 
        parseFloat(lng), 
        place.location.latitude, 
        place.location.longitude
      );

      return {
        name: place.displayName?.text || 'Recycling Center',
        address: place.formattedAddress || 'Address not available',
        lat: place.location.latitude,
        lng: place.location.longitude,
        placeId: place.id,
        distance: distance,
        rating: place.rating || 0,
        userRatingsTotal: place.userRatingCount || 0,
        pricePerLb: generatePrice(index),
        acceptsAluminum: true,
        isOpen: place.businessStatus !== 'CLOSED_PERMANENTLY',
        types: place.types || []
      };
    });

    // Sort by price (highest first)
    centers.sort((a, b) => b.pricePerLb - a.pricePerLb);

    console.log(`Found ${centers.length} recycling centers`);

    res.json({
      count: centers.length,
      centers: centers,
      searchRadius: radiusMeters / 1000,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });

  } catch (error) {
    console.error('Recycling centers API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recycling centers', 
      details: error.message 
    });
  }
});

// Helper: Generate suggestions based on categorized items, budget, and weather


/**
 * Sends a request to the Heroku-hosted Gemini AI service for text and image analysis
 * @param {string} prompt - The text prompt to send to the AI
 * @param {string} imageBase64 - Base64 encoded image data (optional)
 * @param {string} mimeType - MIME type of the image (optional)
 * @return {Promise<string>} The AI response text
 */
async function herokuGemini(prompt, imageBase64, mimeType) {
  // Heroku Flask service exposes POST /chat accepting { prompt, image? }
  const url = `${HEROKU_BASE.replace(/\/$/, '')}/chat`;
  const body = { prompt };
  if (imageBase64 && mimeType) {
    // Send image as base64 data and mime type for Gemini 2.5 Flash vision
    body.image = { data: imageBase64, mimeType };
  }
  
  console.log('Sending request to Heroku Gemini:', {
    url,
    promptLength: prompt.length,
    hasImage: !!imageBase64,
    mimeType
  });
  
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  console.log('Heroku response status:', resp.status);
  
  if (!resp.ok) {
    const txt = await resp.text();
    console.error('Heroku error response:', txt);
    throw new Error(`Heroku Gemini proxy error ${resp.status}: ${txt}`);
  }
  
  const data = await resp.json();
  console.log('Heroku success response received, length:', JSON.stringify(data).length);
  // Heroku returns { response: "..." }
  return data.response || data.text || JSON.stringify(data);
}



// Analyze image (Vision + Heroku Gemini)
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'File must be an image' });
    
    // Check file size limit for Gemini API (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image file too large. Please use images under 5MB.' });
    }

    const budget = req.body.budget ? parseFloat(req.body.budget) : 0;
    if (isNaN(budget) || budget < 0) return res.status(400).json({ error: 'Invalid budget value' });

    // Parse benefit programs
    let benefitPrograms = {};
    try {
      benefitPrograms = req.body.benefitPrograms ? JSON.parse(req.body.benefitPrograms) : {};
    } catch (e) {
      console.warn('Failed to parse benefit programs:', e);
      benefitPrograms = {};
    }

    // Get location data if provided
    const lat = req.body.lat ? parseFloat(req.body.lat) : null;
    const lng = req.body.lng ? parseFloat(req.body.lng) : null;

    console.log(`[${new Date().toISOString()}] Analyzing image: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    if (lat && lng) {
      console.log(`Location: ${lat}, ${lng}`);
    }
    console.log('Using Gemini via Heroku for complete image analysis...');

    // Fetch weather data if location provided - GET WEEKLY FORECAST
    let weatherData = null;
    if (lat && lng) {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`;
        const weatherResponse = await fetch(weatherUrl);
        if (weatherResponse.ok) {
          const data = await weatherResponse.json();
          const current = data.current;
          const daily = data.daily;
          
          const weatherCodes = {
            0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
            45: 'Foggy', 48: 'Foggy',
            51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
            61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
            71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
            80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
            95: 'Thunderstorm'
          };
          
          // Calculate weekly temperature ranges and conditions
          const weeklyHighs = daily.temperature_2m_max.slice(0, 7);
          const weeklyLows = daily.temperature_2m_min.slice(0, 7);
          const weeklyPrecip = daily.precipitation_sum.slice(0, 7);
          
          const minTemp = Math.min(...weeklyLows);
          const maxTemp = Math.max(...weeklyHighs);
          const avgLow = Math.round(weeklyLows.reduce((a, b) => a + b, 0) / 7);
          const avgHigh = Math.round(weeklyHighs.reduce((a, b) => a + b, 0) / 7);
          const totalPrecip = weeklyPrecip.reduce((a, b) => a + b, 0);
          const rainyDays = weeklyPrecip.filter(p => p > 0).length;
          
          weatherData = {
            temperature: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            precipitation: current.precipitation,
            windSpeed: Math.round(current.wind_speed_10m),
            condition: weatherCodes[current.weather_code] || 'Unknown',
            weatherCode: current.weather_code,
            timestamp: current.time,
            // Weekly forecast data
            weeklyForecast: {
              minTemp,
              maxTemp,
              avgLow,
              avgHigh,
              totalPrecip,
              rainyDays,
              tempRange: maxTemp - minTemp
            }
          };
          console.log(`Weather: ${weatherData.condition}, ${weatherData.temperature}°F (feels like ${weatherData.feelsLike}°F)`);
          console.log(`Weekly forecast: Lows ${minTemp}-${avgLow}°F, Highs ${avgHigh}-${maxTemp}°F, ${rainyDays} rainy days`);
        }
      } catch (weatherError) {
        console.warn('Failed to fetch weather data:', weatherError.message);
      }
    }

    const imageBase64 = req.file.buffer.toString('base64');

    /**
     * Generate comprehensive analysis using Heroku Gemini service
     * @param {string} imageBase64 - Base64 encoded image data
     * @param {number} budget - User's budget amount
     * @param {number|null} lat - User's latitude
     * @param {number|null} lng - User's longitude
     * @param {Object|null} weatherData - Weather information
     * @returns {Object} Complete analysis with items, categories, and budget recommendations
     */
    let geminiResponse;
    try {
      const locationInfo = lat && lng ? 
        `User's location: ${lat}, ${lng} (use local area pricing)` : 
        'Location not provided (use San Diego, CA area pricing as default)';

      const weatherInfo = weatherData ? 
        `Weather: ${weatherData.condition}, ${weatherData.temperature}°F (feels like ${weatherData.feelsLike}°F). Weekly: ${weatherData.weeklyForecast?.minTemp}-${weatherData.weeklyForecast?.maxTemp}°F range, ${weatherData.weeklyForecast?.rainyDays} rainy days.` : 
        'No weather data available';

      // Create benefit programs info
      const activeBenefits = Object.entries(benefitPrograms).filter(([_, active]) => active).map(([program]) => program.toUpperCase());
      const benefitInfo = activeBenefits.length > 0 ? 
        `User has access to: ${activeBenefits.join(', ')}. ${activeBenefits.includes('SNAP') || activeBenefits.includes('WIC') ? 'DO NOT include food in budget recommendations - tell user to "Use SNAP/WIC for food" instead.' : ''} ${activeBenefits.includes('MEDICAID') ? 'DO NOT include medical items in budget - tell user to "Use Medicaid for medical needs".' : ''}` :
        'No benefit programs available - include all necessities in budget.';

      const comprehensivePrompt = `Analyze this image carefully and return ONLY valid JSON in this exact format:
{
  "detectedItems": [{"name": "specific item name", "category": "food", "confidence": 0.95}],
  "categorizedItems": {
    "food": ["milk", "eggs", "bread"],
    "clothing": ["jacket", "shoes"],
    "shelter": ["blanket", "tarp"],
    "hygiene": ["soap", "toothbrush"],
    "tools": ["flashlight", "knife"],
    "safety": ["first aid kit"],
    "misc": ["other items"]
  },
  "categoryReadiness": {
    "food": {"percentage": 75, "description": "Well-stocked with dairy, proteins, and canned goods"},
    "clothing": {"percentage": 40, "description": "Basic clothing but missing warm weather gear"},
    "shelter": {"percentage": 60, "description": "Basic shelter items present"},
    "hygiene": {"percentage": 20, "description": "Limited hygiene supplies"},
    "tools": {"percentage": 80, "description": "Good selection of basic tools"},
    "safety": {"percentage": 30, "description": "Missing first aid and emergency gear"},
    "water": {"percentage": 10, "description": "Need water storage"}
  },
  "survivalAnalysis": [{"title": "Quick Assessment", "description": "Overall readiness summary", "priority": "high"}],
  "budgetRecommendations": [{"item": "Item Name", "quantity": 2, "pricePerUnit": 10.00, "totalPrice": 20.00, "description": "Why this is needed based on what's MISSING", "priority": "high"}],
  "budgetBreakdown": {"totalSpent": ${budget}, "remainingBudget": 0, "itemCount": 4}
}

CRITICAL INSTRUCTIONS:

1. DETECT & CATEGORIZE EVERYTHING YOU SEE:
   - Look at EVERY item in the image carefully
   - For each item, add it to "detectedItems" array with specific name
   - MUST categorize each item into the correct category
   - Use these categories ONLY: food, clothing, shelter, hygiene, tools, safety, misc
   - Add the item name to the corresponding array in "categorizedItems"
   - Example: If you see milk, add to both detectedItems AND categorizedItems.food array

2. CATEGORY READINESS - BE HONEST:
   - If refrigerator is FULL of food → food percentage should be 80-100%
   - If you see lots of items in a category → percentage should be high (70-100%)
   - If category is missing or sparse → percentage should be low (0-30%)
   - Description must match the percentage and what you actually see

3. BUDGET RECOMMENDATIONS - ONLY RECOMMEND WHAT'S MISSING:
   - Budget available: $${budget}
   - DO NOT recommend items they already have
   - If food percentage is >70%, DON'T recommend more food
   - Focus recommendations on LOW percentage categories
   - Use realistic 2024 prices for ${locationInfo.includes('San Diego') ? 'San Diego' : 'local area'}
   - If they have most things, recommend upgrades or emergency supplies
   - Use the FULL budget on items they actually need

4. BE CONSISTENT:
   - If you say "refrigerator is well-stocked", food percentage MUST be >70%
   - If food percentage is high, DON'T recommend buying more food
   - Match your descriptions, percentages, and recommendations

${benefitInfo}
${locationInfo}
${weatherInfo}

Return ONLY the JSON object, no other text.`;

      let raw;
      try {
        raw = await herokuGemini(comprehensivePrompt, imageBase64, req.file.mimetype);
        console.log('Gemini comprehensive response received, length:', raw.length);
      } catch (comprehensiveError) {
        console.warn('Comprehensive analysis failed, trying simple analysis:', comprehensiveError.message);
        
        try {
          // Fallback to simple analysis with basic budget recommendations
          const simplePrompt = `Analyze this image and return JSON:
{
  "detectedItems": [{"name": "item name", "category": "clothing", "confidence": 0.8}],
  "survivalAnalysis": [{"title": "Basic Assessment", "description": "You have some supplies but need essentials for better preparedness", "priority": "medium"}],
  "budgetRecommendations": [{"item": "Essential Item", "quantity": 1, "pricePerUnit": 20.00, "totalPrice": 20.00, "description": "Critical for survival", "priority": "high"}],
  "budgetBreakdown": {"totalSpent": ${budget}, "remainingBudget": 0, "itemCount": 3}
}
Budget: $${budget} - create realistic recommendations to use the full amount.`;
          raw = await herokuGemini(simplePrompt, imageBase64, req.file.mimetype);
          console.log('Simple analysis response received, length:', raw.length);
        } catch (simpleError) {
          console.error('Both comprehensive and simple analysis failed:', simpleError.message);
          throw simpleError;
        }
      }
      
      // Parse JSON response from Gemini
      try {
        let jsonStr = raw.replace(/```json|```/g, '').trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        geminiResponse = JSON.parse(jsonStr);
        console.log('Successfully parsed comprehensive Gemini response');
        
        // Log summary of what was received
        console.log(`- Detected items: ${geminiResponse.detectedItems?.length || 0}`);
        console.log(`- Budget recommendations: ${geminiResponse.budgetRecommendations?.length || 0}`);
        console.log(`- Total budget used: $${geminiResponse.budgetBreakdown?.totalSpent || 0}`);
        
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON response:', parseErr.message);
        console.log('Raw response (first 500 chars):', raw.substring(0, 500));
        throw new Error('AI analysis failed - invalid response format');
      }
    } catch (e) {
      console.error('Gemini analysis failed:', e.message);
      return res.status(500).json({ error: 'AI analysis failed' });
    }

    // Validate and fix the response structure
    if (!geminiResponse.detectedItems) {
      console.warn('No detectedItems in response, creating fallback structure');
      geminiResponse.detectedItems = [];
    }
    
    if (!geminiResponse.categorizedItems) {
      geminiResponse.categorizedItems = {
        food: [], clothing: [], shelter: [], hygiene: [], tools: [], safety: [], misc: []
      };
    }
    
    if (!geminiResponse.survivalAnalysis) {
      geminiResponse.survivalAnalysis = [{
        title: 'Analysis Complete',
        description: 'Items detected and categorized successfully',
        priority: 'medium'
      }];
    }
    
    if (!geminiResponse.budgetRecommendations) {
      geminiResponse.budgetRecommendations = [];
    }
    
    // Generate fallback budget recommendations if none provided and budget > 0
    if (geminiResponse.budgetRecommendations.length === 0 && budget > 0) {
      const fallbackRecommendations = [
        { item: 'Emergency Water', quantity: 3, pricePerUnit: Math.min(5.00, budget * 0.3), totalPrice: Math.min(15.00, budget * 0.3), description: 'Essential hydration supply', priority: 'high' },
        { item: 'Non-perishable Food', quantity: 2, pricePerUnit: Math.min(8.00, budget * 0.25), totalPrice: Math.min(16.00, budget * 0.25), description: 'Survival nutrition', priority: 'high' },
        { item: 'First Aid Kit', quantity: 1, pricePerUnit: Math.min(20.00, budget * 0.2), totalPrice: Math.min(20.00, budget * 0.2), description: 'Medical emergency supplies', priority: 'medium' },
        { item: 'Emergency Blanket', quantity: 1, pricePerUnit: Math.min(10.00, budget * 0.15), totalPrice: Math.min(10.00, budget * 0.15), description: 'Thermal protection', priority: 'medium' }
      ];
      
      let remainingBudget = budget;
      geminiResponse.budgetRecommendations = fallbackRecommendations.filter(rec => {
        if (remainingBudget >= rec.totalPrice) {
          remainingBudget -= rec.totalPrice;
          return true;
        }
        return false;
      });
      
      geminiResponse.budgetBreakdown = {
        totalSpent: budget - remainingBudget,
        remainingBudget: remainingBudget,
        itemCount: geminiResponse.budgetRecommendations.length
      };
    }
    
    if (!geminiResponse.budgetBreakdown) {
      geminiResponse.budgetBreakdown = {
        totalSpent: 0,
        remainingBudget: budget,
        itemCount: 0
      };
    }

    // Transform the comprehensive response into the expected format
    const categorizedItems = geminiResponse.categorizedItems || {
      food: [], clothing: [], shelter: [], hygiene: [], tools: [], safety: [], misc: []
    };

    // Format suggestions to match frontend expectations
    const generalSuggestions = [];
    const budgetRecommendations = [];
    
    // Add survival analysis as general suggestions
    if (geminiResponse.survivalAnalysis && geminiResponse.survivalAnalysis.length > 0) {
      generalSuggestions.push(...geminiResponse.survivalAnalysis.map(analysis => ({
        title: analysis.title,
        description: analysis.description,
        priority: analysis.priority || 'medium'
      })));
    }

    // Format budget recommendations for frontend
    if (geminiResponse.budgetRecommendations && geminiResponse.budgetRecommendations.length > 0) {
      budgetRecommendations.push(...geminiResponse.budgetRecommendations.map(rec => {
        const pricePerUnit = Number(rec.pricePerUnit) || 0;
        const totalPrice = Number(rec.totalPrice) || 0;
        return {
          item: `${rec.item} x ${rec.quantity}`,
          price: totalPrice,
          description: `$${pricePerUnit.toFixed(2)} each = $${totalPrice.toFixed(2)} - ${rec.description}`
        };
      }));
    }

    // Add budget breakdown summary as a general suggestion
    if (geminiResponse.budgetBreakdown) {
      const breakdown = geminiResponse.budgetBreakdown;
      const totalSpent = Number(breakdown.totalSpent) || 0;
      generalSuggestions.push({
        title: 'Budget Analysis Complete',
        description: `Spent $${totalSpent.toFixed(2)} of $${budget} on ${breakdown.itemCount || 0} recommended items`,
        priority: 'high'
      });
    }

    const suggestions = {
      general: generalSuggestions,
      budgetRecommendations: budgetRecommendations
    };

    console.log(`Comprehensive analysis complete:
    - Detected items: ${geminiResponse.detectedItems.length}
    - Budget recommendations: ${geminiResponse.budgetRecommendations.length}
    - Total spent: $${geminiResponse.budgetBreakdown?.totalSpent || 0}
    - Survival priorities: ${geminiResponse.survivalAnalysis.length}`);

    res.json({
      categorized: categorizedItems,
      items: geminiResponse.detectedItems || [],
      suggestions: suggestions,
      budget: budget,
      weather: weatherData,
      budgetBreakdown: geminiResponse.budgetBreakdown,
      classificationMethod: 'Comprehensive AI Analysis'
    });
  } catch (err) {
    console.error('Analyze error (heroku server):', err);
    res.status(500).json({ error: 'Failed to analyze image', details: err.message });
  }
});

// Analyze recyclables for multi-material detection (CashForCans feature)
app.post('/api/analyze-recyclables', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    console.log(`[${new Date().toISOString()}] Analyzing recyclables image via Gemini AI...`);
    
    // Extract base64 data from data URL if needed
    let imageBase64 = image;
    if (image.startsWith('data:')) {
      const base64Match = image.match(/^data:image\/[a-z]+;base64,(.+)$/);
      if (base64Match) {
        imageBase64 = base64Match[1];
      }
    }
    
    // Create prompt for multi-material recyclable detection
    const prompt = `You are an expert recyclable materials identifier. Analyze this image and identify all recyclable materials visible.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no extra text.

Identify and count these material types:
1. **aluminum** - Aluminum cans (count individual cans)
2. **plastic** - Plastic bottles (count individual bottles)
3. **glass** - Glass bottles/jars (count individual items)
4. **cardboard** - Cardboard boxes/packaging (estimate total weight in pounds)
5. **paper** - Paper/newspaper (estimate total weight in pounds)
6. **steel** - Steel/tin cans (count individual cans)
7. **copper** - Copper wire/pipes (estimate total weight in pounds)

Count accurately:
- For cans/bottles: Count each visible item
- For bulk materials (cardboard/paper/copper): Estimate weight in pounds
- Be conservative with counts - only count clearly visible items
- If unsure about a material, don't include it
- If no recyclables are visible, return empty array

Return JSON in this EXACT format:
{
  "detected": [
    {"type": "aluminum", "count": 50},
    {"type": "plastic", "count": 30}
  ]
}

Material type must be one of: aluminum, plastic, glass, cardboard, paper, steel, copper
Count must be a positive integer.`;

    try {
      const raw = await herokuGemini(prompt, imageBase64, mimeType || 'image/jpeg');
      console.log('Gemini recyclables analysis response received, length:', raw.length);
      
      // Parse JSON response
      let jsonStr = raw.replace(/```json|```/g, '').trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const response = JSON.parse(jsonStr);
      
      // Validate response structure
      if (!response.detected || !Array.isArray(response.detected)) {
        console.warn('Invalid response structure, returning empty detection');
        return res.json({ detected: [] });
      }
      
      // Validate each detection
      const validMaterials = ['aluminum', 'plastic', 'glass', 'cardboard', 'paper', 'steel', 'copper'];
      const validDetections = response.detected.filter(item => {
        const isValid = item.type && 
                       validMaterials.includes(item.type) && 
                       typeof item.count === 'number' && 
                       item.count > 0;
        if (!isValid) {
          console.warn('Invalid detection item:', item);
        }
        return isValid;
      });
      
      console.log(`Recyclables detected: ${validDetections.length} material types`);
      validDetections.forEach(item => {
        console.log(`  - ${item.type}: ${item.count}`);
      });
      
      res.json({ detected: validDetections });
      
    } catch (aiError) {
      console.error('AI analysis failed:', aiError.message);
      // Return empty detection on AI failure to allow fallback
      res.json({ detected: [], error: 'AI analysis failed, using estimation mode' });
    }
    
  } catch (err) {
    console.error('Recyclables analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze recyclables', details: err.message });
  }
});

// Generic alerts endpoint - fetch from Firebase with time filtering
app.get('/api/alerts/:alertType', async (req, res) => {
  try {
    const { alertType } = req.params;
    const city = req.query.city || 'unknown';
    const timeFilterMinutes = parseInt(req.query.timeFilter) || 1440; // Default 24 hours
    
    if (!firebaseDb) {
      console.log('Firebase not initialized, returning empty alerts');
      return res.json([]);
    }
    
    console.log(`Fetching ${alertType} alerts for city: ${city}, time filter: ${timeFilterMinutes} minutes`);
    
    // Map alert types to Firebase collection paths
    const alertTypeMap = {
      'police': 'police_activity',
      'fire': 'fire_emergency', 
      'medical': 'medical_emergency',
      'accident': 'traffic_accident'
    };
    
    const collectionPath = alertTypeMap[alertType];
    if (!collectionPath) {
      return res.status(400).json({ error: 'Invalid alert type' });
    }
    
    // Fetch documents from alerts/{alertType}/{city} collection
    const alertsCollectionRef = collection(firebaseDb, 'alerts', collectionPath, city);
    const snapshot = await getDocs(alertsCollectionRef);
    
    const currentTime = new Date();
    const timeThreshold = new Date(currentTime.getTime() - (timeFilterMinutes * 60 * 1000));
    
    const alerts = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.location && data.location.latitude && data.location.longitude) {
        const alertTime = data.timestamp?.toDate?.() || new Date(data.timeUTC || currentTime);
        
        // Apply time filter
        if (alertTime >= timeThreshold) {
          alerts.push({
            id: doc.id,
            type: alertType,
            location: {
              latitude: data.location.latitude,
              longitude: data.location.longitude
            },
            timestamp: alertTime.toISOString(),
            cityData: data.cityData || { name: city },
            description: data.description || `${alertType} alert`
          });
        }
      }
    });
    
    console.log(`Fetched ${alerts.length} ${alertType} alerts for ${city} (filtered by ${timeFilterMinutes} minutes)`);
    res.json(alerts);
    
  } catch (error) {
    console.error(`Error fetching ${req.params.alertType} alerts:`, error);
    // Return empty array on error instead of 500 to allow graceful fallback
    res.json([]);
  }
});

// Safe locations endpoint - fetch from Firebase
app.get('/api/safe-locations', async (req, res) => {
  try {
    const city = req.query.city || 'unknown';
    
    if (!firebaseDb) {
      console.log('Firebase not initialized, returning empty safe locations');
      return res.json([]);
    }
    
    console.log('Fetching safe locations for city:', city);
    
    // Fetch documents from safe_locations/{city} collection
    const locationsCollectionRef = collection(firebaseDb, 'safe_locations', city);
    const snapshot = await getDocs(locationsCollectionRef);
    
    const locations = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.location && data.location.latitude && data.location.longitude) {
        locations.push({
          id: doc.id,
          location: {
            latitude: data.location.latitude,
            longitude: data.location.longitude
          },
          name: data.name || 'Safe Location',
          type: data.type || 'general',
          description: data.description || 'Verified safe location',
          cityData: data.cityData || { name: city },
          verified: data.verified || false
        });
      }
    });
    
    console.log(`Fetched ${locations.length} safe locations for ${city}`);
    res.json(locations);
    
  } catch (error) {
    console.error('Error fetching safe locations:', error);
    // Return empty array on error instead of 500 to allow graceful fallback
    res.json([]);
  }
});

// Legacy police reports endpoint - maintained for backward compatibility
app.get('/api/police-reports', async (req, res) => {
  try {
    const city = req.query.city || 'unknown';
    const timeFilterMinutes = parseInt(req.query.timeFilter) || 1440;
    
    if (!firebaseDb) {
      console.log('Firebase not initialized, returning empty police reports');
      return res.json([]);
    }
    
    console.log('Fetching police reports for city:', city);
    
    // Fetch documents from alerts/police_activity/{city} collection
    const reportsCollectionRef = collection(firebaseDb, 'alerts', 'police_activity', city);
    const snapshot = await getDocs(reportsCollectionRef);
    
    const currentTime = new Date();
    const timeThreshold = new Date(currentTime.getTime() - (timeFilterMinutes * 60 * 1000));
    
    const reports = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.location && data.location.latitude && data.location.longitude) {
        const reportTime = data.timestamp?.toDate?.() || new Date(data.timeUTC || currentTime);
        
        // Apply time filter
        if (reportTime >= timeThreshold) {
          reports.push({
            id: doc.id,
            location: {
              latitude: data.location.latitude,
              longitude: data.location.longitude
            },
            timestamp: reportTime.toISOString(),
            cityData: data.cityData || { name: city }
          });
        }
      }
    });
    
    console.log(`Fetched ${reports.length} police reports for ${city} (filtered by ${timeFilterMinutes} minutes)`);
    res.json(reports);
    
  } catch (error) {
    console.error('Error fetching police reports:', error);
    // Return empty array on error instead of 500 to allow graceful fallback
    res.json([]);
  }
});

// Catch-all handler: send back React app for any non-API requests
app.get('*', (req, res) => {
  try {
    if (isProduction) {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      // Ensure proper MIME type for HTML
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(indexPath);
    } else {
      const indexPath = path.join(__dirname, 'index.html');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(indexPath);
    }
  } catch (err) {
    console.error('Error serving index.html:', err);
    res.status(500).send('Server Error');
  }
});

// Generic error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large' });
  }
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log('===================================');
  console.log(`Heroku Gemini proxy server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Using remote Gemini host: ${HEROKU_BASE}`);
  console.log('===================================');
});
