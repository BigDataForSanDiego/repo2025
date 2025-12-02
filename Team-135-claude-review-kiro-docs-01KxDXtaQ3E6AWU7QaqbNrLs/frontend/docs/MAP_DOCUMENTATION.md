# Map Component Documentation

## Overview

The redesigned map component provides a beautiful, smooth, and minimalistic interface for displaying nearby resources to users experiencing homelessness. Built with React, TypeScript, and Leaflet, it offers an elegant user experience with smooth animations and real-time geolocation.

---

## 🎨 Design Philosophy

The map redesign follows these core principles:

- **Minimalistic**: Clean interface that doesn't overwhelm users
- **Beautiful**: Smooth gradients, elegant animations, and modern styling
- **Accessible**: High contrast, clear typography, and intuitive interactions
- **Performant**: Optimized rendering and smooth 60fps animations
- **Mobile-First**: Designed primarily for mobile kiosk usage

---

## 📁 File Structure

```
frontend/app/map/
├── page.tsx              # Main map page component
├── MapView.tsx           # Leaflet map implementation
└── map-styles.css        # Custom animations and styling
```

---

## 🎯 Key Features

### 1. Real-Time Geolocation
- Automatically detects user's location using browser geolocation API
- Smooth flyTo animations when centering on user location
- Fallback to San Diego coordinates if geolocation unavailable
- Manual recenter button with loading state

