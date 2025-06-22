#!/bin/bash

echo "🚀 Setting up Hotel Price Monitor MVP..."

# Create necessary directories if they don't exist
mkdir -p scraper backend frontend

echo "📦 Installing Python scraper dependencies..."
cd scraper
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "❌ requirements.txt not found in scraper directory"
    exit 1
fi
cd ..

echo "📦 Installing TypeScript backend dependencies..."
cd backend
if [ -f "package.json" ]; then
    npm install
    echo "🔧 Setting up Prisma database..."
    npx prisma generate
    npx prisma migrate dev --name init
else
    echo "❌ package.json not found in backend directory"
    exit 1
fi
cd ..

echo "📦 Installing React frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    npm install
else
    echo "❌ package.json not found in frontend directory"
    exit 1
fi
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application:"
echo ""
echo "1. Start the Python scraper (Terminal 1):"
echo "   cd scraper && python -m uvicorn api:app --reload --port 8000"
echo ""
echo "2. Start the TypeScript backend (Terminal 2):"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the React frontend (Terminal 3):"
echo "   cd frontend && npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔗 Backend API will be available at: http://localhost:3001"
echo "🐍 Python scraper will be available at: http://localhost:8000"
echo ""
echo "💡 Alternative: Use './start.sh' to start all services at once" 