import fs from 'fs';
import path from 'path';
import { CITY_COORDINATES, getAllServiceLocations } from '../app/utils/cityCoordinates';

interface GetItDoneReport {
  lat: number;
  lng: number;
  count: number;
  type: 'get-it-done';
  month: string;
  city: string;
  description: string;
  reportDate: string;
}

// Common homeless-related report descriptions for Get-It-Done
const REPORT_DESCRIPTIONS = [
  'Homeless encampment cleanup needed',
  'Tent encampment on sidewalk',
  'Homeless individuals camping in park',
  'Encampment blocking pedestrian access',
  'Homeless camp near school',
  'Encampment with shopping carts and debris',
  'Homeless individuals sleeping in doorways',
  'Tent city in vacant lot',
  'Homeless camp under bridge',
  'Encampment near transit station',
  'Homeless individuals in parking lot',
  'Tent setup in public space',
  'Homeless camp affecting business access',
  'Encampment with trash accumulation',
  'Homeless individuals at bus stop',
  'Tent encampment in alley',
  'Homeless camp near water source',
  'Encampment on public property',
  'Homeless individuals in residential area',
  'Tent city near freeway overpass'
];

function generateRandomLocation(serviceLocations: Array<{lat: number; lng: number; type: string}>): {lat: number; lng: number} {
  const baseLocation = serviceLocations[Math.floor(Math.random() * serviceLocations.length)];
  
  // Add small random offset to create variety (within ~500m radius)
  const latOffset = (Math.random() - 0.5) * 0.008; // ~500m in latitude
  const lngOffset = (Math.random() - 0.5) * 0.008; // ~500m in longitude
  
  return {
    lat: parseFloat((baseLocation.lat + latOffset).toFixed(6)),
    lng: parseFloat((baseLocation.lng + lngOffset).toFixed(6))
  };
}

function generateGetItDoneReportsForCity(
  cityName: string,
  region: string,
  baseCount: number,
  year: string,
  month: string
): GetItDoneReport[] {
  const serviceLocations = getAllServiceLocations(cityName);
  if (serviceLocations.length === 0) return [];
  
  const reports: GetItDoneReport[] = [];
  const monthNum = parseInt(month);
  
  // Generate reports throughout the month
  for (let i = 0; i < baseCount; i++) {
    const location = generateRandomLocation(serviceLocations);
    const randomDay = Math.floor(Math.random() * 28) + 1; // 1-28 days
    const reportDate = `${year}-${month.padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`;
    
    reports.push({
      lat: location.lat,
      lng: location.lng,
      count: 1, // Each report is one incident
      type: 'get-it-done',
      month: `${year}-${month.padStart(2, '0')}`,
      city: cityName,
      description: REPORT_DESCRIPTIONS[Math.floor(Math.random() * REPORT_DESCRIPTIONS.length)],
      reportDate
    });
  }
  
  return reports;
}

function generateGetItDoneDataForMonth(year: string, month: string): GetItDoneReport[] {
  const monthlyReports: GetItDoneReport[] = [];
  
  // Base report counts per city (roughly 10-20% of unsheltered population)
  const cityReportCounts: Record<string, number> = {
    'San Diego City': Math.floor(Math.random() * 50) + 80, // 80-130 reports
    'Oceanside': Math.floor(Math.random() * 10) + 15,      // 15-25 reports
    'Escondido (NC Metro & Hidden Meadows)': Math.floor(Math.random() * 8) + 12,
    'El Cajon': Math.floor(Math.random() * 6) + 10,
    'Chula Vista (Sweetwater)': Math.floor(Math.random() * 8) + 12,
    'Vista (Bonsall)': Math.floor(Math.random() * 4) + 6,
    'Carlsbad': Math.floor(Math.random() * 3) + 4,
    'National City': Math.floor(Math.random() * 4) + 6,
    'Encinitas (San Dieguito, Solana Beach & Del Mar)': Math.floor(Math.random() * 3) + 4,
    'La Mesa': Math.floor(Math.random() * 2) + 3,
    'Lemon Grove': Math.floor(Math.random() * 2) + 3,
    'Santee': Math.floor(Math.random() * 2) + 3,
    'Spring Valley (Casa de Oro)': Math.floor(Math.random() * 2) + 3,
    'Lakeside': Math.floor(Math.random() * 2) + 2,
    'Imperial Beach': Math.floor(Math.random() * 1) + 1,
    'Coronado': Math.floor(Math.random() * 1) + 0,
    'Alpine (Crest-Dehesa)': Math.floor(Math.random() * 1) + 0
  };
  
  // Generate reports for each city
  Object.entries(cityReportCounts).forEach(([cityName, count]) => {
    if (count > 0) {
      const cityReports = generateGetItDoneReportsForCity(
        cityName,
        'Various', // We'll map to regions later if needed
        count,
        year,
        month
      );
      monthlyReports.push(...cityReports);
    }
  });
  
  return monthlyReports;
}

export function generateAllGetItDoneData(): void {
  const outputPath = path.join(process.cwd(), 'public', 'mock-csv', 'get_it_done');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Generate data for 2024 and 2025
  const years = ['2024', '2025'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  
  years.forEach(year => {
    months.forEach(month => {
      const monthlyReports = generateGetItDoneDataForMonth(year, month);
      
      // Generate CSV content
      const csvHeader = 'date,time,description,lat,lng,status,type\n';
      const csvContent = monthlyReports.map(report => 
        `${report.reportDate},12:00:00,"${report.description}",${report.lat},${report.lng},Open,Homeless Encampment`
      ).join('\n');
      
      const filename = `${year}-${month}.csv`;
      fs.writeFileSync(path.join(outputPath, filename), csvHeader + csvContent);
      
      console.log(`Generated ${filename} with ${monthlyReports.length} reports`);
    });
  });
  
  console.log('All Get-It-Done data generated successfully');
}

// CSV format matches expected structure:
// date,time,description,lat,lng,status,type