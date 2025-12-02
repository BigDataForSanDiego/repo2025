'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, MapPin, Phone, CheckCircle, Clock, Navigation, Loader2 } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import './map-styles.css'

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a1d2e]">
      <div className="map-loading">
        <div className="loading-spinner" />
      </div>
    </div>
  )
})

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

export default function MapPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  // San Diego default location
  const DEFAULT_LOCATION: [number, number] = [32.7157, -117.1611]

  useEffect(() => {
    // Get user's location on mount
    getUserLocation()
  }, [])

  useEffect(() => {
    // Fetch resources when user location changes
    if (userLocation) {
      fetchNearbyResources(userLocation[0], userLocation[1])
    }
  }, [userLocation])

  const getUserLocation = () => {
    setLocating(true)

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setLocating(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Use default San Diego location
          setUserLocation(DEFAULT_LOCATION)
          setLocating(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      // Geolocation not supported, use default
      setUserLocation(DEFAULT_LOCATION)
      setLocating(false)
    }
  }

  const fetchNearbyResources = async (lat: number, lng: number) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual backend URL
      // For now, using mock data for development
      const mockResources: Resource[] = [
        {
          id: '1',
          name: 'Hope Shelter',
          type: 'shelter',
          latitude: lat + 0.01,
          longitude: lng + 0.01,
          distance_meters: 300,
          is_open: true,
          phone: '(555) 123-4567',
          hours: 'Open 24/7',
          pet_friendly: true,
          address: '123 Main St, San Diego, CA',
          verified_on: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Community Food Bank',
          type: 'food',
          latitude: lat - 0.015,
          longitude: lng + 0.015,
          distance_meters: 800,
          is_open: true,
          phone: '(555) 234-5678',
          hours: '9:00 AM - 5:00 PM',
          pet_friendly: false,
          address: '456 Oak Ave, San Diego, CA',
          verified_on: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Free Health Clinic',
          type: 'medical',
          latitude: lat + 0.02,
          longitude: lng - 0.01,
          distance_meters: 1200,
          is_open: true,
          phone: '(555) 345-6789',
          hours: '8:00 AM - 6:00 PM',
          pet_friendly: false,
          address: '789 Elm St, San Diego, CA',
          verified_on: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Public Showers & Restrooms',
          type: 'hygiene',
          latitude: lat - 0.008,
          longitude: lng - 0.012,
          distance_meters: 500,
          is_open: true,
          phone: '(555) 456-7890',
          hours: '6:00 AM - 10:00 PM',
          pet_friendly: true,
          address: '321 Pine St, San Diego, CA',
          verified_on: new Date().toISOString()
        }
      ]

      // Simulate API delay for smooth loading animation
      await new Promise(resolve => setTimeout(resolve, 800))

      setResources(mockResources)
      // Auto-select first resource
      if (mockResources.length > 0) {
        setSelectedResource(mockResources[0])
      }
    } catch (err) {
      console.error('Error fetching resources:', err)
      setError('Unable to load resources. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m away`
    } else {
      return `${(meters / 1000).toFixed(1)}km away`
    }
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

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1d2e]">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-[#2a2d3e] z-10 relative bg-[#1a1d2e]/95 backdrop-blur-lg">
        <Link href="/resources">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-white">Resource Map</h1>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={getUserLocation}
            disabled={locating}
            className="text-white hover:bg-white/10 transition-all"
            title="Center on my location"
          >
            {locating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Navigation className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Map Container */}
      <main className="flex-1 relative">
        {userLocation && (
          <div className="map-container absolute inset-0">
            <MapView
              center={userLocation}
              resources={resources}
              selectedResource={selectedResource}
              onResourceSelect={setSelectedResource}
              userLocation={userLocation}
            />
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Resource Card Overlay */}
        {selectedResource && (
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none">
            <div className="resource-card bg-[#1a1d2e]/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden max-w-md mx-auto pointer-events-auto">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: getResourceTypeColor(selectedResource.type) }}
                      />
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                        {getResourceTypeLabel(selectedResource.type)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                      {selectedResource.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-white/60">Verified Today</span>
                      </div>
                      {selectedResource.hours && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-white/60" />
                          <span className="text-white/60">{selectedResource.hours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedResource.pet_friendly && (
                    <div className="bg-[#7a9278] px-3 py-1.5 rounded-full">
                      <span className="text-xs font-semibold text-[#1a1d2e]">Pet-friendly</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-white/80 border-t border-white/10 pt-4">
                  <p className="text-sm font-medium">{formatDistance(selectedResource.distance_meters)}</p>
                  {selectedResource.address && (
                    <p className="text-sm text-white/60">{selectedResource.address}</p>
                  )}
                  {selectedResource.phone && (
                    <p className="text-sm text-white/60">{selectedResource.phone}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                    onClick={() => selectedResource.phone && window.open(`tel:${selectedResource.phone}`)}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call
                  </Button>
                  <Button
                    className="flex-1 bg-[#7a9278] hover:bg-[#8ba389] text-[#1a1d2e] h-12 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedResource.latitude},${selectedResource.longitude}`
                      window.open(url, '_blank')
                    }}
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="border-t border-[#2a2d3e] bg-[#1a1d2e]/95 backdrop-blur-lg relative z-10">
        <div className="flex items-center justify-around h-20 max-w-md mx-auto">
          <Link href="/">
            <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
              <div className="h-6 w-6 rounded-sm bg-white/10" />
              <span className="text-xs">Home</span>
            </button>
          </Link>
          <Link href="/resources">
            <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
              <div className="h-6 w-6 rounded-sm bg-white/10" />
              <span className="text-xs">Resources</span>
            </button>
          </Link>
          <button className="flex flex-col items-center gap-1 text-white">
            <MapPin className="h-6 w-6" />
            <span className="text-xs">Map</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
            <div className="h-6 w-6 rounded-full bg-white/10" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
