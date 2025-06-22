import axios from 'axios';
import { ScrapeRequest, HotelData, Hotel, ApiResponse } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiService {
  /**
   * Scrape hotel data from Booking.com
   */
  static async scrapeHotel(request: ScrapeRequest): Promise<ApiResponse<HotelData>> {
    try {
      const response = await api.post('/scrape', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all hotels from database
   */
  static async getHotels(): Promise<ApiResponse<Hotel[]>> {
    try {
      const response = await api.get('/hotels');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  /**
   * Get specific hotel by ID
   */
  static async getHotel(id: string): Promise<ApiResponse<Hotel>> {
    try {
      const response = await api.get(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  /**
   * Get price history for a room
   */
  static async getRoomPriceHistory(roomId: string, days: number = 30): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get(`/rooms/${roomId}/prices?days=${days}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }
} 