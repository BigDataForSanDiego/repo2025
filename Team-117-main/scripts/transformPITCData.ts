import fs from 'fs';
import path from 'path';
import { CITY_COORDINATES, getAllServiceLocations } from '../app/utils/cityCoordinates';

interface PITCRow {
  region: string;
  city: string;
  es: number; // Emergency Shelter
  th: number; // Transitional Housing
  sh: number; // Supportive Housing
  totalSheltered: number;
  totalUnsheltered: number;
  prevUnsheltered: number;
  percentChange: string;
}

interface CoordinateDataPoint {
  lat: number;
  lng: number;
  count: number;
  type: 'point-in-time' | 'get-it-done';
  month: string;
  city: string;
  region: string;
  shelterType?: 'sheltered' | 'unsheltered';
}

function parsePITCCSV(csvContent: string, year: string): PITCRow[] {
  const lines = csvContent.split('\n');
  const dataRows: PITCRow[] = [];
  
  // Skip header rows and empty rows
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(',,,,')) continue;
    
    const columns = line.split(',');
    if (columns.length < 9) continue;
    
    const region = columns[1]?.trim();
    const city = columns[2]?.trim();
    
    if (!region || !city) continue;
    
    // Clean numeric values, removing ** and other non-numeric characters
    const cleanNumber = (val: string) => {
      const cleaned = val?.replace(/[^0-9-]/g, '') || '0';
      return parseInt(cleaned) || 0;
    };
    
    const row: PITCRow = {
      region,
      city,
      es: cleanNumber(columns[3]),
      th: cleanNumber(columns[4]),
      sh: cleanNumber(columns[5]),
      totalSheltered: cleanNumber(columns[6]),
      totalUnsheltered: cleanNumber(columns[7]),
      prevUnsheltered: cleanNumber(columns[8]),
      percentChange: columns[9] || '0%'
    };
    
    console.log(`Processing: ${city} - Sheltered: ${row.totalSheltered}, Unsheltered: ${row.totalUnsheltered}`);
    dataRows.push(row);
  }
  
  return dataRows;
}

function distributeCountsAcrossLocations(
  totalCount: number,
  serviceLocations: Array<{lat: number; lng: number; type: string}>,
  city: string,
  region: string,
  month: string,
  dataType: 'point-in-time' | 'get-it-done',
  shelterType?: 'sheltered' | 'unsheltered'
): CoordinateDataPoint[] {
  if (totalCount === 0) return [];
  
  const points: CoordinateDataPoint[] = [];
  
  // For San Diego City, distribute more evenly due to large homeless population
  if (city === 'San Diego City') {
    const baseCount = Math.floor(totalCount / serviceLocations.length);
    const remainder = totalCount % serviceLocations.length;
    
    serviceLocations.forEach((location, index) => {
      const count = baseCount + (index < remainder ? 1 : 0);
      if (count > 0) {
        points.push({
          lat: location.lat,
          lng: location.lng,
          count,
          type: dataType,
          month,
          city,
          region,
          shelterType
        });
      }
    });
  } else {
    // For smaller cities, use weighted distribution
    const weights = serviceLocations.map(loc => 
      loc.type === 'center' ? 0.6 : 0.4 / (serviceLocations.length - 1)
    );
    
    let remainingCount = totalCount;
    serviceLocations.forEach((location, index) => {
      const isLast = index === serviceLocations.length - 1;
      const count = isLast ? remainingCount : Math.floor(totalCount * weights[index]);
      
      if (count > 0) {
        points.push({
          lat: location.lat,
          lng: location.lng,
          count,
          type: dataType,
          month,
          city,
          region,
          shelterType
        });
      }
      
      remainingCount -= count;
    });
  }
  
  return points;
}

function transformPITCData(pitcRows: PITCRow[], year: string): CoordinateDataPoint[] {
  const coordinateData: CoordinateDataPoint[] = [];
  
  pitcRows.forEach(row => {
    const serviceLocations = getAllServiceLocations(row.city);
    if (serviceLocations.length === 0) {
      console.warn(`No coordinates found for city: ${row.city}`);
      return;
    }
    
    const month = `${year}-01`; // January point-in-time count
    
    // Add unsheltered population points
    if (row.totalUnsheltered > 0) {
      const unshelteredPoints = distributeCountsAcrossLocations(
        row.totalUnsheltered,
        serviceLocations,
        row.city,
        row.region,
        month,
        'point-in-time',
        'unsheltered'
      );
      coordinateData.push(...unshelteredPoints);
    }
    
    // Add sheltered population points (at service locations)
    if (row.totalSheltered > 0) {
      const shelteredPoints = distributeCountsAcrossLocations(
        row.totalSheltered,
        serviceLocations,
        row.city,
        row.region,
        month,
        'point-in-time',
        'sheltered'
      );
      coordinateData.push(...shelteredPoints);
    }
  });
  
  return coordinateData;
}

// Generate monthly variations based on annual data
function generateMonthlyVariations(yearData: CoordinateDataPoint[], year: string): CoordinateDataPoint[] {
  const allMonthlyData: CoordinateDataPoint[] = [];
  
  // Seasonal variation factors (winter months have higher counts)
  const seasonalFactors = {
    '01': 1.2, // January - highest
    '02': 1.1, // February
    '03': 1.0, // March
    '04': 0.9, // April
    '05': 0.8, // May
    '06': 0.7, // June - lowest
    '07': 0.8, // July
    '08': 0.9, // August
    '09': 1.0, // September
    '10': 1.1, // October
    '11': 1.15, // November
    '12': 1.2  // December - high
  };
  
  Object.entries(seasonalFactors).forEach(([month, factor]) => {
    const monthlyData = yearData.map(point => ({
      ...point,
      month: `${year}-${month}`,
      count: Math.round(point.count * factor)
    }));
    allMonthlyData.push(...monthlyData);
  });
  
  return allMonthlyData;
}

export function processAllPITCData(): void {
  const docsPath = path.join(process.cwd(), 'docs');
  const outputPath = path.join(process.cwd(), 'public', 'mock-csv');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Process 2024 data
  const data2024 = fs.readFileSync(path.join(docsPath, '2024_PITC_hackathon.csv'), 'utf-8');
  const pitcRows2024 = parsePITCCSV(data2024, '2024');
  const coordinateData2024 = transformPITCData(pitcRows2024, '2024');
  const monthlyData2024 = generateMonthlyVariations(coordinateData2024, '2024');
  
  // Process 2025 data
  const data2025 = fs.readFileSync(path.join(docsPath, '2025_PITC_hackathon.csv'), 'utf-8');
  const pitcRows2025 = parsePITCCSV(data2025, '2025');
  const coordinateData2025 = transformPITCData(pitcRows2025, '2025');
  const monthlyData2025 = generateMonthlyVariations(coordinateData2025, '2025');
  
  // Combine all data
  const allData = [...monthlyData2024, ...monthlyData2025];
  
  // Generate CSV format for pit_counts.csv
  const csvHeader = 'lat,lng,count,type,month,city,region,shelterType\n';
  const csvContent = allData.map(point => 
    `${point.lat},${point.lng},${point.count},${point.type},${point.month},${point.city},${point.region},${point.shelterType || ''}`
  ).join('\n');
  
  fs.writeFileSync(path.join(outputPath, 'pit_counts.csv'), csvHeader + csvContent);
  
  console.log(`Generated pit_counts.csv with ${allData.length} data points`);
  console.log(`Covering ${new Set(allData.map(p => p.month)).size} months`);
  console.log(`Across ${new Set(allData.map(p => p.city)).size} cities`);
}