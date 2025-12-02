'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, Source, Layer, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { ProcessedService } from '../types';
import { DEMO_LOCATION } from '../utils/demoData';
import 'mapbox-gl/dist/mapbox-gl.css';

interface DemoMapProps {
  services: ProcessedService[];
  selectedService: ProcessedService | null;
  onServiceSelect: (service: ProcessedService) => void;
}

export default function DemoMap({ services, selectedService, onServiceSelect }: DemoMapProps) {
  // Get Mapbox token from environment
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Map view state
  const [viewState, setViewState] = useState({
    longitude: DEMO_LOCATION.longitude,
    latitude: DEMO_LOCATION.latitude,
    zoom: 12
  });

  // Route state
  const [routeData, setRouteData] = useState<{
    type: 'Feature';
    properties: Record<string, unknown>;
    geometry: {
      type: 'LineString';
      coordinates: number[][];
    };
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const onMove = (evt: ViewStateChangeEvent) => setViewState(evt.viewState);

  // Fetch actual walking directions when a service is selected
  useEffect(() => {
    const fetchRoute = async (service: ProcessedService) => {
      setIsLoadingRoute(true);
      try {
        const start = `${DEMO_LOCATION.longitude},${DEMO_LOCATION.latitude}`;
        const end = `${service.longitude},${service.latitude}`;
        
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?geometries=geojson&access_token=${mapboxToken}`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setRouteData({
            type: 'Feature' as const,
            properties: {},
            geometry: route.geometry
          });
        } else {
          // Fallback to straight line if no route found
          setRouteData({
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: [
                [DEMO_LOCATION.longitude, DEMO_LOCATION.latitude],
                [service.longitude, service.latitude]
              ]
            }
          });
        }
      } catch {
        console.log('Route fetch failed, using straight line fallback');
        // Fallback to straight line on error
        setRouteData({
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [DEMO_LOCATION.longitude, DEMO_LOCATION.latitude],
              [service.longitude, service.latitude]
            ]
          }
        });
      } finally {
        setIsLoadingRoute(false);
      }
    };

    if (selectedService && mapboxToken) {
      fetchRoute(selectedService);
    } else {
      setRouteData(null);
    }
  }, [selectedService, mapboxToken]);

  // Route layer style
  const routeLayerStyle = {
    id: 'route',
    type: 'line' as const,
    paint: {
      'line-color': '#0d9488', // Teal color to match theme
      'line-width': 3,
      'line-opacity': 0.9
    }
  };

  // Route outline layer for better visibility
  const routeOutlineStyle = {
    id: 'route-outline',
    type: 'line' as const,
    paint: {
      'line-color': '#ffffff',
      'line-width': 5,
      'line-opacity': 0.5
    }
  };

  // Show loading or error state if no Mapbox token
  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-lg font-semibold mb-2">Map Unavailable</p>
          <p className="text-sm text-gray-400">Mapbox token required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={onMove}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
      >
        {/* Route Line - Show when service is selected */}
        {routeData && (
          <Source id="route-source" type="geojson" data={routeData}>
            <Layer {...routeOutlineStyle} />
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* User Location Marker */}
        <Marker
          longitude={DEMO_LOCATION.longitude}
          latitude={DEMO_LOCATION.latitude}
          anchor="center"
        >
          <div className="relative">
            <div className="w-8 h-8 bg-blue-500 border-4 border-white rounded-full shadow-lg">
              <div className="absolute -top-1 -left-1 w-10 h-10 bg-blue-400 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
        </Marker>

        {/* Service Markers */}
        {services.map((service) => (
          <Marker
            key={service.id}
            longitude={service.longitude}
            latitude={service.latitude}
            anchor="center"
          >
            <button
              onClick={() => onServiceSelect(service)}
              className={`w-12 h-12 rounded-full border-4 border-white shadow-lg cursor-pointer transform transition-all hover:scale-110 ${
                selectedService?.id === service.id 
                  ? 'bg-yellow-500 ring-4 ring-yellow-300 scale-125' 
                  : getCategoryColor(service.categories[0])
              }`}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                {getCategoryIcon(service.categories[0])}
              </div>
            </button>
          </Marker>
        ))}
      </Map>
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
            <span className="text-white font-medium">Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
            <span className="text-white font-medium">Food Services</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full border border-white"></div>
            <span className="text-white font-medium">Shelter Services</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            <span className="text-white font-medium">Health Services</span>
          </div>
          {selectedService && (
            <div className="flex items-center space-x-2 pt-1 mt-2 border-t border-slate-600">
              <div className="w-3 h-1 bg-teal-600 rounded-full"></div>
              <span className="text-teal-400 font-medium">
                {isLoadingRoute ? 'Loading Route...' : 'Walking Route'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Service Counter */}
      {services.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 shadow-lg">
          <span className="text-white text-sm font-medium">
            {services.length} service{services.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}
    </div>
  );
}

// Helper functions for marker styling
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'shelter': 'bg-purple-500',
    'food': 'bg-green-500',
    'health': 'bg-red-500',
    'hygiene': 'bg-cyan-500',
    'mental-health': 'bg-indigo-500',
    'substance-abuse': 'bg-orange-500',
    'employment': 'bg-yellow-500',
    'legal': 'bg-pink-500',
    'crisis': 'bg-rose-500',
    'other': 'bg-gray-500'
  };
  return colors[category] || 'bg-gray-500';
}

function getCategoryIcon(category: string): string {
  const icons: { [key: string]: string } = {
    'shelter': '🏠',
    'food': '🍽',
    'health': '🏥',
    'hygiene': '🚿',
    'mental-health': '🧠',
    'substance-abuse': '💊',
    'employment': '💼',
    'legal': '⚖',
    'crisis': '🆘',
    'other': '📍'
  };
  return icons[category] || '📍';
}