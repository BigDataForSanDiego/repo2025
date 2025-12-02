import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import proj4 from 'proj4';
import Papa from 'papaparse';
import { parsePITCData, aggregateByZipcode, createZipcodeFeatureCollection } from '../../utils/pitcDataProcessor';

// Define coordinate systems
proj4.defs('EPSG:2230', '+proj=lcc +lat_1=33.88333333333333 +lat_2=32.78333333333333 +lat_0=32.16666666666666 +lon_0=-116.25 +x_0=2000000 +y_0=500000 +ellps=GRS80 +datum=NAD83 +units=ft +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

// Transform function from EPSG:2230 to EPSG:4326
function transformCoordinates(coord: [number, number]): [number, number] {
  const [x, y] = coord;
  const [lng, lat] = proj4('EPSG:2230', 'EPSG:4326', [x, y]);
  return [lng, lat];
}

interface DataPoint {
  lat: number;
  lng: number;
  count: number;
  type: 'point-in-time' | 'get-it-done';
  prediction?: number;
  dateRequested?: string;
  description?: string;
}

interface HomelessService {
  id: string;
  organization: string;
  service_name: string;
  address: string;
  latitude: number;
  longitude: number;
  main_phone?: string;
  website?: string;
  areas_of_focus: string[];
  description: string;
  eligibility?: string;
  capacity_limitations?: string;
  serviceType: 'shelter' | 'food' | 'health' | 'employment' | 'education' | 'other';
}

interface APIResponse {
  data: DataPoint[];
  zipcodeGeoJSON?: GeoJSON.FeatureCollection;
  transitRoutesGeoJSON?: GeoJSON.FeatureCollection;
  transitStopsGeoJSON?: GeoJSON.FeatureCollection;
  homelessServices?: HomelessService[];
  year?: number;
}

// Simple in-memory cache for processed CSV data
interface CacheEntry {
  data: Map<string, DataPoint[]>; // month -> data points
  timestamp: number;
}

const csvDataCache = new Map<number, CacheEntry>(); // year -> cache entry
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData(year: number, month: string): DataPoint[] | null {
  const cacheEntry = csvDataCache.get(year);
  if (!cacheEntry) return null;
  
  // Check if cache is still valid
  if (Date.now() - cacheEntry.timestamp > CACHE_DURATION) {
    csvDataCache.delete(year);
    return null;
  }
  
  return cacheEntry.data.get(month) || null;
}

function setCachedData(year: number, month: string, data: DataPoint[]) {
  let cacheEntry = csvDataCache.get(year);
  if (!cacheEntry) {
    cacheEntry = {
      data: new Map(),
      timestamp: Date.now()
    };
    csvDataCache.set(year, cacheEntry);
  }
  
  cacheEntry.data.set(month, data);
  console.log(`Cached ${data.length} data points for ${month}`);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get('month') || '2024-01';
  const year = parseInt(month.substring(0, 4)) || 2024;

  try {
    // Primary data source: Point-in-time counts (for zipcode choropleth)
    const pitData = await fetchPointInTimeData();
    
    // Secondary data source: Get-It-Done reports (for individual dots)
    const getItDoneData = await fetchGetItDoneData(month);
    
    // Load and process PITC data for zipcode coloring
    const zipcodeGeoJSON = await loadZipcodeGeoJSON(year);
    
    // Load transit data and homeless services
    const [transitRoutesGeoJSON, transitStopsGeoJSON, homelessServices] = await Promise.all([
      loadTransitRoutes(),
      loadTransitStops(),
      loadHomelessServices()
    ]);
    
    // Merge and process data
    const processedData = mergeDataSources(pitData, getItDoneData);
    
    const response: APIResponse = {
      data: processedData,
      zipcodeGeoJSON,
      transitRoutesGeoJSON,
      transitStopsGeoJSON,
      homelessServices,
      year
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

async function fetchPointInTimeData() {
  try {
    // Load Point-in-Time Count data from local CSV file
    const csvPath = path.join(process.cwd(), 'public/data/AllYears_PITC_hackathon.csv');
    const csvText = await fs.readFile(csvPath, 'utf-8');
    console.log('Loaded Point-in-Time Count data from AllYears_PITC_hackathon.csv');
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading Point-in-Time Count data:', error);
    return []; // Return empty array if file can't be loaded
  }
}

async function fetchGetItDoneData(month: string) {
  const year = parseInt(month.substring(0, 4));
  
  // Check cache first
  const cachedData = getCachedData(year, month);
  if (cachedData) {
    console.log(`Cache hit: Using cached data for ${month} (${cachedData.length} points)`);
    return cachedData;
  }
  
  // Use real data for years 2023, 2024, and 2025
  if (year >= 2023 && year <= 2025) {
    try {
      console.log(`Loading real ${year} Get-It-Done data for ${month}`);
      let csvFileName = '';
      
      // Select appropriate CSV file based on year
      if (year === 2025) {
        csvFileName = 'git-2025.csv';
      } else if (year === 2024) {
        csvFileName = 'git-2024.csv';
      } else if (year === 2023) {
        csvFileName = 'git-2023.csv';
      }
      
      const csvPath = path.join(process.cwd(), 'public/data', csvFileName);
      const csvText = await fs.readFile(csvPath, 'utf-8');
      const realData = parseRealGetItDoneData(csvText, month);
      
      // Cache the processed data
      setCachedData(year, month, realData);
      
      console.log(`Found ${realData.length} Get-It-Done reports for ${month} from ${csvFileName}`);
      
      // Log first few descriptions to verify parsing (reduced logging for performance)
      if (realData.length > 0) {
        console.log(`Sample ${year} descriptions:`);
        realData.slice(0, 1).forEach((item, index) => {
          console.log(`${index + 1}: "${item.description?.substring(0, 50)}..."`);
        });
      }
      
      return realData;
    } catch (error) {
      console.error(`Error loading ${year} Get-It-Done data:`, error);
    }
  }
  
  // No data available for years outside 2023-2025 range
  console.log(`No Get-It-Done data available for ${month} - only real data for 2023-2025 is shown`);
  return [];
}

async function loadHomelessServices(): Promise<HomelessService[]> {
  try {
    const servicesPath = path.join(process.cwd(), 'public/data/homeless_services_hackathon.json');
    const servicesText = await fs.readFile(servicesPath, 'utf-8');
    const rawServices = JSON.parse(servicesText);
    
    // Process and categorize services
    const processedServices: HomelessService[] = rawServices
      .filter((service: unknown) => {
        const s = service as Record<string, unknown>;
        return s.latitude && s.longitude;
      })
      .map((service: unknown, index: number) => {
        const s = service as Record<string, unknown>;
        const areasOfFocus = (s.areas_of_focus as string[]) || [];
        const serviceType = categorizeServiceType(areasOfFocus);
        
        return {
          id: `service-${index}`,
          organization: (s.organization as string) || 'Unknown Organization',
          service_name: (s.service_name as string) || 'Unknown Service',
          address: (s.address as string) || '',
          latitude: parseFloat((s.latitude as string) || '0'),
          longitude: parseFloat((s.longitude as string) || '0'),
          main_phone: s.main_phone as string,
          website: s.website as string,
          areas_of_focus: areasOfFocus,
          description: (s.description as string) || '',
          eligibility: s.eligibility as string,
          capacity_limitations: s.capacity_limitations as string,
          serviceType
        };
      })
      .filter((service: HomelessService) => 
        !isNaN(service.latitude) && !isNaN(service.longitude) &&
        service.latitude >= 32.4 && service.latitude <= 33.1 && // San Diego County bounds
        service.longitude >= -117.6 && service.longitude <= -116.8
      );
    
    console.log(`Loaded ${processedServices.length} homeless services`);
    return processedServices;
  } catch (error) {
    console.error('Error loading homeless services:', error);
    return [];
  }
}

function categorizeServiceType(areasOfFocus: string[]): 'shelter' | 'food' | 'health' | 'employment' | 'education' | 'other' {
  const focusText = areasOfFocus.join(' ').toLowerCase();
  
  if (focusText.includes('shelter') || focusText.includes('housing') || focusText.includes('transitional')) {
    return 'shelter';
  }
  if (focusText.includes('food') || focusText.includes('meal') || focusText.includes('nutrition')) {
    return 'food';
  }
  if (focusText.includes('health') || focusText.includes('medical') || focusText.includes('mental') || focusText.includes('therapy')) {
    return 'health';
  }
  if (focusText.includes('job') || focusText.includes('employment') || focusText.includes('work') || focusText.includes('placement')) {
    return 'employment';
  }
  if (focusText.includes('education') || focusText.includes('school') || focusText.includes('training')) {
    return 'education';
  }
  return 'other';
}

function parseCSV(csvText: string) {
  // CSV parsing implementation
  const lines = csvText.split('\n');
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      return {
        lat: parseFloat(values[0]),
        lng: parseFloat(values[1]),
        count: parseInt(values[2]),
        type: 'point-in-time' as const
      };
    })
    .filter(item => !isNaN(item.lat) && !isNaN(item.lng) && !isNaN(item.count));
}

function parseRealGetItDoneData(csvText: string, targetMonth: string): DataPoint[] {
  const targetYear = parseInt(targetMonth.substring(0, 4));
  const targetMonthNum = parseInt(targetMonth.substring(5, 7));
  
  // Use papaparse for proper CSV parsing
  const parseResult = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
    quoteChar: '"',
    delimiter: ',',
  });
  
  if (parseResult.errors.length > 0) {
    console.error('CSV parsing errors:', parseResult.errors);
  }
  
  const rows = parseResult.data as string[][];
  
  // Process all pre-filtered data (CSV already contains only prediction > 5)
  const validRows: DataPoint[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 24) continue; // Skip incomplete rows
    
    // Extract date_closed (column 8, 0-indexed) - early filter for performance
    const dateClosed = row[8];
    if (!dateClosed) continue;
    
    // Parse date to check if it matches target month - early exit if no match
    const closedDate = new Date(dateClosed);
    if (isNaN(closedDate.getTime()) || 
        closedDate.getFullYear() !== targetYear || 
        (closedDate.getMonth() + 1) !== targetMonthNum) {
      continue; // Skip non-matching months
    }
    
    // Extract coordinates - skip invalid coordinates early
    const lat = parseFloat(row[10]);
    const lng = parseFloat(row[11]);
    if (isNaN(lat) || isNaN(lng)) continue;
    
    // Geographic bounds check - San Diego County only
    if (lat < 32.4 || lat > 33.1 || lng < -117.6 || lng > -116.8) continue;
    
    // Parse prediction value (CSV already filtered for prediction > 5)
    let prediction = 5; // Default for pre-filtered data
    const predictionValue = row[23];
    if (predictionValue && !isNaN(Number(predictionValue))) {
      prediction = Math.max(5, Math.min(25, Number(predictionValue)));
    }
    
    // Extract description (all records are significant in pre-filtered data)
    const description = row[22] || '';
    const dateRequested = row[3];
    
    validRows.push({
      lat,
      lng,
      count: 1,
      type: 'get-it-done' as const,
      prediction,
      dateRequested,
      description
    });
  }
  
  console.log(`Processed ${validRows.length} pre-filtered Get-It-Done reports for ${targetMonth}`);
  return validRows;
}


