# FuelShare: Detailed Project Documentation

## 1. Project Overview
**FuelShare** is a zero-profit, student-exclusive carpooling platform designed to reimagine campus commuting. It allows students to share rides and split the exact cost of fuel consumed, promoting eco-conscious travel and reducing the carbon footprint.

### Tech Stack
*   **Frontend:** React (Vite environment), Tailwind CSS, Lucide React (Icons), React Google Maps API.
*   **Backend:** PHP (Core API endpoints), Python (Calculation & Scraping engine), Node.js (Microservice for OTP emails).
*   **Database:** MySQL.

---

## 2. Comprehensive Feature List

### 🔒 Authentication & Security
*   **Student-Exclusive Access:** Emphasizes university email requirement.
*   **OTP Email Verification:** Uses a Node.js microservice (`server.js` on port 5000) to dispatch secure 6-digit OTPs for account creation and destructive actions.
*   **Secure Login/Signup:** Standard PHP/MySQL authentication flow storing hashed passwords.

### 🚗 Ride Creation (Driver Features)
*   **Route Calculation:** Integrates `@react-google-maps/api` to auto-calculate trip distance between origin and destination with a fallback mechanism if the API key is missing.
*   **Smart Cost Calculation (Python Engine):** A dedicated Python script (`fuel_engine.py`) takes the route distance, vehicle capacity, and vehicle model to calculate the exact, fair cost per seat.
    *   **Live Fuel Prices:** It scrapes live fuel prices from financial reporting sites (e.g., GoodReturns).
    *   **Dynamic Mileage:** If mileage isn't provided, it attempts to scrape the vehicle model's standard mileage from Google Search snippets.
*   **Auto-Vehicle Management:** The PHP backend automatically creates a vehicle profile if it doesn't exist to streamline the flow for drivers.

### 🗺️ Ride Discovery & Dashboard (Passenger Features)
*   **Real-Time Dashboard:** Polls the server every 5 seconds to ensure rides are synced across devices without requiring manual refreshes.
*   **Eco-Metrics Tracking:** A persistent banner that calculates and displays the total CO₂ saved (based on km driven) across all shared rides, and the number of active rides on the network.
*   **Ride Interaction:** Passengers can view available rides, see exact fixed costs, available seats, and request a seat.

### 🤝 Booking Management & Interaction
*   **Request Management:** Drivers can review passenger requests and selectively Accept or Decline them.
*   **Private Chat System:** Once a driver accepts a request, a private chat box unlocks between the driver and the specific passenger, allowing them to coordinate pickup details.
*   **Privacy First:** Passenger phone number and bio are only revealed to the driver *after* the request is explicitly accepted.

### 📅 My Bookings
*   **Trip Organization:** Segregates rides into "Upcoming" and "Past" tabs.
*   **Embedded Route Previews:** Displays an interactive `iframe` Google Map of the destination for the primary upcoming ride.
*   **Detailed Itinerary:** Shows precise timestamps, driver information, vehicle details (brand, model, fuel type), and estimated CO₂ saved per specific trip.
*   **Ride Controls:** Cancel upcoming scheduled rides or quickly rebook past routes.

### 👤 Profile & Account Management
*   **Profile Customization:** Users can update their display name, contact number, and short bio.
*   **Danger Zone (Account Deletion):** A highly secure account deletion process.
    *   Requires users to select a reason for leaving.
    *   Triggers an OTP verification to their registered email before executing the permanent deletion of their account, rides, and history.

### ⚙️ Database Automation
*   **MySQL Event Scheduler:** The database schema includes a scheduled event (`clean_old_rides`) that runs every 5 minutes to automatically delete ride records marked as 'Completed' or 'Deleted' older than 10 minutes, keeping the active ride pool clean.

---

## 3. Recommended Future Features

Based on the current architecture and use-case of FuelShare, here are highly recommended features to implement next to elevate the platform:

### 💳 1. Integrated Payment Gateway / Wallet System
Currently, the app calculates the cost beautifully, but the actual transaction happens off-platform (cash/UPI). 
*   **Suggestion:** Implement Razorpay, Stripe, or a closed-loop "Fuel Wallet". Passengers prepay into escrow when requesting a seat, and funds are automatically released to the driver upon ride completion. This guarantees zero-friction payments and eliminates awkward money collection.

### 🔔 2. Push Notifications
Relying on 5-second polling on the dashboard is resource-intensive and doesn't alert users when the app is minimized.
*   **Suggestion:** Integrate **Firebase Cloud Messaging (FCM)** or Web Push APIs to send real-time alerts when a request is made, a request is accepted/declined, or a new chat message arrives.

### ⭐ 3. Trust & Rating System
Safety and reliability are paramount in carpooling.
*   **Suggestion:** Implement a post-ride rating mechanism (1 to 5 stars) and text reviews. Display aggregate ratings on driver profiles and passenger requests to build a trustworthy campus community.

### 🗓️ 4. Recurring / Commute Rides
Many students have fixed schedules (e.g., traveling to campus at 9 AM every Monday/Wednesday).
*   **Suggestion:** Allow drivers to schedule recurring rides that automatically post themselves to the dashboard on specified days of the week.

### 🛡️ 5. Advanced Filtering & Safety Modes
*   **Suggestion:** Add comprehensive search filters on the dashboard (destination, date/time, vehicle type). Most importantly, add a **"Women-Only" toggle** allowing female drivers to exclusively accept requests from female passengers for enhanced safety/comfort.

### 📍 6. Live Location Tracking
Once a ride is confirmed and close to the start time.
*   **Suggestion:** Use the HTML5 Geolocation API to allow the driver to share their live location with accepted passengers on a map, making pickups seamless.

### 📊 7. Admin Dashboard
As the platform grows, moderation will be necessary.
*   **Suggestion:** Build a separate Admin Panel (React/PHP) to monitor platform health, handle reported users, view aggregate CO₂ savings, and manage the database without writing direct SQL queries.
