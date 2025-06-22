from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from scrape import scrape_booking
import uvicorn

app = FastAPI(title="Booking.com Scraper API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    url: str
    checkin: str

class ScrapeResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Booking.com Scraper API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_hotel(request: ScrapeRequest):
    """
    Scrape hotel data from Booking.com
    
    Args:
        request: ScrapeRequest containing URL and check-in date
    
    Returns:
        ScrapeResponse with hotel data or error
    """
    try:
        # Validate URL
        if not request.url.startswith("https://www.booking.com"):
            raise HTTPException(status_code=400, detail="URL must be from booking.com")
        
        # Validate date format (basic check)
        if len(request.checkin) != 10 or request.checkin[4] != '-' or request.checkin[7] != '-':
            raise HTTPException(status_code=400, detail="Check-in date must be in YYYY-MM-DD format")
        
        # Scrape the hotel data
        hotel_data = scrape_booking(request.url, request.checkin)
        
        # Check if scraping was successful
        if "error" in hotel_data:
            return ScrapeResponse(
                success=False,
                error=hotel_data["error"]
            )
        
        return ScrapeResponse(
            success=True,
            data=hotel_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return ScrapeResponse(
            success=False,
            error=f"Internal server error: {str(e)}"
        )

@app.get("/scrape")
async def scrape_hotel_get(url: str, checkin: str):
    """
    GET endpoint for scraping (alternative to POST)
    
    Args:
        url: Booking.com hotel page URL
        checkin: Check-in date in YYYY-MM-DD format
    
    Returns:
        Hotel data or error
    """
    try:
        # Validate URL
        if not url.startswith("https://www.booking.com"):
            raise HTTPException(status_code=400, detail="URL must be from booking.com")
        
        # Validate date format
        if len(checkin) != 10 or checkin[4] != '-' or checkin[7] != '-':
            raise HTTPException(status_code=400, detail="Check-in date must be in YYYY-MM-DD format")
        
        # Scrape the hotel data
        hotel_data = scrape_booking(url, checkin)
        
        if "error" in hotel_data:
            raise HTTPException(status_code=500, detail=hotel_data["error"])
        
        return hotel_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 