function mergeDataSources(pitData: DataPoint[], getItDoneData: DataPoint[]) {
  // Combine and aggregate data from both sources
  const merged = [...pitData, ...getItDoneData];
  
  // Group by location and sum counts, preserving prediction values
  const aggregated = merged.reduce((acc, point) => {
    const key = `${point.lat.toFixed(3)},${point.lng.toFixed(3)}`;
    if (!acc[key]) {
      acc[key] = { ...point, count: 0 };
    }
    acc[key].count += point.count;
    // Preserve prediction for get-it-done points
    if (point.type === 'get-it-done' && point.prediction) {
      acc[key].prediction = point.prediction;
    }
    return acc;
  }, {} as Record<string, DataPoint>);
  
  return Object.values(aggregated);
}

async function loadTransitRoutes(): Promise<GeoJSON.FeatureCollection | undefined> {
  try {
    const transitRoutesPath = path.join(process.cwd(), 'public/data/Transit_Routes_hackathon.geojson');
    const transitRoutesText = await fs.readFile(transitRoutesPath, 'utf-8');
    const originalGeoJSON = JSON.parse(transitRoutesText) as GeoJSON.FeatureCollection;
    
    // Transform coordinates from EPSG:2230 to EPSG:4326
    const transformedFeatures = originalGeoJSON.features.map(feature => {
      if (feature.geometry.type === 'LineString') {
        const transformedCoordinates = feature.geometry.coordinates.map(coord => 
          transformCoordinates(coord as [number, number])
        );
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: transformedCoordinates
          }
        };
      } else if (feature.geometry.type === 'MultiLineString') {
        const transformedCoordinates = feature.geometry.coordinates.map(lineString =>
          lineString.map(coord => transformCoordinates(coord as [number, number]))
        );
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: transformedCoordinates
          }
        };
      }
      return feature;
    });
    
    return {
      ...originalGeoJSON,
      features: transformedFeatures
    };
  } catch (error) {
    console.error('Error loading transit routes:', error);
    return undefined;
  }
}

