import { useState, useEffect, useRef } from 'react'
import { LocationIcon, MoneyIcon, RecycleIcon, CameraIcon, StoreIcon, TrophyIcon, CarIcon } from './Icons'
import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Cash for Recyclables - Find the best recycling centers nearby
 * Users can input item count or upload a photo to get estimated value and find centers
 * Supports multiple recyclable materials
 */
function CashForCans() {
  const [selectedMaterials, setSelectedMaterials] = useState(['aluminum']) // Array of selected material keys
  const [itemCounts, setItemCounts] = useState({ aluminum: '' }) // Object with count for each selected material
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [userLocation, setUserLocation] = useState(() => {
    const savedLocation = localStorage.getItem('resourcify_user_location')
    return savedLocation ? JSON.parse(savedLocation) : null
  })
  const [locationStatus, setLocationStatus] = useState(() => {
    const savedLocation = localStorage.getItem('resourcify_user_location')
    return savedLocation ? 'Location restored from previous session' : ''
  })
  const [radius, setRadius] = useState(10.0)
  const [recyclingCenters, setRecyclingCenters] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [estimatedValue, setEstimatedValue] = useState(null)
  const [showResults, setShowResults] = useState(false)
  
  // Material popup state for grouped display
  const [materialPopup, setMaterialPopup] = useState({ show: false, material: null, centers: [], sortBy: 'distance' })
  
  // User consent state - no persistence, ask every time
  const [userConsent, setUserConsent] = useState(null)
  
  const fileInputRef = useRef(null)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  // Helper functions for material selection
  const toggleMaterial = (materialKey) => {
    // Check consent before allowing material selection
    if (userConsent !== true && !selectedMaterials.includes(materialKey)) {
      alert('Please provide consent to use this feature.')
      return
    }
    
    if (selectedMaterials.includes(materialKey)) {
      // Deselect material
      setSelectedMaterials(prev => prev.filter(key => key !== materialKey))
      setItemCounts(prev => {
        const newCounts = { ...prev }
        delete newCounts[materialKey]
        return newCounts
      })
    } else {
      // Select material
      setSelectedMaterials(prev => [...prev, materialKey])
      setItemCounts(prev => ({ ...prev, [materialKey]: '' }))
    }
  }

  // Handle consent response - no localStorage
  const handleConsentChange = (event) => {
    const consent = event.target.value === 'true'
    setUserConsent(consent)
  }

  const updateItemCount = (materialKey, count) => {
    setItemCounts(prev => ({ ...prev, [materialKey]: count }))
  }

  // Check if any items have been entered
  const hasAnyItems = () => {
    return selectedMaterials.some(key => itemCounts[key] && parseFloat(itemCounts[key]) > 0)
  }

  // Function to show material popup with centers
  const showMaterialCenters = (materialKey) => {
    const materialInfo = MATERIAL_TYPES[materialKey]
    const centersWithValues = recyclingCenters.map(center => ({
      ...center,
      materialValue: calculateMaterialValue(materialKey, center)
    })).filter(center => center.materialValue > 0)

    setMaterialPopup({
      show: true,
      material: { key: materialKey, info: materialInfo },
      centers: centersWithValues.sort((a, b) => a.distance - b.distance), // Default sort by distance
      sortBy: 'distance'
    })
  }

  // Function to change center sorting
  const changeCenterSorting = (newSortBy) => {
    if (!materialPopup.centers || materialPopup.centers.length === 0) return
    
    const sortedCenters = [...materialPopup.centers].sort((a, b) => {
      if (newSortBy === 'price') {
        return b.materialValue - a.materialValue // Highest price first
      } else {
        return a.distance - b.distance // Closest distance first
      }
    })

    setMaterialPopup({
      ...materialPopup,
      centers: sortedCenters,
      sortBy: newSortBy
    })
  }

  // Calculate material value for a specific center
  const calculateMaterialValue = (materialKey, center) => {
    const materialInfo = MATERIAL_TYPES[materialKey]
    const count = parseFloat(itemCounts[materialKey]) || 0
    
    if (count <= 0) return 0
    
    // Calculate CRV (California Redemption Value)
    const crvValue = count * materialInfo.crv
    
    // Calculate scrap value (weight-based)
    const weightInPounds = count / materialInfo.itemsPerPound
    const scrapValue = weightInPounds * (center.rates?.[materialKey] || 0.5) // Default rate if not specified
    
    return crvValue + scrapValue
  }

  // Material types with their properties
  const MATERIAL_TYPES = {
    aluminum: {
      name: 'Aluminum Cans',
      unit: 'cans',
      itemsPerPound: 32,
      crv: 0.05,
      description: 'Standard 12oz aluminum beverage cans'
    },
    plastic: {
      name: 'Plastic Bottles',
      unit: 'bottles',
      itemsPerPound: 20,
      crv: 0.05,
      description: 'PET/HDPE plastic bottles (water, soda)'
    },
    glass: {
      name: 'Glass Bottles',
      unit: 'bottles',
      itemsPerPound: 5,
      crv: 0.05,
      description: 'Glass bottles and jars'
    },
    cardboard: {
      name: 'Cardboard',
      unit: 'pounds',
      itemsPerPound: 1,
      crv: 0,
      description: 'Corrugated cardboard boxes'
    },
    paper: {
      name: 'Paper',
      unit: 'pounds',
      itemsPerPound: 1,
      crv: 0,
      description: 'Newspapers, magazines, office paper'
    },
    steel: {
      name: 'Steel Cans',
      unit: 'cans',
      itemsPerPound: 10,
      crv: 0,
      description: 'Tin/steel food cans'
    },
    copper: {
      name: 'Copper',
      unit: 'pounds',
      itemsPerPound: 1,
      crv: 0,
      description: 'Copper wire, pipes, scrap'
    }
  }

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps) return

      try {
        // Import API configuration
        const { API_ENDPOINTS } = await import('./config.js')
        
        // Fetch API key securely from backend (same endpoint as ImageAnalysis)
        const response = await fetch(API_ENDPOINTS.mapsConfig)
        const config = await response.json()
        
        if (!config.mapsApiKey) {
          throw new Error('Maps API key not available')
        }
        
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.mapsApiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => console.log('Google Maps loaded successfully')
        script.onerror = () => console.error('Failed to load Google Maps')
        document.head.appendChild(script)
      } catch (error) {
        console.error('Failed to load Maps configuration:', error)
      }
    }

    loadGoogleMaps()
  }, [])

  // Initialize map when location is available
  useEffect(() => {
    if (userLocation && recyclingCenters.length > 0 && !mapInstance.current) {
      initMap(userLocation)
    }
  }, [userLocation, recyclingCenters])

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser')
      return
    }

    setLocationStatus('Detecting location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        localStorage.setItem('resourcify_user_location', JSON.stringify(location))
        setLocationStatus(`Location detected: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
      },
      (error) => {
        setLocationStatus(`Error: ${error.message}`)
      }
    )
  }

  const clearLocation = () => {
    setUserLocation(null)
    localStorage.removeItem('resourcify_user_location')
    setLocationStatus('')
    setRecyclingCenters([])
    setShowResults(false)
    if (mapInstance.current) {
      mapInstance.current = null
    }
  }

  const initMap = (location) => {
    if (!window.google?.maps || !mapRef.current) return

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 12,
        gestureHandling: 'greedy',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8b92a8' }] }
        ]
      })

      // User location marker
      new window.google.maps.Marker({
        position: location,
        map: map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#6c8fff',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      // Recycling center markers
      recyclingCenters.forEach((center, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: center.lat, lng: center.lng },
          map: map,
          title: center.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: index === 0 ? '#10b981' : '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #1a1a2e; padding: 8px;">
              <h4 style="margin: 0 0 4px 0;">${center.name}</h4>
              <p style="margin: 0; font-size: 0.9rem;">${center.address}</p>
              <p style="margin: 4px 0 0 0; color: #10b981; font-weight: bold;">
                ${center.pricePerLb ? `$${center.pricePerLb}/lb` : 'CRV Rate'}
              </p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })
      })

      mapInstance.current = map
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  const findRecyclingCenters = async (location) => {
    if (!window.google?.maps) {
      console.error('Google Maps not loaded')
      return []
    }

    try {
      // Import API configuration
      const { API_BASE_URL } = await import('./config.js')
      
      // Call backend API to get real recycling centers
      const response = await fetch(`${API_BASE_URL}/api/recycling-centers?lat=${location.lat}&lng=${location.lng}&radius=${radius}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log(`Found ${data.count} recycling centers from Google Places API`)
      
      // Return the centers from the API
      return data.centers || []
      
    } catch (error) {
      console.error('Error finding recycling centers:', error)
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data')
      const mockCenters = [
      ]
      
      return mockCenters
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    
    // Simulate AI analysis (in production, this would call your backend)
    setTimeout(() => {
      // Generate estimated counts for all selected materials
      const newCounts = {}
      selectedMaterials.forEach(materialKey => {
        const material = MATERIAL_TYPES[materialKey]
        let estimatedItems
        
        if (material.unit === 'pounds') {
          estimatedItems = Math.floor(Math.random() * 20) + 5 // 5-25 lbs
        } else {
          estimatedItems = Math.floor(Math.random() * 50) + 20 // 20-70 items
        }
        
        newCounts[materialKey] = estimatedItems.toString()
      })
      
      setItemCounts(newCounts)
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleCalculate = async () => {
    // Check if at least one material has a count
    const hasValidCounts = selectedMaterials.some(key => itemCounts[key] && parseFloat(itemCounts[key]) > 0)
    
    if (!hasValidCounts || !userLocation) {
      alert('Please enter quantities for selected materials and enable location')
      return
    }

    setIsAnalyzing(true)

    // Calculate totals across all materials
    let totalPounds = 0
    let totalCRV = 0
    let totalItems = 0
    const materialBreakdown = []

    selectedMaterials.forEach(materialKey => {
      const count = itemCounts[materialKey]
      if (count && parseFloat(count) > 0) {
        const material = MATERIAL_TYPES[materialKey]
        const items = parseFloat(count)
        const pounds = items / material.itemsPerPound
        const crvValue = material.crv ? items * material.crv : 0

        totalPounds += pounds
        totalCRV += crvValue
        totalItems += items

        materialBreakdown.push({
          name: material.name,
          items: items,
          pounds: pounds.toFixed(2),
          crv: crvValue.toFixed(2)
        })
      }
    })

    // Find recycling centers
    const centers = await findRecyclingCenters(userLocation)
    
    // Calculate value at each center
    const centersWithValue = centers.map(center => {
      const scrapValue = totalPounds * center.pricePerLb
      const totalValue = totalCRV + scrapValue
      
      return {
        ...center,
        estimatedValue: scrapValue.toFixed(2),
        totalWithCRV: totalValue.toFixed(2)
      }
    })

    const calculationResults = {
      totalItems: totalItems,
      totalPounds: totalPounds.toFixed(2),
      totalCRV: totalCRV.toFixed(2),
      bestPrice: centersWithValue[0]?.estimatedValue || '0.00',
      bestTotal: centersWithValue[0]?.totalWithCRV || totalCRV.toFixed(2),
      materialBreakdown: materialBreakdown,
      materialsSelected: selectedMaterials.length
    }

    setRecyclingCenters(centersWithValue)
    setEstimatedValue(calculationResults)
    setShowResults(true)
    setIsAnalyzing(false)

    // Store recycling calculation in Firebase for debugging
    try {
      console.log('CashForCans: Storing recycling calculation in Firebase')
      console.log('CashForCans: Calculation data:', calculationResults)
      
      // Determine city name for Firebase collection path
      let cityName = 'unknown'
      if (userLocation) {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation.lat}&longitude=${userLocation.lng}&localityLanguage=en`
          )
          const geoData = await response.json()
          cityName = (geoData.city || geoData.locality || 'unknown').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')
        } catch (geoError) {
          console.log('CashForCans: Could not determine city name, using "unknown"')
        }
      }
      
      const recyclingDoc = {
        calculationType: 'recycling_calculation',
        timestamp: serverTimestamp(),
        timeUTC: new Date().toISOString(),
        materials: {
          selected: selectedMaterials,
          counts: itemCounts,
          breakdown: materialBreakdown
        },
        location: userLocation ? {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          coordinates: `${userLocation.lat},${userLocation.lng}`
        } : null,
        results: calculationResults,
        calculationId: `recycling_calc_${Date.now()}`
      }
      
      await addDoc(collection(db, 'user_analysis', 'recycling_calculations', cityName), recyclingDoc)
      console.log('CashForCans: Successfully stored recycling calculation in Firebase')
    } catch (firebaseError) {
      console.error('CashForCans: Failed to store calculation in Firebase:', firebaseError)
      // Don't throw error - calculation was successful, just logging failed
    }

    // Initialize map
    if (centersWithValue.length > 0) {
      setTimeout(() => initMap(userLocation), 100)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          color: 'var(--text-primary)', 
          marginBottom: '0.5rem', 
          fontSize: '1.8rem', 
          fontWeight: '400',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <RecycleIcon size={32} color="var(--success)" />
          Cash for Recyclables
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Find the best recycling centers near you and see how much money you can get for your recyclable materials.
        </p>
      </div>

      {/* Location Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LocationIcon size={20} color="var(--accent)" />
          Your Location
        </h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            <LocationIcon size={16} color="#6c8fff" /> Search Radius: {radius.toFixed(1)} km
          </label>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            style={{ 
              width: '100%',
              maxWidth: '300px',
              accentColor: '#6c8fff'
            }}
          />
          <div style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.85rem', 
            marginTop: '0.25rem' 
          }}>
            Find recycling centers within {radius.toFixed(1)}km
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={detectLocation}
            className="btn btn-secondary"
            style={{ 
              flex: 1,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8b5cf6',
              color: '#8b5cf6'
            }}
          >
            <LocationIcon size={16} /> {userLocation ? 'Update Location' : 'Detect My Location'}
          </button>
          
          {userLocation && (
            <button
              onClick={clearLocation}
              className="btn btn-secondary"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#ef4444'
              }}
            >
              Clear
            </button>
          )}
        </div>
        
        {locationStatus && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {locationStatus}
          </p>
        )}
      </div>

      {/* Input Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          What Are You Recycling?
        </h3>

        {/* Data Collection Consent */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1rem', 
          background: 'var(--card-background)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '0.5rem' 
        }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
            Data Collection Consent
          </h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            We collect location and recycling data to provide personalized recommendations and improve our service. Do you consent to this data collection?
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <input
                type="radio"
                name="userConsent"
                value="true"
                checked={userConsent === true}
                onChange={handleConsentChange}
                style={{ accentColor: 'var(--primary-color)' }}
              />
              Yes, I consent
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <input
                type="radio"
                name="userConsent"
                value="false"
                checked={userConsent === false}
                onChange={handleConsentChange}
                style={{ accentColor: 'var(--primary-color)' }}
              />
              No, I do not consent
            </label>
          </div>
        </div>

        {/* Material Type Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '0.75rem', 
            color: 'var(--text-primary)',
            fontWeight: '500'
          }}>
            <RecycleIcon size={16} color="#10b981" /> Material Types (select multiple):
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem' 
          }}>
            {Object.entries(MATERIAL_TYPES).map(([key, material]) => {
              const isSelected = selectedMaterials.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleMaterial(key)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                    border: `2px solid ${isSelected ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? '600' : '400'
                  }}>
                    {material.name}
                  </div>
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--success)',
                      color: 'white',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
            {selectedMaterials.length > 0 ? 
              `${selectedMaterials.length} material${selectedMaterials.length > 1 ? 's' : ''} selected. Click to toggle selection.` :
              'Select at least one material type to recycle.'
            }
          </small>
        </div>

        {/* Quantity Inputs for Selected Materials */}
        {selectedMaterials.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <RecycleIcon size={16} color="#10b981" />
              Enter Quantities
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedMaterials.map(materialKey => {
                const material = MATERIAL_TYPES[materialKey]
                return (
                  <div 
                    key={materialKey}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '0.5rem', 
                      color: 'var(--text-primary)',
                      fontWeight: '500'
                    }}>
                      {material.name} ({material.unit}):
                    </label>
                    <input
                      type="number"
                      value={itemCounts[materialKey] || ''}
                      onChange={(e) => updateItemCount(materialKey, e.target.value)}
                      className="form-control"
                      placeholder={`Enter number of ${material.unit}`}
                      min="1"
                      step={material.unit === 'pounds' ? '0.1' : '1'}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {material.crv > 0 && 
                        `CRV deposit: $${material.crv} per item • `}
                      ~{material.itemsPerPound} {material.unit} per pound
                    </small>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary)', 
          margin: '1rem 0',
          fontSize: '0.9rem'
        }}>
          OR
        </div>

        {/* Photo Upload */}
        <div>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '0.5rem', 
            color: 'var(--text-primary)' 
          }}>
            <CameraIcon size={16} color="#6c8fff" /> Take a Photo:
          </label>
          
          <div 
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            style={{
              minHeight: previewUrl ? 'auto' : '150px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            {previewUrl ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '250px', 
                    borderRadius: '8px',
                    display: 'block',
                    margin: '0 auto'
                  }} 
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage()
                  }}
                  className="btn btn-danger"
                  style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px',
                    padding: '0.5rem'
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <CameraIcon size={48} color="var(--text-secondary)" />
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  Drop photo here or click to select
                </p>
                <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
                  Choose Photo
                </button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {selectedFile && !hasAnyItems() && (
            <button
              onClick={analyzeImage}
              className="btn btn-secondary"
              disabled={isAnalyzing}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {isAnalyzing ? 'Analyzing...' : `Count ${MATERIAL_TYPES[materialType].name} from Photo`}
            </button>
          )}
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="btn btn-primary"
        disabled={!hasAnyItems() || !userLocation || isAnalyzing}
        style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', marginBottom: '2rem' }}
      >
        {isAnalyzing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Finding Best Prices...
          </div>
        ) : (
          <>
            <MoneyIcon size={16} /> Find Best Recycling Centers
          </>
        )}
      </button>

      {/* Results Section */}
      {showResults && estimatedValue && (
        <>
          {/* Value Summary */}
          <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h3 style={{ color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MoneyIcon size={20} color="var(--success)" />
              Your Estimated Value ({estimatedValue.materialsSelected} Material{estimatedValue.materialsSelected > 1 ? 's' : ''})
            </h3>
            
            {/* Material Breakdown */}
            {estimatedValue.materialBreakdown && estimatedValue.materialBreakdown.length > 1 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                  Material Breakdown:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {estimatedValue.materialBreakdown.map((material, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {material.name}: {material.items} items ({material.pounds} lbs)
                      </span>
                      <span style={{ color: 'var(--success)', fontWeight: '500' }}>
                        {material.crv > 0 ? `$${material.crv} CRV` : 'No CRV'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Total Items
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {estimatedValue.totalItems}
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Total Weight (lbs)
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {estimatedValue.totalPounds}
                </div>
              </div>
              
              {parseFloat(estimatedValue.totalCRV) > 0 && (
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Total CRV Value
                  </div>
                  <div style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    ${estimatedValue.totalCRV}
                  </div>
                </div>
              )}
              
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Best Total Value
                </div>
                <div style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  ${estimatedValue.bestTotal}
                </div>
              </div>
            </div>
          </div>

          {/* Materials List - Grouped by Material */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StoreIcon size={20} color="var(--accent)" />
              Find Recycling Centers by Material
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Click on each material to see recycling centers and compare prices
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedMaterials.filter(key => itemCounts[key] && parseFloat(itemCounts[key]) > 0).map((materialKey, index) => {
                const material = MATERIAL_TYPES[materialKey]
                const count = parseFloat(itemCounts[materialKey]) || 0
                const bestCenter = recyclingCenters.length > 0 ? recyclingCenters.reduce((best, current) => 
                  calculateMaterialValue(materialKey, current) > calculateMaterialValue(materialKey, best) ? current : best
                ) : null
                const bestValue = bestCenter ? calculateMaterialValue(materialKey, bestCenter) : 0
                
                return (
                  <div 
                    key={materialKey}
                    onClick={() => showMaterialCenters(materialKey)}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 143, 255, 0.1)'
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div>
                      <h4 style={{ 
                        color: 'var(--text-primary)', 
                        margin: '0 0 0.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {material.icon} {material.name}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                        {count} {material.unit} ({(count / material.itemsPerPound).toFixed(2)} lbs)
                      </p>
                      <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.85rem' }}>
                        {recyclingCenters.length} recycling centers available
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        Best Value
                      </div>
                      <div style={{ 
                        color: 'var(--success)', 
                        fontSize: '1.8rem', 
                        fontWeight: 'bold' 
                      }}>
                        ${bestValue.toFixed(2)}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        Click to compare →
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Map */}
          {recyclingCenters.length > 0 && (
            <div className="card">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Map View
              </h3>
              <div
                ref={mapRef}
                style={{
                  height: '400px',
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Material Centers Popup Modal */}
      {materialPopup.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}
        onClick={() => setMaterialPopup({ show: false, material: null, centers: [], sortBy: 'distance' })}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: '1px solid var(--border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StoreIcon size={18} color="var(--text-primary)" />
                {materialPopup.material?.info?.icon} {materialPopup.material?.info?.name} Centers
              </h3>
              <button 
                onClick={() => setMaterialPopup({ show: false, material: null, centers: [], sortBy: 'distance' })}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Recycling centers accepting {materialPopup.material?.info?.name?.toLowerCase()} - 
              {materialPopup.centers && materialPopup.centers.length > 0 ? ` ${materialPopup.centers.length} centers found` : ' searching...'}
            </p>

            {/* Sorting Controls */}
            {materialPopup.centers && materialPopup.centers.length > 1 && (
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                  Sort by:
                </span>
                <button
                  onClick={() => changeCenterSorting('distance')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: materialPopup.sortBy === 'distance' ? 'var(--accent)' : 'var(--bg-primary)',
                    color: materialPopup.sortBy === 'distance' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📍 Distance
                </button>
                <button
                  onClick={() => changeCenterSorting('price')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: materialPopup.sortBy === 'price' ? 'var(--accent)' : 'var(--bg-primary)',
                    color: materialPopup.sortBy === 'price' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  💰 Price
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {materialPopup.centers && materialPopup.centers.length > 0 ? (
                materialPopup.centers.map((center, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        color: 'var(--text-primary)', 
                        margin: '0 0 0.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {index === 0 && <TrophyIcon size={16} color="var(--success)" />}
                        {center.name}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LocationIcon size={12} color="var(--text-secondary)" />
                        {center.address}
                      </p>
                      <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CarIcon size={12} color="var(--accent)" />
                        {center.distance.toFixed(1)} km away
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                      <div style={{ 
                        color: index === 0 ? 'var(--success)' : 'var(--text-primary)', 
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}>
                        ${center.materialValue.toFixed(2)}
                      </div>
                      {index === 0 && (
                        <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {materialPopup.sortBy === 'price' ? 'Best Price!' : 'Closest!'}
                        </div>
                      )}
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        ⭐ {center.rating}/5
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  No recycling centers found for this material within your radius.
                </div>
              )}
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem',
              backgroundColor: 'rgba(108, 143, 255, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                💡 Tip: Call ahead to confirm current rates and material acceptance
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>


    </div>
  )
}

export default CashForCans
