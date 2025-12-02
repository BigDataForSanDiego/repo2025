// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const budgetInput = document.getElementById('budgetInput');
const detectLocationBtn = document.getElementById('detectLocationBtn');
const locationStatus = document.getElementById('locationStatus');
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadForm = document.getElementById('uploadForm');
const results = document.getElementById('results');
const radiusSlider = document.getElementById('radiusSlider');
const radiusValue = document.getElementById('radiusValue');
const loading = document.getElementById('loading');
const analysisResults = document.getElementById('analysisResults');
const storeMap = document.getElementById('storeMap');
const mapDiv = document.getElementById('map');
const storeList = document.getElementById('storeList');

// Map variables
let map = null;
let userLocation = null;
let markers = [];
let infoWindow = null;

let selectedFile = null;

// Update radius text when slider value changes
radiusSlider.addEventListener('input', function() {
    radiusValue.textContent = `${parseFloat(this.value).toFixed(1)} km`;
});

// Update store search when slider value changes (using debounce to prevent too many API calls)
let searchTimeout;
radiusSlider.addEventListener('change', function() {
    if (userLocation && map) {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        searchTimeout = setTimeout(() => {
            initMap({ coords: { latitude: userLocation.lat, longitude: userLocation.lng } });
        }, 300);
    }
    console.log("hi");
});
console.log("hello");

