# FuelShare App Description & Context for Gemini

**Project Name:** FuelShare 🚗💨

## 1. Overview
FuelShare is a campus-exclusive, peer-to-peer ride-sharing web application. It aims to solve the financial and logistical challenges of daily student commutes by matching vehicle owners with empty seats with peers heading in the same direction. The platform uses a strictly non-profit, cost-sharing model powered by a dynamic algorithmic fair-pricing engine.

## 2. Core Features
- **Dynamic Fair-Pricing Engine:** The app scrapes real-time fuel prices (Petrol/Diesel) using a Python microservice and mathematically calculates the exact fair cost of the trip based on total fuel needed (distance / mileage) divided by vehicle seating capacity. This ensures drivers do not profit, and passengers pay exact actual costs.
- **Campus-Exclusive Access:** Registration is strictly restricted to verified university email addresses, ensuring a verified, safe, student-only environment.
- **Dual-Role Profiles:** Users can act seamlessly as both Drivers (publishing rides with their registered vehicles) and Passengers (booking available rides).
- **Vehicle Garage:** Users can register multiple vehicles with specific mileage, fuel type, and passenger capacity.
- **Automated Matchmaking:** Real-time pairing of available seats with commuter demand in the Dashboard.

## 3. Technology Stack & Architecture
- **Frontend (UI & State):** 
  - Built with ReactJS (Vite environment).
  - Styling: Tailwind CSS v4.
  - Components include: `Navbar.jsx`, `RideCard.jsx`, `ChatBox.jsx`.
  - Key Pages include: `Dashboard.jsx`, `Login.jsx`, `Profile.jsx`, `Createride.jsx`, `MyBookings.jsx`.
- **Backend (API & Data):** 
  - Vanilla PHP following RESTful principles (driven by a main router entry in `backend/api/api.php`).
  - Handles secure user authentication, session management, and routing.
- **Database:** MySQL (normalized in 3NF). PHP processes requests using PDO for maximum security against SQL injections. Entities include Users, Vehicles, Rides, and Bookings.
- **Logic Microservice:** A separate Python 3 script utilizing `requests` and `BeautifulSoup4` which is triggered by the PHP backend via shell execution to perform real-time fuel price web scraping.

## 4. General Workflows
- **Onboarding:** Register with a college-specific email address.
- **Driver Flow:** Define start/destination points and departure time. The logic engine calculates the price, and the ride is published.
- **Passenger Flow:** Browse an interactive dashboard of "Open" rides, view driver details and mathematically justified prices, and book a seat safely. 

## 5. Usage for AI Context
When prompting Gemini or another LLM, paste this document to provide full architectural context. You can then add specific queries like:
- "Refactor the database queries in `backend/api/api.php`."
- "Improve the UI of the dashboard in `frontend/src/pages/Dashboard.jsx` using Tailwind CSS."
- "Help me fix an issue with the python web scraper logic."
