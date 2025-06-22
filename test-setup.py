#!/usr/bin/env python3
"""
Test script to verify the Hotel Price Monitor MVP setup
"""

import requests
import json
import time
import sys

def test_python_scraper():
    """Test the Python FastAPI scraper"""
    print("🧪 Testing Python scraper...")
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Python scraper is running")
            return True
        else:
            print("❌ Python scraper health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Python scraper is not running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error testing Python scraper: {e}")
        return False

def test_typescript_backend():
    """Test the TypeScript Express backend"""
    print("🧪 Testing TypeScript backend...")
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:3001/health", timeout=5)
        if response.status_code == 200:
            print("✅ TypeScript backend is running")
            return True
        else:
            print("❌ TypeScript backend health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ TypeScript backend is not running on port 3001")
        return False
    except Exception as e:
        print(f"❌ Error testing TypeScript backend: {e}")
        return False

def test_react_frontend():
    """Test the React frontend"""
    print("🧪 Testing React frontend...")
    
    try:
        # Test if frontend is accessible
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ React frontend is running")
            return True
        else:
            print("❌ React frontend is not accessible")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ React frontend is not running on port 3000")
        return False
    except Exception as e:
        print(f"❌ Error testing React frontend: {e}")
        return False

def test_scraping_integration():
    """Test the complete scraping integration"""
    print("🧪 Testing scraping integration...")
    
    try:
        # Test scraping endpoint
        test_data = {
            "url": "https://www.booking.com/hotel/us/hilton-garden-inn-new-york-manhattan-midtown-east.html",
            "checkin": "2024-01-15"
        }
        
        response = requests.post(
            "http://localhost:3001/api/scrape",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Scraping integration is working")
                return True
            else:
                print(f"❌ Scraping failed: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Scraping endpoint returned status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to scraping endpoint")
        return False
    except Exception as e:
        print(f"❌ Error testing scraping integration: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Hotel Price Monitor MVP - Setup Test")
    print("=" * 50)
    
    tests = [
        ("Python Scraper", test_python_scraper),
        ("TypeScript Backend", test_typescript_backend),
        ("React Frontend", test_react_frontend),
        ("Scraping Integration", test_scraping_integration),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your setup is working correctly.")
        print("\n🌐 You can now access:")
        print("   Frontend: http://localhost:3000")
        print("   Backend API: http://localhost:3001")
        print("   Python Scraper: http://localhost:8000")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the setup instructions.")
        print("\n💡 Make sure all services are running:")
        print("   1. Python scraper: uvicorn api:app --reload --port 8000")
        print("   2. TypeScript backend: npm run dev (in backend directory)")
        print("   3. React frontend: npm run dev (in frontend directory)")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 