async function loadTransitStops(): Promise<GeoJSON.FeatureCollection | undefined> {
  try {
    const transitStopsPath = path.join(process.cwd(), 'public/data/Transit_Stops_hackathon.geojson');
    const transitStopsText = await fs.readFile(transitStopsPath, 'utf-8');
    const originalGeoJSON = JSON.parse(transitStopsText) as GeoJSON.FeatureCollection;
    
    // Transform coordinates from EPSG:2230 to EPSG:4326
    const transformedFeatures = originalGeoJSON.features.map(feature => {
      if (feature.geometry.type === 'Point') {
        const transformedCoordinates = transformCoordinates(feature.geometry.coordinates as [number, number]);
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: transformedCoordinates
          }
        };
      }
      return feature;
    });
    
    return {
      ...originalGeoJSON,
      features: transformedFeatures
    };
  } catch (error) {
    console.error('Error loading transit stops:', error);
    return undefined;
  }
}

async function loadZipcodeGeoJSON(year: number): Promise<GeoJSON.FeatureCollection | undefined> {
  try {
    // Load base zipcode GeoJSON
    const zipcodePath = path.join(process.cwd(), 'public/data/sd_zipcodes.geojson');
    const zipcodeGeoJSON = JSON.parse(await fs.readFile(zipcodePath, 'utf-8'));
    
    // Load and process AllYears PITC data
    const pitcPath = path.join(process.cwd(), 'public/data/AllYears_PITC_hackathon.csv');
    const pitcCsvText = await fs.readFile(pitcPath, 'utf-8');
    
    // Parse PITC data for the specified year
    const pitcRecords = parsePITCData(pitcCsvText, year);
    
    // Aggregate by zipcode
    const zipcodeData = aggregateByZipcode(pitcRecords);
    
    // Create enhanced GeoJSON with PITC data
    const enhancedGeoJSON = createZipcodeFeatureCollection(zipcodeData, zipcodeGeoJSON);
    
    return enhancedGeoJSON;
  } catch (error) {
    console.error('Error loading zipcode data:', error);
    return undefined;
  }
}