import React from 'react';
import { HotelData } from '../types';
import { Star, Users, Coffee, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface HotelDisplayProps {
  hotelData: HotelData;
}

export const HotelDisplay: React.FC<HotelDisplayProps> = ({ hotelData }) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{hotelData.hotelName}</h1>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span>{hotelData.rating.overall.toFixed(1)}</span>
          </div>
          <span>•</span>
          <span>Currency: {hotelData.currency}</span>
          <span>•</span>
          <span>Scraped: {formatDate(hotelData.scrapeDate)}</span>
          <span>•</span>
          <span>Check-in: {formatDate(hotelData.checkInDate)}</span>
        </div>
      </div>

      {/* Amenities */}
      {hotelData.amenities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {hotelData.amenities.map((amenity, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Rooms</h3>
        <div className="space-y-4">
          {hotelData.rooms.map((room) => (
            <div
              key={room.roomId}
              className={`border rounded-lg p-4 ${
                room.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{room.name}</h4>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Up to {room.occupancy} guests</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {room.available ? formatPrice(room.price, hotelData.currency) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  {room.available ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={room.available ? 'text-green-700' : 'text-red-700'}>
                    {room.available ? 'Available' : 'Not Available'}
                  </span>
                </div>

                {room.refundable && (
                  <div className="flex items-center">
                    <RotateCcw className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-blue-700">Refundable</span>
                  </div>
                )}

                {room.breakfastIncluded && (
                  <div className="flex items-center">
                    <Coffee className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-orange-700">Breakfast Included</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hotelData.rooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No room data available for this hotel.</p>
        </div>
      )}
    </div>
  );
}; 