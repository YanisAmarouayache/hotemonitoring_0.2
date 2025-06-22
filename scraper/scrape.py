import requests
from bs4 import BeautifulSoup
from typing import List, Optional
import re
from datetime import datetime
import json

class Room:
    def __init__(self, room_id: str, name: str, occupancy: int, price: float, 
                 refundable: bool, breakfast_included: bool, available: bool):
        self.room_id = room_id
        self.name = name
        self.occupancy = occupancy
        self.price = price
        self.refundable = refundable
        self.breakfast_included = breakfast_included
        self.available = available

class Rating:
    def __init__(self, overall: float, location: float):
        self.overall = overall
        self.location = location

class HotelData:
    def __init__(self, hotel_id: str, hotel_name: str, currency: str, 
                 scrape_date: str, check_in_date: str, rooms: List[Room], 
                 rating: Rating, amenities: List[str]):
        self.hotel_id = hotel_id
        self.hotel_name = hotel_name
        self.currency = currency
        self.scrape_date = scrape_date
        self.check_in_date = check_in_date
        self.rooms = rooms
        self.rating = rating
        self.amenities = amenities

def extract_price(price_text: str) -> float:
    """Extract numeric price from price text"""
    if not price_text:
        return 0.0
    
    try:
        # Clean the price text - remove currency symbols and extra characters
        cleaned_text = re.sub(r'[^\d.,]', '', price_text)
        
        # Handle cases with multiple dots (like "7.97.9")
        if cleaned_text.count('.') > 1:
            # Split by dots and take the first two parts
            parts = cleaned_text.split('.')
            if len(parts) >= 2:
                cleaned_text = f"{parts[0]}.{parts[1]}"
            else:
                cleaned_text = parts[0]
        
        # Remove commas and extract the first valid number
        cleaned_text = cleaned_text.replace(',', '')
        
        # Use a more specific regex to match valid price patterns
        price_match = re.search(r'^\d+\.?\d*$', cleaned_text)
        if price_match:
            return float(price_match.group())
        
        # Fallback: try to extract any number sequence
        price_match = re.search(r'(\d+\.?\d*)', cleaned_text)
        if price_match:
            return float(price_match.group(1))
        
        return 0.0
        
    except (ValueError, TypeError) as e:
        print(f"Error parsing price '{price_text}': {e}")
        return 0.0

def extract_rating(rating_text: str) -> float:
    """Extract numeric rating from rating text"""
    if not rating_text:
        return 0.0
    
    rating_match = re.search(r'[\d.]+', rating_text)
    if rating_match:
        return float(rating_match.group())
    return 0.0

