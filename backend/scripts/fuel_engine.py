import sys
import json
import os
import time
import requests
import argparse
import re
from bs4 import BeautifulSoup

CACHE_FILE = os.path.join(os.path.dirname(__file__), "fuel_cache.json")
CACHE_TTL_SECONDS = 12 * 3600 # 12 hours cache

# Verified Indian City Benchmark Petrol Prices (₹/L)
CITY_BENCHMARK_PRICES = {
    "vadodara": 94.28,
    "baroda": 94.28,
    "ahmedabad": 94.59,
    "surat": 94.56,
    "rajkot": 94.30,
    "gandhinagar": 94.80,
    "anand": 94.90,
    "bhavnagar": 95.10,
    "jamnagar": 94.60,
    "junagadh": 94.70,
    "mehsana": 94.85,
    "bharuch": 94.75,
    "vapi": 95.00,
    "valsad": 95.10,
    "navsari": 94.90,
    "mumbai": 103.50,
    "delhi": 94.77,
    "new-delhi": 94.77,
    "bangalore": 102.86,
    "bengaluru": 102.86,
    "pune": 103.45,
    "hyderabad": 107.41,
    "jaipur": 104.88,
    "kolkata": 103.94,
    "chennai": 100.75
}

# City Slug Aliases for DriveSpark & GoodReturns
CITY_SLUG_MAP = {
    "delhi": "new-delhi",
    "baroda": "vadodara",
    "bengaluru": "bangalore"
}

# Popular Indian Vehicles Mileage Dictionary (km/l)
VEHICLE_MILEAGE_DB = {
    "activa": 48.0,
    "jupiter": 50.0,
    "access": 52.0,
    "splendor": 65.0,
    "pulsar": 45.0,
    "apache": 42.0,
    "royal enfield": 35.0,
    "bullet": 35.0,
    "classic 350": 35.0,
    "duke": 30.0,
    "r15": 40.0,
    "swift": 22.5,
    "baleno": 22.3,
    "wagon r": 23.5,
    "alto": 22.0,
    "dzire": 22.5,
    "i20": 19.8,
    "creta": 16.8,
    "honda city": 17.8,
    "verna": 18.0,
    "brezza": 20.1,
    "nexon": 17.5,
    "harrier": 14.6,
    "safari": 14.5,
    "fortuner": 10.0,
    "innova": 12.5,
    "thar": 13.0,
    "scorpio": 14.0,
    "xuv700": 13.5,
    "seltos": 16.5,
    "kwid": 22.0,
    "celerio": 25.2,
    "triber": 19.0,
    "amaze": 18.6
}

