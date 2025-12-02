import { getZipcodesForCity, getAllZipcodes } from './cityZipcodeMapping';

export interface PITCRecord {
  region: string;
  city: string;
  emergencyShelter: number;
  transitionalHousing: number;
  supportiveHousing: number;
  totalSheltered: number;
  totalUnsheltered: number;
  previousUnsheltered: number;
  percentChange: string;
  year: number;
}

export interface ZipcodeData {
  zipcode: string;
  unshelteredCount: number;
  cities: string[];
  year: number;
}

// Parse AllYears PITC CSV data
export function parsePITCData(csvText: string, year: number): PITCRecord[] {
  const lines = csvText.split('\n');
  const records: PITCRecord[] = [];
  
  // Skip header rows and find data starting from row 3 (index 2)
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('*') || line.includes('TOTAL')) {
      continue;
    }

    const values = line.split(',');
    
    if (values.length < 5) {
      continue;
    }

    const region = values[0]?.trim() || '';
    const city = values[1]?.trim() || '';
    
    // Skip empty city entries
    if (!city) {
      continue;
    }

    // Determine which column to use based on year
    let unshelteredColumnIndex: number;
    if (year === 2025) {
      unshelteredColumnIndex = 2; // 2025 Unsheltered
    } else if (year === 2024) {
      unshelteredColumnIndex = 3; // 2024 Unsheltered  
    } else {
      unshelteredColumnIndex = 4; // 2023 Unsheltered
    }

    const rawValue = values[unshelteredColumnIndex] || '0';
    const totalUnsheltered = parseInt(rawValue.replace(/[^\d]/g, '') || '0');

    records.push({
      region,
      city,
      emergencyShelter: 0, // Not available in AllYears format
      transitionalHousing: 0, // Not available in AllYears format
      supportiveHousing: 0, // Not available in AllYears format
      totalSheltered: 0, // Not available in AllYears format
      totalUnsheltered,
      previousUnsheltered: 0, // Not available in AllYears format
      percentChange: '', // Not available in AllYears format
      year
    });
  }

  return records;
}

// Convert PITC city data to zipcode-level data
export function aggregateByZipcode(pitcRecords: PITCRecord[]): ZipcodeData[] {
  const zipcodeMap = new Map<string, ZipcodeData>();
  
  pitcRecords.forEach(record => {
    const zipcodes = getZipcodesForCity(record.city);
    
    if (zipcodes.length === 0) {
      console.warn(`No zipcodes found for city: "${record.city}"`);
      return;
    }

    // Distribute the unsheltered count across all zipcodes for the city
    const countPerZipcode = Math.round(record.totalUnsheltered / zipcodes.length);

    zipcodes.forEach(zipcode => {
      if (zipcodeMap.has(zipcode)) {
        const existing = zipcodeMap.get(zipcode)!;
        existing.unshelteredCount += countPerZipcode;
        if (!existing.cities.includes(record.city)) {
          existing.cities.push(record.city);
        }
      } else {
        zipcodeMap.set(zipcode, {
          zipcode,
          unshelteredCount: countPerZipcode,
          cities: [record.city],
          year: record.year
        });
      }
    });
  });

  return Array.from(zipcodeMap.values());
}

// Get color for zipcode based on unsheltered count
export function getZipcodeColor(count: number): string {
  if (count === 0) return '#f3f4f6'; // Light gray for empty
  if (count <= 25) return '#fef3c7'; // Light yellow
  if (count <= 75) return '#fbbf24'; // Yellow
  if (count <= 150) return '#f59e0b'; // Orange
  if (count <= 200) return '#ea580c'; // Dark orange
  if (count <= 300) return '#dc2626'; // Red
  return '#991b1b'; // Dark red for 300+
}

// Create GeoJSON feature collection with zipcode data
export function createZipcodeFeatureCollection(
  zipcodeData: ZipcodeData[],
  baseGeoJSON: GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {
  const zipcodeMap = new Map(zipcodeData.map(z => [z.zipcode, z]));
  const validZipcodes = new Set(getAllZipcodes());

  const features = baseGeoJSON.features
    .filter((feature: GeoJSON.Feature) => {
      const zipcode = feature.properties?.ZIP || feature.properties?.ZIPCODE || feature.properties?.zip;
      return validZipcodes.has(zipcode);
    })
    .map((feature: GeoJSON.Feature) => {
      const zipcode = feature.properties?.ZIP || feature.properties?.ZIPCODE || feature.properties?.zip;
      const data = zipcodeMap.get(zipcode);
      
      return {
        ...feature,
        properties: {
          ...feature.properties,
          unshelteredCount: data?.unshelteredCount || 0,
          cities: data?.cities || [],
          color: getZipcodeColor(data?.unshelteredCount || 0)
        }
      };
    });

  return {
    type: 'FeatureCollection',
    features
  };
}