#!/usr/bin/env python3
"""
Test script to verify price parsing works correctly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraper'))

from scrape import extract_price

def test_price_parsing():
    """Test various price formats"""
    test_cases = [
        ("7.97.9", 7.97),  # The problematic case
        ("$123.45", 123.45),
        ("€99.99", 99.99),
        ("£150", 150.0),
        ("1,234.56", 1234.56),
        ("Invalid", 0.0),
        ("", 0.0),
        ("123", 123.0),
        ("45.67.89", 45.67),  # Multiple dots
        ("12.34.56.78", 12.34),  # Many dots
    ]
    
    print("🧪 Testing price parsing...")
    print("=" * 40)
    
    all_passed = True
    for input_price, expected in test_cases:
        try:
            result = extract_price(input_price)
            status = "✅" if abs(result - expected) < 0.01 else "❌"
            print(f"{status} '{input_price}' -> {result} (expected: {expected})")
            if abs(result - expected) >= 0.01:
                all_passed = False
        except Exception as e:
            print(f"❌ '{input_price}' -> ERROR: {e}")
            all_passed = False
    
    print("=" * 40)
    if all_passed:
        print("🎉 All price parsing tests passed!")
    else:
        print("⚠️  Some price parsing tests failed!")
    
    return all_passed

if __name__ == "__main__":
    test_price_parsing() 