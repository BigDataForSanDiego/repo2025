# CareVault

> “CareVault — a privacy-aware web platform that unites shelters, clinics, and outreach teams to protect and assist the unhoused in real time.”

## Overview
CareVault is a full-stack humanitarian platform enabling NGOs, shelters, and clinics to coordinate care for unhoused neighbors using QR-enabled profiles, encrypted medical data, MongoDB-backed integrity hashes, and real-time analytics.

### Tech Stack
- **Frontend:** Next.js, React, Mapbox/Leaflet, Socket.IO client
- **Backend:** Node.js, Express, MongoDB, Socket.IO
- **Security Logging:** MongoDB integrity hashes with SHA-256 digests
- **Notifications:** Twilio SMS + SMTP email

## Repository Structure
```
client/            # Next.js frontend
server/            # Express API + WebSocket
data/              # Seed datasets
docs/              # Deployment guides and architecture notes
scripts/           # Optional Python services
```

## Getting Started
1. **Install dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
2. **Run development servers**
   ```bash
   # API + WebSocket
   cd server && npm run dev

   # Frontend
   cd ../client && npm run dev
   ```
3. **Environment variables**
   - Copy `.env` in both `client/` and `server/` directories and populate values for MongoDB, JWT secret, Twilio, and SMTP credentials.

## Key Features
- Role-based dashboards for volunteers, clinics, and analysts
- QR / barcode scanning to surface encrypted profiles and auto-log scan events
- Medical record tabs with AES-256 metadata encryption and edit trails
- Emergency alert workflow with SMS/email notifications and tamper-evident MongoDB audit hashes
- Real-time WebSocket updates and geospatial heatmaps with forecasted demand

