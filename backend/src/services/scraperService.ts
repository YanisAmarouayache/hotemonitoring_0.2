import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { HotelData, ScrapeRequest, ScrapeResponse } from '../types';

const prisma = new PrismaClient();

// FastAPI scraper service URL
const SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://localhost:8000';

export class ScraperService {
  /**
   * Proxy scrape request to FastAPI scraper and store results in database
   */
  static async scrapeAndStore(request: ScrapeRequest): Promise<ScrapeResponse> {
    try {
      // Call FastAPI scraper
      const response = await axios.post(`${SCRAPER_API_URL}/scrape`, request, {
        timeout: 60000, // 60 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const scrapeResponse = response.data as ScrapeResponse;

      if (!scrapeResponse.success || !scrapeResponse.data) {
        return {
          success: false,
          error: scrapeResponse.error || 'Failed to scrape hotel data',
        };
      }

      // Store data in database
      const hotelData = scrapeResponse.data;
      await this.storeHotelData(hotelData);

      return {
        success: true,
        data: hotelData,
      };
    } catch (error) {
      console.error('Error in scrapeAndStore:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return {
            success: false,
            error: 'Scraper service is not available. Please ensure the FastAPI scraper is running on port 8000.',
          };
        }
        
        if (error.response?.data?.detail) {
          return {
            success: false,
            error: error.response.data.detail,
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Store hotel data in the database
   */
  private static async storeHotelData(hotelData: HotelData): Promise<void> {
    try {
      // Check if hotel already exists
      let hotel = await prisma.hotel.findFirst({
        where: {
          name: hotelData.hotelName,
        },
      });

      if (!hotel) {
        // Create new hotel
        hotel = await prisma.hotel.create({
          data: {
            name: hotelData.hotelName,
            currency: hotelData.currency,
            amenities: JSON.stringify(hotelData.amenities),
            ratingOverall: hotelData.rating.overall,
            ratingLocation: hotelData.rating.location,
          },
        });
      } else {
        // Update existing hotel
        hotel = await prisma.hotel.update({
          where: { id: hotel.id },
          data: {
            currency: hotelData.currency,
            amenities: JSON.stringify(hotelData.amenities),
            ratingOverall: hotelData.rating.overall,
            ratingLocation: hotelData.rating.location,
          },
        });
      }

      // Process rooms and prices
      for (const roomData of hotelData.rooms) {
        // Find or create room
        let room = await prisma.room.findFirst({
          where: {
            hotelId: hotel.id,
            name: roomData.name,
          },
        });

        if (!room) {
          room = await prisma.room.create({
            data: {
              hotelId: hotel.id,
              name: roomData.name,
              occupancy: roomData.occupancy,
            },
          });
        }

        // Create daily price record
        await prisma.dailyPrice.create({
          data: {
            roomId: room.id,
            checkInDate: new Date(hotelData.checkInDate),
            price: roomData.price,
            available: roomData.available,
            refundable: roomData.refundable,
            breakfastIncluded: roomData.breakfastIncluded,
            scrapedAt: new Date(hotelData.scrapeDate),
          },
        });
      }

      console.log(`Successfully stored data for hotel: ${hotelData.hotelName}`);
    } catch (error) {
      console.error('Error storing hotel data:', error);
      throw new Error(`Failed to store hotel data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all hotels with their rooms and prices
   */
  static async getAllHotels() {
    try {
      const hotels = await prisma.hotel.findMany({
        include: {
          rooms: {
            include: {
              prices: {
                orderBy: {
                  scrapedAt: 'desc',
                },
                take: 1, // Get latest price for each room
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return hotels;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      throw new Error(`Failed to fetch hotels: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get hotel by ID with rooms and prices
   */
  static async getHotelById(hotelId: string) {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
        include: {
          rooms: {
            include: {
              prices: {
                orderBy: {
                  scrapedAt: 'desc',
                },
              },
            },
          },
        },
      });

      return hotel;
    } catch (error) {
      console.error('Error fetching hotel:', error);
      throw new Error(`Failed to fetch hotel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get price history for a specific room
   */
  static async getRoomPriceHistory(roomId: string, days: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const prices = await prisma.dailyPrice.findMany({
        where: {
          roomId,
          scrapedAt: {
            gte: cutoffDate,
          },
        },
        orderBy: {
          scrapedAt: 'desc',
        },
      });

      return prices;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw new Error(`Failed to fetch price history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 