#!/bin/bash

# Development Startup Script
# This script starts both backend and frontend for local development

set -e

echo "=========================================="
echo "Homebase Development Environment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is running
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Start backend
echo -e "${BLUE}Starting Backend...${NC}"
cd backend

# Check if Supabase is already running
if supabase status > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Supabase is already running${NC}"
else
    echo "Starting Supabase..."
    supabase start
    echo ""
    echo "Applying migrations..."
    supabase db push
fi

echo ""
echo -e "${GREEN}✓ Backend is ready${NC}"
echo ""

# Get Supabase info
SUPABASE_URL=$(supabase status --output env | grep SUPABASE_API_URL | cut -d '=' -f2)
ANON_KEY=$(supabase status --output env | grep ANON_KEY | cut -d '=' -f2)

echo "Backend URLs:"
echo "  API: $SUPABASE_URL"
echo "  Studio: http://localhost:54323"
echo ""

cd ..

# Check frontend dependencies
echo -e "${BLUE}Checking Frontend Dependencies...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""
echo -e "${GREEN}✓ Frontend is ready${NC}"
echo ""

# Display instructions
echo "=========================================="
echo "Development Environment Ready!"
echo "=========================================="
echo ""
echo "Backend:"
echo "  API URL: $SUPABASE_URL"
echo "  Studio: http://localhost:54323"
echo "  Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo "Frontend:"
echo "  Starting on: http://localhost:3000"
echo "  Test Page: http://localhost:3000/test-api"
echo ""
echo "To stop the backend:"
echo "  cd backend && supabase stop"
echo ""
echo "=========================================="
echo ""

# Start frontend
echo -e "${BLUE}Starting Frontend...${NC}"
echo ""
npm run dev
