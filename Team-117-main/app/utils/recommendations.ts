interface DataPoint {
  lat: number;
  lng: number;
  count: number;
}

interface ServiceRecommendation {
  id: string;
  lat: number;
  lng: number;
  type: 'shelter' | 'food_bank' | 'medical' | 'day_center';
  score: number;
  peopleHelped: number;
}

interface ServiceLocation {
  lat: number;
  lng: number;
}

export function calculateRecommendations(
  data: DataPoint[],
  existingServices: ServiceLocation[] = []
): ServiceRecommendation[] {
  // Create a grid across San Diego
  const gridSize = 0.01; // Approximately 1km
  const bounds = {
    north: 33.114249,
    south: 32.534856,
    east: -116.908816,
    west: -117.282538
  };
  
  const recommendations: ServiceRecommendation[] = [];
  let idCounter = 0;
  
  // Analyze each grid cell
  for (let lat = bounds.south; lat <= bounds.north; lat += gridSize) {
    for (let lng = bounds.west; lng <= bounds.east; lng += gridSize) {
      const cellData = getCellMetrics(lat, lng, data, existingServices);
      
      if (cellData.needScore > 50) {
        recommendations.push({
          id: `rec-${idCounter++}`,
          lat,
          lng,
          type: determineServiceType(cellData),
          score: cellData.needScore,
          peopleHelped: Math.round(cellData.populationDensity * 0.7)
        });
      }
    }
  }
  
  // Return top 5 recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function getCellMetrics(lat: number, lng: number, data: DataPoint[], services: ServiceLocation[]) {
  // Calculate metrics for a grid cell
  const radius = 0.005; // ~500m
  
  // Count homeless population in cell
  const populationDensity = data
    .filter(point => 
      Math.abs(point.lat - lat) < radius && 
      Math.abs(point.lng - lng) < radius
    )
    .reduce((sum, point) => sum + point.count, 0);
  
  // Find nearest service
  const nearestServiceDistance = services.length > 0 
    ? Math.min(...services.map(service => 
        getDistance(lat, lng, service.lat, service.lng)
      ))
    : Infinity;
  
  // Calculate need score
  const needScore = populationDensity * (nearestServiceDistance > 2 ? 2 : 1);
  
  return {
    populationDensity,
    nearestServiceDistance,
    needScore
  };
}

function determineServiceType(metrics: { populationDensity: number; nearestServiceDistance: number }): ServiceRecommendation['type'] {
  // Logic to determine what type of service is needed
  if (metrics.nearestServiceDistance > 3) {
    return 'shelter';
  } else if (metrics.populationDensity > 100) {
    return 'food_bank';
  } else if (metrics.populationDensity > 50) {
    return 'medical';
  }
  return 'day_center';
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Haversine formula for distance
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}