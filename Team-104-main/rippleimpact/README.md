# RippleImpact - Donation Platform Proof of Concept

A modern, mobile-first donation platform connecting donors with homeless individuals in San Diego.

## 🎯 Features

### Donor Experience

- **Dashboard**: View total donations, people helped, and ripple effects
- **Impact Feed**: Real-time updates from recipients you've supported
- **People I've Helped**: Track progress of all recipients your donations have helped
- **Impact Network**: Visualize the ripple effect of your generosity
- **Donation Flow**: Seamless donation experience with multiple payment options

### Recipient Experience

- **Dashboard**: Personal stats, milestones, and goal tracking
- **Community Hub**: Social feed with milestone celebrations, resource sharing, and peer support
- **Milestone Celebrations**: Track and celebrate achievements with the community
- **Goal Tracking**: Set and monitor personal goals with progress bars

## 🚀 Getting Started

### Prerequisites

- Node.js (v22.x recommended)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

## 📱 Navigation

### Public Pages

- **Home** (`/`) - Landing page with platform overview
- **Donate** (`/donate`) - Make a donation
- **Confirmation** (`/donate/confirmation`) - Post-donation confirmation

### Donor Portal

- **Dashboard** (`/donor/dashboard`) - Overview of your impact
- **People Helped** (`/donor/people`) - Track recipients you've supported
- **Impact Network** (`/donor/impact`) - Visualize your ripple effect
- **Settings** (`/donor/settings`) - Account preferences

### Recipient Portal

- **Dashboard** (`/recipient/dashboard`) - Personal progress overview
- **Community Hub** (`/recipient/community`) - Social feed and community features
- **Settings** (`/recipient/settings`) - Account preferences

## 🎨 Design System

### Colors

- **Primary Blue** (#2563EB) - Trust, stability
- **Secondary Orange** (#F97316) - Ripple effects, energy
- **Success Green** (#10B981) - Milestones, achievements
- **Accent Purple** (#8B5CF6) - Community features
- **Celebration Gold** (#FCD34D) - Special achievements

### Key Components

- Responsive cards with hover effects
- Progress bars and stat visualizations
- Milestone badges and celebrations
- Mobile-first navigation (bottom nav on mobile, top nav on desktop)

## 🛠 Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## 📝 Mock Data

The application uses mock data located in `src/data/mockData.js` to demonstrate functionality. This includes:

- Donor statistics and impact updates
- Recipient profiles and milestones
- Community feed posts
- Impact tree visualization data

## 🎯 Core Concepts

### No-Choice Donation Model

Donors contribute to a general pool without selecting specific recipients. The organization allocates funds based on urgency and need, then connects donors to see who they helped.

### Ripple Effect

When recipients achieve stability, they can "pay it forward" by helping others, creating generations of impact that donors can track.

### Community-Driven

Recipients have a robust social platform to support each other, share resources, and celebrate milestones together.

## 🚧 Proof of Concept Status

This is a front-end prototype demonstrating the user experience. It includes:

- ✅ Full UI/UX for donor and recipient experiences
- ✅ Interactive components and navigation
- ✅ Mock data and realistic workflows
- ⚠️ No backend integration (uses mock data)
- ⚠️ No real payment processing
- ⚠️ No authentication system

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## 🤝 Contributing

This is a proof of concept for demonstration purposes. For production implementation, you would need:

- Backend API with database
- Payment processing integration (Stripe, PayPal, etc.)
- Authentication and authorization
- Content moderation system
- Real-time updates (WebSockets or similar)
- Image upload and storage
- Email notification system

## 📄 License

This is a prototype for demonstration purposes.

---

**RippleImpact** - Your impact multiplies 💙
