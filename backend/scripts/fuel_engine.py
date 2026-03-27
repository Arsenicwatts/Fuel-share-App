import sys
import json
import requests
import argparse
import re
from bs4 import BeautifulSoup

def get_fuel_price(city="new-delhi"):
    """Scrapes live petrol price from financial sites (fallback to 96.72)"""
    url = f"https://www.goodreturns.in/petrol-price-in-{city}.html"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Target the strong tags which usually contain the price like '₹ 94.72'
        price_tags = soup.find_all('strong')
        for tag in price_tags:
            text = tag.get_text(strip=True)
            if '₹' in text:
                val = text.replace('₹', '').replace(',', '').strip()
                try:
                    return float(val)
                except ValueError:
                    continue
        return 96.72 # Fallback
    except Exception:
        return 96.72 # Fallback on connection error

def get_vehicle_mileage(model):
    """Scrapes Google Search snippet for the kmpl mileage rating of a vehicle model"""
    if not model or len(model) < 2:
        return 15.0 # Standard fallback
        
    query = f"{model} mileage kmpl".replace(' ', '+')
    url = f"https://www.google.com/search?q={query}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract text from the DOM and look for kmpl/km/l patterns
        text = soup.get_text().lower()
        matches = re.findall(r'(\d{2}\.?\d{0,2})\s*(?:kmpl|km/l)', text)
        
        if matches:
            # First match is usually the bolded Google snippet answer
            return float(matches[0])
            
        return 15.0 # Fallback if no snippet block generated 
    except Exception:
        return 15.0

def calculate_fair_price(distance, mileage, fuel_price, capacity):
    try:
        total_trip_cost = (distance / mileage) * fuel_price
        # Fair Price = Total Cost / Total Seats (Splitting the cost)
        cost_per_seat = total_trip_cost / capacity
        return round(cost_per_seat, 2)
    except ZeroDivisionError:
        return 0.0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FuelShare Core Calculation Engine")
    parser.add_argument('--distance', type=float, required=True, help="Trip distance in km")
    parser.add_argument('--mileage', type=float, required=False, default=0.0, help="Vehicle mileage in km/l (0 to trigger auto-scrape)")
    parser.add_argument('--model', type=str, required=False, default="", help="Vehicle model string for scraping")
    parser.add_argument('--capacity', type=int, required=True, help="Total seating capacity")
    args = parser.parse_args()

    # Step 1: Auto-detect or use provided mileage
    final_mileage = args.mileage
    scraped_mileage = False
    
    if final_mileage <= 0.0 and args.model:
        final_mileage = get_vehicle_mileage(args.model)
        scraped_mileage = True
    elif final_mileage <= 0.0:
        final_mileage = 15.0 # Global fallback

    # Step 2: Grab Live Fuel Price
    price = get_fuel_price()
    
    # Step 3: Run Algorithm
    cost = calculate_fair_price(args.distance, final_mileage, price, args.capacity)

    # Output structured JSON to stdout for PHP/Node to parse
    print(json.dumps({
        "status": "success",
        "vehicle_model": args.model if args.model else "Unknown",
        "mileage_used": final_mileage,
        "mileage_scraped": scraped_mileage,
        "live_fuel_price": price,
        "cost_per_seat": cost
    }))