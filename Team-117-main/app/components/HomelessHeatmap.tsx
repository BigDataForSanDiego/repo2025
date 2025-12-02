'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Heart, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Users, Shield, Target, AlertTriangle, Clock, BarChart3, Bot, X, Layers } from 'lucide-react';
import Image from 'next/image';
import Map, { Source, Layer, Marker, ViewStateChangeEvent, MapMouseEvent, MapRef } from 'react-map-gl/mapbox';
import TimelapseControls from './TimelapseControls';
import { fetchLocalData } from '../utils/dataClient';
import 'mapbox-gl/dist/mapbox-gl.css';

// Google Analytics event tracking
declare global {
  interface Window {
    gtag?: (command: string, target: string, parameters?: Record<string, unknown>) => void;
  }
}

const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

interface DataPoint {
  lat: number;
  lng: number;
  count: number;
  month: string;
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


export default function HomelessHeatmap() {
  const mapRef = useRef<MapRef>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [zipcodeGeoJSON, setZipcodeGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [transitRoutesGeoJSON, setTransitRoutesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [transitStopsGeoJSON, setTransitStopsGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  const [homelessServices, setHomelessServices] = useState<HomelessService[]>([]);
  const [servicesGeoJSON, setServicesGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [showServices, setShowServices] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('2023-01');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'ai-insights'>('analytics');
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(false);
  const [hoveredZipcode, setHoveredZipcode] = useState<Record<string, string | number> | null>(null);
  const [hoveredCircle, setHoveredCircle] = useState<DataPoint | null>(null);
  const [hoveredTransitRoute, setHoveredTransitRoute] = useState<Record<string, string | number> | null>(null);
  const [hoveredTransitStop, setHoveredTransitStop] = useState<Record<string, string | number> | null>(null);
  const [hoveredService, setHoveredService] = useState<HomelessService | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [updateTime, setUpdateTime] = useState<string>('');
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const loadDataTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track window size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 540);
      setIsTablet(width >= 540 && width <= 1024);
    };
    
    // Set initial value
    handleResize();
    
    // Set initial expanded states based on screen size
    const isTabletOrDesktop = window.innerWidth >= 540;
    setIsSidebarExpanded(isTabletOrDesktop);
    setIsLegendExpanded(isTabletOrDesktop);
    
    // Set update time only on client
    setUpdateTime(new Date().toLocaleTimeString());
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [viewState, setViewState] = useState({
    longitude: -117.1611,
    latitude: 32.7157,
    zoom: 9.5
  });

  // Memoized filtered data points for performance
  const visibleDataPoints = useMemo(() => {
    if (isLoading) return [];
    
    return data
      .filter(point => point.type === 'get-it-done')
      .filter(point => {
        // Viewport filtering - only render points in current view
        const { latitude, longitude, zoom } = viewState;
        const latDiff = Math.abs(point.lat - latitude);
        const lngDiff = Math.abs(point.lng - longitude);
        const threshold = zoom < 10 ? 0.5 : zoom < 12 ? 0.2 : 0.1;
        return latDiff < threshold && lngDiff < threshold;
      })
      .slice(0, 500); // Limit to 500 visible markers max for performance
  }, [data, viewState, isLoading]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // AI Insights data

  const handleMouseEnter = useCallback((e: MapMouseEvent) => {
    if (e.features && e.features[0]) {
      setHoveredZipcode(e.features[0].properties);
    }
    setMousePosition({ x: e.point.x, y: e.point.y });
  }, []);

  const handleMouseMove = useCallback((e: MapMouseEvent) => {
    setMousePosition({ x: e.point.x, y: e.point.y });
    // Update hovered feature data as mouse moves between regions
    if (e.features && e.features[0]) {
      const feature = e.features[0];
      const layerId = e.features[0].layer?.id;
      
      if (layerId === 'zipcode-fill') {
        setHoveredZipcode(feature.properties);
        setHoveredTransitRoute(null);
        setHoveredTransitStop(null);
      } else if (layerId === 'transit-routes') {
        setHoveredTransitRoute(feature.properties);
        setHoveredZipcode(null);
        setHoveredTransitStop(null);
      } else if (layerId === 'transit-stops') {
        setHoveredTransitStop(feature.properties);
        setHoveredZipcode(null);
        setHoveredTransitRoute(null);
        setHoveredService(null);
      } else if (layerId === 'services-layer') {
        // Find the service from properties
        const serviceId = feature.properties?.id;
        const service = homelessServices.find(s => s.id === serviceId);
        if (service) {
          setHoveredService(service);
        }
        setHoveredZipcode(null);
        setHoveredTransitRoute(null);
        setHoveredTransitStop(null);
      }
    } else {
      setHoveredZipcode(null);
      setHoveredTransitRoute(null);
      setHoveredTransitStop(null);
      setHoveredService(null);
    }
  }, [homelessServices]);

  const handleMouseLeave = useCallback(() => {
    setHoveredZipcode(null);
  }, []);

  const handleCircleMouseEnter = useCallback((point: DataPoint) => {
    setHoveredCircle(point);
  }, []);

  const handleCircleMouseLeave = useCallback(() => {
    setHoveredCircle(null);
  }, []);

  const getPopulationRange = useCallback((count: number): string => {
    if (count === 0) return 'No data';
    if (count <= 25) return '1-25 range';
    if (count <= 75) return '26-75 range';
    if (count <= 150) return '76-150 range';
    if (count <= 200) return '151-200 range';
    if (count <= 300) return '201-300 range';
    return '300+ range';
  }, []);

  const formatDate = useCallback((month: string | undefined): string => {
    if (!month) return 'Unknown Date';
    const parts = month.split('-');
    if (parts.length !== 2) return 'Invalid Date';
    const [year, monthNum] = parts;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = parseInt(monthNum) - 1;
    if (monthIndex < 0 || monthIndex >= 12) return 'Invalid Date';
    return `${monthNames[monthIndex]} ${year}`;
  }, []);

  const formatFullDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return 'Unknown Date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const getDotSize = useCallback((prediction: number = 1): string => {
    // Scale dot size based on prediction value (1-20+) - reduced by ~70%
    if (prediction <= 1) return 'w-1 h-1'; // 4px - smallest
    if (prediction <= 3) return 'w-1.5 h-1.5'; // 6px - small
    if (prediction <= 6) return 'w-2 h-2'; // 8px - medium
    if (prediction <= 10) return 'w-2.5 h-2.5'; // 10px - large
    if (prediction <= 15) return 'w-3 h-3'; // 12px - larger
    if (prediction <= 20) return 'w-3.5 h-3.5'; // 14px - very large
    return 'w-4 h-4'; // 16px - largest (20+), ~70% smaller than original
  }, []);



  const createServiceIcon = useCallback((serviceType: string, color: string) => {
    // Get the SVG path for each icon type (simplified versions of Lucide icons)
    const iconPaths: Record<string, string> = {
      shelter: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10', // Home icon path
      food: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2 M7 2v20 M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z', // UtensilsCrossed simplified
      health: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', // Heart
      employment: 'M16 20V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16 M8 20h8 M4 20h16', // Briefcase simplified
      education: 'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 0 5-1 8-1s5 1 8 1v-5', // GraduationCap simplified
      other: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' // Users simplified
    };

    const iconPath = iconPaths[serviceType] || iconPaths.other;
    
    // Create SVG with white circle background and colored icon
    const svgString = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="white" stroke="#d1d5db" stroke-width="2"/>
        <g transform="translate(8, 8) scale(0.67)" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="${iconPath}"/>
        </g>
      </svg>
    `;

    // Convert to data URL
    const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
    
    // Create image from data URL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const img = new (globalThis as any).Image();
    img.src = dataUrl;
    return img;
  }, []);

  const addServiceIcons = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const serviceTypes = [
      { type: 'shelter', color: '#f97316' },
      { type: 'food', color: '#22c55e' },
      { type: 'health', color: '#ef4444' },
      { type: 'employment', color: '#3b82f6' },
      { type: 'education', color: '#a855f7' },
      { type: 'other', color: '#6b7280' }
    ];

    // Add each icon to the map
    for (const service of serviceTypes) {
      const iconId = `${service.type}-icon`;
      if (!map.hasImage(iconId)) {
        try {
          const icon = createServiceIcon(service.type, service.color);
          // Wait for image to load
          await new Promise<void>((resolve) => {
            if (icon.complete) {
              // Image already loaded
              map.addImage(iconId, icon);
              resolve();
            } else {
              icon.onload = () => {
                map.addImage(iconId, icon);
                resolve();
              };
              icon.onerror = () => {
                console.error(`Failed to load icon for ${service.type}`);
                resolve(); // Continue even if icon fails to load
              };
            }
          });
        } catch (error) {
          console.error(`Error adding icon ${iconId}:`, error);
        }
      }
    }
  }, [createServiceIcon]);

  // Memoized metrics calculation for performance
  const metrics = useMemo(() => {
    const getItDoneCount = data.filter(d => d.type === 'get-it-done').length;
    
    // Calculate total homeless count from zipcode data
    let totalHomelessCount = 0;
    if (zipcodeGeoJSON) {
      zipcodeGeoJSON.features.forEach(feature => {
        const count = feature.properties?.unshelteredCount || 0;
        totalHomelessCount += count;
      });
    }

    // Mock calculations for demo
    const previousMonthCount = Math.round(totalHomelessCount * 0.97); // 3% decrease
    const monthOverMonthChange = totalHomelessCount > 0 
      ? ((totalHomelessCount - previousMonthCount) / previousMonthCount * 100).toFixed(1)
      : '0.0';
    
    const hotspotAreas = zipcodeGeoJSON?.features.filter(f => 
      (f.properties?.unshelteredCount || 0) > 100
    ).length || 0;

    const coverageScore = Math.min(100, Math.round((homelessServices.length / Math.max(1, hotspotAreas)) * 15));

    return {
      totalHomelessCount,
      monthOverMonthChange: parseFloat(monthOverMonthChange),
      hotspotAreas,
      coverageScore,
      getItDoneCount
    };
  }, [data, zipcodeGeoJSON, homelessServices]);

  // Keep calculateMetrics as a function for backward compatibility
  const calculateMetrics = useCallback(() => metrics, [metrics]);

  const createServicesGeoJSON = useCallback((services: HomelessService[]): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = services.map(service => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [service.longitude, service.latitude]
      },
      properties: {
        id: service.id,
        organization: service.organization,
        service_name: service.service_name,
        address: service.address,
        main_phone: service.main_phone,
        website: service.website,
        description: service.description,
        eligibility: service.eligibility,
        capacity_limitations: service.capacity_limitations,
        serviceType: service.serviceType,
        icon: `${service.serviceType}-icon` // Will reference the image in Mapbox
      }
    }));

    return {
      type: 'FeatureCollection',
      features
    };
  }, []);


  // Debounced data loading for timeline performance
  const debouncedLoadData = useCallback((month: string) => {
    // Clear any pending timeout
    if (loadDataTimeoutRef.current) {
      clearTimeout(loadDataTimeoutRef.current);
    }
    
    // Debounce the actual data loading
    loadDataTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetchLocalData(month);
        console.log(response);
        // Handle new API response format
        if (response.data) {
          setData(response.data);
          if (response.zipcodeGeoJSON) {
            setZipcodeGeoJSON(response.zipcodeGeoJSON);
          }
          if (response.transitRoutesGeoJSON) {
            setTransitRoutesGeoJSON(response.transitRoutesGeoJSON);
          }
          if (response.transitStopsGeoJSON) {
            setTransitStopsGeoJSON(response.transitStopsGeoJSON);
          }
          if (response.homelessServices) {
            setHomelessServices(response.homelessServices);
            const geoJSON = createServicesGeoJSON(response.homelessServices);
            setServicesGeoJSON(geoJSON);
            // Add icons to map after a short delay to ensure map is ready
            setTimeout(() => {
              const map = mapRef.current?.getMap();
              if (map && map.loaded()) {
                addServiceIcons();
              } else {
                // If map isn't loaded yet, wait for it
                map?.once('load', () => addServiceIcons());
              }
            }, 100);
          }
        } else {
          // Legacy format fallback
          setData(response);
        }
        
      } catch (error) {
        console.error('Failed to load data:', error);
        // For demo purposes, use minimal mock data
        const mockData: DataPoint[] = [
          { lat: 32.7157, lng: -117.1611, count: 45, month: month, type: 'point-in-time' },
          { lat: 32.7355, lng: -117.1460, count: 32, month: month, type: 'point-in-time' },
          { lat: 32.7485, lng: -117.1555, count: 28, month: month, type: 'point-in-time' },
        ];
        setData(mockData);
      }
      
      // Only turn off loading after the initial load
      if (isLoading) {
        setIsLoading(false);
        // Update time only on client
        setUpdateTime(new Date().toLocaleTimeString());
      }
    }, 150); // 150ms debounce delay
  }, [createServicesGeoJSON, addServiceIcons, isLoading, setUpdateTime]);

  useEffect(() => {
    debouncedLoadData(selectedMonth);
  }, [selectedMonth, debouncedLoadData]);

  return (
    <>
    <div 
      className="relative w-full h-full transition-all duration-300 ease-in-out"
      style={{ 
        // Desktop: account for sidebar margin
        marginRight: !isMobile ? (isSidebarExpanded ? '320px' : '48px') : '0px',
        // Mobile: account for bottom sheet when expanded
        marginBottom: isMobile && isSidebarExpanded ? '70vh' : '0px'
      }}
    >
      {/* Map or Placeholder */}
      {mapboxToken ? (
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
          mapboxAccessToken={mapboxToken}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          attributionControl={false}
          interactiveLayerIds={['zipcode-fill', 'transit-routes', 'transit-stops', 'services-layer']}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Zipcode Choropleth Layer */}
          {zipcodeGeoJSON && (
            <Source
              id="zipcode-source"
              type="geojson"
              data={zipcodeGeoJSON}
            >
              <Layer
                id="zipcode-fill"
                type="fill"
                paint={{
                  'fill-color': ['get', 'color'],
                  'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    0.9,
                    0.7
                  ]
                }}
              />
              <Layer
                id="zipcode-stroke"
                type="line"
                paint={{
                  'line-color': '#ffffff',
                  'line-width': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    3,
                    1.5
                  ],
                  'line-opacity': 0.9
                }}
              />
            </Source>
          )}

          {/* Transit Routes Layer */}
          {showTransit && transitRoutesGeoJSON && (
            <Source
              id="transit-routes-source"
              type="geojson"
              data={transitRoutesGeoJSON}
            >
              <Layer
                id="transit-routes"
                type="line"
                paint={{
                  'line-color': '#22c55e',
                  'line-width': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    4,
                    2.5
                  ],
                  'line-opacity': 0.8
                }}
              />
            </Source>
          )}

          {/* Transit Stops Layer */}
          {showTransit && transitStopsGeoJSON && (
            <Source
              id="transit-stops-source"
              type="geojson"
              data={transitStopsGeoJSON}
            >
              <Layer
                id="transit-stops"
                type="circle"
                paint={{
                  'circle-color': '#22c55e',
                  'circle-radius': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    6,
                    4
                  ],
                  'circle-stroke-color': '#ffffff',
                  'circle-stroke-width': 2,
                  'circle-opacity': 0.9
                }}
              />
            </Source>
          )}

          {/* Homeless Services Layer */}
          {showServices && servicesGeoJSON && (
            <Source
              id="services-source"
              type="geojson"
              data={servicesGeoJSON}
            >
              <Layer
                id="services-layer"
                type="symbol"
                layout={{
                  'icon-image': ['get', 'icon'],
                  'icon-size': 1.0,
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true
                }}
              />
            </Source>
          )}

          {/* Get-It-Done Data Points as Markers - Optimized rendering */}
          {visibleDataPoints.map((point, index) => (
            <Marker
              key={`marker-${index}`}
              longitude={point.lng}
              latitude={point.lat}
              anchor="center"
            >
              <div 
                className={`${getDotSize(point.prediction)} bg-blue-500 rounded-full opacity-50 border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform`}
                onMouseEnter={() => handleCircleMouseEnter(point)}
                onMouseLeave={handleCircleMouseLeave}
              />
            </Marker>
          ))}
          {/* Zipcode Hover Tooltip */}
          {hoveredZipcode && (
            <div 
              className="absolute bg-black/95 text-white p-3 rounded-lg shadow-2xl pointer-events-none z-50 border border-gray-600 max-w-xs"
              style={{
                left: Math.min(mousePosition.x + 10, window.innerWidth - 250),
                top: Math.max(mousePosition.y - 10, 10),
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              <div className="font-bold text-base">Zipcode {hoveredZipcode.ZIP || hoveredZipcode.ZIPCODE || hoveredZipcode.zip}</div>
              <div className="text-sm text-blue-300">{hoveredZipcode.unshelteredCount || 0} Unsheltered • {getPopulationRange(Number(hoveredZipcode.unshelteredCount) || 0)}</div>
              {hoveredZipcode.cities && Array.isArray(hoveredZipcode.cities) && hoveredZipcode.cities.length > 0 && (
                <div className="text-xs text-gray-300 mt-1">
                  Cities: {hoveredZipcode.cities.join(', ')}
                </div>
              )}
            </div>
          )}
          
          {/* Circle Hover Tooltip */}
          {hoveredCircle && (
            <div 
              className="absolute bg-black/95 text-white p-3 rounded-lg shadow-2xl pointer-events-none z-50 border border-gray-600 max-w-sm"
              style={{
                left: Math.min(mousePosition.x + 10, window.innerWidth - 350),
                top: Math.max(mousePosition.y - 10, 10),
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              <div className="font-bold text-base text-blue-300">Get-It-Done Report</div>
              <div className="text-sm">{formatFullDate(hoveredCircle.dateRequested)}</div>
              {hoveredCircle.prediction && (
                <div className="text-sm text-yellow-300">
                  Priority Level: {hoveredCircle.prediction}
                </div>
              )}
              <div className="text-xs text-gray-300 mt-2 leading-relaxed">
                {hoveredCircle.description || 'Homeless encampment cleanup requested'}
              </div>
            </div>
          )}

          {/* Transit Route Hover Tooltip */}
          {hoveredTransitRoute && (
            <div 
              className="absolute bg-black/95 text-white p-3 rounded-lg shadow-2xl pointer-events-none z-50 border border-green-600 max-w-xs"
              style={{
                left: Math.min(mousePosition.x + 10, window.innerWidth - 250),
                top: Math.max(mousePosition.y - 10, 10),
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              <div className="font-bold text-base text-green-300">Transit Route</div>
              <div className="text-sm">{hoveredTransitRoute.route_short_name} - {hoveredTransitRoute.route_long_name}</div>
              <div className="text-xs text-gray-300 mt-1">
                Agency: {hoveredTransitRoute.agency_id} • Type: {hoveredTransitRoute.route_type_text}
              </div>
            </div>
          )}

          {/* Transit Stop Hover Tooltip */}
          {hoveredTransitStop && (
            <div 
              className="absolute bg-black/95 text-white p-3 rounded-lg shadow-2xl pointer-events-none z-50 border border-green-600 max-w-xs"
              style={{
                left: Math.min(mousePosition.x + 10, window.innerWidth - 250),
                top: Math.max(mousePosition.y - 10, 10),
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              <div className="font-bold text-base text-green-300">Transit Stop</div>
              <div className="text-sm">{hoveredTransitStop.stop_name}</div>
              <div className="text-xs text-gray-300 mt-1">
                Agency: {hoveredTransitStop.stop_agency} • ID: {hoveredTransitStop.stop_id}
              </div>
            </div>
          )}

          {/* Service Hover Tooltip */}
          {hoveredService && (
            <div 
              className="absolute bg-black/95 text-white p-3 rounded-lg shadow-2xl pointer-events-none z-50 border border-orange-600 max-w-sm"
              style={{
                left: Math.min(mousePosition.x + 10, window.innerWidth - 350),
                top: Math.max(mousePosition.y - 10, 10),
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              <div className="font-bold text-base text-orange-300">{hoveredService.service_name}</div>
              <div className="text-sm text-gray-200">{hoveredService.organization}</div>
              <div className="text-xs text-gray-300 mt-1">{hoveredService.address}</div>
              {hoveredService.main_phone && (
                <div className="text-xs text-blue-300 mt-1">📞 {hoveredService.main_phone}</div>
              )}
              {hoveredService.capacity_limitations && (
                <div className="text-xs text-yellow-300 mt-1">Capacity: {hoveredService.capacity_limitations}</div>
              )}
              <div className="text-xs text-gray-400 mt-2 capitalize">
                {hoveredService.serviceType} Service
              </div>
            </div>
          )}
        </Map>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
          {/* Grid Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Center Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-900/20 to-gray-900/60" />

          {/* Map Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-100">
              <MapPin className="h-20 w-20 mx-auto mb-6 opacity-70" />
              <p className="text-xl font-semibold mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                San Diego Heatmap Visualization
              </p>
              <p className="text-base mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                Mapbox integration ready - add your API key to .env.local
              </p>
              <p className="text-base font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                Data points: {data.length}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Header Bar */}
      {!isLoading && (
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="backdrop-blur-xl border-b shadow-2xl" style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderBottomColor: '#71717a'
        }}>
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Main Header Row */}
            <div className="flex items-center justify-between py-4">
              {/* Logo and Title Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl blur-sm" style={{ backgroundColor: '#0ea5e9', opacity: 0.2 }}></div>
                  <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    width={40}
                    height={40}
                    className="relative h-10 w-10 rounded-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: '#ffffff' }}>
                    Vulnerability Atlas
                  </h1>
                  <p className="text-xs font-medium tracking-wide" style={{ color: '#71717a' }}>
                    San Diego Homelessness Intelligence Platform
                  </p>
                </div>
              </div>

              {/* Real-time Status Indicator */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-xs" style={{ color: '#71717a' }}>
                  Updated {updateTime}
                </div>
              </div>
            </div>

            {/* Metrics Dashboard Row - Hidden on mobile and tablet */}
            <div className="pb-4 hidden lg:block">
              <div className="grid grid-cols-6 gap-3">
                {(() => {
                  const metrics = calculateMetrics();
                  return (
                    <>
                      {/* Total Population */}
                      <div className="backdrop-blur-sm rounded-xl p-3 transition-all duration-200 border" style={{
                        backgroundColor: '#0f172a',
                        borderColor: '#0ea5e9',
                        borderWidth: '1px'
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4" style={{ color: '#0ea5e9' }} />
                          <span className="text-xs font-medium" style={{ color: '#71717a' }}>Population</span>
                        </div>
                        <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                          {metrics.totalHomelessCount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {metrics.monthOverMonthChange >= 0 ? (
                            <TrendingUp className="w-3 h-3" style={{ color: '#f43f5e' }} />
                          ) : (
                            <TrendingDown className="w-3 h-3" style={{ color: '#10b981' }} />
                          )}
                          <span className="text-xs font-semibold" style={{ 
                            color: metrics.monthOverMonthChange >= 0 ? '#f43f5e' : '#10b981'
                          }}>
                            {Math.abs(metrics.monthOverMonthChange)}%
                          </span>
                        </div>
                      </div>

                      {/* Active Reports */}
                      <div className="backdrop-blur-sm rounded-xl p-3 transition-all duration-200 border" style={{
                        backgroundColor: '#0f172a',
                        borderColor: '#f97316',
                        borderWidth: '1px'
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4" style={{ color: '#f97316' }} />
                          <span className="text-xs font-medium" style={{ color: '#71717a' }}>Reports</span>
                        </div>
                        <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                          {metrics.getItDoneCount}
                        </div>
                        <div className="text-xs font-medium mt-1" style={{ color: '#f97316' }}>
                          Active Issues
                        </div>
                      </div>

                      {/* Hotspot Areas */}
                      <div className="backdrop-blur-sm rounded-xl p-3 transition-all duration-200 border" style={{
                        backgroundColor: '#0f172a',
                        borderColor: '#f43f5e',
                        borderWidth: '1px'
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4" style={{ color: '#f43f5e' }} />
                          <span className="text-xs font-medium" style={{ color: '#71717a' }}>Hotspots</span>
                        </div>
                        <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                          {metrics.hotspotAreas}
                        </div>
                        <div className="text-xs font-medium mt-1" style={{ color: '#f43f5e' }}>
                          High Density
                        </div>
                      </div>

                      {/* Services Coverage */}
                      <div className="backdrop-blur-sm rounded-xl p-3 transition-all duration-200 border" style={{
                        backgroundColor: '#0f172a',
                        borderColor: '#10b981',
                        borderWidth: '1px'
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4" style={{ color: '#10b981' }} />
                          <span className="text-xs font-medium" style={{ color: '#71717a' }}>Coverage</span>
                        </div>
                        <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                          {metrics.coverageScore}%
                        </div>
                        <div className="text-xs font-medium mt-1" style={{ color: '#10b981' }}>
                          Service Reach
                        </div>
                      </div>

                      {/* Current Period */}
                      <div className="backdrop-blur-sm rounded-xl p-3 transition-all duration-200 border" style={{
                        backgroundColor: '#0f172a',
                        borderColor: '#0ea5e9',
                        borderWidth: '1px'
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4" style={{ color: '#0ea5e9' }} />
                          <span className="text-xs font-medium" style={{ color: '#71717a' }}>Period</span>
                        </div>
                        <div className="text-sm font-bold" style={{ color: '#ffffff' }}>
                          {formatDate(selectedMonth)}
                        </div>
                        <div className="text-xs font-medium mt-1" style={{ color: '#0ea5e9' }}>
                          Current View
                        </div>
                      </div>

                      {/* Data Quality */}
                      <div className="backdrop-blur-sm rounded-xl p-3 transition-all duration-200 border" style={{
                        backgroundColor: '#0f172a',
                        borderColor: '#10b981',
                        borderWidth: '1px'
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4" style={{ color: '#10b981' }} />
                          <span className="text-xs font-medium" style={{ color: '#71717a' }}>Quality</span>
                        </div>
                        <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                          {Math.min(100, Math.round((data.length / Math.max(1, 1000)) * 100))}%
                        </div>
                        <div className="text-xs font-medium mt-1" style={{ color: '#10b981' }}>
                          Data Integrity
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Legend - Mobile: Collapsible overlay, Desktop: Side panel */}
      {!isLoading && (
      <AnimatePresence>
        {isLegendExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`absolute left-4 z-50 bg-gray-900/95 backdrop-blur-md text-white p-5 rounded-xl shadow-2xl border border-gray-700/50 max-w-xs sm:max-w-sm ${
              isMobile ? 'bottom-0' : 'top-1/2 transform -translate-y-1/2'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  Map Legend
                </h3>
              </div>
              <button
                onClick={() => setIsLegendExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800/50 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Population Density Section */}
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-4 w-4 text-blue-400" />
                  <p className="font-semibold text-blue-100">Population Density</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-3 rounded border border-gray-500/50 shadow-sm" style={{ backgroundColor: '#f3f4f6' }}></div>
                    <span className="text-xs text-gray-300">0</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-3 rounded border border-gray-500/50 shadow-sm" style={{ backgroundColor: '#fef3c7' }}></div>
                    <span className="text-xs text-gray-300">1-25</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-3 rounded border border-gray-500/50 shadow-sm" style={{ backgroundColor: '#fbbf24' }}></div>
                    <span className="text-xs text-gray-300">26-75</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-3 rounded border border-gray-500/50 shadow-sm" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span className="text-xs text-gray-300">76-150</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-3 rounded border border-gray-500/50 shadow-sm" style={{ backgroundColor: '#ea580c' }}></div>
                    <span className="text-xs text-gray-300">151-200</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-3 rounded border border-gray-500/50 shadow-sm" style={{ backgroundColor: '#dc2626' }}></div>
                    <span className="text-xs text-gray-300">201-300</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-3 rounded border border-gray-500/50 shadow-sm" style={{ backgroundColor: '#991b1b' }}></div>
                    <span className="text-xs text-gray-300">300+</span>
                  </motion.div>
                </div>
              </div>
              
              {/* Reports Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div>
                    <span className="text-sm font-medium text-blue-100">Get-It-Done Reports</span>
                    <p className="text-xs text-blue-300/80">Community-reported issues</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Interactive Layers Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Layers className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold text-gray-200">Interactive Layers</p>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showTransit}
                      onChange={(e) => {
                        setShowTransit(e.target.checked);
                        trackEvent('layer_toggle', { 
                          layer: 'transit', 
                          enabled: e.target.checked 
                        });
                      }}
                      className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-1 bg-green-500 rounded-full shadow-sm"></div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-200 group-hover:text-white transition-colors">Transit System</span>
                        <p className="text-xs text-gray-400">Routes & stops</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showServices}
                      onChange={(e) => {
                        setShowServices(e.target.checked);
                        trackEvent('layer_toggle', { 
                          layer: 'services', 
                          enabled: e.target.checked 
                        });
                      }}
                      className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500 drop-shadow-sm" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-200 group-hover:text-white transition-colors">Support Services</span>
                        <p className="text-xs text-gray-400">Shelter, food & health</p>
                      </div>
                    </div>
                  </label>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}

      {/* Mobile: Floating Legend Button - Only show when legend is collapsed */}
      {!isLoading && !isLegendExpanded && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsLegendExpanded(true)}
          className="fixed bottom-6 left-6 z-50 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors"
        >
          <MapPin className="h-5 w-5" />
        </motion.button>
      )}

      {/* Timeline Controls - Dynamic positioning */}
      {!isLoading && (
      <motion.div 
        className={`absolute z-40 ${
          isMobile ? 'left-0 w-full px-4' : 'bottom-4 sm:bottom-6 sm:px-0'
        }`}
        style={{
          top: isMobile ? '7rem' : 'auto'
        }}
        animate={!isMobile ? {
          left: isTablet ? '15px' : (isSidebarExpanded ? 'calc((100vw - 350px) / 2 - (100vw - 350px - 4rem) * 0.25)' : '50%'),
          x: isTablet ? '0%' : (isSidebarExpanded ? '0%' : '-50%'),
          width: isTablet ? (isSidebarExpanded ? 'calc(100vw - 340px)' : 'calc(100vw - 80px)') : (isSidebarExpanded ? 'calc((100vw - 350px - 4rem) * 0.5)' : "42.5%"),
        } : {}}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <div className={!isMobile && !isSidebarExpanded ? 'mx-8' : ''}>
          <TimelapseControls 
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>
      </motion.div>
      )}

      {/* Analytics Sidebar - Mobile: Bottom Sheet, Desktop: Right Sidebar */}
      {(!isMobile || isSidebarExpanded) && !isLoading && (
        <motion.div
          className={`fixed z-50 ${
            isMobile 
              ? 'bottom-0 left-0 right-0' 
              : 'bottom-auto left-auto right-0 w-80 lg:w-96'
          } md:h-[calc(100vh-9rem)] lg:h-[calc(100vh-12rem)]`}
          style={{
            top: isMobile ? 'auto' : isTablet ? '5rem' : '12rem',
            left: isMobile ? '0' : 'auto',
            right: isMobile ? '0' : '0'
          }}
          initial={false}
          animate={{
            // Mobile: slide up from bottom
            height: isSidebarExpanded ? (isMobile ? '70vh' : '100vh') : 'auto',
            // Desktop & Tablet: slide in from right
            width: !isMobile ? (isSidebarExpanded ? (isTablet ? 320 : 350) : 60) : 'auto'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
        <div className="h-full backdrop-blur-xl border-l md:border-t-0 border-t overflow-hidden md:rounded-none rounded-t-2xl" style={{
          backgroundColor: '#0f172a',
          borderColor: '#71717a'
        }}>
          {/* Header */}
          <div className="border-b" style={{ borderColor: '#71717a' }}>
            {/* Top Row: Collapse Button */}
            <div className="flex justify-end p-3 pb-2">
              <button
                onClick={() => {
                  const newState = !isSidebarExpanded;
                  setIsSidebarExpanded(newState);
                  trackEvent('sidebar_toggle', { 
                    action: newState ? 'expand' : 'collapse' 
                  });
                }}
                className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 group"
                style={{
                  color: '#71717a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = '#71717a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#71717a';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Desktop & Tablet: BarChart3 when collapsed, ChevronLeft when expanded */}
                <div className="hidden sm:block">
                {isSidebarExpanded ? (
                   <ChevronLeft className="h-4 w-4 group-hover:scale-110 transition-transform" />
                ) : (
                  <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                )}
                </div>
                {/* Mobile only: Down arrow when expanded, up arrow when collapsed */}
                <div className="sm:hidden">
                  {isSidebarExpanded ? (
                    <ChevronRight className="h-4 w-4 rotate-90 group-hover:scale-110 transition-transform" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 -rotate-90 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </button>
            </div>

            {/* Second Row: Full-Width Tabs */}
            <AnimatePresence>
              {isSidebarExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 pb-3"
                >
                  <div className="backdrop-blur-sm rounded-xl p-1 border" style={{
                    backgroundColor: '#0f172a',
                    borderColor: '#71717a'
                  }}>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => {
                          setActiveTab('analytics');
                          trackEvent('tab_switch', { tab_name: 'analytics' });
                        }}
                        className={`relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all duration-200 ${
                          activeTab === 'analytics'
                            ? 'text-white shadow-lg'
                            : 'hover:text-white'
                        }`}
                        style={{
                          backgroundColor: activeTab === 'analytics' ? '#0ea5e9' : 'transparent',
                          color: activeTab === 'analytics' ? '#ffffff' : '#71717a',
                          boxShadow: activeTab === 'analytics' ? '0 10px 15px -3px rgba(14, 165, 233, 0.25)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (activeTab !== 'analytics') {
                            e.currentTarget.style.backgroundColor = 'rgba(113, 113, 122, 0.5)';
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeTab !== 'analytics') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#71717a';
                          }
                        }}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm font-medium">Analytics</span>
                        {activeTab === 'analytics' && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-lg -z-10"
                            style={{ backgroundColor: '#0ea5e9' }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('ai-insights');
                          trackEvent('tab_switch', { tab_name: 'ai-insights' });
                        }}
                        className={`relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all duration-200 ${
                          activeTab === 'ai-insights'
                            ? 'text-white shadow-lg'
                            : 'hover:text-white'
                        }`}
                        style={{
                          backgroundColor: activeTab === 'ai-insights' ? '#10b981' : 'transparent',
                          color: activeTab === 'ai-insights' ? '#ffffff' : '#71717a',
                          boxShadow: activeTab === 'ai-insights' ? '0 10px 15px -3px rgba(16, 185, 129, 0.25)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (activeTab !== 'ai-insights') {
                            e.currentTarget.style.backgroundColor = 'rgba(113, 113, 122, 0.5)';
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeTab !== 'ai-insights') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#71717a';
                          }
                        }}
                      >
                        <Bot className="h-4 w-4" />
                        <span className="text-sm font-medium">AI Insights</span>
                        {activeTab === 'ai-insights' && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-lg -z-10"
                            style={{ backgroundColor: '#10b981' }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Content */}
          <AnimatePresence>
            {isSidebarExpanded && (() => {
              const metrics = calculateMetrics();
              
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 pt-8 space-y-6 overflow-y-auto h-[calc(100%-80px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                >
                  {activeTab === 'analytics' ? (
                    <>
                      {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Total Count Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.5 }}
                      className="bg-gray-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        <div className="flex items-center text-sm">
                          {metrics.monthOverMonthChange >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-red-400 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-400 mr-1" />
                          )}
                          <span className={metrics.monthOverMonthChange >= 0 ? "text-red-400" : "text-green-400"}>
                            {Math.abs(metrics.monthOverMonthChange)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{metrics.totalHomelessCount.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 mb-3">Total Count</div>
                      {/* Mini sparkline */}
                      <div className="h-8 flex items-end space-x-1">
                        {[85, 92, 78, 88, 95, 82, 90].map((value, index) => (
                          <div
                            key={index}
                            className="flex-1 bg-gradient-to-t from-blue-500/50 to-blue-400 rounded-t"
                            style={{ height: `${value}%` }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Coverage Score Card */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        <div 
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${metrics.coverageScore >= 80 ? '#10b981' : metrics.coverageScore >= 60 ? '#f59e0b' : '#ef4444'}20`,
                            color: metrics.coverageScore >= 80 ? '#10b981' : metrics.coverageScore >= 60 ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          {metrics.coverageScore >= 80 ? 'Good' : metrics.coverageScore >= 60 ? 'Warning' : 'Critical'}
                        </div>
                      </div>
                      <div className="flex items-center justify-center mb-2">
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#374151"
                              strokeWidth="2"
                            />
                            <motion.path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={metrics.coverageScore >= 80 ? '#10b981' : metrics.coverageScore >= 60 ? '#f59e0b' : '#ef4444'}
                              strokeWidth="2"
                              strokeDasharray={`${metrics.coverageScore}, 100`}
                              initial={{ strokeDasharray: "0, 100" }}
                              animate={{ strokeDasharray: `${metrics.coverageScore}, 100` }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{metrics.coverageScore}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 text-center">Coverage Score</div>
                    </motion.div>

                    {/* Growth Rate Card */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-gray-900/80 backdrop-blur-sm border border-green-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <div className="text-xs text-gray-400">vs last month</div>
                      </div>
                      <div className={`text-2xl font-bold mb-1 ${metrics.monthOverMonthChange >= 0 ? "text-red-400" : "text-green-400"}`}>
                        {metrics.monthOverMonthChange >= 0 ? "+" : ""}{metrics.monthOverMonthChange}%
                      </div>
                      <div className="text-xs text-gray-400 mb-3">Growth Rate</div>
                      {/* Mini bar chart */}
                      <div className="h-6 flex items-end space-x-1">
                        {[-2.1, -1.5, 0.8, metrics.monthOverMonthChange].map((value, index) => (
                          <div
                            key={index}
                            className={`flex-1 rounded-t ${value >= 0 ? "bg-red-400" : "bg-green-400"}`}
                            style={{ height: `${Math.abs(value) * 10 + 10}px` }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Active Reports Card */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-gray-900/80 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Target className="h-5 w-5 text-yellow-400" />
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-xs text-yellow-400">Active</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{metrics.getItDoneCount}</div>
                      <div className="text-xs text-gray-400 mb-3">Reports This Month</div>
                      {/* Mini donut indicator */}
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-4 border-gray-700 border-t-yellow-400 animate-spin" style={{animationDuration: '3s'}}></div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Hot Zones List */}
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 mb-6 lg:mb-60"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <MapPin className="h-5 w-5 text-red-400" />
                      <h3 className="text-sm font-semibold text-white">Hot Zones</h3>
                    </div>
                    <div className="space-y-3">
                      {zipcodeGeoJSON?.features
                        .filter(f => (f.properties?.unshelteredCount || 0) > 0)
                        .sort((a, b) => (b.properties?.unshelteredCount || 0) - (a.properties?.unshelteredCount || 0))
                        .reduce((unique, feature) => {
                          const zipcode = feature.properties?.ZIP || feature.properties?.ZIPCODE || feature.properties?.zip;
                          if (!unique.find(f => {
                            const existingZip = f.properties?.ZIP || f.properties?.ZIPCODE || f.properties?.zip;
                            return existingZip === zipcode;
                          })) {
                            unique.push(feature);
                          }
                          return unique;
                        }, [] as GeoJSON.Feature[])
                        .slice(0, 8)
                        .map((feature, index) => {
                          const zipcode = feature.properties?.ZIP || feature.properties?.ZIPCODE || feature.properties?.zip;
                          const cities = feature.properties?.cities;
                          const cityName = cities && Array.isArray(cities) && cities.length > 0 ? cities[0] : null;
                          const count = feature.properties?.unshelteredCount || 0;
                          const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4'];
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                              className="p-3 bg-gray-800/20 border border-gray-700/20 rounded hover:bg-gray-800/40 cursor-pointer transition-colors"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: colors[index] }}></div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-white truncate">
                                    {zipcode ? `ZIP ${zipcode}` : 'Unknown Area'}
                                  </div>
                                  <div className="text-xs text-gray-400 leading-relaxed">
                                    {count.toLocaleString()} people
                                    {cityName && ` • ${cityName}`}
                                  </div>
                                </div>
                                <div className="flex items-center text-xs">
                                  <TrendingUp className="h-3 w-3 text-red-400 mr-1" />
                                  <span className="text-red-400">+2.1%</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        }) || (
                        <div className="text-gray-400 text-sm">No data available</div>
                      )}
                    </div>
                  </motion.div>
                    </>
                  ) : (
                    <>
                      {/* Enhanced AI Insights Content */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        {/* AI Assistant Chat Interface - Moved to top */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="backdrop-blur-sm border rounded-lg p-4"
                          style={{
                            backgroundColor: '#0f172a',
                            borderColor: '#71717a'
                          }}
                        >
                          <div className="flex items-center space-x-2 mb-4">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <Bot className="h-5 w-5" style={{ color: '#0ea5e9' }} />
                            </motion.div>
                            <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>AI Assistant</h3>
                            <span className="text-xs px-2 py-1 rounded border" style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              color: '#10b981',
                              borderColor: 'rgba(16, 185, 129, 0.3)'
                            }}>Online</span>
                          </div>
                          
                          {/* Chat Messages */}
                          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            {/* Assistant Message */}
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0ea5e9' }}>
                                <Bot className="h-3 w-3" style={{ color: '#ffffff' }} />
                              </div>
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: 0.4 }}
                                className="rounded-lg p-3 max-w-[80%]"
                                style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
                              >
                                <p className="text-sm" style={{ color: '#f1f5f9' }}>
                                  Hello! I&apos;m your AI assistant for homeless services data. I can help you analyze trends, find insights, and answer questions about the data. What would you like to explore?
                                </p>
                              </motion.div>
                            </motion.div>

                            {/* User Message Example */}
                            <motion.div 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.6 }}
                              className="flex items-start space-x-2 justify-end"
                            >
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: 0.7 }}
                                className="border rounded-lg p-3 max-w-[80%]"
                                style={{
                                  backgroundColor: 'rgba(14, 165, 233, 0.2)',
                                  borderColor: 'rgba(14, 165, 233, 0.3)'
                                }}
                              >
                                <p className="text-sm" style={{ color: '#f1f5f9' }}>
                                  What are the main factors contributing to the downtown increase?
                                </p>
                              </motion.div>
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#71717a' }}>
                                <span className="text-xs font-medium" style={{ color: '#ffffff' }}>U</span>
                              </div>
                            </motion.div>

                            {/* Assistant Response */}
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.9 }}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0ea5e9' }}>
                                <Bot className="h-3 w-3" style={{ color: '#ffffff' }} />
                              </div>
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: 1.0 }}
                                className="rounded-lg p-3 max-w-[80%]"
                                style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
                              >
                                <p className="text-sm" style={{ color: '#f1f5f9' }}>
                                  Based on the data analysis, three key factors are driving the downtown increase:
                                </p>
                                <ul className="text-sm mt-2 space-y-1" style={{ color: '#f1f5f9' }}>
                                  <li>• Increased transit accessibility (40% correlation)</li>
                                  <li>• New shelter capacity limitations (25% impact)</li>
                                  <li>• Economic factors and job market changes (35% influence)</li>
                                </ul>
                              </motion.div>
                            </motion.div>
                          </div>

                          {/* Chat Input */}
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1"
                                style={{
                                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                  borderColor: 'rgba(113, 113, 122, 0.5)',
                                  color: '#ffffff',
                                  borderWidth: '1px',
                                  borderStyle: 'solid'
                                }}
                                disabled
                              />
                              <div className="absolute inset-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(113, 113, 122, 0.2)' }}>
                                <span className="text-xs" style={{ color: '#71717a' }}>Demo Mode - Input Disabled</span>
                              </div>
                            </div>
                            <button
                              className="border px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                                borderColor: 'rgba(14, 165, 233, 0.3)',
                                color: '#0ea5e9'
                              }}
                              disabled
                            >
                              Send
                            </button>
                          </div>
                        </motion.div>

                        {/* Smart Analysis Section */}
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="bg-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-2 mb-4">
                            <Bot className="h-5 w-5 text-purple-400" />
                            <h3 className="text-sm font-semibold text-white">Smart Analysis</h3>
                            <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">Live</span>
                          </div>
                          
                          <div className="space-y-3">
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              whileHover={{ scale: 1.02 }}
                              className="p-3 bg-purple-900/20 border border-purple-500/20 rounded hover:bg-purple-900/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                  <p className="text-sm text-gray-200 leading-relaxed">
                                    Downtown areas show a 23% increase in reports compared to last month, with highest concentration near transit centers.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              whileHover={{ scale: 1.02 }}
                              className="p-3 bg-blue-900/20 border border-blue-500/20 rounded hover:bg-blue-900/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                  <p className="text-sm text-gray-200 leading-relaxed">
                                    Service utilization peaks during 10-11 AM and 3-4 PM, correlating with meal service times.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.6 }}
                              whileHover={{ scale: 1.02 }}
                              className="p-3 bg-green-900/20 border border-green-500/20 rounded hover:bg-green-900/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                  <p className="text-sm text-gray-200 leading-relaxed">
                                    Predictive model suggests optimal service placement could reduce response times by 15%.
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.7 }}
                              whileHover={{ scale: 1.02 }}
                              className="p-3 bg-orange-900/20 border border-orange-500/20 rounded hover:bg-orange-900/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                  <p className="text-sm text-gray-200 leading-relaxed">
                                    Weather patterns indicate 40% higher service demand during rainy days and extreme heat.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Trend Predictions */}
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="bg-gray-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 mb-6 lg:mb-60"
                        >
                          <div className="flex items-center space-x-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                            <h3 className="text-sm font-semibold text-white">Trend Predictions</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center justify-between p-2 bg-blue-900/10 rounded hover:bg-blue-900/20 transition-colors cursor-pointer"
                            >
                              <span className="text-sm text-gray-300">Next 30 days</span>
                              <span className="text-sm text-blue-400 font-medium">+12% increase expected</span>
                            </motion.div>
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.6 }}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center justify-between p-2 bg-green-900/10 rounded hover:bg-green-900/20 transition-colors cursor-pointer"
                            >
                              <span className="text-sm text-gray-300">Service efficiency</span>
                              <span className="text-sm text-green-400 font-medium">+8% improvement</span>
                            </motion.div>
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.7 }}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center justify-between p-2 bg-yellow-900/10 rounded hover:bg-yellow-900/20 transition-colors cursor-pointer"
                            >
                              <span className="text-sm text-gray-300">High-risk areas</span>
                              <span className="text-sm text-yellow-400 font-medium">3 new hotspots</span>
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </motion.div>
      )}



      {/* Mobile: Floating Action Button for Analytics - Only show when sidebar is collapsed */}
      {!isSidebarExpanded && !isLoading && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsSidebarExpanded(true)}
          className="fixed bottom-6 right-6 z-50 sm:hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
        >
          <BarChart3 className="h-6 w-6" />
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </motion.button>
      )}


      {/* Loading Overlay */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: '#0f172a' }}
        >
          <div className="relative z-10 flex flex-col items-center space-y-8">
            {/* Main Loading Animation */}
            <div className="relative">
              {/* Outer Ring */}
              <div className="w-32 h-32 border-4 rounded-full animate-spin" style={{
                borderColor: '#71717a',
                borderTopColor: '#0ea5e9',
                borderRightColor: '#10b981',
                animationDuration: '3s'
              }}></div>
              
              {/* Middle Ring */}
              <div className="absolute inset-4 w-24 h-24 border-4 rounded-full animate-spin" style={{
                borderColor: '#71717a',
                borderTopColor: '#f97316',
                borderLeftColor: '#10b981',
                animationDuration: '2s',
                animationDirection: 'reverse'
              }}></div>
              
              {/* Inner Ring */}
              <div className="absolute inset-8 w-16 h-16 border-4 rounded-full animate-spin" style={{
                borderColor: '#71717a',
                borderTopColor: '#f97316',
                borderBottomColor: '#f43f5e',
                animationDuration: '1.5s'
              }}></div>

              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <BarChart3 className="w-8 h-8" style={{ color: '#0ea5e9' }} />
                </motion.div>
              </div>
            </div>

            {/* Loading Text with Typewriter Effect */}
            <div className="text-center space-y-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold"
                style={{ color: '#ffffff' }}
              >
                Vulnerability Atlas
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center space-x-2"
              >
                <motion.span 
                  className="text-lg font-medium"
                  style={{ color: '#71717a' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Analyzing data
                </motion.span>
                <motion.div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#0ea5e9' }}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>

              {/* Progress Steps */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="space-y-3 mt-8"
              >
                {[
                  { label: 'Loading geographic data', delay: 0 },
                  { label: 'Processing homeless services', delay: 0.5 },
                  { label: 'Calculating metrics', delay: 1 },
                  { label: 'Initializing visualization', delay: 1.5 }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2 + step.delay }}
                    className="flex items-center space-x-3 text-sm"
                    style={{ color: '#71717a' }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: step.delay
                      }}
                      className="w-4 h-4 border-2 rounded-full"
                      style={{
                        borderColor: '#71717a',
                        borderTopColor: '#0ea5e9'
                      }}
                    />
                    <span>{step.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Progress Bar */}
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="w-64 h-1 rounded-full overflow-hidden mt-6"
                style={{ backgroundColor: '#71717a' }}
              >
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: '#0ea5e9' }}
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>

            {/* Floating Data Points Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: 'rgba(14, 165, 233, 0.3)',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
}