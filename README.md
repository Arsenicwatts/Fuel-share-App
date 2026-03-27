# FuelShare 🚗💨

**FuelShare** is a campus-exclusive, peer-to-peer ride-sharing web application. It is designed to solve the financial and logistical challenges of daily student commutes by matching vehicle owners who have empty seats with peers heading in the same direction. Unlike commercial ride-hailing apps, FuelShare operates on a strictly non-profit, cost-sharing model powered by a dynamic algorithmic pricing engine.

## 1. The Problem Space
College students and campus commuters typically face three major transportation hurdles:
- **Financial Strain:** Commercial cabs (like Ola or Uber) utilize surge pricing, making them too expensive for daily student commutes.
- **The "Splitting" Awkwardness:** While informal carpooling happens, manually calculating how much petrol was burned and awkwardly asking friends for small amounts of money creates social friction.
- **Safety Concerns:** Public carpooling apps expose young students to unverified strangers, which is a major safety deterrent.
- **Resource Inefficiency:** Campus parking lots are filled with single-occupancy vehicles, contributing to traffic congestion and a higher carbon footprint.

## 2. The FuelShare Solution
FuelShare bridges the gap between expensive cabs and unreliable public transport by creating a secure micro-economy. By restricting access exclusively to users with verified university email addresses, it ensures a 100% safe, student-only environment. The platform automates the entire process of finding rides and mathematically calculates the exact cost of the trip, removing the need for manual negotiation.

## 3. Core Innovation: The Dynamic Fair-Pricing Engine
The standout feature of FuelShare is its automated pricing algorithm. It guarantees that the driver makes no profit, and the passenger pays only their exact fair share of the fuel consumed.

**How the logic engine works:**
- **Data Scraping:** A Python microservice runs in the background, scraping real-time daily fuel prices (Petrol/Diesel) from reliable financial websites.
- **The Formula:**
  - `Total Fuel Needed = Trip Distance (km) ÷ Vehicle Mileage (km/l)`
  - `Total Trip Cost = Total Fuel Needed × Live Fuel Price (₹)`
  - `Fair Cost Per Seat = Total Trip Cost ÷ Total Vehicle Capacity`
- **Result:** The ride is published to the dashboard with a fixed, mathematically justified price tag.

## 4. Key Platform Features
- **Dual-Role Profiles:** A single user can act as both a Driver (offering rides) and a Passenger (booking rides) depending on their needs for the day.
- **Vehicle Garage:** Drivers can register multiple vehicles in their profile, saving the specific mileage, fuel type, and seating capacity for accurate calculations.
- **Interactive Dashboard:** A clean, modern UI where passengers can view available "Open" rides, see the driver's details, the vehicle model, departure time, and the exact cost.
- **Automated Matchmaking:** The system pairs available capacity with commuter demand in real-time.

## 5. Technology Stack & Architecture
FuelShare is built using a modern, decoupled Full-Stack architecture:
- **Frontend (UI):** Built with ReactJS (Vite environment) and styled with Tailwind CSS v4. Ensures a fast, responsive, Single Page Application (SPA) experience.
- **Backend (API & Routing):** Powered by Vanilla PHP following RESTful architectural principles. Handles user authentication, session management, and securely processes requests using PDO.
- **Logic Microservice:** A Python 3 script utilizes `requests` and `BeautifulSoup4` for web scraping. PHP triggers this script via shell execution to perform mathematical calculations.
- **Database:** A normalized MySQL database structured in 3NF to manage Users, Vehicles, Rides, and Bookings efficiently.

## 6. The User Workflow
1. **Onboarding:** A user registers using their college email.
2. **Driver Action:** A driver enters their start point, destination, and departure time. The system pulls their vehicle's mileage, hits the Python engine for today's fuel price, and publishes the ride.
3. **Passenger Action:** A passenger logs in, browses the dashboard, finds a route that matches their commute, and clicks "Book Seat" at the transparently displayed price.

## 7. Future Scope and Impact
As an academic project, FuelShare proves the viability of algorithmic cost-sharing. Future iterations could include:
- Integration with Google Maps API for automated distance calculation.
- In-app UPI payment gateways for seamless financial clearing.
- An eco-metric dashboard showing users how much CO₂ they have saved by carpooling.
