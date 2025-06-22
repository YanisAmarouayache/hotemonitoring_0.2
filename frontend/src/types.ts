// Type definitions for the frontend

export interface Room {
  roomId: string;
  name: string;
  occupancy: number;
  price: number;
  refundable: boolean;
  breakfastIncluded: boolean;
  available: boolean;
}

export interface Rating {
  overall: number;
  location: number;
}

export interface HotelData {
  hotelId: string;
  hotelName: string;
  currency: string;
  scrapeDate: string;
  checkInDate: string;
  rooms: Room[];
  rating: Rating;
  amenities: string[];
}

export interface ScrapeRequest {
  url: string;
  checkin: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Database types from backend
export interface Hotel {
  id: string;
  name: string;
  currency: string;
  amenities: string; // JSON string
  ratingOverall: number;
  ratingLocation: number;
  createdAt: string;
  updatedAt: string;
  rooms: RoomDB[];
}

export interface RoomDB {
  id: string;
  hotelId: string;
  name: string;
  occupancy: number;
  createdAt: string;
  updatedAt: string;
  prices: DailyPrice[];
}

export interface DailyPrice {
  id: string;
  roomId: string;
  checkInDate: string;
  price: number;
  available: boolean;
  refundable: boolean;
  breakfastIncluded: boolean;
  scrapedAt: string;
  createdAt: string;
  updatedAt: string;
} 