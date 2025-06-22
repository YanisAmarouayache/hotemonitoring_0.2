#!/bin/bash

echo "🚀 Starting Hotel Price Monitor MVP..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $SCRAPER_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🐍 Starting Python scraper..."
cd scraper
python -m uvicorn api:app --reload --port 8000 &
SCRAPER_PID=$!
cd ..

echo "⚡ Starting TypeScript backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "⚛️  Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:3001"
echo "🐍 Python scraper: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background processes
wait 