#!/bin/bash

# Start All Services for 211 SDHEART Integration Testing

set -e

echo "=========================================="
echo "Starting HomeBase with 211 SDHEART"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Docker
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}WARNING: Docker not running. Supabase backend won't be available (211 will still work)${NC}"
else
    echo -e "${GREEN}✓ Docker is running${NC}"
fi
echo ""

# Start 211 API Server
echo -e "${BLUE}Starting 211 SDHEART API Server...${NC}"
cd ml/server

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting server on port 3000..."
npm start &
SERVER_PID=$!
echo -e "${GREEN}✓ 211 API Server started (PID: $SERVER_PID)${NC}"
echo ""

cd ../..

# Start Supabase (if Docker is running)
if docker info > /dev/null 2>&1; then
    echo -e "${BLUE}Starting Supabase Backend...${NC}"
    cd backend
    
    if supabase status > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Supabase already running${NC}"
    else
        supabase start > /dev/null 2>&1 &
        echo "Waiting for Supabase to start..."
        sleep 10
        echo -e "${GREEN}✓ Supabase started${NC}"
    fi
    
    cd ..
    echo ""
fi

# Display URLs
echo "=========================================="
echo "Services Ready!"
echo "=========================================="
echo ""
echo "211 SDHEART API:"
echo "  http://localhost:3000/v1/211/json"
echo ""

if docker info > /dev/null 2>&1; then
    echo "Supabase Backend:"
    echo "  API: http://127.0.0.1:54321"
    echo "  Studio: http://localhost:54323"
    echo ""
fi

echo "To start HomeBase:"
echo "  cd HomeBase"
echo "  npm run web"
echo ""
echo "To stop 211 server:"
echo "  kill $SERVER_PID"
echo ""
echo "=========================================="
echo ""

# Keep script running
echo "Press Ctrl+C to stop all services"
wait $SERVER_PID
