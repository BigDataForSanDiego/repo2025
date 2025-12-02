import * as d3 from 'd3-scale';

export interface ProcessedDataPoint {
  lat: number;
  lng: number;
  count: number;
  month: string;
  type: 'point-in-time' | 'get-it-done';
  intensity?: number;
}

export function processRawData(rawData: ProcessedDataPoint[]): ProcessedDataPoint[] {
  // Filter out invalid data points
  const validData = rawData.filter(point => 
    point.lat && point.lng && !isNaN(point.lat) && !isNaN(point.lng)
  );

  // Calculate intensity based on count
  const counts = validData.map(d => d.count);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  
  const intensityScale = d3.scaleLinear()
    .domain([minCount, maxCount])
    .range([0, 1]);

  return validData.map(point => ({
    ...point,
    intensity: intensityScale(point.count)
  }));
}

export function aggregateByMonth(data: ProcessedDataPoint[]): Map<string, ProcessedDataPoint[]> {
  const monthlyData = new Map<string, ProcessedDataPoint[]>();
  
  data.forEach(point => {
    const month = point.month || '2024-01'; // Default month if not specified
    if (!monthlyData.has(month)) {
      monthlyData.set(month, []);
    }
    monthlyData.get(month)!.push(point);
  });
  
  return monthlyData;
}

export function calculateHotspots(data: ProcessedDataPoint[], threshold: number = 0.7): ProcessedDataPoint[] {
  return data.filter(point => (point.intensity || 0) >= threshold);
}

export function generateHeatmapGradient() {
  return [
    { offset: 0, color: 'rgba(0,0,0,0)' },
    { offset: 0.2, color: 'rgb(65,182,196)' },
    { offset: 0.4, color: 'rgb(127,205,187)' },
    { offset: 0.6, color: 'rgb(199,233,180)' },
    { offset: 0.8, color: 'rgb(237,248,177)' },
    { offset: 0.9, color: 'rgb(255,237,160)' },
    { offset: 1, color: 'rgb(255,0,0)' }
  ];
}