// Load Google Maps API dynamically
async function loadMapsAPI() {
    try {
        const response = await fetch('/api/maps-key');
        if (!response.ok) {
            throw new Error('Failed to get Maps API key');
        }
        const { key } = await response.json();
        
        // Load the Maps JavaScript API with a callback
        return new Promise((resolve, reject) => {
            window.initGoogleMapsCallback = () => {
                delete window.initGoogleMapsCallback;
                resolve();
            };
            
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,marker&callback=initGoogleMapsCallback&loading=async`;
            script.async = true;
            script.onerror = (error) => {
                console.error('Google Maps script failed to load:', error);
                reject(new Error('Google Maps API failed to load. Check API key restrictions and ensure Maps JavaScript API is enabled.'));
            };
            document.head.appendChild(script);
        });
    } catch (error) {
        console.error('Error loading Maps API:', error);
        throw error;
    }
}

// Event Listeners
// Handle button click inside upload area
const chooseFileBtn = uploadArea.querySelector('button');
if (chooseFileBtn) {
    chooseFileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling to uploadArea
        e.preventDefault(); // Prevent any default behavior
        imageInput.click();
    });
}

uploadArea.addEventListener('click', (e) => {
    // Don't trigger if clicking the button inside
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        return;
    }
    imageInput.click();
});
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
imageInput.addEventListener('change', handleFileSelect);
uploadForm.addEventListener('submit', handleFormSubmit);
detectLocationBtn.addEventListener('click', detectLocation);

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            selectedFile = file;
            showImagePreview(file);
        } else {
            alert('Please select an image file');
        }
    }
}

// File Selection Handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        showImagePreview(file);
    } else {
        // reset if no file is selected
        selectedFile = null;
    }
}

// Show Image Preview
function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
        uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Remove Image
function removeImage() {
    selectedFile = null;
    imagePreview.style.display = 'none';
    uploadArea.style.display = 'block';
    imageInput.value = '';
}

// Form Submit Handler
// Initialize map with user's location
async function initMap(position) {
    try {
        await loadMapsAPI();
        
        const { latitude, longitude } = position.coords;
        userLocation = { lat: latitude, lng: longitude };
        
        map = new google.maps.Map(mapDiv, {
            center: userLocation,
            gestureHandling: 'greedy', // Enables scroll zoom without requiring Command/Control key
            zoom: 12,
            mapId: 'DEMO_MAP_ID' // Use demo Map ID to enable Advanced Markers
        });
        
        // Add marker for user's location
        const MarkerClass = google.maps.marker?.AdvancedMarkerElement || google.maps.Marker;
        const userMarkerView = new MarkerClass({
            map,
            position: userLocation,
            title: 'Your Location',
            ...(google.maps.marker?.AdvancedMarkerElement
                ? { content: createMarkerContent('Your Location', 'blue') }
                : { icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
            )
        });
        
        infoWindow = new google.maps.InfoWindow();
        
        // Use Places API for searching nearby stores
        try {
            const placesApiKey = await getPlacesApiKey();
            console.log('Using Places API key for Places:', placesApiKey ? 'Key loaded' : 'No key');
            
            const response = await fetch(`https://places.googleapis.com/v1/places:searchNearby`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': placesApiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.location'
                },
                body: JSON.stringify({
                    locationRestriction: {
                        circle: {
                            center: {
                                latitude: userLocation.lat,
                                longitude: userLocation.lng
                            },
                            radius: parseFloat(radiusSlider.value) * 1000 // Convert km to meters
                        }
                    },
                    includedTypes: ['hardware_store'],
                    maxResultCount: 10
                })
            });
            
            console.log('Places API request sent with location:', userLocation);
            
            if (!response.ok) {
                console.error('Places API error:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Places API error details:', errorText);
                throw new Error(`Failed to fetch nearby places: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Places API response:', data);
            // Clear previous markers
            markers.forEach(marker => marker.map = null);
            markers = [];
            
            // Clear previous store list
            storeList.innerHTML = '';
            
            if (data.places) {
                data.places.slice(0, 5).forEach(place => {
                    const position = {
                        lat: place.location.latitude,
                        lng: place.location.longitude
                    };
                    
                    // Create marker with fallback
                    const marker = new MarkerClass({
                        map,
                        position,
                        title: place.displayName.text,
                        ...(google.maps.marker?.AdvancedMarkerElement
                            ? { content: createMarkerContent(place.displayName.text) }
                            : {}
                        )
                    });
                    
                    markers.push(marker);
                    
                    // Create store list item
                    const storeItem = document.createElement('div');
                    storeItem.className = 'store-item';
                    storeItem.innerHTML = `
                        <h3>${place.displayName.text}</h3>
                        <p>${place.formattedAddress}</p>
                        ${place.rating ? `<p>Rating: ${place.rating.toFixed(1)} ⭐</p>` : ''}
                    `;
                    
                    // Add click handlers
                    storeItem.addEventListener('click', () => {
                        map.panTo(position);
                        showInfoWindow(place, marker);
                    });
                    
                    marker.addListener('click', () => {
                        map.panTo(position);
                        showInfoWindow(place, marker);
                    });
                    
                    storeList.appendChild(storeItem);
                });
            }
            
            storeMap.style.display = 'block';
        } catch (error) {
            console.error('Error fetching nearby places:', error);
            locationStatus.textContent = 'Error finding nearby stores. Please try again.';
            locationStatus.className = 'error';
        }
    } catch (error) {
        console.error('Error initializing map:', error);
        locationStatus.textContent = 'Error loading map. Please try again.';
        locationStatus.className = 'error';
    }
}

// Helper function to get the Google Maps API key from the server
async function getGoogleApiKey() {
    try {
        const response = await fetch('/api/maps-key');
        if (!response.ok) {
            console.error('Failed to fetch Maps API key:', response.status, response.statusText);
            throw new Error(`Failed to get Maps API key: ${response.status}`);
        }
        const data = await response.json();
        console.log('Maps API key received:', data.key ? 'Key present' : 'No key in response');
        return data.key;
    } catch (error) {
        console.error('Error getting Maps API key:', error);
        throw error;
    }
}

// Helper function to get the Google Places API key from the server
async function getPlacesApiKey() {
    try {
        const response = await fetch('/api/places-key');
        if (!response.ok) {
            console.error('Failed to fetch Places API key:', response.status, response.statusText);
            throw new Error(`Failed to get Places API key: ${response.status}`);
        }
        const data = await response.json();
        console.log('Places API key received:', data.key ? 'Key present' : 'No key in response');
        return data.key;
    } catch (error) {
        console.error('Error getting Places API key:', error);
        throw error;
    }
}

// Create custom marker element
function createMarkerContent(title, color = 'red') {
    const content = document.createElement('div');
    content.classList.add('custom-marker');
    content.style.backgroundColor = color;
    content.style.padding = '8px';
    content.style.borderRadius = '4px';
    content.style.color = 'white';
    content.textContent = title;
    return content;
}

// Show info window for a store
function showInfoWindow(place, marker) {
    infoWindow.setContent(`
        <div class="info-window">
            <h3>${place.displayName.text}</h3>
            <p>${place.formattedAddress}</p>
            ${place.rating ? `<p>Rating: ${place.rating.toFixed(1)} ⭐</p>` : ''}
        </div>
    `);
    infoWindow.open({ map, anchor: marker });
}

// Detect user's location
async function detectLocation() {
    if (navigator.geolocation) {
        locationStatus.textContent = 'Getting your location...';
        locationStatus.className = '';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                locationStatus.textContent = 'Location found! Showing nearby stores...';
                locationStatus.className = 'success';
                initMap(position);
            },
            (error) => {
                console.error('Geolocation error:', error);
                locationStatus.textContent = 'Error getting location. Please try again.';
                locationStatus.className = 'error';
            }
        );
    } else {
        locationStatus.textContent = 'Geolocation is not supported by your browser.';
        locationStatus.className = 'error';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Double-check: if selectedFile is null but imageInput has a file, set it
    // This handles the case where the change event didn't fire properly
    if (!selectedFile && imageInput.files && imageInput.files[0]) {
        selectedFile = imageInput.files[0];
        // Only show preview if it's not already showing
        if (imagePreview.style.display === 'none') {
            showImagePreview(selectedFile);
        }
    }
    
    if (!selectedFile) {
        alert('Please select an image to analyze');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('budget', budgetInput.value || '0');
    
    // Include location data if available
    if (userLocation) {
        formData.append('lat', userLocation.lat);
        formData.append('lng', userLocation.lng);
        console.log('Sending location data:', userLocation);
    }
    
    // Show loading
    loading.style.display = 'block';
    results.style.display = 'none';
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Analysis response data:', data);
        
        // Check if there's an error in the response
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayResults(data);
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert(`Failed to analyze image: ${error.message}`);
    } finally {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Resources';
    }
}

// Display Analysis Results
function displayResults(data) {
    console.log('Displaying results with data:', data);
    const { categorized = {}, items = [], suggestions = {}, budget = 0, weather = null } = data;
    
    let html = '<h2>Analysis Results</h2>';
    
    // Show weather information if available
    if (weather) {
        const tempColor = weather.feelsLike <= 32 ? '#e74c3c' : weather.feelsLike <= 50 ? '#f39c12' : weather.temperature >= 85 ? '#e67e22' : '#3498db';
        html += `
            <div class="weather-info" style="background: linear-gradient(135deg, ${tempColor}20, ${tempColor}10); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${tempColor};">
                <h3 style="margin-top: 0;">Current Weather Conditions</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <div><strong>Temperature:</strong> ${weather.temperature}°F</div>
                    <div><strong>Feels Like:</strong> ${weather.feelsLike}°F</div>
                    <div><strong>Conditions:</strong> ${weather.condition}</div>
                    <div><strong>Humidity:</strong> ${weather.humidity}%</div>
                </div>
                ${weather.feelsLike <= 32 ? '<p style="color: #c0392b; font-weight: bold; margin: 10px 0 0 0;">EXTREME COLD WARNING - Hypothermia risk!</p>' : ''}
                ${weather.feelsLike <= 50 && weather.feelsLike > 32 ? '<p style="color: #d68910; font-weight: bold; margin: 10px 0 0 0;">Cold weather - warm clothing recommended</p>' : ''}
                ${weather.temperature >= 85 ? '<p style="color: #ca6f1e; font-weight: bold; margin: 10px 0 0 0;">Hot weather - stay hydrated!</p>' : ''}
            </div>
        `;
    }
    
    // Show categorized items
    if (categorized && Object.keys(categorized).length > 0) {
        html += '<h3>Detected Items by Category</h3>';
        
        const categoryNames = {
            food: 'Food & Drinks',
            clothing: 'Clothing & Apparel',
            shelter: 'Shelter & Protection',
            hygiene: 'Hygiene & Health',
            tools: 'Tools & Equipment',
            safety: 'Safety & Emergency',
            misc: 'Other Items'
        };
        
        for (const [category, categoryItems] of Object.entries(categorized)) {
            if (categoryItems && categoryItems.length > 0) {
                html += `
                    <div class="category-section">
                        <h4>${categoryNames[category] || category}</h4>
                        <ul class="item-list">
                `;
                
                categoryItems.forEach(item => {
                    const confidence = Math.round((item.confidence || 0) * 100);
                    html += `
                        <li>
                            <span>${item.name || 'Unknown'}</span>
                            <span class="confidence">${confidence}% confidence</span>
                        </li>
                    `;
                });
                
                html += '</ul></div>';
            }
        }
    }
    
    // Show all detected items
    if (items && items.length > 0) {
        html += `
            <details style="margin: 30px 0; background: var(--bg-tertiary); padding: 20px; border-radius: 8px;">
                <summary style="cursor: pointer; font-weight: 500; color: var(--text-primary);">
                    All Detected Items (${items.length})
                </summary>
                <ul class="item-list" style="margin-top: 15px;">
        `;
        
        items.forEach(item => {
            const confidence = Math.round((item.score || item.confidence || 0) * 100);
            html += `
                <li>
                    <span>${item.name || 'Unknown'}</span>
                    <span class="confidence">${confidence}% confidence</span>
                </li>
            `;
        });
        
        html += '</ul></details>';
    }
    
    // Show suggestions
    if (suggestions && typeof suggestions === 'object') {
        html += '<h3>Smart Recommendations</h3>';
        
        // General suggestions
        if (Array.isArray(suggestions.general) && suggestions.general.length > 0) {
            html += '<h4>Resource Analysis</h4>';
            suggestions.general.forEach(suggestion => {
                // Handle both object and string suggestions
                if (typeof suggestion === 'string') {
                    html += `
                        <div class="suggestion-item">
                            <p>${suggestion}</p>
                        </div>
                    `;
                } else if (suggestion && typeof suggestion === 'object') {
                    html += `
                        <div class="suggestion-item">
                            <h4>${suggestion.title || 'Suggestion'}</h4>
                            <p>${suggestion.description || suggestion.text || ''}</p>
                    `;
                    
                    if (Array.isArray(suggestion.items) && suggestion.items.length > 0) {
                        html += '<ul class="suggestion-items">';
                        suggestion.items.forEach(item => {
                            html += `<li>${item}</li>`;
                        });
                        html += '</ul>';
                    }
                    
                    html += '</div>';
                }
            });
        }
        
        // Budget recommendations
        if (Array.isArray(suggestions.budgetRecommendations) && suggestions.budgetRecommendations.length > 0 && budget > 0) {
            html += `<h4>Budget Recommendations ($${budget})</h4>`;
            suggestions.budgetRecommendations.forEach(rec => {
                // Handle both string and object format
                if (typeof rec === 'string') {
                    html += `
                        <div class="budget-item">
                            <p>${rec}</p>
                        </div>
                    `;
                } else if (rec && typeof rec === 'object') {
                    html += `
                        <div class="budget-item">
                            <h4>${rec.item || 'Item'} ${rec.price ? `<span class="price">$${rec.price}</span>` : ''}</h4>
                            <p>${rec.description || rec.text || ''}</p>
                        </div>
                    `;
                }
            });
        }
        
        // Priority actions - only if we have structured general suggestions
        if (Array.isArray(suggestions.general) && suggestions.general.length > 0 && 
            suggestions.general.some(s => typeof s === 'object' && s.title)) {
            html += '<h4>Priority Actions</h4>';
            suggestions.general.forEach((suggestion, index) => {
                if (typeof suggestion === 'object' && suggestion.title) {
                    const icons = ['!', '~', '*'];
                    const icon = icons[index % icons.length];
                    html += `
                        <div class="priority-item">
                            <span class="priority-icon">${icon}</span>
                            <div class="priority-content">
                                <h4>${suggestion.title}</h4>
                                <p>${suggestion.description || suggestion.text || ''}</p>
                            </div>
                        </div>
                    `;
                }
            });
        }
    }
    
    analysisResults.innerHTML = html;
    results.style.display = 'block';
    
    // Smooth scroll to results
    results.scrollIntoView({ behavior: 'smooth' });
}

// Reset Form
function resetForm() {
    selectedFile = null;
    imageInput.value = '';
    budgetInput.value = '';
    imagePreview.style.display = 'none';
    uploadArea.style.display = 'block';
    results.style.display = 'none';
    
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Share Results
function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'Resourcify Analysis Results',
            text: 'Check out my resource analysis from Resourcify!',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            alert('Unable to share. Please copy the URL manually.');
        });
    }
}

// Navigation Functions
function showImageAnalysis() {
    // Hide eligibility form
    document.getElementById('eligibilityForm').style.display = 'none';
    
    // Show upload section
    document.querySelector('.upload-section').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Update navigation buttons
    document.getElementById('imageAnalysisBtn').classList.add('active');
    document.getElementById('eligibilityBtn').classList.remove('active');
    
    // Reset forms
    resetForm();
}

function showEligibilityForm() {
    // Hide upload section and results
    document.querySelector('.upload-section').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    
    // Show eligibility form
    document.getElementById('eligibilityForm').style.display = 'block';
    
    // Update navigation buttons
    document.getElementById('imageAnalysisBtn').classList.remove('active');
    document.getElementById('eligibilityBtn').classList.add('active');
    
    // Reset eligibility form
    resetEligibilityForm();
}

// Eligibility Form Functions
function resetEligibilityForm() {
    document.getElementById('eligibilityFormElement').reset();
    document.getElementById('eligibilityResults').style.display = 'none';
}

// Eligibility form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const eligibilityForm = document.getElementById('eligibilityFormElement');
    if (eligibilityForm) {
        eligibilityForm.addEventListener('submit', handleEligibilitySubmit);
    }
});

function handleEligibilitySubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        householdSize: parseInt(document.getElementById('householdSize').value),
        income: parseInt(document.getElementById('income').value),
        hasChildren: document.getElementById('hasChildren').checked,
        isVeteran: document.getElementById('isVeteran').checked,
        hasDisability: document.getElementById('hasDisability').checked,
        isHomeless: document.getElementById('isHomeless').checked
    };
    
    // Calculate eligibility
    const eligiblePrograms = calculateEligibility(formData);
    
    // Display results
    displayEligibilityResults(eligiblePrograms);
}

function calculateEligibility(formData) {
    const eligiblePrograms = [];
    
    // SNAP (Food Stamps) - based on income guidelines
    const snapIncomeLimit = formData.householdSize * 16000; // Rough estimate
    if (formData.income < snapIncomeLimit) {
        eligiblePrograms.push({
            name: 'SNAP (Food Stamps)',
            description: 'Supplemental Nutrition Assistance Program - Monthly benefits for purchasing food',
            priority: 'high'
        });
    }
    
    // Emergency Housing Assistance
    if (formData.isHomeless) {
        eligiblePrograms.push({
            name: 'Emergency Housing Assistance',
            description: 'Immediate shelter and housing support for homeless individuals and families',
            priority: 'critical'
        });
    }
    
    // WIC Program
    if (formData.hasChildren && formData.income < formData.householdSize * 20000) {
        eligiblePrograms.push({
            name: 'WIC Program',
            description: 'Women, Infants, and Children nutrition program - Food assistance for pregnant women and children under 5',
            priority: 'high'
        });
    }
    
    // Veterans Benefits
    if (formData.isVeteran) {
        eligiblePrograms.push({
            name: 'VA Benefits',
            description: 'Veterans Affairs assistance programs including healthcare, disability compensation, and housing assistance',
            priority: 'high'
        });
    }
    
    // Social Security Disability Insurance
    if (formData.hasDisability) {
        eligiblePrograms.push({
            name: 'SSDI',
            description: 'Social Security Disability Insurance - Monthly payments for individuals unable to work due to disability',
            priority: 'high'
        });
    }
    
    // Temporary Assistance for Needy Families (TANF)
    if (formData.hasChildren && formData.income < formData.householdSize * 12000) {
        eligiblePrograms.push({
            name: 'TANF',
            description: 'Temporary Assistance for Needy Families - Cash assistance and support services for families with children',
            priority: 'high'
        });
    }
    
    // Medicaid
    const medicaidIncomeLimit = formData.householdSize * 17000; // Simplified
    if (formData.income < medicaidIncomeLimit || formData.isHomeless || formData.hasDisability) {
        eligiblePrograms.push({
            name: 'Medicaid',
            description: 'Free or low-cost healthcare coverage including doctor visits, hospital care, and prescription drugs',
            priority: 'high'
        });
    }
    
    return eligiblePrograms;
}

function displayEligibilityResults(programs) {
    const resultsDiv = document.getElementById('eligibilityResults');
    const listDiv = document.getElementById('eligibilityList');
    
    if (programs.length === 0) {
        listDiv.innerHTML = `
            <div class="program-item">
                <h4>No Programs Found</h4>
                <p>Based on the information provided, we couldn't find any programs you may be eligible for. 
                Consider consulting with a local social services office for personalized assistance.</p>
            </div>
        `;
    } else {
        listDiv.innerHTML = programs.map(program => `
            <div class="program-item ${program.priority === 'critical' ? 'critical' : ''}">
                <h4>
                    ${program.name}
                    <span class="program-priority ${program.priority}">${program.priority.toUpperCase()}</span>
                </h4>
                <p>${program.description}</p>
            </div>
        `).join('');
    }
    
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}