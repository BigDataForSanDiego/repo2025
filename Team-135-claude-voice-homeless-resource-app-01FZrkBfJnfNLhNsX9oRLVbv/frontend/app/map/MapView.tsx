'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Resource {
  id: string
  name: string
  type: 'shelter' | 'food' | 'medical' | 'hygiene' | 'other'
  latitude: number
  longitude: number
  distance_meters: number
  is_open: boolean
  phone: string | null
  hours: string | null
  pet_friendly: boolean
  address: string | null
  verified_on: string
}

interface MapViewProps {
  center: [number, number]
  resources: Resource[]
  selectedResource: Resource | null
  onResourceSelect: (resource: Resource) => void
  userLocation: [number, number]
}

export default function MapView({
  center,
  resources,
  selectedResource,
  onResourceSelect,
  userLocation
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const userMarkerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Create map with smooth animations
    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
      preferCanvas: false,
      renderer: L.canvas({ padding: 0.5 })
    })

    // Add beautiful tile layer - using Carto Positron for clean, minimalistic look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
      minZoom: 10,
      className: 'map-tiles'
    }).addTo(map)

    mapRef.current = map

    // Add user location marker
    addUserMarker(map, userLocation)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update map center when user location changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo(center, 13, {
        duration: 1.5,
        easeLinearity: 0.25
      })

      // Update user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation)
      } else if (mapRef.current) {
        addUserMarker(mapRef.current, userLocation)
      }
    }
  }, [center, userLocation])

  // Add/update resource markers
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Add new markers
    resources.forEach(resource => {
      const marker = createResourceMarker(resource, map)
      markersRef.current[resource.id] = marker
    })
  }, [resources])

  // Handle selected resource
  useEffect(() => {
    if (!mapRef.current || !selectedResource) return

    const map = mapRef.current
    const marker = markersRef.current[selectedResource.id]

    if (marker) {
      // Smooth pan to marker with nice animation
      map.flyTo([selectedResource.latitude, selectedResource.longitude], 15, {
        duration: 1,
        easeLinearity: 0.25
      })

      // Highlight selected marker
      Object.entries(markersRef.current).forEach(([id, m]) => {
        const element = m.getElement()
        if (element) {
          if (id === selectedResource.id) {
            element.style.zIndex = '1000'
            element.style.transform = 'translateY(-4px) scale(1.2)'
          } else {
            element.style.zIndex = '500'
            element.style.transform = ''
          }
        }
      })
    }
  }, [selectedResource])

  const addUserMarker = (map: L.Map, location: [number, number]) => {
    const userIcon = L.divIcon({
      className: 'user-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })

    const marker = L.marker(location, {
      icon: userIcon,
      zIndexOffset: 2000
    }).addTo(map)

    userMarkerRef.current = marker
  }

  const createResourceMarker = (resource: Resource, map: L.Map) => {
    // Create custom marker icon
    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-dot ${resource.type}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })

    const marker = L.marker([resource.latitude, resource.longitude], {
      icon: markerIcon,
      zIndexOffset: 1000
    })

    // Add click handler
    marker.on('click', () => {
      onResourceSelect(resource)
    })

    // Add elegant popup for desktop/hover
    const popupContent = `
      <div style="padding: 12px; min-width: 200px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: ${getResourceTypeColor(resource.type)};"></div>
          <span style="font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px;">
            ${getResourceTypeLabel(resource.type)}
          </span>
        </div>
        <h3 style="color: white; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">
          ${resource.name}
        </h3>
        <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 4px;">
          ${formatDistance(resource.distance_meters)}
        </div>
        ${resource.address ? `
          <div style="font-size: 11px; color: rgba(255,255,255,0.5);">
            ${resource.address}
          </div>
        ` : ''}
      </div>
    `

    marker.bindPopup(popupContent, {
      closeButton: true,
      className: 'resource-popup',
      maxWidth: 280,
      offset: [0, -8]
    })

    marker.addTo(map)
    return marker
  }

  const getResourceTypeColor = (type: string): string => {
    const colors = {
      shelter: '#667eea',
      food: '#f5576c',
      medical: '#00f2fe',
      hygiene: '#38f9d7',
      other: '#fee140'
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const getResourceTypeLabel = (type: string): string => {
    const labels = {
      shelter: 'Shelter',
      food: 'Food',
      medical: 'Medical',
      hygiene: 'Hygiene',
      other: 'Other'
    }
    return labels[type as keyof typeof labels] || 'Resource'
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m away`
    } else {
      return `${(meters / 1000).toFixed(1)}km away`
    }
  }

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ background: '#1a1d2e' }}
    />
  )
}
