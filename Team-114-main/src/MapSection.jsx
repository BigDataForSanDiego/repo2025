import { useState, useEffect, useRef, useCallback } from 'react'
import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { MapIcon, AlertIcon, PoliceIcon, FireIcon, HospitalIcon, HandshakeIcon, SearchIcon, PillIcon, AtmIcon, CarIcon, GasStationIcon, SafeLocationIcon } from './Icons'

// Helper function to normalize city names for Firebase document IDs
const normalizeCityName = (cityName) => {
  if (!cityName || cityName === 'Unknown City') {
    return 'unknown'
  }
  
  return cityName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim()
}

const MapSection = () => {
  const [userLocation, setUserLocation] = useState(null)
  const [currentCity, setCurrentCity] = useState('')
  const [map, setMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [locationPermission, setLocationPermission] = useState('prompt') // 'granted', 'denied', 'prompt'
  const mapRef = useRef(null)
  // Radius (in kilometers) for nearby searches and ref to track markers
  const [radiusKm, setRadiusKm] = useState(2)
  const [lastSearchType, setLastSearchType] = useState(null)
  const markersRef = useRef([])
  // State for nearby search results and selected location
  const [searchResults, setSearchResults] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [expandedServiceType, setExpandedServiceType] = useState(null)
  const directionsRendererRef = useRef(null)
  const [showPlacesModal, setShowPlacesModal] = useState(false)
  const [showTravelModeModal, setShowTravelModeModal] = useState(false)
  const [selectedTravelMode, setSelectedTravelMode] = useState('WALK')
  const [travelModeDurations, setTravelModeDurations] = useState({ WALK: null, DRIVE: null, TRANSIT: null })
  // Alert reports display
  const [alertReports, setAlertReports] = useState({
    police_activity: [],
    fire: [],
    medical_emergency: [],
    accident: []
  })
  const [safeLocations, setSafeLocations] = useState([])
  const alertMarkersRef = useRef([])
  const safeLocationMarkersRef = useRef([])
  const [showAlerts, setShowAlerts] = useState(false)
  const [showSafeLocations, setShowSafeLocations] = useState(false)
  const [timeFilterMinutes, setTimeFilterMinutes] = useState(60) // Default to 60 minutes

  // Mark component as mounted
  useEffect(() => {
    setMounted(true)
    // Check initial location permission
    if (navigator.permissions) {
      navigator.permissions.query({name: 'geolocation'}).then((result) => {
        setLocationPermission(result.state)
      })
    }
  }, [])

  // Request location permission explicitly
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission('granted')
          // Force re-run of useEffect by changing locationPermission state
        },
        (error) => {
          console.error('Location permission denied:', error)
          setLocationPermission('denied')
          // Force re-run of useEffect by changing locationPermission state
        }
      )
    }
  }

  // Map initialization functions - defined outside useEffect for accessibility
  const initializeMap = () => {
    // Multiple approaches to ensure container is ready
    const tryInitialize = () => {
      if (mapRef.current) {
        console.log('Map container found, initializing...')
        initializeMapWithContainer()
        return true
      }
      return false
    }

    // Try immediately
    if (tryInitialize()) return

    // Try with requestAnimationFrame
    requestAnimationFrame(() => {
      if (tryInitialize()) return

      // Try with timeout as fallback
      setTimeout(() => {
        if (tryInitialize()) return
        
        console.error('Map container not found after all attempts')
        setIsLoading(false)
      }, 500)
    })
  }
  
  const initializeMapWithContainer = () => {
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
              setUserLocation(location)
              
              const newMap = new window.google.maps.Map(mapRef.current, {
                center: location,
                zoom: 15,
                gestureHandling: 'greedy',
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'on' }]
                  }
                ]
              })
              
              // Add user location marker
              new window.google.maps.Marker({
                position: location,
                map: newMap,
                title: 'Your Location',
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                }
              })
              
              // Get city name from coordinates with fallback
              const getCityName = async (location) => {
                try {
                  // Try Google Geocoder first
                  const geocoder = new window.google.maps.Geocoder()
                  geocoder.geocode({ location }, async (results, status) => {
                    if (status === 'OK' && results[0]) {
                      // Try different address component types for city
                      const cityComponent = results[0].address_components.find(
                        component => 
                          component.types.includes('locality') ||
                          component.types.includes('administrative_area_level_3') ||
                          component.types.includes('administrative_area_level_2') ||
                          component.types.includes('sublocality_level_1')
                      )
                      
                      if (cityComponent) {
                        console.log('City found via Google Geocoder:', cityComponent.long_name)
                        setCurrentCity(cityComponent.long_name)
                        return
                      }
                    }
                    
                    // Fallback to BigDataCloud API
                    console.log('Google Geocoder failed, trying BigDataCloud API')
                    try {
                      const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lng}&localityLanguage=en`
                      )
                      const data = await response.json()
                      const city = data.city || data.locality || data.principalSubdivision || 'Unknown City'
                      console.log('City found via BigDataCloud:', city)
                      setCurrentCity(city)
                    } catch (error) {
                      console.error('Both geocoding services failed:', error)
                      setCurrentCity('Unknown City')
                    }
                  })
                } catch (error) {
                  console.error('Geocoding error:', error)
                  setCurrentCity('Unknown City')
                }
              }
              
              getCityName(location)
              
              setMap(newMap)
              setIsLoading(false)
            },
            () => {
              // Default to San Francisco if geolocation fails
              const defaultLocation = { lat: 37.7749, lng: -122.4194 }
              setUserLocation(defaultLocation)
              setCurrentCity('San Francisco')
              
              if (mapRef.current) {
                const newMap = new window.google.maps.Map(mapRef.current, {
                  center: defaultLocation,
                  zoom: 12
                })
                
                setMap(newMap)
              }
              setIsLoading(false)
            }
          )
        }
    }

  // Initialize Google Maps useEffect
  useEffect(() => {
    if (!mounted) return
    
    // Only show permission prompt if permission is explicitly 'prompt'
    if (locationPermission === 'prompt') {
      // Auto-check for location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setLocationPermission('granted'),
          () => setLocationPermission('denied')
        )
      }
      return
    }

    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }
      
      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMaps)
            initializeMap()
          }
        }, 100)
        return
      }
      
      try {
        const { API_ENDPOINTS } = await import('./config.js')
        const response = await fetch(API_ENDPOINTS.mapsConfig)
        const config = await response.json()
        
        if (!config.mapsApiKey) {
          throw new Error('Maps API key not available')
        }
        
        return new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${config.mapsApiKey}&libraries=places,geometry`
          script.onload = () => {
            initializeMap()
            resolve()
          }
          script.onerror = (error) => {
            console.error('Failed to load Google Maps - likely blocked by ad blocker or extension:', error)
            // Show fallback message instead of failing
            setIsLoading(false)
            alert('Maps functionality is being blocked by your browser or an extension. Please disable ad blockers for this site or use the location features in other sections of the app.')
          }
          document.head.appendChild(script)
        })
      } catch (error) {
        console.error('Failed to load Maps configuration:', error)
        setIsLoading(false)
      }
    }

    // Only load Google Maps if we have permission and component is mounted
    if (mounted && locationPermission === 'granted') {
      loadGoogleMaps()
    }
  }, [mounted, locationPermission])

  // Separate effect to ensure Maps initialization happens after render
  useEffect(() => {
    console.log('Maps initialization check:', {
      mounted,
      locationPermission,
      hasMapRef: !!mapRef.current,
      hasGoogleMaps: !!(window.google && window.google.maps),
      hasExistingMap: !!map,
      isLoading
    })
    
    if (mounted && locationPermission === 'granted' && mapRef.current && window.google && window.google.maps && !map) {
      console.log('All conditions met, initializing map...')
      initializeMap()
    }
  }, [mounted, locationPermission, map])

  // Report police function
  const handlePoliceReport = async () => {
    if (!userLocation || !currentCity) {
      alert('Location not available. Please enable location services.')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to report police activity in your area (${currentCity})?`
    )
    
    if (confirmed) {
      try {
        console.log('Submitting police report for city:', currentCity)
        console.log('User location:', userLocation)
        
        const normalizedCity = normalizeCityName(currentCity)
        
        await addDoc(collection(db, 'alerts', 'police_activity', normalizedCity), {
          location: {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            coordinates: `${userLocation.lat},${userLocation.lng}`
          },
          cityData: {
            name: currentCity,
            normalized: normalizedCity
          },
          timestamp: serverTimestamp(),
          timeUTC: new Date().toISOString(),
          reportId: `police_${normalizedCity}_${Date.now()}`
        })
        
        console.log('Police report submitted successfully')
        
        alert('Police report submitted successfully')
        
        // Add a marker to the map
        if (map) {
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Police Report',
            icon: {
              url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red">
                  <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24)
            }
          })
        }
      } catch (error) {
        console.error('Error submitting police report:', error)
        alert('Failed to submit report. Please try again.')
      }
    }
  }

  // Report emergency services
  const handleEmergencyReport = async (type) => {
    if (!userLocation || !currentCity) {
      alert('Location not available. Please enable location services.')
      return
    }

    const confirmed = window.confirm(
      `Report ${type} at your current location?`
    )
    
    if (confirmed) {
      try {
        console.log('Submitting emergency report:', type, 'for city:', currentCity)
        console.log('User location:', userLocation)
        
        const normalizedCity = normalizeCityName(currentCity)
        const reportType = type.toLowerCase().replace(/\s+/g, '_')
        
        await addDoc(collection(db, 'alerts', reportType, normalizedCity), {
          emergencyType: type,
          location: {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            coordinates: `${userLocation.lat},${userLocation.lng}`
          },
          cityData: {
            name: currentCity,
            normalized: normalizedCity
          },
          timestamp: serverTimestamp(),
          timeUTC: new Date().toISOString(),
          reportId: `${reportType}_${normalizedCity}_${Date.now()}`
        })
        
        console.log('Emergency report submitted successfully')
        
        alert(`${type} report submitted successfully`)
        
        // Add marker with different color based on type
        const colors = {
          'Fire': '#ff4444',
          'Medical Emergency': '#ff8800', 
          'Accident': '#ffaa00',
          'Hazard': '#aa4400'
        }
        
        if (map) {
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: `${type} Report`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: colors[type] || '#ff4444',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          })
        }
      } catch (error) {
        console.error('Error submitting emergency report:', error)
        alert('Failed to submit report. Please try again.')
      }
    }
  }

  // Mark safe location
  const handleSafeLocationReport = async () => {
    if (!userLocation || !currentCity) {
      alert('Location not available. Please enable location services.')
      return
    }

    const confirmed = window.confirm(
      'Mark this location as a safe/helpful place?'
    )
    
    if (confirmed) {
      try {
        const normalizedCity = normalizeCityName(currentCity)
        
        await addDoc(collection(db, 'safeLocations', 'community_resources', normalizedCity), {
          location: {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            coordinates: `${userLocation.lat},${userLocation.lng}`
          },
          cityData: {
            name: currentCity,
            normalized: normalizedCity
          },
          timestamp: serverTimestamp(),
          reportedAt: new Date().toISOString(),
          locationId: `safe_${normalizedCity}_${Date.now()}`
        })
        
        alert('Safe location marked successfully')
        
        if (map) {
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Safe Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#00aa44',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          })
        }
      } catch (error) {
        console.error('Error marking safe location:', error)
        alert('Failed to mark location. Please try again.')
      }
    }
  }

  // Find nearby services (radiusMeters optional - if provided uses that, otherwise uses state radiusKm)
  const findNearbyServices = (type, radiusMeters) => {
    console.log('findNearbyServices called with:', type, 'map:', !!map, 'userLocation:', !!userLocation, 'google.maps:', !!window.google?.maps, 'radiusMeters:', radiusMeters)

    setLastSearchType(type)
    setExpandedServiceType(type)
    setSearchResults([])
    setSelectedLocation(null)

    if (!window.google || !window.google.maps) {
      alert('Google Maps API not loaded. Please refresh the page or disable ad blockers.')
      return
    }

    if (!map || !userLocation) {
      alert(`Cannot find nearby services: ${!map ? 'Map not loaded' : 'Location not available'}. Please ensure location access is granted.`)
      return
    }

    // Clear previous directions renderer if it exists
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null)
    }

    const service = new window.google.maps.places.PlacesService(map)
    const radiusToUse = radiusMeters ?? Math.round(radiusKm * 1000)
    const request = {
      location: userLocation,
      radius: radiusToUse,
      type: type
    }

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length) {
        // Calculate distances for each result
        const resultsWithDistance = results.slice(0, 10).map(place => {
          const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
            place.geometry.location
          )
          return { ...place, distanceMeters: distance }
        })
        setSearchResults(resultsWithDistance)
        setShowPlacesModal(true)
      } else {
        setSearchResults([])
        setShowPlacesModal(false)
      }
    })
  }

  // Show directions from user location to selected place
  const showDirections = async (place, travelMode = 'WALK') => {
    if (!map || !userLocation || !window.google || !window.google.maps) {
      alert('Map or location not available')
      return
    }

    setSelectedLocation(place)

    try {
      // Get Maps API key for Routes API call
      const response = await fetch('/api/maps-key')
      if (!response.ok) throw new Error('Failed to get Maps API key')
      const { key } = await response.json()

      // Fetch durations for all three travel modes
      const modes = ['WALK', 'DRIVE', 'TRANSIT']
      const durations = {}

      for (const mode of modes) {
        const requestBody = {
          origin: {
            location: {
              latLng: {
                latitude: userLocation.lat,
                longitude: userLocation.lng
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng()
              }
            }
          },
          travelMode: mode
        }

        const routesResponse = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask': 'routes.polyline,routes.legs,routes.duration,routes.distanceMeters'
          },
          body: JSON.stringify(requestBody)
        })

        const routesData = await routesResponse.json()

        if (routesResponse.ok && routesData.routes && routesData.routes.length > 0) {
          const route = routesData.routes[0]
          let durationSeconds = 0
          if (route.duration) {
            const durationStr = route.duration.replace('s', '')
            durationSeconds = parseInt(durationStr) || 0
          }
          durations[mode] = { seconds: durationSeconds, text: formatDuration(durationSeconds) }
        } else {
          durations[mode] = null
        }
      }

      setTravelModeDurations(durations)
      setSelectedTravelMode(travelMode)
      setShowTravelModeModal(true)
      setShowPlacesModal(false)
    } catch (error) {
      console.error('Error fetching durations:', error)
      alert(`Could not fetch route info: ${error.message}`)
    }
  }

  // Display the selected route on the map
  const displayRoute = async (travelMode) => {
    if (!selectedLocation || !userLocation) return

    try {
      const response = await fetch('/api/maps-key')
      if (!response.ok) throw new Error('Failed to get Maps API key')
      const { key } = await response.json()

      const requestBody = {
        origin: {
          location: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: selectedLocation.geometry.location.lat(),
              longitude: selectedLocation.geometry.location.lng()
            }
          }
        },
        travelMode: travelMode
      }

      const routesResponse = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'routes.polyline,routes.legs,routes.duration,routes.distanceMeters'
        },
        body: JSON.stringify(requestBody)
      })

      const routesData = await routesResponse.json()

      if (routesData.routes && routesData.routes.length > 0) {
        const route = routesData.routes[0]

        if (!route.polyline || !route.polyline.encodedPolyline) {
          alert('Could not decode route.')
          return
        }

        const polylinePoints = decodePolyline(route.polyline.encodedPolyline)
        const path = polylinePoints.map(point => ({
          lat: point[0],
          lng: point[1]
        }))

        // Clear previous polyline
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null)
        }

        // Draw new polyline
        const polyline = new window.google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 5,
          map: map
        })

        directionsRendererRef.current = polyline

        // Fit map bounds
        const bounds = new window.google.maps.LatLngBounds()
        path.forEach(point => bounds.extend(point))
        map.fitBounds(bounds, 50)
      } else {
        alert('No route found')
      }
    } catch (error) {
      console.error('Error displaying route:', error)
      alert('Could not display route')
    }
  }

  // Decode polyline (Google's polyline encoding algorithm)
  const decodePolyline = (encoded) => {
    const poly = []
    let index = 0, lat = 0, lng = 0
    
    while (index < encoded.length) {
      let result = 0, shift = 0, byte
      do {
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)
      const dlat = result & 1 ? ~(result >> 1) : result >> 1
      lat += dlat
      
      result = 0
      shift = 0
      do {
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)
      const dlng = result & 1 ? ~(result >> 1) : result >> 1
      lng += dlng
      
      poly.push([lat / 1e5, lng / 1e5])
    }
    return poly
  }

  // Format duration from seconds
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`
    }
    return `${minutes} min`
  }

  // Clear search results and directions
  const clearSearch = () => {
    setSearchResults([])
    setSelectedLocation(null)
    setExpandedServiceType(null)
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null)
    }
  }

  // Close all modals
  const closeModals = () => {
    setShowPlacesModal(false)
    setShowTravelModeModal(false)
  }

  // Simple clustering algorithm - groups nearby points together
  const clusterPoints = (points, clusterRadius = 100) => {
    if (!points || points.length === 0) return []
    
    const clusters = []
    const visited = new Set()
    
    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue
      
      const cluster = [points[i]]
      visited.add(i)
      
      // Find all nearby points
      for (let j = i + 1; j < points.length; j++) {
        if (visited.has(j)) continue
        
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(points[i].location.latitude, points[i].location.longitude),
          new window.google.maps.LatLng(points[j].location.latitude, points[j].location.longitude)
        )
        
        if (distance <= clusterRadius) {
          cluster.push(points[j])
          visited.add(j)
        }
      }
      
      clusters.push(cluster)
    }
    
    return clusters
  }

  // Calculate center point of a cluster
  const getClusterCenter = (cluster) => {
    const sum = cluster.reduce(
      (acc, point) => ({
        lat: acc.lat + point.location.latitude,
        lng: acc.lng + point.location.longitude
      }),
      { lat: 0, lng: 0 }
    )
    return {
      lat: sum.lat / cluster.length,
      lng: sum.lng / cluster.length
    }
  }

  // Fetch and display all alert types from Firebase
  const loadAlerts = useCallback(async () => {
    if (!map || !currentCity) {
      console.log('Cannot load alerts: map or city not available')
      return
    }

    try {
      const normalizedCity = normalizeCityName(currentCity)
      console.log('Fetching alerts for city:', currentCity, 'normalized:', normalizedCity)

      const alertTypes = ['police', 'fire', 'medical', 'accident']
      const allAlerts = {}
      
      // Fetch each alert type
      for (const alertType of alertTypes) {
        try {
          const response = await fetch(`/api/alerts/${alertType}?city=${encodeURIComponent(normalizedCity)}&timeFilter=${timeFilterMinutes}`)
          if (response.ok) {
            const reports = await response.json()
            allAlerts[alertType] = Array.isArray(reports) ? reports : []
            console.log(`Fetched ${alertType}:`, reports.length, 'reports')
          } else {
            allAlerts[alertType] = []
          }
        } catch (error) {
          console.error(`Error fetching ${alertType}:`, error)
          allAlerts[alertType] = []
        }
      }

      setAlertReports(allAlerts)

      // Clear existing alert markers
      alertMarkersRef.current.forEach(marker => marker.setMap(null))
      alertMarkersRef.current = []

      // Process each alert type with different colors and icons
      const alertConfig = {
        police: { color: '#135DD8', label: 'Police', icon: '🚔' },
        fire: { color: '#e74c3c', label: 'Fire', icon: '🔥' },
        medical: { color: '#f39c12', label: 'Medical', icon: '🚑' },
        accident: { color: '#8e44ad', label: 'Accident', icon: '🚗' }
      }

      // Combine all alerts for clustering
      const allAlertPoints = []
      Object.entries(allAlerts).forEach(([alertType, reports]) => {
        reports.forEach(report => {
          if (report.location && report.location.latitude && report.location.longitude) {
            allAlertPoints.push({
              ...report,
              alertType: alertType,
              lat: report.location.latitude,
              lng: report.location.longitude
            })
          }
        })
      })

      // Cluster all alerts together
      const clusters = clusterPoints(allAlertPoints, 200) // 200 meter cluster radius

      // Create markers for each cluster
      clusters.forEach((cluster, idx) => {
        const center = getClusterCenter(cluster)
        const clusterSize = cluster.length

        // Determine dominant alert type in cluster
        const alertTypeCounts = {}
        cluster.forEach(alert => {
          alertTypeCounts[alert.alertType] = (alertTypeCounts[alert.alertType] || 0) + 1
        })
        const dominantType = Object.keys(alertTypeCounts).reduce((a, b) => 
          alertTypeCounts[a] > alertTypeCounts[b] ? a : b
        )
        
        const config = alertConfig[dominantType]
        let scale = 12 + Math.min(clusterSize - 1, 8) // Larger for bigger clusters

        // Create marker
        const marker = new window.google.maps.Marker({
          position: center,
          map: map,
          title: `${config.label} alerts: ${clusterSize}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: scale,
            fillColor: config.color,
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        })

        // Add click listener to show cluster details
        marker.addListener('click', () => {
          const alertSummary = Object.entries(alertTypeCounts)
            .map(([type, count]) => `${alertConfig[type].icon} ${alertConfig[type].label}: ${count}`)
            .join('<br/>')
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="color: #000; font-family: Arial, sans-serif; padding: 8px;">
                <strong>Safety Alerts</strong><br/>
                ${alertSummary}<br/>
                <small style="color: #666;">Total: ${clusterSize} alert${clusterSize > 1 ? 's' : ''}</small>
              </div>
            `,
            maxWidth: 200
          })
          infoWindow.open(map, marker)
        })

        alertMarkersRef.current.push(marker)
      })

      console.log(`Created ${clusters.length} alert clusters from ${allAlertPoints.length} total alerts`)
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }, [map, currentCity, timeFilterMinutes])

  // Load safe locations from Firebase
  const loadSafeLocations = useCallback(async () => {
    if (!map || !currentCity) {
      console.log('Cannot load safe locations: map or city not available')
      return
    }

    try {
      const normalizedCity = normalizeCityName(currentCity)
      console.log('Fetching safe locations for city:', currentCity, 'normalized:', normalizedCity)

      const response = await fetch(`/api/safe-locations?city=${encodeURIComponent(normalizedCity)}`)
      if (!response.ok) {
        console.log('No safe locations endpoint or no locations found')
        return
      }

      const locations = await response.json()
      console.log('Fetched safe locations:', locations)

      if (!Array.isArray(locations) || locations.length === 0) {
        console.log('No safe locations returned')
        setSafeLocations([])
        return
      }

      setSafeLocations(locations)

      // Clear existing safe location markers
      safeLocationMarkersRef.current.forEach(marker => marker.setMap(null))
      safeLocationMarkersRef.current = []

      // Create markers for safe locations
      locations.forEach((location, idx) => {
        if (location.location && location.location.latitude && location.location.longitude) {
          const marker = new window.google.maps.Marker({
            position: { lat: location.location.latitude, lng: location.location.longitude },
            map: map,
            title: 'Safe Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#27ae60',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          })

          // Add click listener
          marker.addListener('click', () => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="color: #000; font-family: Arial, sans-serif; padding: 8px;">
                  <strong>🏠 Safe Location</strong><br/>
                  <small style="color: #666;">Marked by community member</small>
                </div>
              `,
              maxWidth: 200
            })
            infoWindow.open(map, marker)
          })

          safeLocationMarkersRef.current.push(marker)
        }
      })

      console.log(`Created ${locations.length} safe location markers`)
    } catch (error) {
      console.error('Error loading safe locations:', error)
    }
  }, [map, currentCity])

  // Load alerts when map, city, or time filter changes
  useEffect(() => {
    if (map && currentCity && showAlerts) {
      loadAlerts()
    }
  }, [map, currentCity, showAlerts, timeFilterMinutes, loadAlerts])

  // Load safe locations when map, city, or safe locations toggle changes
  useEffect(() => {
    if (map && currentCity && showSafeLocations) {
      loadSafeLocations()
    }
  }, [map, currentCity, showSafeLocations, loadSafeLocations])

  if (locationPermission === 'prompt' || locationPermission === 'denied') {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#ffffff', 
          maxWidth: '520px', 
          padding: '3rem',
          background: 'rgba(20, 20, 25, 0.95)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(108, 143, 255, 0.3)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <MapIcon size={64} color="#6c8fff" />
          </div>
          <h2 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: '700', color: '#ffffff' }}>Location Access Required</h2>
          <p style={{ marginBottom: '2rem', lineHeight: '1.6', fontSize: '1.1rem', color: '#b0b0b5' }}>
            Enable location access to unlock these map features:
          </p>
          <div style={{ marginBottom: '2.5rem', textAlign: 'left', padding: '0 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(108, 143, 255, 0.1)', borderRadius: '8px' }}>
              <HospitalIcon size={20} color="#6c8fff" />
              <span style={{ marginLeft: '0.75rem', color: '#ffffff' }}>Nearby hospitals and emergency services</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '8px' }}>
              <AlertIcon size={20} color="#e74c3c" />
              <span style={{ marginLeft: '0.75rem', color: '#ffffff' }}>Community safety reports and alerts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(243, 156, 18, 0.1)', borderRadius: '8px' }}>
              <GasStationIcon size={20} color="#f39c12" />
              <span style={{ marginLeft: '0.75rem', color: '#ffffff' }}>Gas stations and essential services</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0', padding: '0.75rem', background: 'rgba(39, 174, 96, 0.1)', borderRadius: '8px' }}>
              <SearchIcon size={20} color="#27ae60" />
              <span style={{ marginLeft: '0.75rem', color: '#ffffff' }}>Precise location-based recommendations</span>
            </div>
          </div>
          <button
            onClick={requestLocationPermission}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #6c8fff 0%, #764ba2 100%)',
              color: '#ffffff',
              border: '2px solid rgba(108, 143, 255, 0.5)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 6px 25px rgba(108, 143, 255, 0.4)',
              transition: 'all 0.3s ease',
              marginBottom: '1.5rem',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)'
              e.target.style.boxShadow = '0 8px 30px rgba(108, 143, 255, 0.6)'
              e.target.style.background = 'linear-gradient(135deg, #764ba2 0%, #6c8fff 100%)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 6px 25px rgba(108, 143, 255, 0.4)'
              e.target.style.background = 'linear-gradient(135deg, #6c8fff 0%, #764ba2 100%)'
            }}
          >
            {isLoading ? 'Requesting Access...' : 'Enable Location Access'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <SafeLocationIcon size={16} color="#27ae60" />
            <p style={{ fontSize: '0.9rem', color: '#b0b0b5', margin: 0 }}>
              Secure & Private - Location data stays on your device
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Don't return early for loading - let the map container render so it can be found
  // Instead, show loading overlay over the map container

  return (
    <div style={{ height: '100vh', display: 'flex', position: 'relative' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '300px' : '60px',
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem',
        overflowY: 'auto',
        transition: 'width 0.3s ease',
        zIndex: 1000
      }}>
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            background: '#6c8fff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {sidebarOpen ? '←' : '→'}
        </button>

        {sidebarOpen && (
          <>
            <h3 style={{ marginBottom: '1rem', color: '#ffffff' }}>
              Map Controls
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '1rem' }}>
              Location: {currentCity}
            </p>

            {/* Radius slider - top of sidebar */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                Search radius: {radiusKm} km
              </label>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={radiusKm}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  setRadiusKm(v)
                  // If a search was already performed, re-run it with the new radius
                  if (lastSearchType) {
                    findNearbyServices(lastSearchType, v * 1000)
                  }
                }}
                style={{ width: '100%' }}
              />
            </div>

            {/* Emergency Reporting */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertIcon size={18} color="#e74c3c" /> Emergency Reports
              </h4>
              <button
                onClick={handlePoliceReport}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(231, 76, 60, 0.2)',
                  color: 'white',
                  border: '2px solid rgb(231, 76, 60)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(231, 76, 60, 0.4)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(231, 76, 60, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <PoliceIcon size={16} /> Report Police Activity
              </button>
              <button
                onClick={() => handleEmergencyReport('Fire')}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(230, 126, 34, 0.2)',
                  color: 'white',
                  border: '2px solid rgb(230, 126, 34)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(230, 126, 34, 0.4)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(230, 126, 34, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(230, 126, 34, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <FireIcon size={16} /> Report Fire
              </button>
              <button
                onClick={() => handleEmergencyReport('Medical Emergency')}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(243, 156, 18, 0.2)',
                  color: 'white',
                  border: '2px solid rgb(243, 156, 18)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(243, 156, 18, 0.4)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(243, 156, 18, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <HospitalIcon size={16} /> Medical Emergency
              </button>
              <button
                onClick={() => handleEmergencyReport('Accident')}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(211, 84, 0, 0.2)',
                  color: 'white',
                  border: '2px solid rgb(211, 84, 0)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(211, 84, 0, 0.4)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(211, 84, 0, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(211, 84, 0, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <CarIcon size={16} /> Report Accident
              </button>
            </div>

            {/* Community Features */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HandshakeIcon size={18} color="#27ae60" /> Community
              </h4>
              <button
                onClick={handleSafeLocationReport}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(39, 174, 96, 0.2)',
                  color: 'white',
                  border: '2px solid rgb(39, 174, 96)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(39, 174, 96, 0.4)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(39, 174, 96, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <SafeLocationIcon size={16} /> Mark Safe Location
              </button>
            </div>

            {/* Safety Alerts Toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertIcon size={18} color="#e74c3c" /> Safety Alerts
              </h4>
              
              {/* Time Filter Slider */}
              <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                <label style={{ color: 'white', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>
                  Time Filter: {timeFilterMinutes === 1440 ? '24 hours' : `${timeFilterMinutes} min`}
                </label>
                <input
                  type="range"
                  min="10"
                  max="1440"
                  step="10"
                  value={timeFilterMinutes}
                  onChange={(e) => setTimeFilterMinutes(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    background: '#ddd',
                    borderRadius: '5px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#ccc', marginTop: '0.25rem' }}>
                  <span>10min</span>
                  <span>1hr</span>
                  <span>6hr</span>
                  <span>24hr</span>
                </div>
              </div>

              <button
                onClick={() => setShowAlerts(!showAlerts)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  marginBottom: '0.5rem',
                  background: showAlerts ? 'rgba(231, 76, 60, 0.6)' : 'rgba(231, 76, 60, 0.2)',
                  color: 'white',
                  border: '2px solid rgb(231, 76, 60)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(231, 76, 60, 0.4)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = showAlerts ? 'rgba(231, 76, 60, 0.6)' : 'rgba(231, 76, 60, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {showAlerts ? '👁️ Hide' : '👁️ Show'} Safety Alerts
              </button>

              <button
                onClick={() => setShowSafeLocations(!showSafeLocations)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: showSafeLocations ? 'rgba(39, 174, 96, 0.6)' : 'rgba(39, 174, 96, 0.2)',
                  color: 'white',
                  border: '2px solid rgb(39, 174, 96)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(39, 174, 96, 0.4)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = showSafeLocations ? 'rgba(39, 174, 96, 0.6)' : 'rgba(39, 174, 96, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {showSafeLocations ? '👁️ Hide' : '👁️ Show'} Safe Locations
              </button>
            </div>

            {/* Find Services */}
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#3498db', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SearchIcon size={18} color="#3498db" /> Find Nearby
              </h4>
              
              {/* Service buttons */}
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={() => findNearbyServices('hospital')}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    marginBottom: '0.5rem',
                    background: expandedServiceType === 'hospital' ? 'rgba(52, 152, 219, 0.6)' : 'rgba(52, 152, 219, 0.2)',
                    color: 'white',
                    border: '2px solid rgb(52, 152, 219)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(52, 152, 219, 0.4)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = expandedServiceType === 'hospital' ? 'rgba(52, 152, 219, 0.6)' : 'rgba(52, 152, 219, 0.2)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <HospitalIcon size={16} /> Hospitals
                </button>
                <button
                  onClick={() => findNearbyServices('police')}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    marginBottom: '0.5rem',
                    background: expandedServiceType === 'police' ? 'rgba(52, 73, 94, 0.6)' : 'rgba(52, 73, 94, 0.2)',
                    color: 'white',
                    border: '2px solid rgb(52, 73, 94)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(52, 73, 94, 0.4)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(52, 73, 94, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = expandedServiceType === 'police' ? 'rgba(52, 73, 94, 0.6)' : 'rgba(52, 73, 94, 0.2)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <PoliceIcon size={16} /> Police Stations
                </button>
                <button
                  onClick={() => findNearbyServices('fire_station')}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    marginBottom: '0.5rem',
                    background: expandedServiceType === 'fire_station' ? 'rgba(231, 76, 60, 0.6)' : 'rgba(231, 76, 60, 0.2)',
                    color: 'white',
                    border: '2px solid rgb(231, 76, 60)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(231, 76, 60, 0.4)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = expandedServiceType === 'fire_station' ? 'rgba(231, 76, 60, 0.6)' : 'rgba(231, 76, 60, 0.2)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <FireIcon size={16} /> Fire Stations
                </button>
                <button
                  onClick={() => findNearbyServices('pharmacy')}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    marginBottom: '0.5rem',
                    background: expandedServiceType === 'pharmacy' ? 'rgba(155, 89, 182, 0.6)' : 'rgba(155, 89, 182, 0.2)',
                    color: 'white',
                    border: '2px solid rgb(155, 89, 182)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(155, 89, 182, 0.4)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(155, 89, 182, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = expandedServiceType === 'pharmacy' ? 'rgba(155, 89, 182, 0.6)' : 'rgba(155, 89, 182, 0.2)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <PillIcon size={16} /> Pharmacies
                </button>
                <button
                  onClick={() => findNearbyServices('gas_station')}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    marginBottom: '0.5rem',
                    background: expandedServiceType === 'gas_station' ? 'rgba(243, 156, 18, 0.6)' : 'rgba(243, 156, 18, 0.2)',
                    color: 'white',
                    border: '2px solid rgb(243, 156, 18)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(243, 156, 18, 0.4)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = expandedServiceType === 'gas_station' ? 'rgba(243, 156, 18, 0.6)' : 'rgba(243, 156, 18, 0.2)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <GasStationIcon size={16} /> Gas Stations
                </button>
                <button
                  onClick={() => findNearbyServices('atm')}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    marginBottom: '0.5rem',
                    background: expandedServiceType === 'atm' ? 'rgba(22, 160, 133, 0.6)' : 'rgba(22, 160, 133, 0.2)',
                    color: 'white',
                    border: '2px solid rgb(22, 160, 133)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(22, 160, 133, 0.4)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 4px 12px rgba(22, 160, 133, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = expandedServiceType === 'atm' ? 'rgba(22, 160, 133, 0.6)' : 'rgba(22, 160, 133, 0.2)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <AtmIcon size={16} /> ATMs
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Places Modal */}
      {showPlacesModal && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(20, 20, 25, 0.95)',
          border: '1px solid rgba(108, 143, 255, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          zIndex: 2000,
          maxWidth: '500px',
          maxHeight: '70vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.5rem' }}>Nearby Places</h3>
            <button
              onClick={() => setShowPlacesModal(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>Found {searchResults.length} locations</p>

          {searchResults.map((place, index) => (
            <div
              key={index}
              onClick={() => showDirections(place)}
              style={{
                padding: '1rem',
                marginBottom: '0.75rem',
                background: 'rgba(52, 152, 219, 0.1)',
                border: '1px solid rgba(52, 152, 219, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#ffffff', fontWeight: '500' }}>
                {place.name}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                {place.vicinity}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#9ca3af' }}>
                📍 {(place.distanceMeters / 1000).toFixed(1)} km away
              </p>
              {place.rating && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#f0ad4e' }}>
                  ⭐ {place.rating.toFixed(1)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Travel Mode Modal */}
      {showTravelModeModal && selectedLocation && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(20, 20, 25, 0.95)',
          border: '1px solid rgba(108, 143, 255, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          zIndex: 2000,
          maxWidth: '500px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.5rem' }}>Choose Travel Mode</h3>
            <button
              onClick={() => setShowTravelModeModal(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontWeight: '500' }}>
            {selectedLocation.name}
          </p>

          {/* Walking Option */}
          <button
            onClick={() => {
              setSelectedTravelMode('WALK')
              displayRoute('WALK')
              setShowTravelModeModal(false)
            }}
            style={{
              width: '100%',
              padding: '1rem',
              marginBottom: '1rem',
              background: selectedTravelMode === 'WALK' ? 'rgba(52, 152, 219, 0.4)' : 'rgba(52, 152, 219, 0.1)',
              border: selectedTravelMode === 'WALK' ? '2px solid rgb(52, 152, 219)' : '1px solid rgba(52, 152, 219, 0.3)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(52, 152, 219, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = selectedTravelMode === 'WALK' ? 'rgba(52, 152, 219, 0.4)' : 'rgba(52, 152, 219, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>🚶 Walking</span>
              <span style={{ color: '#cbd5e1' }}>
                {travelModeDurations['WALK'] ? travelModeDurations['WALK'].text : 'Loading...'}
              </span>
            </div>
          </button>

          {/* Driving Option */}
          <button
            onClick={() => {
              setSelectedTravelMode('DRIVE')
              displayRoute('DRIVE')
              setShowTravelModeModal(false)
            }}
            style={{
              width: '100%',
              padding: '1rem',
              marginBottom: '1rem',
              background: selectedTravelMode === 'DRIVE' ? 'rgba(231, 76, 60, 0.4)' : 'rgba(231, 76, 60, 0.1)',
              border: selectedTravelMode === 'DRIVE' ? '2px solid rgb(231, 76, 60)' : '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(231, 76, 60, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = selectedTravelMode === 'DRIVE' ? 'rgba(231, 76, 60, 0.4)' : 'rgba(231, 76, 60, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>🚗 Driving</span>
              <span style={{ color: '#cbd5e1' }}>
                {travelModeDurations['DRIVE'] ? travelModeDurations['DRIVE'].text : 'Loading...'}
              </span>
            </div>
          </button>

        </div>
      )}

      {/* Overlay for modals */}
      {(showPlacesModal || showTravelModeModal) && (
        <div
          onClick={closeModals}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1999
          }}
        />
      )}

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {isLoading && (
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: 1000
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ marginBottom: '1rem' }}>
                <MapIcon size={48} color="white" />
              </div>
              <p>Loading Map...</p>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

    </div>
  )
}

export default MapSection