# 🚀 Quick Start Guide

## Setup (One-time)

```bash
# Navigate to project
cd /Users/chinmaybharambe/Desktop/hackathon/rippleimpact

# Install dependencies (if not already done)
npm install
```

## Running the App

```bash
# Start development server
npm run dev
```

The app will be available at **http://localhost:5173** (or the port shown in terminal)

## 🎯 Demo Navigation Routes

### Public Pages

- **Home/Landing**: http://localhost:5173/
- **Donate**: http://localhost:5173/donate
- **Confirmation**: http://localhost:5173/donate/confirmation

### Donor Portal (Demo)

- **Dashboard**: http://localhost:5173/donor/dashboard
- **People Helped**: http://localhost:5173/donor/people
- **Impact Network**: http://localhost:5173/donor/impact
- **Settings**: http://localhost:5173/donor/settings

### Recipient Portal (Demo)

- **Dashboard**: http://localhost:5173/recipient/dashboard
- **Community Hub**: http://localhost:5173/recipient/community
- **Settings**: http://localhost:5173/recipient/settings

## 📱 Testing Mobile View

### In Chrome/Edge DevTools:

1. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Click the device toggle button (or press `Cmd+Shift+M` / `Ctrl+Shift+M`)
3. Select a mobile device (iPhone 12, Pixel 5, etc.)
4. See the mobile bottom navigation appear!

### Responsive Breakpoints:

- **Mobile**: < 768px (bottom navigation)
- **Tablet**: 768px - 1024px (top navigation)
- **Desktop**: > 1024px (full navigation with labels)

## 🎨 Key Features to Demo

### 1. Donation Flow (5 minutes)

```
/ → /donate → (fill form) → /donate/confirmation → /donor/dashboard
```

- Show confetti animation
- Point out "What Happens Next" section
- Navigate to dashboard to see "people helped"

### 2. Impact Tracking (3 minutes)

```
/donor/dashboard → /donor/people → /donor/impact
```

- View recent updates with ripple effect banners
- Check progress of each person
- See visual impact tree

### 3. Community Features (3 minutes)

```
/recipient/dashboard → /recipient/community
```

- View personal milestones
- Browse community feed
- Show celebration interactions
- Point out community goals

### 4. Mobile Responsiveness (2 minutes)

- Start on desktop view
- Toggle to mobile (F12 → device toolbar)
- Show bottom navigation
- Demonstrate touch-friendly design

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill the process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Styles Not Loading

```bash
# Restart dev server
# Press Ctrl+C to stop, then:
npm run dev
```

## 🎬 Presentation Tips

1. **Start Full Screen**: Press `F11` for immersive demo
2. **Prepare Browser Tabs**: Open key routes in separate tabs
3. **Use Zoom**: `Cmd/Ctrl + Plus` to increase text size for presentations
4. **Clear Cache**: Hard refresh with `Cmd+Shift+R` / `Ctrl+F5` if styles look off
5. **Mobile Demo**: Have DevTools mobile view ready in another tab

## 📸 Screenshot Routes

Best pages for screenshots/presentations:

- `/` - Beautiful landing page
- `/donate` - Clean donation interface
- `/donate/confirmation` - Celebration moment
- `/donor/dashboard` - Rich data visualization
- `/donor/impact` - Unique impact tree
- `/recipient/community` - Vibrant community hub

## 🔥 Quick Demo Script (5 min)

**Minute 1**: Landing page - explain the problem and solution
**Minute 2**: Donation flow - show how easy it is to give
**Minute 3**: Donor dashboard - demonstrate transparency
**Minute 4**: Impact network - highlight ripple effect
**Minute 5**: Recipient community - show dignity and empowerment

## 📊 Mock Data Notes

All data is simulated. The app currently:

- ✅ Shows realistic UI/UX
- ✅ Demonstrates user flows
- ✅ Interactive components
- ❌ No real backend
- ❌ No data persistence
- ❌ No authentication

Perfect for proof-of-concept and design review!

## 🆘 Need Help?

Check these files:

- `README.md` - Full project documentation
- `FEATURES.md` - Detailed feature guide
- `src/data/mockData.js` - All mock data structure

---

**Happy Demoing! 🎉**
