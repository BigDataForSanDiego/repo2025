# Home Base - Distress Relief for the Homeless

### 2025 BIG DATA HACKATHON PROPOSAL

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet)](https://leafletjs.com/)

---

## 📋 Team Information

- **Team Number:** 135
- **Team Name:** Git Rich or Trying to Merge
- **Team Coordinator:** [@anarahdma](https://github.com/anarahdma)
- **Team Members:**
  - Pavan Kumar Naguvanahalli Yashavantha ([@PavanCodesNY](https://github.com/PavanCodesNY))
  - Mehul Verma ([@mehul422](https://github.com/mehul422))
  - Aditi ([@AditiBansal711](https://github.com/AditiBansal711))
  - Tanishq ([@tanRathore](https://github.com/tanRathore))

---

## 🎯 Project Vision

**A voice-driven geospatial assistant system designed to identify and support people experiencing homelessness during moments of distress.**

Home Base combines cutting-edge geospatial technology with empathetic design to provide immediate access to critical resources—shelters, food banks, medical clinics, and hygiene facilities—through an intuitive, voice-enabled interface and beautiful interactive map.

#### A visual
![VoiceMap + Safe-Path GIS Integration](https://github.com/BigDataForSanDiego/Team-135/blob/69afa0e02e060119c1385850f7a88810e63f9566/images/voicemap_safe_path_gis.png "VoiceMap + Safe-Path GIS Integration")

*A conceptual architecture showing how the VoiceMap + Safe-Path Layer augments the 211–SDHEART–SANDAG GIS ecosystem.*


<img height="10%" width="50%" alt="HDMA" src="https://github.com/BigDataForSanDiego/bigdataforsandiego.github.io/blob/main/templates/img/hdma2.png?raw=true"> 


#### Hackathon Five CORE Themes. `CHECK ONE or TWO QUESTIONS (insert X in [ ])`.
- [X] Access to Shelter and Resources
> - Solutions to improve on-demand access and availability of shelters, food banks, medical aid, and social services for homeless individuals.
> - Question: How can we develop technological solutions that provide real-time, on-demand information updates on available shelters, food banks, hygiene stations, medical clinics, and social services for people experiencing homelessness?
- [X] Health and Mental Wellness Support
> - Tools to provide remote mental health support, connect to mobile healthcare providers, or manage chronic conditions common in homeless populations using mobile devices.
> - Question: How can we create tools or mobile applications that deliver remote mental health care, help manage chronic health conditions, or connect unhoused individuals with trusted health professionals?
- [ ] Housing and Employment Pathways
> - Web platforms that connect homeless individuals to affordable housing opportunities, job training programs, or employment resources.
> - Question: What digital web platforms or systems can help individuals experiencing homelessness navigate the path toward stable housing and employment, including skills training, job placement, and housing referrals?

---

## 🎤 Voice-Driven Resource Discovery

**NEW: Voice AI to Real-Time Resource Maps**

HomeBase now features a complete voice-to-resources flow that connects users to real-time data from 211 San Diego and our Supabase backend:

### How It Works

1. **Speak Your Need** - Tap the voice button and say what you need:
   - "I need food"
   - "Where can I find shelter?"
   - "I need medical help"
   - "Where can I shower?"

2. **Instant Results** - The app automatically:
   - Detects your intent (food, shelter, medical, hygiene)
   - Fetches real-time data from 211 SDHEART API
   - Falls back to Supabase if needed
   - Shows you a map with nearby resources

3. **Interactive Map** - See resources on a beautiful map:
   - Your location (blue dot)
   - Nearby resources (colored markers)
   - Distance and directions
   - Resource details and contact info

4. **Take Action** - Connect with resources:
   - View hours and availability
   - See if they're pet-friendly
   - Call directly with "Talk to someone"
   - Get walking directions

### Data Sources

- **211 SDHEART API**: Real-time resource data with capacity and wait times
- **Supabase Backend**: Curated database with verified resources
- **Smart Merging**: Combines both sources for comprehensive results

### Quick Start

```bash
# Start 211 API server
cd ml/server && npm start

# Start Supabase
cd backend && npx supabase start

# Start HomeBase app
cd HomeBase && npm start
```

See [TEST_VOICE_RESOURCES.md](TEST_VOICE_RESOURCES.md) for detailed testing instructions.

See [VOICE_TO_RESOURCES_FLOW.md](HomeBase/VOICE_TO_RESOURCES_FLOW.md) for technical details. 
- [X] Safety and Community Engagement
> - Solutions to increase personal safety, prevent violence, and foster community support and empathy networks for homeless people.
> - Question: How might we design technological solutions that improve safety for unhoused individuals, reduce violence, and build empathy and community support through storytelling, social engagement, or civic partnerships?
- [X] Data-Driven Policy and User-Centered Resource Planning
> - Use of geospatial and demographic data to better understand homeless population trends, optimize resource allocation, and support policy advocacy.
> - Question: How can we use geospatial data, census data, and AI to map trends in homelessness, identify service gaps, and support equitable decision making and public advocacy
- [ ] Other Possible Topics
> - Improving digital equity and resource accessibility
> - Helping youth homelessness and at-risk populations
> - Providing mobile health clinics and telehealth expansion kits
> - Increasing climate resilience for unhoused communities
> - Others

---

## ✨ Key Features

### 🗺️ Ultra-Beautiful Interactive Map
The centerpiece of Home Base is our completely redesigned map interface:

- **Minimalistic Design**: Clean, uncluttered interface with smooth gradients and modern styling
- **Smooth Animations**: 60fps hardware-accelerated animations for all interactions
- **Real-time Geolocation**: Automatically centers on user's location with smooth transitions
- **Color-Coded Markers**: Beautiful gradient markers for different resource types
  - Purple: Shelters
  - Pink: Food banks
  - Blue: Medical clinics
  - Green: Hygiene facilities
- **Interactive Popups**: Glass-morphism design with instant resource information
- **Elegant Resource Cards**: Detailed overlay with call and navigation buttons
- **Smart Clustering**: Efficiently displays hundreds of resources without overwhelming users

### 🎤 Voice-Driven Interface
- Emergency voice assistance on the home page
- Hands-free operation for accessibility
- Natural language understanding

### 📍 Geospatial Intelligence
- PostGIS-powered spatial queries
- Haversine distance calculations
- Real-time resource availability
- Pet-friendly filtering
- Operating hours verification

### 🔍 Resource Categories
- Shelters (with pet-friendly options)
- Food banks and meal services
- Medical clinics and health services
- Hygiene facilities (showers, restrooms)
- Emergency services

### 📱 Mobile-First Design
- Optimized for kiosk deployment
- Touch-friendly interactions
- Responsive across all screen sizes
- Offline-capable (coming soon)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL with PostGIS (for backend)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Backend Setup

See [Backend Documentation](backend/README.md) for complete setup instructions.

```bash
# Navigate to backend directory
cd backend

# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
supabase start

# Run migrations
supabase db reset
```

---

## 📁 Project Structure

```
Team-135/
├── frontend/                 # Next.js React application
│   ├── app/
│   │   ├── map/             # ✨ NEW: Beautiful map interface
│   │   │   ├── page.tsx     # Main map page component
│   │   │   ├── MapView.tsx  # Leaflet map implementation
│   │   │   └── map-styles.css # Custom animations & styling
│   │   ├── emergency/       # Voice emergency interface
│   │   ├── resources/       # Resource category pages
│   │   └── ...
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── docs/                # Frontend documentation
│       └── MAP_DOCUMENTATION.md # Comprehensive map guide
│
├── backend/                 # Supabase backend
│   ├── supabase/
│   │   ├── functions/       # Edge functions
│   │   │   └── resource-finder/ # Geospatial API
│   │   └── migrations/      # Database schema
│   └── docs/                # Backend documentation
│
└── README.md               # This file
```

---

## 🎨 Map Redesign Highlights

The map has been completely rebuilt from the ground up:

### Before
- Static placeholder with gradient background
- Hardcoded fake markers
- No real geolocation
- No interactivity

### After
- Real Leaflet-powered interactive map
- Beautiful Carto Positron tiles for minimalistic aesthetics
- Live user geolocation with smooth flyTo animations
- Color-coded resource markers with pulse animations
- Elegant glass-morphism popups
- Detailed resource cards with action buttons
- Smooth transitions and 60fps animations
- Mobile-optimized touch interactions
- Backend API integration ready

**[View Complete Map Documentation →](frontend/docs/MAP_DOCUMENTATION.md)**

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **Maps**: Leaflet + React Leaflet
- **Icons**: Lucide React
- **Animations**: CSS3 + Tailwind Animate

### Backend
- **Platform**: Supabase
- **Database**: PostgreSQL 15 + PostGIS
- **Runtime**: Deno (Edge Functions)
- **API**: RESTful endpoints
- **Authentication**: Supabase Auth (ready)

### Infrastructure
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **CI/CD**: GitHub Actions
- **Analytics**: Vercel Analytics

---

## 📖 Documentation

- [Frontend Setup Guide](frontend/README.md)
- [Map Component Documentation](frontend/docs/MAP_DOCUMENTATION.md) ⭐ NEW
- [Backend Architecture](backend/README.md)
- [Development Setup](backend/docs/setup.md)
- [Deployment Guide](backend/docs/deployment.md)
- [Security & Authentication](backend/docs/authentication-security.md)

---

## 🎯 API Reference

### Resource Finder Endpoint

`GET /functions/v1/resource-finder`

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in meters (default: 5000, max: 50000)
- `type` (optional): Resource type (shelter, food, medical, hygiene, other)
- `pet_friendly` (optional): Filter pet-friendly resources (true/false)
- `is_open` (optional): Filter currently open resources (true/false)

**Example Request:**
```bash
curl "https://your-backend.supabase.co/functions/v1/resource-finder?lat=32.7157&lng=-117.1611&radius=5000&type=shelter"
```

**Example Response:**
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

## 🧪 Development

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Code Quality
```bash
# Lint frontend code
cd frontend
npm run lint

# Format code
npm run format
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Preview production build
npm start
```

---

## 🌟 Roadmap

### Phase 1: Core Features (Current)
- [x] Interactive map with real geolocation
- [x] Resource markers with smooth animations
- [x] PostGIS backend integration
- [x] Voice emergency interface
- [x] Comprehensive documentation

### Phase 2: Enhanced Features
- [ ] Marker clustering for performance
- [ ] Resource filtering UI
- [ ] Search functionality
- [ ] Walking directions on map
- [ ] Offline mode with cached data
- [ ] Multi-language support

### Phase 3: Advanced Features
- [ ] Real-time resource availability updates
- [ ] User-contributed resources
- [ ] Community reviews and ratings
- [ ] Transit integration
- [ ] Emergency service hotlines
- [ ] Data analytics dashboard

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain accessibility standards (WCAG 2.1 AA)
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📊 Impact & Metrics

### Target Audience
- People experiencing homelessness in San Diego
- Social workers and case managers
- Emergency responders
- Community organizations

### Success Metrics
- Number of resources accessed through the platform
- Average time to find nearest resource
- User satisfaction scores
- Resource verification rate
- Community engagement level

---

## 🙏 Acknowledgments

- San Diego Regional Data Library (SANDAG)
- 211 San Diego
- San Diego Homeless Management Information System (SDHEART)
- OpenStreetMap Contributors
- CARTO for beautiful map tiles
- All the organizations providing services to people experiencing homelessness

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

For questions, feedback, or collaboration:
- Create an issue in this repository
- Contact the team coordinator: [@anarahdma](https://github.com/anarahdma)

---

## 🏆 Big Data Hackathon 2025

**Team 135: "Git Rich or Trying to Merge"**

*Building technology that makes a difference in people's lives.*

