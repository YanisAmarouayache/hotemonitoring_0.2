@echo off
echo 🚀 Starting Hotel Price Monitor MVP...

echo 🐍 Starting Python scraper...
start "Python Scraper" cmd /k "cd scraper && python -m uvicorn api:app --reload --port 8000"

echo ⚡ Starting TypeScript backend...
start "TypeScript Backend" cmd /k "cd backend && npm run dev"

echo ⚛️ Starting React frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo ✅ All services started!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:3001
echo 🐍 Python scraper: http://localhost:8000
echo.
echo All services are running in separate windows.
echo Close the windows to stop the services.
pause 