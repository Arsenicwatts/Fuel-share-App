import sys
import json
import requests
import argparse
from bs4 import BeautifulSoup

def get_fuel_price(city="Delhi"):
    # Mocking price for stability, replace with scraping logic if needed
    return 96.72

def calculate_fair_price(distance, mileage, fuel_price, capacity):
    try:
        total_trip_cost = (distance / mileage) * fuel_price
        # Fair Price = Total Cost / Total Seats (Splitting the cost)
        cost_per_seat = total_trip_cost / capacity
        return round(cost_per_seat, 2)
    except ZeroDivisionError:
        return 0.0

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--distance', type=float, required=True)
    parser.add_argument('--mileage', type=float, required=True)
    parser.add_argument('--capacity', type=int, required=True)
    args = parser.parse_args()

    price = get_fuel_price()
    cost = calculate_fair_price(args.distance, args.mileage, price, args.capacity)

    print(json.dumps({
        "status": "success",
        "fuel_price": price,
        "cost_per_seat": cost
    }))