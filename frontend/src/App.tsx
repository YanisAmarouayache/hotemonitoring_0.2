import React, { useState } from 'react';
import { ScrapeForm } from './components/ScrapeForm';
import { HotelDisplay } from './components/HotelDisplay';
import { HotelData } from './types';
import { AlertCircle, CheckCircle } from 'lucide-react';

function App() {
  const [hotelData, setHotelData] = useState<HotelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleScrapeSuccess = (data: HotelData) => {
    setHotelData(data);
    setError(null);
    setSuccess('Hotel data scraped successfully!');
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleScrapeError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);
    
    // Clear error message after 10 seconds
    setTimeout(() => setError(null), 10000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Hotel Price Monitor
          </h1>
          <p className="text-gray-600">
            Scrape and compare hotel prices from Booking.com
          </p>
        </header>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <ScrapeForm
            onScrapeSuccess={handleScrapeSuccess}
            onScrapeError={handleScrapeError}
          />

          {hotelData && (
            <HotelDisplay hotelData={hotelData} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This is an MVP application for educational purposes. 
            Please respect Booking.com's terms of service.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App; 