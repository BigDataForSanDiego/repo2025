# Setup Guide

## Prerequisites

You need to install Node.js (which includes npm) to run this Next.js project.

### Installing Node.js

1. **Download Node.js:**
   - Visit [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS (Long Term Support) version (recommended)
   - Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

2. **Install Node.js:**
   - Run the downloaded installer
   - Follow the installation wizard (accept defaults)
   - Make sure "Add to PATH" is checked during installation

3. **Verify Installation:**
   - Open a new PowerShell or Command Prompt window
   - Run: `node --version` (should show v20.x.x or similar)
   - Run: `npm --version` (should show 10.x.x or similar)

## After Installing Node.js

Once Node.js is installed, return to this directory and run:

```bash
# Install project dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Alternative: Using a Package Manager

If you prefer using a package manager:

### Using Chocolatey (Windows):
```powershell
choco install nodejs-lts
```

### Using Winget (Windows 10/11):
```powershell
winget install OpenJS.NodeJS.LTS
```

## Troubleshooting

- **"npm is not recognized"**: Make sure you've restarted your terminal/PowerShell after installing Node.js
- **Permission errors**: You may need to run PowerShell as Administrator
- **Port 3000 already in use**: Change the port by running `npm run dev -- -p 3001`

