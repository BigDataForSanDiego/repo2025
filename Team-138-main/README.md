# CareLink SD
https://team-138.vercel.app/ 

A low-friction telehealth application for unhoused neighbors in San Diego County. Built for the Hackathon: Innovating to Tackle Homelessness.

## Features

- **Quick Intake**: Simple consent and basic information collection
- **Smart Triage**: 30-second assessment to route clients appropriately
- **Waiting Queue**: Real-time queue management for clients waiting for care
- **Video Sessions**: Mock WebRTC interface for telehealth sessions
- **Staff Console**: Dashboard for staff to view and claim waiting clients

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **React 18**

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Google Maps API (Optional but recommended):**
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Enable "Maps JavaScript API" in your project
   - Create a `.env.local` file in the root directory:
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```
   - Note: Maps will still work with a placeholder key, but you'll see a watermark

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── intake/           # Client intake page
│   ├── triage/           # Triage pages (main, red, green)
│   ├── waiting/          # Waiting room page
│   ├── session/          # Video session page
│   ├── staff/            # Staff console
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/                  # Utility functions and store
└── public/               # Static assets
```

## Usage Flow

1. **Client Journey:**
   - Visit `/intake` → Consent → Enter name/phone
   - Complete triage questions at `/triage`
   - If yellow: Wait in queue → Join session
   - If red: See crisis resources
   - If green: See scheduled appointment and resources

2. **Staff Journey:**
   - Visit `/staff` to see waiting queue
   - Click "Claim" to join a client's session
   - Video session opens at `/session`

## Notes

- This is an MVP/demo with in-memory storage (data resets on server restart)
- The video component is a mock; replace with Twilio/Vonage/Daily.co for production
- Add proper authentication and database for production use

## License

Built for hackathon purposes.

