// San Diego County city-to-coordinate mapping
// Based on actual city centers and known homeless service locations

export interface CityCoordinates {
  lat: number;
  lng: number;
  serviceLocations?: Array<{lat: number; lng: number; type: string}>;
}

export const CITY_COORDINATES: Record<string, CityCoordinates> = {
  'San Diego City': {
    lat: 32.7157,
    lng: -117.1611,
    serviceLocations: [
      { lat: 32.7074, lng: -117.1698, type: 'downtown' },
      { lat: 32.7485, lng: -117.1555, type: 'university' },
      { lat: 32.7355, lng: -117.1460, type: 'balboa' },
      { lat: 32.6851, lng: -117.1650, type: 'southbay' },
      { lat: 32.7320, lng: -117.1570, type: 'midtown' },
      { lat: 32.7220, lng: -117.1420, type: 'hillcrest' },
      { lat: 32.7100, lng: -117.1500, type: 'downtown-east' },
      { lat: 32.7400, lng: -117.1300, type: 'kearny-mesa' }
    ]
  },
  'Carlsbad': {
    lat: 33.1581,
    lng: -117.3506,
    serviceLocations: [
      { lat: 33.1581, lng: -117.3506, type: 'center' },
      { lat: 33.1490, lng: -117.3443, type: 'south' }
    ]
  },
  'Oceanside': {
    lat: 33.1959,
    lng: -117.3795,
    serviceLocations: [
      { lat: 33.1959, lng: -117.3795, type: 'center' },
      { lat: 33.2108, lng: -117.3834, type: 'north' },
      { lat: 33.1834, lng: -117.3712, type: 'beach' }
    ]
  },
  'Encinitas (San Dieguito, Solana Beach & Del Mar)': {
    lat: 33.0369,
    lng: -117.2920,
    serviceLocations: [
      { lat: 33.0369, lng: -117.2920, type: 'encinitas' },
      { lat: 32.9930, lng: -117.2713, type: 'solana-beach' },
      { lat: 32.9595, lng: -117.2653, type: 'del-mar' }
    ]
  },
  'Coronado': {
    lat: 32.6859,
    lng: -117.1831,
    serviceLocations: [
      { lat: 32.6859, lng: -117.1831, type: 'center' }
    ]
  },
  'National City': {
    lat: 32.6781,
    lng: -117.0992,
    serviceLocations: [
      { lat: 32.6781, lng: -117.0992, type: 'center' },
      { lat: 32.6634, lng: -117.1063, type: 'south' }
    ]
  },
  'Chula Vista (Sweetwater)': {
    lat: 32.6401,
    lng: -117.0842,
    serviceLocations: [
      { lat: 32.6401, lng: -117.0842, type: 'center' },
      { lat: 32.6298, lng: -117.0625, type: 'east' },
      { lat: 32.6511, lng: -117.0945, type: 'north' }
    ]
  },
  'Imperial Beach': {
    lat: 32.5839,
    lng: -117.1131,
    serviceLocations: [
      { lat: 32.5839, lng: -117.1131, type: 'center' }
    ]
  },
  'El Cajon': {
    lat: 32.7948,
    lng: -116.9625,
    serviceLocations: [
      { lat: 32.7948, lng: -116.9625, type: 'center' },
      { lat: 32.8011, lng: -116.9731, type: 'north' },
      { lat: 32.7856, lng: -116.9542, type: 'east' }
    ]
  },
  'La Mesa': {
    lat: 32.7678,
    lng: -117.0231,
    serviceLocations: [
      { lat: 32.7678, lng: -117.0231, type: 'center' },
      { lat: 32.7545, lng: -117.0334, type: 'south' }
    ]
  },
  'Lemon Grove': {
    lat: 32.7428,
    lng: -117.0317,
    serviceLocations: [
      { lat: 32.7428, lng: -117.0317, type: 'center' }
    ]
  },
  'Santee': {
    lat: 32.8383,
    lng: -116.9739,
    serviceLocations: [
      { lat: 32.8383, lng: -116.9739, type: 'center' },
      { lat: 32.8298, lng: -116.9645, type: 'south' }
    ]
  },
  'Alpine (Crest-Dehesa)': {
    lat: 32.8350,
    lng: -116.7664,
    serviceLocations: [
      { lat: 32.8350, lng: -116.7664, type: 'center' }
    ]
  },
  'Lakeside': {
    lat: 32.8567,
    lng: -116.9217,
    serviceLocations: [
      { lat: 32.8567, lng: -116.9217, type: 'center' }
    ]
  },
  'Spring Valley (Casa de Oro)': {
    lat: 32.7445,
    lng: -116.9989,
    serviceLocations: [
      { lat: 32.7445, lng: -116.9989, type: 'center' },
      { lat: 32.7334, lng: -116.9876, type: 'south' }
    ]
  },
  'Escondido (NC Metro & Hidden Meadows)': {
    lat: 33.1192,
    lng: -117.0864,
    serviceLocations: [
      { lat: 33.1192, lng: -117.0864, type: 'center' },
      { lat: 33.1345, lng: -117.0798, type: 'north' },
      { lat: 33.1034, lng: -117.0923, type: 'south' }
    ]
  },
  'Vista (Bonsall)': {
    lat: 33.2000,
    lng: -117.2425,
    serviceLocations: [
      { lat: 33.2000, lng: -117.2425, type: 'vista' },
      { lat: 33.2889, lng: -117.2253, type: 'bonsall' }
    ]
  }
};

export function getCityCoordinates(cityName: string): CityCoordinates | null {
  return CITY_COORDINATES[cityName] || null;
}

export function getAllServiceLocations(cityName: string): Array<{lat: number; lng: number; type: string}> {
  const city = getCityCoordinates(cityName);
  if (!city) return [];
  
  return city.serviceLocations || [{ lat: city.lat, lng: city.lng, type: 'center' }];
}