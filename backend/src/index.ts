import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ScraperService } from './services/scraperService';
import { ScrapeRequest, ApiResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes

/**
 * POST /api/scrape
 * Proxy scrape request to FastAPI scraper and store results
 */
app.post('/api/scrape', async (req, res) => {
  try {
    const { url, checkin }: ScrapeRequest = req.body;

    // Validate request
    if (!url || !checkin) {
      return res.status(400).json({
        success: false,
        error: 'URL and checkin date are required',
      } as ApiResponse<null>);
    }

    if (!url.startsWith('https://www.booking.com')) {
      return res.status(400).json({
        success: false,
        error: 'URL must be from booking.com',
      } as ApiResponse<null>);
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin)) {
      return res.status(400).json({
        success: false,
        error: 'Check-in date must be in YYYY-MM-DD format',
      } as ApiResponse<null>);
    }

    console.log(`Scraping request received: ${url} for ${checkin}`);

    // Call scraper service
    const result = await ScraperService.scrapeAndStore({ url, checkin });

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
      } as ApiResponse<any>);
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      } as ApiResponse<null>);
    }
  } catch (error) {
    console.error('Error in /api/scrape:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/hotels
 * Get all hotels with their rooms and latest prices
 */
app.get('/api/hotels', async (req, res) => {
  try {
    const hotels = await ScraperService.getAllHotels();
    
    res.json({
      success: true,
      data: hotels,
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch hotels',
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/hotels/:id
 * Get specific hotel by ID with rooms and prices
 */
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await ScraperService.getHotelById(id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found',
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: hotel,
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch hotel',
    } as ApiResponse<null>);
  }
});

/**
 * GET /api/rooms/:roomId/prices
 * Get price history for a specific room
 */
app.get('/api/rooms/:roomId/prices', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { days = '30' } = req.query;
    
    const priceHistory = await ScraperService.getRoomPriceHistory(
      roomId, 
      parseInt(days as string)
    );
    
    res.json({
      success: true,
      data: priceHistory,
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch price history',
    } as ApiResponse<null>);
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  } as ApiResponse<null>);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  } as ApiResponse<null>);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
});

export default app; 