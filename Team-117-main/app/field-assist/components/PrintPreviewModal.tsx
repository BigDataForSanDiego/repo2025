'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessedService } from '../types';
import { MOCK_DIRECTIONS, DEMO_LOCATION, TRANSIT_DIRECTIONS } from '../utils/demoData';

interface PrintPreviewModalProps {
  service: ProcessedService;
  userInput: string;
  onClose: () => void;
}

export default function PrintPreviewModal({ service, onClose }: PrintPreviewModalProps) {
  const directions = MOCK_DIRECTIONS[service.id];
  const transitDirections = TRANSIT_DIRECTIONS[service.id];
  const currentDate = new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  // State for storing the actual walking route
  const [routeCoordinates, setRouteCoordinates] = useState<number[][]>([]);

  // Fetch actual walking route when component mounts
  useEffect(() => {
    const fetchWalkingRoute = async () => {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) return;

      try {
        const start = `${DEMO_LOCATION.longitude},${DEMO_LOCATION.latitude}`;
        const end = `${service.longitude},${service.latitude}`;
        
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?geometries=geojson&access_token=${mapboxToken}`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setRouteCoordinates(route.geometry.coordinates);
        } else {
          // Fallback to straight line if no route found
          setRouteCoordinates([
            [DEMO_LOCATION.longitude, DEMO_LOCATION.latitude],
            [service.longitude, service.latitude]
          ]);
        }
      } catch {
        console.log('Route fetch failed, using straight line fallback');
        // Fallback to straight line on error
        setRouteCoordinates([
          [DEMO_LOCATION.longitude, DEMO_LOCATION.latitude],
          [service.longitude, service.latitude]
        ]);
      } finally {
        // Route fetching complete
      }
    };

    fetchWalkingRoute();
  }, [service.longitude, service.latitude]);

  const generateMapImageUrl = (service: ProcessedService) => {
    // Generate a static Mapbox map image URL for printing
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    // Calculate center point between user and service location
    const centerLon = (DEMO_LOCATION.longitude + service.longitude) / 2;
    const centerLat = (DEMO_LOCATION.latitude + service.latitude) / 2;
    
    // Calculate distance to determine appropriate zoom level
    const lonDiff = Math.abs(DEMO_LOCATION.longitude - service.longitude);
    const latDiff = Math.abs(DEMO_LOCATION.latitude - service.latitude);
    const maxDiff = Math.max(lonDiff, latDiff);
    
    // Determine zoom level based on distance (with some padding)
    let zoom = 14;
    if (maxDiff > 0.05) zoom = 11;      // Very far
    else if (maxDiff > 0.02) zoom = 12; // Far
    else if (maxDiff > 0.01) zoom = 13; // Medium
    else zoom = 14;                     // Close
    
    const width = 540;
    const height = 320;
    
    if (!mapboxToken) {
      return '/api/placeholder/600/400';
    }

    // Create markers for the static map with custom colors
    const userMarker = `pin-s-u+3B82F6(${DEMO_LOCATION.longitude},${DEMO_LOCATION.latitude})`;
    const serviceMarker = `pin-s-s+10B981(${service.longitude},${service.latitude})`;
    
    // Use actual route coordinates if available, otherwise fallback to straight line
    const coordinates = routeCoordinates.length > 0 ? routeCoordinates : [
      [DEMO_LOCATION.longitude, DEMO_LOCATION.latitude],
      [service.longitude, service.latitude]
    ];
    
    // Create a GeoJSON line with actual walking route
    const lineGeoJSON = {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "properties": {
          "stroke": "#0d9488",
          "stroke-width": 4,
          "stroke-opacity": 1
        },
        "geometry": {
          "type": "LineString",
          "coordinates": coordinates
        }
      }]
    };
    
    const encodedGeoJSON = encodeURIComponent(JSON.stringify(lineGeoJSON));
    
    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/geojson(${encodedGeoJSON}),${userMarker},${serviceMarker}/${centerLon},${centerLat},${zoom}/${width}x${height}@2x?access_token=${mapboxToken}`;
  };

  return (
    <>
      {/* Print-specific CSS */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: letter;
          }
          .printable-content {
            width: 100% !important;
            max-width: 7.5in !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            margin: 0 auto !important;
          }
          .printable-content h1 {
            font-size: 18px !important;
            margin-bottom: 4px !important;
          }
          .printable-content h2 {
            font-size: 14px !important;
            margin-bottom: 2px !important;
          }
          .printable-content h3 {
            font-size: 13px !important;
            margin-bottom: 6px !important;
          }
          .printable-content h4 {
            font-size: 12px !important;
            margin-bottom: 4px !important;
          }
          .printable-content .space-y-2 > * + * {
            margin-top: 4px !important;
          }
          .printable-content .space-y-3 > * + * {
            margin-top: 6px !important;
          }
          .printable-content .mb-4 {
            margin-bottom: 8px !important;
          }
          .printable-content .mb-3 {
            margin-bottom: 6px !important;
          }
          .printable-content .p-4 {
            padding: 8px !important;
          }
          .printable-content .p-3 {
            padding: 6px !important;
          }
          .printable-content img {
            height: 120px !important;
          }
          .printable-content .transport-grid {
            display: flex !important;
            gap: 8px !important;
          }
          .printable-content .transport-column {
            flex: 1 !important;
            width: 48% !important;
          }
        }
      `}</style>
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Print Preview</h2>
              <p className="text-gray-600 text-sm mt-1">Ready to print directions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center space-x-2 shadow-lg"
              >
                <span>🖨️</span>
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Print Content Preview */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div id="print-content" className="printable-content">
              {/* 8.5" x 11" Page Content */}
              <div className="bg-white p-4 mx-auto print:p-3" style={{ width: '7.5in', maxHeight: '10in' }}>
                
                {/* Header */}
                <div className="text-center border-b border-gray-300 pb-2 mb-3 print:pb-1 print:mb-2">
                  <h1 className="text-xl font-bold text-gray-800 mb-1 print:text-lg print:mb-0">Your Directions</h1>
                  <h2 className="text-base text-blue-600 font-semibold print:text-sm">{service.name}</h2>
                  <p className="text-gray-600 text-xs print:text-xs">Generated on {currentDate}</p>
                </div>

                {/* Service Information Box - Consolidated */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 print:p-2 print:mb-2">
                  <div className="grid grid-cols-2 gap-3 print:gap-1">
                    <div className="space-y-1 print:space-y-0">
                      <div>
                        <span className="font-semibold text-gray-700 text-xs print:text-xs">Organization:</span>
                        <p className="text-gray-600 text-xs print:text-xs">{service.organization}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 text-xs print:text-xs">Address:</span>
                        <p className="text-gray-600 text-xs print:text-xs leading-tight">{service.address}</p>
                      </div>
                      {service.phone && (
                        <div>
                          <span className="font-semibold text-gray-700 text-xs print:text-xs">Phone:</span>
                          <p className="text-gray-600 text-xs print:text-xs">{service.phone}</p>
                        </div>
                      )}
                      {service.hours && (
                        <div>
                          <span className="font-semibold text-gray-700 text-xs print:text-xs">Hours:</span>
                          <p className="text-gray-600 text-xs print:text-xs">{service.hours}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1 print:space-y-0">
                      <div>
                        <span className="font-semibold text-gray-700 text-xs print:text-xs">Distance:</span>
                        <p className="text-blue-600 font-semibold text-sm print:text-xs">{service.distance}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 text-xs print:text-xs">Walking:</span>
                        <p className="text-green-600 font-semibold text-sm print:text-xs">{service.walkTime}</p>
                      </div>
                      {service.transitTime && (
                        <div>
                          <span className="font-semibold text-gray-700 text-xs print:text-xs">Transit:</span>
                          <p className="text-purple-600 font-semibold text-sm print:text-xs">{service.transitTime.time}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-700 text-xs print:text-xs">Status:</span>
                        <p className="text-green-600 font-medium text-xs print:text-xs">Open Now</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="mb-3 print:mb-2">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 print:text-xs">Route Map</h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={generateMapImageUrl(service)}
                      alt="Route map showing walking directions"
                      className="w-full h-28 object-cover print:h-20"
                      onError={(e) => {
                        // Fallback to a placeholder if map fails to load
                        e.currentTarget.src = 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="540" height="100" viewBox="0 0 540 100" xmlns="http://www.w3.org/2000/svg">
                            <rect width="540" height="100" fill="#f3f4f6"/>
                            <rect x="40" y="15" width="460" height="70" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2"/>
                            <line x1="120" y1="50" x2="420" y2="50" stroke="#0d9488" stroke-width="4" opacity="1"/>
                            <circle cx="120" cy="50" r="6" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
                            <circle cx="420" cy="50" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                            <text x="270" y="12" text-anchor="middle" font-family="Arial" font-size="11" fill="#374151">Route Map</text>
                            <text x="120" y="95" text-anchor="middle" font-family="Arial" font-size="8" fill="#3b82f6">Start</text>
                            <text x="420" y="95" text-anchor="middle" font-family="Arial" font-size="8" fill="#10b981">Destination</text>
                          </svg>
                        `);
                      }}
                    />
                  </div>
                </div>

                {/* Transportation Options - Side by Side */}
                <div className="mb-3 print:mb-2">
                  <h3 className="font-bold text-gray-800 text-base mb-2 print:text-sm print:mb-1">Transportation Options</h3>
                  
                  <div className="transport-grid grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2">
                    {/* Left Column: Walking Directions + About Service */}
                    <div className="transport-column space-y-2">
                      {/* Walking Directions */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 print:p-1">
                        <h4 className="font-bold text-gray-800 text-xs mb-1 flex items-center">
                          <span className="mr-1">🚶</span> Walking Directions
                        </h4>
                        <div className="space-y-1 print:space-y-0">
                          {directions?.steps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="flex-shrink-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium text-xs">{step.instruction}</p>
                                {step.distance && (
                                  <p className="text-gray-500 text-xs">{step.distance}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-blue-300">
                          <div className="text-center">
                            <span className="text-xs font-bold text-blue-600">
                              {directions?.totalDistance} • {directions?.totalDuration}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* About This Service */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 print:p-1">
                        <h4 className="font-bold text-gray-800 text-xs mb-1">About This Service</h4>
                        <p className="text-gray-700 leading-snug text-xs">{service.description}</p>
                        
                        {service.eligibility && (
                          <div className="mt-2 pt-1 border-t border-green-300">
                            <span className="font-semibold text-gray-700 text-xs">Eligibility: </span>
                            <span className="text-gray-600 text-xs">{service.eligibility}</span>
                          </div>
                        )}

                        {service.capacity && (
                          <div className="mt-1">
                            <span className="font-semibold text-gray-700 text-xs">Availability: </span>
                            <span className="text-gray-600 text-xs">{service.capacity}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transit Options */}
                    {service.transitTime && transitDirections && (
                      <div className="transport-column bg-purple-50 border border-purple-200 rounded-lg p-2 print:p-1">
                        <h4 className="font-bold text-gray-800 text-xs mb-1 flex items-center">
                          <span className="mr-1">🚌</span> Transit Directions
                        </h4>
                        
                        <div className="mb-2 p-1 bg-purple-100 rounded text-center">
                          <span className="font-semibold text-purple-800 text-xs">Route: {transitDirections.route}</span>
                        </div>
                        
                        <div className="space-y-1 print:space-y-0">
                          {transitDirections.steps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="flex-shrink-0 w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium text-xs">{step.instruction}</p>
                                <p className="text-gray-500 text-xs">{step.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-purple-300">
                          <div className="text-center">
                            <span className="text-xs font-bold text-purple-600">
                              {service.transitTime.time}
                            </span>
                            <div className="text-xs text-gray-600 mt-1">
                              {service.transitTime.details}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                {/* QR Code Section */}
                <div className="mb-2 print:mb-1">
                  <div className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg print:p-1">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-xs print:text-xs">Digital Access</h4>
                      <p className="text-xs text-gray-600 print:text-xs">Scan for directions and service details</p>
                    </div>
                    <div className="w-10 h-10 bg-white border border-purple-300 rounded-lg flex items-center justify-center print:w-8 print:h-8 p-1">
                      <img 
                        src="/adobe-express-qr-code.svg" 
                        alt="QR Code for directions and service details"
                        className="w-8 h-8 print:w-6 print:h-6 object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-300 pt-2 text-center print:pt-1">
                  <p className="text-xs text-gray-400 print:text-xs">
                    If you need immediate assistance, call 211 or 911 for emergencies
                  </p>
                </div>

              </div>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}