KNOWN_CITIES = {
    # Vadodara
    "vadodara": "vadodara",
    "baroda": "vadodara",
    "alkapuri": "vadodara",
    "gotri": "vadodara",
    "vasna": "vadodara",
    "sayajiganj": "vadodara",
    "waghodia": "vadodara",
    "khanderao": "vadodara",
    "manjalpur": "vadodara",
    "makarpura": "vadodara",
    "fatehgunj": "vadodara",
    "sama": "vadodara",
    "savli": "vadodara",
    "bhayli": "vadodara",
    "parul": "vadodara",
    "limda": "vadodara",
    "tarsali": "vadodara",
    "karelibaug": "vadodara",
    # Ahmedabad
    "ahmedabad": "ahmedabad",
    "chandkheda": "ahmedabad",
    "navrangpura": "ahmedabad",
    "vastrapur": "ahmedabad",
    "satellite": "ahmedabad",
    "kalupur": "ahmedabad",
    "sg highway": "ahmedabad",
    "bopal": "ahmedabad",
    "prahlad nagar": "ahmedabad",
    "nirma": "ahmedabad",
    "iim": "ahmedabad",
    "thaltej": "ahmedabad",
    "gota": "ahmedabad",
    "maninagar": "ahmedabad",
    "nikol": "ahmedabad",
    # Gandhinagar
    "gandhinagar": "gandhinagar",
    "raisan": "gandhinagar",
    "palaj": "gandhinagar",
    "kudasan": "gandhinagar",
    "infocity": "gandhinagar",
    "pdeu": "gandhinagar",
    "pdpu": "gandhinagar",
    # Surat
    "surat": "surat",
    "adajan": "surat",
    "vesu": "surat",
    "ichchhanath": "surat",
    "svnit": "surat",
    "varachha": "surat",
    "katargam": "surat",
    "udhna": "surat",
    # Rajkot & Anand
    "rajkot": "rajkot",
    "anand": "anand",
    "nadiad": "anand",
    "changa": "anand",
    "vv nagar": "anand",
    "vidyanagar": "anand",
    "charusat": "anand",
    # Mumbai
    "mumbai": "mumbai",
    "powai": "mumbai",
    "bandra": "mumbai",
    "andheri": "mumbai",
    # Delhi
    "delhi": "new-delhi",
    "new delhi": "new-delhi",
    "hauz khas": "new-delhi",
    # Bangalore
    "bangalore": "bangalore",
    "bengaluru": "bangalore",
    "koramangala": "bangalore",
    "indiranagar": "bangalore",
    "malleshwaram": "bangalore",
    # Other Metros
    "pune": "pune",
    "hyderabad": "hyderabad",
    "jaipur": "jaipur",
    "kolkata": "kolkata",
    "chennai": "chennai"
}

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache):
    try:
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f, indent=2)
    except Exception:
        pass

def extract_city_slug(location_str):
    """Extracts city slug and display name from any address string using whole-word matching"""
    if not location_str:
        return "vadodara", "Vadodara"

    text_lower = location_str.lower()

    # Whole-word match for known cities and landmarks
    for key, slug in KNOWN_CITIES.items():
        if re.search(r'\b' + re.escape(key) + r'\b', text_lower):
            return slug, key.capitalize()

    parts = [p.strip() for p in location_str.split(',') if p.strip()]
    states_set = {"india", "gujarat", "maharashtra", "karnataka", "delhi", "rajasthan", "telangana", "madhya pradesh", "uttar pradesh", "bihar", "tamil nadu", "kerala", "west bengal", "punjab", "haryana", "odisha", "assam", "andhra pradesh", "chhattisgarh", "jharkhand", "uttarakhand", "himachal pradesh"}
    for p in reversed(parts):
        p_lower = p.lower()
        if p_lower not in states_set:
            clean = re.sub(r'[^a-z0-9\-]', '', p_lower.replace(' ', '-'))
            if clean and len(clean) > 2:
                mapped = CITY_SLUG_MAP.get(clean, clean)
                return mapped, p.capitalize()

    return "vadodara", "Vadodara"

def scrape_drivespark_price(slug):
    """Primary Scraper: DriveSpark City Fuel Page"""
    url = f"https://www.drivespark.com/petrol-price-in-{slug}/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
    try:
        res = requests.get(url, headers=headers, timeout=3)
        if res.status_code == 200:
            matches = re.findall(r'(\d{2,3}\.\d{2})\s*/\s*L', res.text)
            if matches:
                val = float(matches[0])
                if 80.0 <= val <= 130.0:
                    return val
    except Exception:
        pass
    return None

def scrape_goodreturns_price(slug):
    """Secondary Scraper: GoodReturns City Fuel Page"""
    url = f"https://www.goodreturns.in/petrol-price-in-{slug}.html"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
    try:
        res = requests.get(url, headers=headers, timeout=3)
        if res.status_code == 200:
            matches = re.findall(r'Today.*?(?:₹|\&nb\s*;\s*)\s*(\d{2,3}\.\d{2})', res.text, re.I)
            if matches:
                for val_str in matches:
                    val = float(val_str)
                    if 80.0 <= val <= 130.0:
                        return val
    except Exception:
        pass
    return None

