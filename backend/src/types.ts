// Type definitions for the hotel monitoring system

export interface Room {
  roomId: string;
  name: string;
  occupancy: number;
  price: number; // price per night for 1 room
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

export interface ScrapeResponse {
  success: boolean;
  data?: HotelData;
  error?: string;
}

// Database types (Prisma generated)
export interface Hotel {
  id: string;
  name: string;
  currency: string;
  amenities: string; // JSON string
  ratingOverall: number;
  ratingLocation: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomDB {
  id: string;
  hotelId: string;
  name: string;
  occupancy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyPrice {
  id: string;
  roomId: string;
  checkInDate: Date;
  price: number;
  available: boolean;
  refundable: boolean;
  breakfastIncluded: boolean;
  scrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface HotelWithRooms extends Hotel {
  rooms: (RoomDB & {
    prices: DailyPrice[];
  })[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 