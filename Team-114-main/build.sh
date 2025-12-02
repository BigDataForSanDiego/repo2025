#!/bin/bash

# Build script for Resourcify deployment

echo "==================================="
echo "Building Resourcify for Production"
echo "==================================="

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the React app
echo "Building React application..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "Build successful! Output in 'dist' directory"
    echo "Build files:"
    ls -la dist/
else
    echo "Build failed!"
    exit 1
fi

echo "==================================="
echo "Build complete! Ready for deployment"
echo "==================================="