def get_fuel_price(location_str="vadodara"):
    """Fetches real-time petrol price with 12-hour local caching & multi-source scrapers"""
    slug, city_display = extract_city_slug(location_str)

    # 1. Check local JSON cache
    cache = load_cache()
    now = time.time()
    if slug in cache:
        cdata = cache[slug]
        if now - cdata.get("timestamp", 0) < CACHE_TTL_SECONDS:
            return cdata["price"], city_display, "cached"

    # 2. Try Primary Scraper (DriveSpark)
    price = scrape_drivespark_price(slug)
    source = "DriveSpark Live"

    # 3. Try Secondary Scraper (GoodReturns)
    if not price:
        price = scrape_goodreturns_price(slug)
        source = "GoodReturns Live"

    # 4. Benchmark Fallback
    if not price:
        price = CITY_BENCHMARK_PRICES.get(slug, 94.28)
        source = "State Benchmark"

    # 5. Save to local JSON cache
    cache[slug] = {
        "price": price,
        "source": source,
        "city": city_display,
        "timestamp": now
    }
    save_cache(cache)

    return price, city_display, source

def get_vehicle_mileage(model):
    """Auto-detects vehicle mileage (km/l) using DB lookup + Web Scraper fallback"""
    if not model or len(model) < 2:
        return 15.0

    model_lower = model.lower().strip()

    for key, mileage_val in VEHICLE_MILEAGE_DB.items():
        if key in model_lower:
            return mileage_val

    try:
        query = f"{model_lower} mileage kmpl".replace(' ', '+')
        url = f"https://html.duckduckgo.com/html/?q={query}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
        res = requests.get(url, headers=headers, timeout=4)
        if res.status_code == 200:
            text = res.text.lower()
            matches = re.findall(r'(\d{2}\.?\d{0,2})\s*(?:kmpl|km/l)', text)
            if matches:
                for val_str in matches:
                    val = float(val_str)
                    if 8.0 <= val <= 85.0:
                        return val
    except Exception:
        pass

    return 15.0

def calculate_fair_price(distance, mileage, fuel_price, capacity):
    try:
        if mileage <= 0 or capacity <= 0 or distance <= 0:
            return 0.0
        total_trip_cost = (distance / mileage) * fuel_price
        cost_per_seat = total_trip_cost / capacity
        return round(cost_per_seat, 2)
    except ZeroDivisionError:
        return 0.0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FuelShare Multi-Engine Real-Time Scraper")
    parser.add_argument('--distance', type=float, required=False, default=10.0, help="Trip distance in km")
    parser.add_argument('--mileage', type=float, required=False, default=0.0, help="Vehicle mileage in km/l (0 to auto-scrape)")
    parser.add_argument('--model', type=str, required=False, default="", help="Vehicle model string for auto-scraping")
    parser.add_argument('--capacity', type=int, required=False, default=4, help="Total seating capacity")
    parser.add_argument('--city', type=str, required=False, default="vadodara", help="City name or full address string")
    parser.add_argument('--location', type=str, required=False, default="", help="Full location string for city extraction")
    args = parser.parse_args()

    loc = args.location if args.location else args.city

    final_mileage = args.mileage
    scraped_mileage = False

    if final_mileage <= 0.0 and args.model:
        final_mileage = get_vehicle_mileage(args.model)
        scraped_mileage = True
    elif final_mileage <= 0.0:
        final_mileage = 15.0

    price, city_display, source = get_fuel_price(loc)
    cost = calculate_fair_price(args.distance, final_mileage, price, args.capacity)

    print(json.dumps({
        "status": "success",
        "city": city_display,
        "location": loc,
        "source": source,
        "vehicle_model": args.model if args.model else "Standard Car",
        "mileage_used": final_mileage,
        "mileage_scraped": scraped_mileage,
        "live_fuel_price": price,
        "cost_per_seat": cost
    }))