def scrape_booking(url: str, checkin_date: str) -> dict:
    """
    Scrape Booking.com hotel data using BeautifulSoup
    
    Args:
        url: Booking.com hotel page URL
        checkin_date: Check-in date in YYYY-MM-DD format
    
    Returns:
        HotelData object as dictionary
    """
    
    # Headers to mimic a real browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        # Add check-in date to URL if not present
        if 'checkin=' not in url:
            separator = '&' if '?' in url else '?'
            url = f"{url}{separator}checkin={checkin_date}"
        
        print(f"Scraping URL: {url}")
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract hotel name
        hotel_name = ""
        name_selectors = [
            'h2[data-testid="title"]',
            '#hp_hotel_name',
            '.hp__hotel-name',
            'h1[data-testid="title"]'
        ]
        
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem:
                hotel_name = name_elem.get_text(strip=True)
                break
        
        # Extract hotel ID from URL
        hotel_id_match = re.search(r'/hotel/([^/]+)', url)
        hotel_id = hotel_id_match.group(1) if hotel_id_match else "unknown"
        
        # Extract ratings
        overall_rating = 0.0
        location_rating = 0.0
        
        rating_selectors = [
            'div[data-testid="review-score-component"]',
            '.review-score-badge',
            '.review-score-widget'
        ]
        
        for selector in rating_selectors:
            rating_elem = soup.select_one(selector)
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                overall_rating = extract_rating(rating_text)
                break
        
        # Extract amenities
        amenities = []
        amenity_selectors = [
            '.hotel-facilities-group .bui-list__description',
            '.facilities__list .facilities__item',
            '.hp-amenity-list .hp-amenity-item'
        ]
        
        for selector in amenity_selectors:
            amenity_elems = soup.select(selector)
            for elem in amenity_elems:
                amenity_text = elem.get_text(strip=True)
                if amenity_text and len(amenity_text) > 2:
                    amenities.append(amenity_text)
            if amenities:
                break
        
        # Extract rooms and prices
        rooms = []
        room_selectors = [
            'tr[data-block-id^="hotel_room"]',
            'table.hprt-table tr.hprt-table-row',
            '.room-item',
            '.room-info'
        ]
        
        for selector in room_selectors:
            room_elems = soup.select(selector)
            if room_elems:
                for i, room_elem in enumerate(room_elems[:5]):  # Limit to 5 rooms
                    try:
                        # Extract room name
                        room_name = ""
                        name_selectors = [
                            '.room-name',
                            '.hprt-roomtype-icon-link',
                            '.room-title'
                        ]
                        
                        for name_sel in name_selectors:
                            name_elem = room_elem.select_one(name_sel)
                            if name_elem:
                                room_name = name_elem.get_text(strip=True)
                                break
                        
                        if not room_name:
                            room_name = f"Room {i+1}"
                        
                        # Extract price
                        price = 0.0
                        price_selectors = [
                            'span.prco-valign-middle-helper',
                            'span.hprt-price-price-standard',
                            '.room-price',
                            '.price'
                        ]
                        
                        for price_sel in price_selectors:
                            price_elem = room_elem.select_one(price_sel)
                            if price_elem:
                                price_text = price_elem.get_text(strip=True)
                                price = extract_price(price_text)
                                break
                        
                        # Extract occupancy (default to 2)
                        occupancy = 2
                        occupancy_selectors = [
                            '.occupancy-info',
                            '.room-occupancy'
                        ]
                        
                        for occ_sel in occupancy_selectors:
                            occ_elem = room_elem.select_one(occ_sel)
                            if occ_elem:
                                occ_text = occ_elem.get_text(strip=True)
                                occ_match = re.search(r'(\d+)', occ_text)
                                if occ_match:
                                    occupancy = int(occ_match.group(1))
                                break
                        
                        # Check for refundable and breakfast
                        refundable = "refundable" in room_elem.get_text().lower()
                        breakfast_included = "breakfast" in room_elem.get_text().lower()
                        available = price > 0
                        
                        room = Room(
                            room_id=f"{hotel_id}_room_{i}",
                            name=room_name,
                            occupancy=occupancy,
                            price=price,
                            refundable=refundable,
                            breakfast_included=breakfast_included,
                            available=available
                        )
                        rooms.append(room)
                        
                    except Exception as e:
                        print(f"Error parsing room {i}: {e}")
                        continue
                
                if rooms:
                    break
        
        # If no rooms found, create a default room
        if not rooms:
            default_room = Room(
                room_id=f"{hotel_id}_room_1",
                name="Standard Room",
                occupancy=2,
                price=0.0,
                refundable=False,
                breakfast_included=False,
                available=False
            )
            rooms.append(default_room)
        
        # Determine currency (default to USD)
        currency = "USD"
        currency_selectors = [
            '.currency',
            '.price-currency'
        ]
        
        for selector in currency_selectors:
            currency_elem = soup.select_one(selector)
            if currency_elem:
                currency_text = currency_elem.get_text(strip=True)
                if currency_text in ['$', 'USD', '€', 'EUR', '£', 'GBP']:
                    currency = currency_text
                break
        
        # Create HotelData object
        hotel_data = HotelData(
            hotel_id=hotel_id,
            hotel_name=hotel_name or "Unknown Hotel",
            currency=currency,
            scrape_date=datetime.now().isoformat(),
            check_in_date=checkin_date,
            rooms=rooms,
            rating=Rating(overall_rating, location_rating),
            amenities=amenities[:10]  # Limit to 10 amenities
        )
        
        # Convert to dictionary for JSON serialization
        return {
            "hotelId": hotel_data.hotel_id,
            "hotelName": hotel_data.hotel_name,
            "currency": hotel_data.currency,
            "scrapeDate": hotel_data.scrape_date,
            "checkInDate": hotel_data.check_in_date,
            "rooms": [
                {
                    "roomId": room.room_id,
                    "name": room.name,
                    "occupancy": room.occupancy,
                    "price": room.price,
                    "refundable": room.refundable,
                    "breakfastIncluded": room.breakfast_included,
                    "available": room.available
                }
                for room in hotel_data.rooms
            ],
            "rating": {
                "overall": hotel_data.rating.overall,
                "location": hotel_data.rating.location
            },
            "amenities": hotel_data.amenities
        }
        
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        # Return error response
        return {
            "error": str(e),
            "hotelId": "error",
            "hotelName": "Error",
            "currency": "USD",
            "scrapeDate": datetime.now().isoformat(),
            "checkInDate": checkin_date,
            "rooms": [],
            "rating": {"overall": 0.0, "location": 0.0},
            "amenities": []
        }

if __name__ == "__main__":
    # Test the scraper
    test_url = "https://www.booking.com/hotel/us/hilton-garden-inn-new-york-manhattan-midtown-east.html"
    test_date = "2024-01-15"
    
    result = scrape_booking(test_url, test_date)
    print(json.dumps(result, indent=2)) 