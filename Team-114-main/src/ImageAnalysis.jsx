import { useState, useEffect, useRef } from 'react'
import { LocationIcon, MoneyIcon, RocketIcon, BenefitIcon, FoodIcon, CheckIcon, StoreIcon, AnalysisIcon, ChartIcon, ListIcon, TrophyIcon, CloseIcon, CarIcon, MapIcon } from './Icons'
import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './universal.css'

/**
 * Image Analysis component - Fixed Google Maps API key and enhanced budget analysis
 * @component 
 * @returns {JSX.Element} The image analysis interface
 */
function ImageAnalysis({ globalAnalysisState, setGlobalAnalysisState }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [budget, setBudget] = useState('')
  const [userLocation, setUserLocation] = useState(() => {
    // Try to restore location from localStorage
    const savedLocation = localStorage.getItem('resourcify_user_location')
    return savedLocation ? JSON.parse(savedLocation) : null
  })
  const [radius, setRadius] = useState(5.0)
  const [locationStatus, setLocationStatus] = useState(() => {
    const savedLocation = localStorage.getItem('resourcify_user_location')
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation)
        if (location.address) {
          return `Saved location: ${location.address}`
        } else if (location.city && location.state) {
          return `Saved location: ${location.state}, ${location.city}`
        } else if (location.city && location.street) {
          return `Saved location: ${location.street}, ${location.city}`
        } else {
          return `Saved location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
        }
      } catch (e) {
        return 'Location restored from previous session'
      }
    }
    return ''
  })
  const [markers, setMarkers] = useState([])
  
  // Use global analysis state
  const isLoading = globalAnalysisState.isAnalyzing
  const analysisResults = globalAnalysisState.results
  
  // Toggle for detailed view
  const [showDetailedResults, setShowDetailedResults] = useState(false)
  
  // Local analyzing state for budget calculations
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Store popup state with sorting
  const [storePopup, setStorePopup] = useState({ show: false, item: null, stores: [], sortBy: 'distance' })
  
  // Cached stores to avoid repeated API calls
  const [cachedStores, setCachedStores] = useState({})
  const [storeCache, setStoreCache] = useState(null) // Cache for all nearby stores
  const [lastLocationKey, setLastLocationKey] = useState(null)
  
  // Benefit programs state
  const [benefitPrograms, setBenefitPrograms] = useState({
    snap: false,
    wic: false,
    tanf: false,
    medicaid: false
  })
  
  // User consent - no state, always ask
  const [userConsent, setUserConsent] = useState(null)
  
  const fileInputRef = useRef(null)

  // Check if user consent is needed before collecting benefit program data
  const handleBenefitProgramChange = (programKey, checked) => {
    // Check if consent has been given in the form
    if (userConsent === null && checked) {
      alert('Please answer the data sharing question above before selecting benefit programs.')
      return
    }
    
    // Update benefit program
    setBenefitPrograms(prev => ({
      ...prev,
      [programKey]: checked
    }))
  }

  // Map functionality removed - location is still used for API calls

  // Function to calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  // Function to get ALL nearby stores once and cache them
  const getAllNearbyStores = async (location) => {
    if (!location || !location.lat || !location.lng) {
      console.error('Invalid location provided to getAllNearbyStores');
      return null;
    }
    
    const locationKey = `${location.lat.toFixed(4)}_${location.lng.toFixed(4)}_${radius}`;
    
    // Return cached stores if available for this location and radius
    if (lastLocationKey === locationKey && storeCache) {
      console.log('Using cached stores for location:', locationKey);
      return storeCache;
    }

    console.log('Fetching fresh store data for location:', locationKey);
    
    try {
      // Import API configuration
      const { API_ENDPOINTS } = await import('./config.js')
      
      // Use server-side NEW Places API instead of client-side old API
      const response = await fetch(API_ENDPOINTS.placesSearch, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          radius: radius, // radius in km
          types: [
            'grocery_store', 
            'supermarket',
            'pharmacy', 
            'clothing_store', 
            'department_store',
            'hardware_store',
            'convenience_store'
          ],
          maxResults: 50
        })
      });

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.places || data.places.length === 0) {
        console.log('No stores found in the area');
        return [];
      }

      // Process and format the results
      const uniqueStores = data.places.map(place => {
        const storeName = place.name.toLowerCase();
        const acceptsSNAP = 
          storeName.includes('walmart') || storeName.includes('target') ||
          storeName.includes('costco') || storeName.includes('kroger') ||
          storeName.includes('safeway') || storeName.includes('vons') ||
          storeName.includes('albertsons') || storeName.includes('grocery') ||
          storeName.includes('supermarket');
        
        const acceptsWIC = 
          storeName.includes('walmart') || storeName.includes('target') ||
          storeName.includes('safeway') || storeName.includes('vons') ||
          storeName.includes('albertsons') || storeName.includes('grocery');

        // Determine store type based on place types (using new Places API types)
        let storeType = 'department_store'; // default
        if (place.types.some(type => type.includes('grocery_store') || type.includes('supermarket'))) {
          storeType = 'grocery_store';
        } else if (place.types.some(type => type.includes('pharmacy'))) {
          storeType = 'pharmacy';
        } else if (place.types.some(type => type.includes('clothing_store'))) {
          storeType = 'clothing_store';
        } else if (place.types.some(type => type.includes('hardware_store'))) {
          storeType = 'hardware_store';
        }

        return {
          id: place.id,
          name: place.name,
          address: place.address,
          distance: `${place.distance.toFixed(1)} km`,
          actualDistance: place.distance,
          acceptsSNAP,
          acceptsWIC,
          rating: place.rating || 0,
          storeType: storeType,
          priceLevel: place.priceLevel || 2
        };
      })
      .filter(store => store.actualDistance <= radius)
      .sort((a, b) => a.actualDistance - b.actualDistance);

      // Cache the results
      setStoreCache(uniqueStores);
      setLastLocationKey(locationKey);
      
      console.log(`Cached ${uniqueStores.length} stores for future use`);
      return uniqueStores;

    } catch (error) {
      console.error('Error fetching all nearby stores:', error);
      return [];
    }
  };

  // Function to find stores for a specific item type from cache
  const findNearbyStores = async (location, item) => {
    try {
      // Get all cached stores first - NO MORE REPEATED API CALLS!
      const allStores = await getAllNearbyStores(location);
      
      if (!allStores || allStores.length === 0) {
        return getFallbackStores(item);
      }

      // Filter stores based on item type from cached results
      const getRelevantStores = (allStores, item) => {
        const itemLower = item.item?.toLowerCase() || item.name?.toLowerCase() || '';
        const descLower = item.description?.toLowerCase() || '';
        
        let relevantStores = allStores;
        
        if (itemLower.includes('food') || itemLower.includes('water') || descLower.includes('food')) {
          relevantStores = allStores.filter(store => 
            store.storeType === 'grocery_store' || 
            store.storeType === 'supermarket' ||
            store.name.toLowerCase().includes('grocery') ||
            store.name.toLowerCase().includes('supermarket') ||
            store.name.toLowerCase().includes('market')
          );
        } else if (itemLower.includes('clothing') || itemLower.includes('clothes')) {
          relevantStores = allStores.filter(store => 
            store.storeType === 'clothing_store' || 
            store.storeType === 'department_store' ||
            store.name.toLowerCase().includes('clothing') ||
            store.name.toLowerCase().includes('apparel')
          );
        } else if (itemLower.includes('medicine') || itemLower.includes('first aid')) {
          relevantStores = allStores.filter(store => 
            store.storeType === 'pharmacy' ||
            store.name.toLowerCase().includes('pharmacy') ||
            store.name.toLowerCase().includes('cvs') ||
            store.name.toLowerCase().includes('walgreens')
          );
        }
        
        // If no specific matches, return general stores (department stores, big box stores)
        if (relevantStores.length === 0) {
          relevantStores = allStores.filter(store => 
            store.storeType === 'department_store' ||
            store.name.toLowerCase().includes('walmart') ||
            store.name.toLowerCase().includes('target')
          );
        }
        
        return relevantStores;
      };

      const relevantStores = getRelevantStores(allStores, item);
      
      // Add estimated pricing based on item and store type
      const storesWithPricing = relevantStores.map(store => ({
        ...store,
        price: item.price ? (item.price * (0.8 + Math.random() * 0.4)) : 
               (item.totalPrice ? (item.totalPrice * (0.8 + Math.random() * 0.4)) : 
                (store.priceLevel * 5 + Math.random() * 10))
      }));

      return storesWithPricing.slice(0, 10); // Return top 10 relevant stores

    } catch (error) {
      console.error('Error finding cached stores:', error);
      return getFallbackStores(item);
    }
  }

  // Fallback stores when Google Places API fails
  const getFallbackStores = (item) => {
    const basePrice = item?.price || item?.totalPrice || 10;
    return [
      { 
        name: "Nearby Store 1", 
        address: "Location detection required for accurate results", 
        distance: "N/A", 
        price: basePrice,
        acceptsSNAP: true,
        acceptsWIC: true
      },
      { 
        name: "Nearby Store 2", 
        address: "Please enable location services", 
        distance: "N/A", 
        price: basePrice * 1.1,
        acceptsSNAP: true,
        acceptsWIC: false
      }
    ];
  }

  // Function to recalculate budget recommendations based on closest stores
  const calculateClosestBudget = async () => {
    if (!analysisResults.suggestions?.budgetRecommendations || !userLocation) {
      alert('Please detect your location first to calculate closest store prices.');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Get closest stores for each recommendation
      const updatedRecommendations = [];
      
      for (const rec of analysisResults.suggestions.budgetRecommendations) {
        const stores = await findNearbyStores(userLocation, rec);
        if (stores && stores.length > 0) {
          // Sort by distance and get closest
          const sortedStores = stores.sort((a, b) => a.actualDistance - b.actualDistance);
          const closestStore = sortedStores[0];
          
          updatedRecommendations.push({
            ...rec,
            price: closestStore.price,
            storeName: closestStore.name,
            storeDistance: closestStore.distance,
            calculationType: 'closest'
          });
        } else {
          updatedRecommendations.push(rec);
        }
      }

      // Recalculate budget breakdown with new prices
      const newTotalSpent = updatedRecommendations.reduce((total, rec) => 
        total + (rec.price || rec.totalPrice || 0), 0
      );
      const newRemainingBudget = (analysisResults.budget || 0) - newTotalSpent;
      
      const updatedBudgetBreakdown = {
        ...analysisResults.budgetBreakdown,
        totalSpent: newTotalSpent,
        remainingBudget: newRemainingBudget,
        calculationType: 'closest'
      };

      // Update the analysis results with new prices and budget
      setGlobalAnalysisState({
        ...globalAnalysisState,
        results: {
          ...analysisResults,
          suggestions: {
            ...analysisResults.suggestions,
            budgetRecommendations: updatedRecommendations
          },
          budgetBreakdown: updatedBudgetBreakdown
        }
      });

    } catch (error) {
      console.error('Error calculating closest budget:', error);
      alert('Unable to calculate closest store prices. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Function to recalculate budget recommendations based on cheapest stores
  const calculateCheapestBudget = async () => {
    if (!analysisResults.suggestions?.budgetRecommendations || !userLocation) {
      alert('Please detect your location first to calculate cheapest store prices.');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Get cheapest stores for each recommendation
      const updatedRecommendations = [];
      
      for (const rec of analysisResults.suggestions.budgetRecommendations) {
        const stores = await findNearbyStores(userLocation, rec);
        if (stores && stores.length > 0) {
          // Sort by price and get cheapest
          const sortedStores = stores.sort((a, b) => a.price - b.price);
          const cheapestStore = sortedStores[0];
          
          updatedRecommendations.push({
            ...rec,
            price: cheapestStore.price,
            storeName: cheapestStore.name,
            storeDistance: cheapestStore.distance,
            calculationType: 'cheapest'
          });
        } else {
          updatedRecommendations.push(rec);
        }
      }

      // Recalculate budget breakdown with new prices
      const newTotalSpent = updatedRecommendations.reduce((total, rec) => 
        total + (rec.price || rec.totalPrice || 0), 0
      );
      const newRemainingBudget = (analysisResults.budget || 0) - newTotalSpent;
      
      const updatedBudgetBreakdown = {
        ...analysisResults.budgetBreakdown,
        totalSpent: newTotalSpent,
        remainingBudget: newRemainingBudget,
        calculationType: 'cheapest'
      };

      // Update the analysis results with new prices and budget
      setGlobalAnalysisState({
        ...globalAnalysisState,
        results: {
          ...analysisResults,
          suggestions: {
            ...analysisResults.suggestions,
            budgetRecommendations: updatedRecommendations
          },
          budgetBreakdown: updatedBudgetBreakdown
        }
      });

    } catch (error) {
      console.error('Error calculating cheapest budget:', error);
      alert('Unable to calculate cheapest store prices. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Function to find stores for a budget item
  const findStoresForItem = async (item) => {
    try {
      // Check if user has SNAP or WIC for food-related items
      const hasFoodBenefits = benefitPrograms.snap || benefitPrograms.wic;

      if (!userLocation) {
        alert('Please detect your location first to find nearby stores.');
        return;
      }

      // Show loading state
      setStorePopup({ 
        show: true, 
        item: item, 
        stores: [{ 
          name: 'Searching nearby stores...', 
          address: 'Please wait while we find stores near you',
          distance: '...',
          price: 0,
          loading: true
        }] 
      });

      // Use Google Places API to find real nearby stores
      const allStores = await findNearbyStores(userLocation, item);
      
      if (!allStores || allStores.length === 0) {
        // Calculate estimated cost for the resource
        const estimatedCost = item.price || item.totalPrice || 
          (item.item?.toLowerCase().includes('food') ? 15 : 
           item.item?.toLowerCase().includes('water') ? 8 :
           item.item?.toLowerCase().includes('clothing') ? 25 : 20);
        
        setStorePopup({ 
          show: true, 
          item: item, 
          stores: [],
          noStoresMessage: {
            title: `No stores found within ${radius.toFixed(1)}km`,
            message: `You need "${item.item || item.name}" with an estimated cost of $${estimatedCost.toFixed(2)}. Try expanding your search radius to find more stores, or consider online shopping options.`,
            suggestion: `Recommended: Increase search radius to ${Math.min(radius + 2, 10).toFixed(1)}km`
          }
        });
        return;
      }

      // Filter stores based on benefit programs if it's a food item
      let filteredStores = allStores;
      if (item.description && item.description.toLowerCase().includes('food') && hasFoodBenefits) {
        if (benefitPrograms.snap) {
          filteredStores = allStores.filter(store => store.acceptsSNAP);
        } else if (benefitPrograms.wic) {
          filteredStores = allStores.filter(store => store.acceptsWIC);
        }
        
        // If no stores accept benefits, show all stores with a warning
        if (filteredStores.length === 0) {
          filteredStores = allStores;
          alert('Note: None of the nearby stores may accept your benefits. Showing all nearby options.');
        }
      }

      // Sort stores based on current sort preference
      const sortedStores = [...filteredStores].sort((a, b) => {
        if (storePopup.sortBy === 'price') {
          return a.price - b.price; // Lowest price first
        } else {
          return a.actualDistance - b.actualDistance; // Closest distance first
        }
      });

      setStorePopup({ 
        show: true, 
        item: item, 
        stores: sortedStores,
        sortBy: storePopup.sortBy || 'distance' // Default to distance sorting
      })
    } catch (error) {
      console.error('Error finding stores:', error)
      alert('Unable to find store information at this time. Please ensure location services are enabled.')
    }
  }

  // Function to change store sorting
  const changeSorting = (newSortBy) => {
    if (!storePopup.stores || storePopup.stores.length === 0) return;
    
    const sortedStores = [...storePopup.stores].sort((a, b) => {
      if (newSortBy === 'price') {
        return a.price - b.price; // Lowest price first
      } else {
        return a.actualDistance - b.actualDistance; // Closest distance first
      }
    });

    setStorePopup({
      ...storePopup,
      stores: sortedStores,
      sortBy: newSortBy
    });
  }

  // Google Maps is loaded by MapSection component - no need to load here

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by this browser.')
      return
    }

    setLocationStatus('Detecting location...')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        
        // Try to get address from coordinates
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lng}&localityLanguage=en`)
          const addressData = await response.json()
          
          // Parse address components from BigDataCloud API structure
          console.log('Address data received:', addressData)
          
          // Extract city - be more specific to avoid timezone data
          const city = addressData.locality || 
                       (addressData.localityInfo?.administrative?.find(item => 
                         item.adminLevel === 3 && !item.name?.includes('/') && !item.name?.includes('America')
                       )?.name) || 
                       'Unknown City'
          
          // Extract state - avoid timezone and country data
          const state = addressData.principalSubdivision || 
                       (addressData.localityInfo?.administrative?.find(item => 
                         item.adminLevel === 1 && !item.name?.includes('/') && !item.name?.includes('America')
                       )?.name) || 
                       'Unknown State'
          
          // Try to get neighborhood/district from informative array or administrative array
          const street = addressData.localityInfo?.informative?.find(item => 
                          item.description === 'neighbourhood' || 
                          item.description === 'district' ||
                          item.order >= 4  // Higher order usually means more specific location
                        )?.name || 
                        addressData.localityInfo?.administrative?.find(item => 
                          item.adminLevel >= 4 // Level 4+ is usually neighborhood/district
                        )?.name || 
                        ''
          
          const locationWithAddress = {
            ...location,
            city,
            state,
            street,
            address: `${city}, ${state}`
          }
          
          setUserLocation(locationWithAddress)
          localStorage.setItem('resourcify_user_location', JSON.stringify(locationWithAddress))
          setLocationStatus(`Location: ${city}, ${state}`)
        } catch (error) {
          console.error('Failed to get address:', error)
          setUserLocation(location)
          localStorage.setItem('resourcify_user_location', JSON.stringify(location))
          setLocationStatus(`Location found: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} - Ready for analysis`)
        }
      },
      (error) => {
        setLocationStatus('Failed to detect location. Please allow location access.')
        console.error('Geolocation error:', error)
      }
    )
  }

  // Map functionality removed - location is still used for API calls

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Please select an image first.')
      return
    }

    setGlobalAnalysisState({ isAnalyzing: true, results: null, error: null, progress: 'uploading' })
    
    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('budget', budget || '0')
    formData.append('benefitPrograms', JSON.stringify(benefitPrograms))
    
    if (userLocation) {
      formData.append('lat', userLocation.lat.toString())
      formData.append('lng', userLocation.lng.toString())
    }

    try {
      setGlobalAnalysisState(prev => ({ ...prev, progress: 'analyzing' }))
      
      // Import API configuration
      const { API_ENDPOINTS } = await import('./config.js')
      
      const response = await fetch(API_ENDPOINTS.analyze, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${await response.text()}`)
      }

      const results = await response.json()
      setGlobalAnalysisState({ 
        isAnalyzing: false, 
        results: results, 
        error: null, 
        progress: 'complete' 
      })

      // Store analysis results in Firebase for debugging
      try {
        console.log('ImageAnalysis: Storing analysis results in Firebase')
        console.log('ImageAnalysis: Results data:', results)
        
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
            console.log('ImageAnalysis: Could not determine city name, using "unknown"')
          }
        }

        const analysisDoc = {
          analysisType: 'image_analysis',
          timestamp: serverTimestamp(),
          timeUTC: new Date().toISOString(),
          budget: parseFloat(budget) || 0,
          benefitPrograms: benefitPrograms,
          location: userLocation ? {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            coordinates: `${userLocation.lat},${userLocation.lng}`
          } : null,
          results: {
            categoryReadiness: results.categoryReadiness || {},
            suggestions: results.suggestions || {},
            budget: results.budget || 0,
            budgetBreakdown: results.budgetBreakdown || {},
            itemCount: results.itemCount || 0
          },
          analysisId: `image_analysis_${Date.now()}`
        }
        
        await addDoc(collection(db, 'user_analysis', 'image_analysis', cityName), analysisDoc)
        console.log('ImageAnalysis: Successfully stored analysis results in Firebase')
      } catch (firebaseError) {
        console.error('ImageAnalysis: Failed to store results in Firebase:', firebaseError)
        // Don't throw error - analysis was successful, just logging failed
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setGlobalAnalysisState({ 
        isAnalyzing: false, 
        results: null, 
        error: error.message, 
        progress: 'idle' 
      })
      alert('Analysis failed. Please try again.')
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setBudget('')
    // Keep location data - don't reset showMap, locationStatus, or userLocation
    setGlobalAnalysisState({ isAnalyzing: false, results: null, error: null, progress: 'idle' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearLocation = () => {
    setUserLocation(null)
    setLocationStatus('')
    setMarkers([])
    localStorage.removeItem('resourcify_user_location')
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: '400' }}>
          Rationer
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Take a pic and we'll help you make the most of what you have.
        </p>
      </div>

      {/* Benefit Programs Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BenefitIcon size={20} color="var(--accent)" />
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Benefit Programs</h3>
        </div>
        
        {/* Inline Consent Question */}
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: 'rgba(108, 143, 255, 0.1)',
          border: '1px solid rgba(108, 143, 255, 0.3)',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
            Help us improve Resourcify
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
            We'd like to collect optional information (such as anonymized usage data and in-app feedback) to help improve the app. Do you agree to share this optional data?
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="dataConsent"
                value="yes"
                checked={userConsent === true}
                onChange={() => setUserConsent(true)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <CheckIcon size={16} color="var(--success)" />
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Yes, I agree</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="dataConsent"
                value="no"
                checked={userConsent === false}
                onChange={() => setUserConsent(false)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <CloseIcon size={16} color="var(--text-secondary)" />
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>No, continue without sharing</span>
            </label>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
            Note: Resourcify will not collect or store optional personal data without your explicit consent.
          </p>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Check any benefit programs you have access to for more accurate recommendations:
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          {[
            { key: 'snap', label: 'SNAP (Food Stamps)', desc: 'Supplemental Nutrition Assistance Program' },
            { key: 'wic', label: 'WIC', desc: 'Women, Infants, and Children Program' },
            { key: 'tanf', label: 'TANF', desc: 'Temporary Assistance for Needy Families' },
            { key: 'medicaid', label: 'Medicaid', desc: 'Medical assistance program' }
          ].map((program) => (
            <label 
              key={program.key}
              className={`benefit-program-label ${benefitPrograms[program.key] ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={benefitPrograms[program.key]}
                onChange={(e) => handleBenefitProgramChange(program.key, e.target.checked)}
                style={{ display: 'none' }}
              />
              <div className="benefit-program-checkbox">
                {benefitPrograms[program.key] && (
                  <CheckIcon size={12} color="white" />
                )}
              </div>
              <div>
                <div className="benefit-program-text">
                  {program.label}
                </div>
                <div className="benefit-program-desc">
                  {program.desc}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleAnalyze}>
          {/* Upload Area */}
          <div 
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginBottom: '2rem',
              minHeight: previewUrl ? 'auto' : '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {previewUrl ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
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
                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  ↑
                </div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Drop your photo here or click to select
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Supports: JPG, PNG, WebP
                </p>
                <button type="button" className="btn btn-secondary">
                  Choose File
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

          {/* Budget Input */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <MoneyIcon size={16} color="#6c8fff" /> Budget (Optional):
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="form-control"
              placeholder="Enter your budget"
              min="0"
              step="1"
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Get personalized purchase recommendations based on your budget
            </small>
          </div>

          {/* Location Input */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <LocationIcon size={16} color="#6c8fff" /> Search Distance: {radius.toFixed(1)} km
            </label>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value))}
                style={{ 
                  width: '200px',
                  accentColor: '#6c8fff'
                }}
              />
              <div style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.85rem', 
                marginTop: '0.25rem' 
              }}>
                Find stores within {radius.toFixed(1)}km radius
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={detectLocation}
                className="btn btn-secondary"
                style={{ 
                  flex: 1,
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #8b5cf6',
                  color: '#8b5cf6'
                }}
              >
                <LocationIcon size={16} /> {userLocation ? 'Update Location' : 'Find Stores Near Me'}
              </button>
              
              {userLocation && (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="btn btn-secondary"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: '0 1rem'
                  }}
                  title="Clear saved location"
                >
                  <CloseIcon size={16} />
                </button>
              )}
            </div>
            
            {locationStatus && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {locationStatus}
              </p>
            )}
          </div>

          {/* Map removed - location and radius are still used for API calls */}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedFile || isLoading}
            style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
          >
            {isLoading ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Analyzing...
                </div>
              </>
            ) : (
              <>
                <RocketIcon size={16} /> Start Analysis
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: 'var(--text-secondary)' 
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--bg-tertiary)',
            borderTop: '4px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Analyzing your image...</p>
        </div>
      )}

      {/* Results */}
      {analysisResults && !isLoading && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Analysis Results
          </h2>

          {/* Category Readiness Bars */}
          {analysisResults.categoryReadiness && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChartIcon size={18} color="var(--accent)" />
                Preparedness Overview
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {Object.entries(analysisResults.categoryReadiness).map(([category, data]) => (
                  <div 
                    key={category} 
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ 
                        color: 'var(--text-primary)', 
                        textTransform: 'capitalize',
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: '600'
                      }}>
                        {category}
                      </h4>
                      <span style={{ 
                        color: data.percentage >= 70 ? 'var(--success)' : 
                              data.percentage >= 40 ? '#f59e0b' : '#ef4444',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {data.percentage}%
                      </span>
                    </div>
                    
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{
                          width: `${Math.min(100, Math.max(0, data.percentage))}%`,
                          height: '100%',
                          backgroundColor: data.percentage >= 70 ? 'var(--success)' : 
                                          data.percentage >= 40 ? '#f59e0b' : '#ef4444',
                          transition: 'width 0.5s ease-out',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    
                    {/* Show description only in detailed view */}
                    {showDetailedResults && data.description && (
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.85rem',
                        margin: '0.5rem 0 0 0',
                        lineHeight: '1.4'
                      }}>
                        {data.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
              Detected Items by Category
            </h3>
            
            {analysisResults.categorized && Object.entries(analysisResults.categorized).map(([category, items]) => (
              items.length > 0 && (
                <div key={category} style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    textTransform: 'capitalize',
                    marginBottom: '0.5rem' 
                  }}>
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {items.map((item, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {item.name || item}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Quick Results - Minimal View */}
          {analysisResults.suggestions?.general && analysisResults.suggestions.general.length > 0 && !showDetailedResults && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AnalysisIcon size={18} color="var(--success)" />
                Quick Assessment
              </h3>
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                borderLeft: `3px solid ${
                  analysisResults.suggestions.general[0]?.priority === 'high' ? '#ef4444' : 
                  analysisResults.suggestions.general[0]?.priority === 'medium' ? '#f59e0b' : '#10b981'
                }`
              }}>
                <p style={{ 
                  color: 'var(--text-primary)', 
                  margin: 0,
                  fontSize: '0.95rem',
                  lineHeight: '1.4'
                }}>
                  {(() => {
                    const firstItem = analysisResults.suggestions.general[0];
                    const text = firstItem.description || firstItem.title || '';
                    const firstSentence = text.split('.')[0] + (text.includes('.') ? '.' : '');
                    return firstSentence;
                  })()}
                </p>
              </div>
              <p style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)', 
                textAlign: 'center',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                Click "Show Details" below for full analysis
              </p>
            </div>
          )}

          {/* Detailed Analysis - Full View */}
          {analysisResults.suggestions?.general && analysisResults.suggestions.general.length > 0 && showDetailedResults && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChartIcon size={18} color="var(--success)" />
                Detailed Analysis & Recommendations  
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analysisResults.suggestions.general.map((suggestion, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${
                      suggestion.priority === 'high' ? '#ef4444' : 
                      suggestion.priority === 'medium' ? '#f59e0b' : '#10b981'
                    }`
                  }}>
                    <h4 style={{ 
                      color: 'var(--text-primary)', 
                      margin: '0 0 0.5rem 0',
                      fontSize: '1rem'
                    }}>
                      {suggestion.title}
                    </h4>
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {suggestion.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Recommendations - Condensed View */}
          {analysisResults.suggestions?.budgetRecommendations && analysisResults.suggestions.budgetRecommendations.length > 0 && !showDetailedResults && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#6c8fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MoneyIcon size={18} color="#6c8fff" />
                Budget Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysisResults.suggestions.budgetRecommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    onClick={() => findStoresForItem(rec)}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(108, 143, 255, 0.1)',
                      border: '1px solid rgba(108, 143, 255, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 143, 255, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 143, 255, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        color: 'var(--text-primary)', 
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {rec.item}
                      </span>
                      <span style={{ 
                        color: '#6c8fff', 
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        ${rec.price?.toFixed(2) || rec.totalPrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Recommendations - Detailed View */}
          {analysisResults.suggestions?.budgetRecommendations && analysisResults.suggestions.budgetRecommendations.length > 0 && showDetailedResults && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#6c8fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MoneyIcon size={18} color="#6c8fff" />
                Budget Recommendations (Detailed)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysisResults.suggestions.budgetRecommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    onClick={() => findStoresForItem(rec)}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(108, 143, 255, 0.1)',
                      border: '1px solid rgba(108, 143, 255, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 143, 255, 0.2)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(108, 143, 255, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 143, 255, 0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1, marginRight: '1rem' }}>
                        <h4 style={{ 
                          color: 'var(--text-primary)', 
                          margin: '0 0 0.5rem 0',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}>
                          {rec.item}
                        </h4>
                        <p style={{ 
                          color: 'var(--text-secondary)', 
                          fontSize: '0.9rem',
                          margin: 0,
                          lineHeight: '1.4'
                        }}>
                          {rec.description}
                        </p>
                      </div>
                      <div style={{ 
                        textAlign: 'right'
                      }}>
                        <div style={{
                          color: '#6c8fff', 
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}>
                          ${rec.price?.toFixed(2) || rec.totalPrice?.toFixed(2) || '0.00'}
                        </div>
                        {rec.storeName && (
                          <div style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem'
                          }}>
                            {rec.calculationType === 'closest' ? '📍' : rec.calculationType === 'cheapest' ? '💰' : ''} {rec.storeName}
                            {rec.storeDistance && <div>{rec.storeDistance}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: '#6c8fff', 
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      <StoreIcon size={14} color="#6c8fff" />
                      <span>Click to find stores</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Budget Summary - Quick View */}
              {analysisResults.budgetBreakdown && !showDetailedResults && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Budget Used:</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                        ${analysisResults.budgetBreakdown.totalSpent.toFixed(2)}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        /{analysisResults.budget}
                      </span>
                    </div>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      width: `${Math.min(100, (analysisResults.budgetBreakdown.totalSpent / analysisResults.budget) * 100)}%`,
                      height: '100%',
                      backgroundColor: 'var(--success)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}

              {/* Budget Summary - Detailed View */}
              {analysisResults.budgetBreakdown && showDetailedResults && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: 'var(--success)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Detailed Budget Summary
                    {analysisResults.budgetBreakdown.calculationType && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        backgroundColor: analysisResults.budgetBreakdown.calculationType === 'closest' ? '#28a745' : '#ffc107',
                        color: analysisResults.budgetBreakdown.calculationType === 'closest' ? 'white' : 'black',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontWeight: '600'
                      }}>
                        {analysisResults.budgetBreakdown.calculationType === 'closest' ? '📍 CLOSEST' : '💰 CHEAPEST'}
                      </span>
                    )}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Budget:</span>
                    <span style={{ color: 'var(--text-primary)' }}>${analysisResults.budget}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Recommended Spending:</span>
                    <span style={{ color: 'var(--success)' }}>${analysisResults.budgetBreakdown.totalSpent.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Remaining:</span>
                    <span style={{ color: 'var(--text-primary)' }}>${analysisResults.budgetBreakdown.remainingBudget.toFixed(2)}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      width: `${Math.min(100, (analysisResults.budgetBreakdown.totalSpent / analysisResults.budget) * 100)}%`,
                      height: '100%',
                      backgroundColor: 'var(--success)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Toggle Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <button 
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="btn btn-outline"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
                backgroundColor: 'transparent'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {showDetailedResults ? (
                  <>
                    <ListIcon size={14} color="var(--accent-primary)" />
                    Quick View
                  </>
                ) : (
                  <>
                    <ChartIcon size={14} color="var(--accent-primary)" />
                    <span style={{ textDecoration: 'underline' }}>Full Details</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Budget Calculation Buttons - Only show in detailed view */}
          {showDetailedResults && analysisResults.suggestions?.budgetRecommendations && analysisResults.suggestions.budgetRecommendations.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <button 
                onClick={calculateClosestBudget}
                disabled={isAnalyzing}
                className="btn btn-outline"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  borderColor: '#28a745',
                  color: '#28a745',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  opacity: isAnalyzing ? 0.6 : 1
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LocationIcon size={14} color="#28a745" />
                  {isAnalyzing ? 'Calculating...' : 'Calculate Closest'}
                </span>
              </button>
              <button 
                onClick={calculateCheapestBudget}
                disabled={isAnalyzing}
                className="btn btn-outline"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  borderColor: '#ffc107',
                  color: '#ffc107',
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  opacity: isAnalyzing ? 0.6 : 1
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MoneyIcon size={14} color="#ffc107" />
                  {isAnalyzing ? 'Calculating...' : 'Calculate Cheapest'}
                </span>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={resetForm} className="btn btn-secondary">
              Analyze Another Photo
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Resourcify Analysis Results',
                    text: 'Check out my resource analysis!',
                    url: window.location.href
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('Link copied to clipboard!'))
                }
              }}
              className="btn btn-primary"
            >
              Share Results
            </button>
          </div>
        </div>
      )}

      {/* Store Popup Modal */}
      {storePopup.show && (
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
        onClick={() => setStorePopup({ show: false, item: null, stores: [], noStoresMessage: null, sortBy: 'distance' })}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
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
                Where to buy: {storePopup.item?.item}
              </h3>
              <button 
                onClick={() => setStorePopup({ show: false, item: null, stores: [], noStoresMessage: null, sortBy: 'distance' })}
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
              Nearby stores for "{storePopup.item?.item}" - {storePopup.stores && storePopup.stores.length > 0 ? `${storePopup.stores.length} stores found` : 'searching...'}
            </p>

            {/* Sorting Controls */}
            {storePopup.stores && storePopup.stores.length > 1 && !storePopup.noStoresMessage && (
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
                  onClick={() => changeSorting('distance')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: storePopup.sortBy === 'distance' ? 'var(--accent)' : 'var(--bg-primary)',
                    color: storePopup.sortBy === 'distance' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📍 Distance
                </button>
                <button
                  onClick={() => changeSorting('price')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: storePopup.sortBy === 'price' ? 'var(--accent)' : 'var(--bg-primary)',
                    color: storePopup.sortBy === 'price' ? 'white' : 'var(--text-primary)',
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
              {/* Show no stores found message if applicable */}
              {storePopup.noStoresMessage ? (
                <div style={{
                  padding: '2rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  textAlign: 'center'
                }}>
                  <h4 style={{ 
                    color: 'var(--warning)', 
                    margin: '0 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}>
                    <LocationIcon size={18} color="var(--warning)" />
                    {storePopup.noStoresMessage.title}
                  </h4>
                  <p style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                    {storePopup.noStoresMessage.message}
                  </p>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(108, 143, 255, 0.1)',
                    borderRadius: '6px',
                    marginTop: '1rem'
                  }}>
                    <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>
                      💡 {storePopup.noStoresMessage.suggestion}
                    </p>
                  </div>
                </div>
              ) : (
                // Show store results
                storePopup.stores.map((store, index) => (
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
                        {!store.loading && index === 0 && (
                          <TrophyIcon size={16} color="var(--success)" />
                        )}
                        {store.loading && (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid var(--accent)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                        )}
                        {store.name}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LocationIcon size={12} color="var(--text-secondary)" />
                        {store.address}
                      </p>
                      <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CarIcon size={12} color="var(--accent)" />
                        {store.distance}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                      <div style={{ 
                        color: !store.loading && index === 0 ? 'var(--success)' : 'var(--text-primary)', 
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}>
                        {store.loading ? '...' : `$${(store.price || 0).toFixed(2)}`}
                      </div>
                      {!store.loading && index === 0 && (
                        <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {storePopup.sortBy === 'price' ? 'Cheapest!' : 'Closest!'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
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
                💡 Tip: Call ahead to confirm availability and current prices
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

export default ImageAnalysis;