### 2. Interactive Resource Markers
- Color-coded by resource type:
  - **Purple gradient**: Shelters (#667eea → #764ba2)
  - **Pink gradient**: Food banks (#f093fb → #f5576c)
  - **Blue gradient**: Medical clinics (#4facfe → #00f2fe)
  - **Green gradient**: Hygiene facilities (#43e97b → #38f9d7)
  - **Yellow gradient**: Other resources (#fa709a → #fee140)
- Smooth pulse animation for visibility
- Hover effects with scale transformation
- Click to select and view details

### 3. Elegant Popups
- Glass-morphism design with backdrop blur
- Smooth slide-in animation (cubic-bezier easing)
- Display key information: name, type, distance, address
- Auto-dismiss or manual close

### 4. Resource Card Overlay
- Detailed information panel at bottom of screen
- Slide-up entrance animation
- Shows:
  - Resource name and type
  - Verification status
  - Operating hours
  - Pet-friendly indicator
  - Distance and address
  - Phone number
- Action buttons:
  - **Call**: Direct phone dialer integration
  - **Directions**: Opens Google Maps with navigation

### 5. Beautiful Map Tiles
- Carto Positron basemap for clean, minimalistic appearance
- Smooth tile fade-in animations
- High contrast for outdoor visibility
- Light color scheme optimized for readability

---

## 🎭 Animations & Transitions

### Marker Animations
```css
/* Smooth pulse effect */
@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 currentColor; }
  50% { box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 0 8px transparent; }
}
```

### User Location Marker
```css
/* Continuous pulse with expanding ring */
@keyframes userPulse {
  0%, 100% { box-shadow: 0 6px 20px rgba(102,126,234,0.6), 0 0 0 0 rgba(102,126,234,0.4); }
  50% { box-shadow: 0 8px 24px rgba(102,126,234,0.8), 0 0 0 12px rgba(102,126,234,0); }
}
```

### Popup Entrance
```css
@keyframes popupSlideIn {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Resource Card
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 🔌 API Integration

### Current Implementation
The map currently uses mock data for development. To connect to the real backend:

1. Update the `fetchNearbyResources` function in `page.tsx`:

```typescript
const fetchNearbyResources = async (lat: number, lng: number) => {
  setLoading(true)
  setError(null)

  try {
    // Replace with your backend URL
    const response = await fetch(
      `https://your-backend-url.com/functions/v1/resource-finder?lat=${lat}&lng=${lng}&radius=5000`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch resources')
    }

    const data = await response.json()
    setResources(data.resources || [])

    if (data.resources?.length > 0) {
      setSelectedResource(data.resources[0])
    }
  } catch (err) {
    console.error('Error fetching resources:', err)
    setError('Unable to load resources. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

### Backend API Reference
Endpoint: `/functions/v1/resource-finder`

**Query Parameters:**
- `lat` (required): User latitude (-90 to 90)
- `lng` (required): User longitude (-180 to 180)
- `radius` (optional): Search radius in meters (default: 5000, max: 50000)
- `type` (optional): Filter by type (shelter, food, medical, hygiene, other)
- `pet_friendly` (optional): Filter pet-friendly resources (true/false)
- `is_open` (optional): Filter currently open resources (true/false)

**Response Format:**
```json
{
  "success": true,
  "resources": [
    {
      "id": "uuid",
      "name": "Hope Shelter",
      "type": "shelter",
      "latitude": 32.7157,
      "longitude": -117.1611,
      "distance_meters": 300,
      "is_open": true,
      "phone": "(555) 123-4567",
      "hours": "Open 24/7",
      "pet_friendly": true,
      "address": "123 Main St, San Diego, CA",
      "verified_on": "2025-11-14T08:00:00Z"
    }
  ],
  "count": 1
}
```

---

## 🎨 Customization Guide

### Changing Color Scheme

Update colors in both `page.tsx` and `map-styles.css`:

```typescript
// page.tsx - getResourceTypeColor function
const colors = {
  shelter: '#YOUR_COLOR',
  food: '#YOUR_COLOR',
  // ...
}
```

```css
/* map-styles.css - .marker-dot classes */
.marker-dot.shelter {
  background: linear-gradient(135deg, #START #END);
}
```

### Adjusting Animation Speed

Modify timing values in `map-styles.css`:

```css
/* Slower pulse (current: 2s) */
.marker-dot {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Faster popup animation (current: 0.3s) */
.leaflet-popup-content-wrapper {
  animation: popupSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Changing Map Style

Replace the tile layer URL in `MapView.tsx`:

```typescript
// Current: Carto Positron (light, minimalistic)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
})

// Alternative: Dark theme
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
})

// Alternative: OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
})
```

---

## 🚀 Performance Optimizations

### 1. Dynamic Imports
MapView is dynamically imported to avoid SSR issues and reduce initial bundle size:

```typescript
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})
```

### 2. Marker Management
Markers are efficiently managed using refs to avoid unnecessary re-renders:

```typescript
const markersRef = useRef<{ [key: string]: L.Marker }>({})
```

### 3. Canvas Rendering
Leaflet is configured to use canvas rendering for better performance with many markers:

```typescript
const map = L.map(mapContainerRef.current, {
  renderer: L.canvas({ padding: 0.5 })
})
```

### 4. Smooth Animations
Using CSS transforms for hardware acceleration:

```css
.custom-marker {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-marker:hover {
  transform: translateY(-4px) scale(1.1); /* GPU-accelerated */
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Map loads successfully
- [ ] User location is detected and displayed
- [ ] Markers appear for all resources
- [ ] Clicking a marker selects it and shows details
- [ ] Resource card displays correct information
- [ ] Call button opens phone dialer
- [ ] Directions button opens Google Maps
- [ ] Recenter button returns to user location
- [ ] Animations are smooth at 60fps
- [ ] Mobile touch interactions work correctly
- [ ] Map is responsive on different screen sizes

### Browser Testing
Tested and verified on:
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### Map Doesn't Load
**Issue**: Blank screen or error message

**Solutions**:
1. Check browser console for errors
2. Verify Leaflet CSS is imported
3. Ensure dynamic import is working
4. Check if container has height set

### Markers Don't Appear
**Issue**: No markers visible on map

**Solutions**:
1. Verify resources array has data
2. Check latitude/longitude values are valid
3. Inspect marker creation in browser dev tools
4. Ensure z-index is set correctly

### Animations Are Choppy
**Issue**: Laggy or stuttering animations

**Solutions**:
1. Check if browser is hardware-accelerated
2. Reduce number of simultaneous animations
3. Use `will-change` CSS property sparingly
4. Profile with browser performance tools

### Geolocation Not Working
**Issue**: User location not detected

**Solutions**:
1. Ensure HTTPS connection (required for geolocation)
2. Check browser permissions
3. Verify fallback to default location works
4. Test on different browsers/devices

---

## 🔮 Future Enhancements

### Planned Features
1. **Clustering**: Group nearby markers at lower zoom levels
2. **Filtering**: Toggle resource types on/off
3. **Search**: Find specific resources by name
4. **Routing**: Display walking directions on map
5. **Offline Mode**: Cache map tiles and resource data
6. **Accessibility**: Screen reader support, keyboard navigation
7. **Dark Mode**: Alternative color scheme for night use
8. **Multi-language**: i18n support for multiple languages

### Integration Ideas
1. **Real-time Updates**: WebSocket for live resource availability
2. **User Contributions**: Report new resources or updates
3. **Community Reviews**: Ratings and comments
4. **Emergency Services**: Quick access to 911 and crisis lines
5. **Transit Integration**: Show nearby bus stops and routes

---

## 📚 Additional Resources

### Leaflet Documentation
- Official docs: https://leafletjs.com/reference.html
- React Leaflet: https://react-leaflet.js.org/
- Plugins: https://leafletjs.com/plugins.html

### Design Inspiration
- Map color schemes: https://snazzymaps.com/
- Animation timing: https://cubic-bezier.com/
- Glass-morphism: https://glassmorphism.com/

### Accessibility
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA for maps: https://www.w3.org/WAI/ARIA/apg/

---

## 📝 Changelog

### Version 2.0.0 (2025-11-14)
- Complete redesign with Leaflet
- Added smooth animations and transitions
- Implemented real-time geolocation
- Created interactive resource markers
- Added elegant popups and resource cards
- Integrated with backend API (mock data for now)
- Comprehensive documentation

### Version 1.0.0 (Initial)
- Basic placeholder implementation
- Static gradient background
- Hardcoded location markers
- No real mapping functionality

---

## 👥 Contributing

When contributing to the map component:

1. Follow the existing code style
2. Test on multiple devices and browsers
3. Update documentation for any new features
4. Ensure animations remain smooth (60fps)
5. Maintain accessibility standards
6. Keep bundle size minimal

---

## 📄 License

Part of the Home Base project for Big Data Hackathon 2025
Team 135: "Git Rich or Trying to Merge"

---

**For questions or issues, contact the development team.**
