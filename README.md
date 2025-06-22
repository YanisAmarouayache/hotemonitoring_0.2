# Booking.com Price Scraper & Comparator MVP

A test MVP webapp that scrapes Booking.com hotel data, stores it in a database, and provides a React frontend for price comparison.

## 🏗️ Architecture

The application consists of three main components:

1. **Python Scraper** (FastAPI + BeautifulSoup) - Scrapes hotel data from Booking.com
2. **TypeScript Backend** (Express + Prisma + SQLite) - Stores and serves data
3. **React Frontend** (Vite + TypeScript) - User interface for price comparison

## 📁 Project Structure

```
hotelmonitoring_0.2/
├── scraper/                 # Python FastAPI scraper
│   ├── scrape.py           # BeautifulSoup scraper logic
│   ├── api.py              # FastAPI endpoints
│   └── requirements.txt    # Python dependencies
├── backend/                # TypeScript Express backend
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   ├── types.ts        # TypeScript definitions
│   │   └── services/
│   │       └── scraperService.ts
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json        # Node.js dependencies
│   └── tsconfig.json       # TypeScript config
├── frontend/               # React Vite frontend
│   ├── src/
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   ├── types.ts        # TypeScript definitions
│   │   ├── services/
│   │   │   └── api.ts      # API service
│   │   └── components/
│   │       ├── ScrapeForm.tsx
│   │       └── HotelDisplay.tsx
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
├── setup.sh               # Setup script
├── start.sh               # Start all services
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **pip**

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd hotelmonitoring_0.2

# Make scripts executable
chmod +x setup.sh start.sh

# Run setup script
./setup.sh
```

### 2. Manual Setup (Alternative)

#### Python Scraper Setup
```bash
cd scraper
pip install -r requirements.txt
```

#### TypeScript Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

#### React Frontend Setup
```bash
cd frontend
npm install
```

### 3. Start All Services

```bash
# Option 1: Use the start script
./start.sh

# Option 2: Start manually in separate terminals
```

#### Manual Start (3 terminals required):

**Terminal 1 - Python Scraper:**
```bash
cd scraper
uvicorn api:app --reload --port 8000
```

**Terminal 2 - TypeScript Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - React Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Python Scraper**: http://localhost:8000

## 📊 API Endpoints

### FastAPI Scraper (Port 8000)
- `GET /` - Health check
- `POST /scrape` - Scrape hotel data
- `GET /scrape?url=...&checkin=...` - Scrape hotel data (GET)

### Express Backend (Port 3001)
- `GET /health` - Health check
- `POST /api/scrape` - Proxy to scraper and store data
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get specific hotel
- `GET /api/rooms/:roomId/prices` - Get price history

## 🗄️ Database Schema

The application uses SQLite with Prisma ORM:

```prisma
model Hotel {
  id             String   @id @default(cuid())
  name           String
  currency       String
  amenities      String   // JSON string
  ratingOverall  Float    @default(0)
  ratingLocation Float    @default(0)
  rooms          Room[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Room {
  id        String       @id @default(cuid())
  hotelId   String
  name      String
  occupancy Int
  prices    DailyPrice[]
  hotel     Hotel        @relation(fields: [hotelId], references: [id])
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model DailyPrice {
  id                String   @id @default(cuid())
  roomId            String
  checkInDate       DateTime
  price             Float
  available         Boolean  @default(false)
  refundable        Boolean  @default(false)
  breakfastIncluded Boolean  @default(false)
  scrapedAt         DateTime @default(now())
  room              Room     @relation(fields: [roomId], references: [id])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## 🎯 Usage

1. **Open the frontend** at http://localhost:3000
2. **Enter a Booking.com hotel URL** (e.g., https://www.booking.com/hotel/us/hilton-garden-inn-new-york-manhattan-midtown-east.html)
3. **Select a check-in date**
4. **Click "Scrape Hotel Data"**
5. **View the scraped hotel information** including:
   - Hotel name and rating
   - Available amenities
   - Room types with prices
   - Availability status
   - Refundable options
   - Breakfast inclusion

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001
SCRAPER_API_URL=http://localhost:8000
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

### Scraper Configuration

The scraper uses multiple CSS selectors to extract data from Booking.com pages. You can modify the selectors in `scraper/scrape.py` if the website structure changes.

## 🛡️ Anti-Bot Measures

The scraper includes basic anti-bot measures:
- Realistic User-Agent headers
- Reasonable request delays
- Proper Accept-Language headers
- Error handling for blocked requests

**Note**: This is an MVP for educational purposes. In production, you should implement more sophisticated anti-bot measures and respect Booking.com's terms of service.

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in the respective configuration files
2. **Database errors**: Run `npx prisma migrate reset` in the backend directory
3. **Scraping fails**: Check if Booking.com has changed their HTML structure
4. **CORS errors**: Ensure all services are running on the correct ports

### Logs

- **Python scraper**: Check terminal output for scraping errors
- **Backend**: Check terminal output for API errors
- **Frontend**: Check browser console for JavaScript errors

## 📝 Development

### Adding New Features

1. **Backend**: Add new endpoints in `backend/src/index.ts`
2. **Frontend**: Add new components in `frontend/src/components/`
3. **Database**: Modify schema in `backend/prisma/schema.prisma`

### Testing

```bash
# Test Python scraper
cd scraper
python scrape.py

# Test backend API
curl http://localhost:3001/health

# Test frontend
# Open http://localhost:3000 in browser
```

## 📄 License

This project is for educational purposes only. Please respect Booking.com's terms of service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the repository. 