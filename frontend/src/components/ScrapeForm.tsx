import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { ScrapeRequest, HotelData } from '../types';
import { Search, Calendar, ExternalLink, Loader2 } from 'lucide-react';

interface ScrapeFormProps {
  onScrapeSuccess: (data: HotelData) => void;
  onScrapeError: (error: string) => void;
}

export const ScrapeForm: React.FC<ScrapeFormProps> = ({ onScrapeSuccess, onScrapeError }) => {
  const [url, setUrl] = useState('');
  const [checkin, setCheckin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !checkin) {
      onScrapeError('Please fill in all fields');
      return;
    }

    if (!url.startsWith('https://www.booking.com')) {
      onScrapeError('URL must be from booking.com');
      return;
    }

    setIsLoading(true);

    try {
      const request: ScrapeRequest = { url, checkin };
      const response = await ApiService.scrapeHotel(request);

      if (response.success && response.data) {
        onScrapeSuccess(response.data);
        // Clear form on success
        setUrl('');
        setCheckin('');
      } else {
        onScrapeError(response.error || 'Failed to scrape hotel data');
      }
    } catch (error) {
      onScrapeError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Search className="mr-2 h-6 w-6 text-blue-600" />
        Scrape Hotel Data
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Booking.com Hotel URL
          </label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.booking.com/hotel/..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="checkin" className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              id="checkin"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            'Scrape Hotel Data'
          )}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Instructions:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Enter a valid Booking.com hotel page URL</li>
          <li>Select your desired check-in date</li>
          <li>Click "Scrape Hotel Data" to fetch current prices</li>
          <li>The data will be stored in our database for future reference</li>
        </ul>
      </div>
    </div>
  );
}; 