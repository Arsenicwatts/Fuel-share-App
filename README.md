# FuelShare 🚗⚡

A campus-exclusive, peer-to-peer ride-sharing web application. FuelShare matches vehicle owners with empty seats to students heading in the same direction, splitting exact real-time fuel costs automatically.

---

## 🌟 Key Features

- 🔐 **Verified University Auth**: Email OTP verification (Nodemailer + Gmail SMTP) ensures campus security.
- ⛽ **Real-Time Web Scraper Engine**: Dynamic Python/Node scraper fetches live city petrol rates via DriveSpark, dynamically adjusting ride pricing based on exact route city locations.
- 📍 **100% Universal Location Search & Pinning**: Multi-source geocoding (Photon + OpenStreetMap Nominatim) supporting any campus, transit hub, custom address write-in, or interactive Leaflet map pin dropping.
- 🔖 **User-Centric Custom Saved Places**: Per-account saved locations (*Home, Office, College, Gym, etc.*) with custom nicknames, 1-click quick selection, and localStorage isolation.
- 🗺️ **Compact Mini Route Maps**: Sleek Leaflet mini-map route previews on ride cards and interactive full-modal map pickers.
- 💬 **Peer-to-Peer Ride Chat**: Real-time in-app messaging between drivers and accepted passengers.
- 📊 **Live Cost Split Calculator**: Mathematical cost sharing formula: `(Distance ÷ Mileage) × Live City Fuel Price ÷ Seat Capacity`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Lucide React, Leaflet Maps |
| **Backend API** | PHP 8 (PDO / MySQL) on Apache (XAMPP) |
| **Mail / OTP Server** | Node.js + Express + Nodemailer |
| **Scraper & Fuel Engine** | Python 3 (BeautifulSoup web scraper + DriveSpark) |
| **Database** | MySQL (Normalized 3NF schema with auto-cleanup event schedulers) |

---

## 🏗️ System Architecture

```
Browser (localhost:3000)
  ├── React SPA (Vite dev server)
  │     ├── Multi-Source Geocoder (Photon + Nominatim)
  │     ├── Compact Leaflet Mini-Maps & Interactive Map Pin Modal
  │     └── User-Isolated Saved Places Manager
  │
  ├── PHP Backend (localhost:80/fuelshare-backend)
  │   └── MySQL Database (localhost:3306)
  │
  └── Node.js & Python Engine (localhost:5000)
      ├── POST /api/send-otp        → Sends OTP email via Gmail SMTP
      ├── POST /api/verify-otp      → Validates OTP server-side
      ├── GET  /api/fuel-price      → Scrapes live city petrol rates via Python engine
      └── POST /api/calculate       → Calculates mathematically exact fuel cost per seat
```

---

## ⚙️ Setup Instructions

### Prerequisites

- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL)
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3](https://www.python.org/) with `beautifulsoup4` and `requests`

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Arsenicwatts/Fuel-share-App.git
cd Fuel-share-App/frontend
npm install
```

### 2. Database Setup

Start MySQL from XAMPP, then import `database/schema.sql`:

```bash
# Command line
mysql -u root < database/schema.sql

# Or via phpMyAdmin: Import -> database/schema.sql
```

### 3. PHP Backend Junction

Link the backend directory to Apache `htdocs`:

```bash
# Windows (run CMD as Admin)
mklink /J "C:\xampp\htdocs\fuelshare-backend" "path\to\Fuel-share-App\backend"
```

### 4. Environment Variables

Create `frontend/.env`:

```env
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

### 5. Launch Application

```bash
cd frontend
npm start
```

This launches the Vite Dev Server (`http://localhost:3000`) and the Node.js Mail/Fuel Engine Server (`http://localhost:5000`) concurrently.

---

## 📡 API Endpoints

### PHP API (`http://localhost/fuelshare-backend/api/index.php`)

| Method | Action | Description |
|--------|--------|-------------|
| POST | `signup` | Create account (bcrypt hashed) |
| POST | `login` | Authenticate user |
| GET | `get_rides` | List all active rides with seat availability |
| POST | `create_ride` | Publish a new ride with route coordinates |
| POST | `delete_ride` | Soft-delete a ride |
| POST | `request_seat` | Request a seat on a ride |
| POST | `respond_request` | Accept or decline passenger request |
| POST | `send_message` | Send chat message to driver/passenger |
| GET | `my_bookings` | Get user's rides (driver + passenger) |

### Node.js & Python Engine (`http://localhost:5000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send-otp` | Generate and email verification OTP |
| POST | `/api/verify-otp` | Validate submitted OTP |
| GET | `/api/fuel-price?location={city}` | Scrapes live city petrol rates |
| POST | `/api/calculate` | Run Python cost sharing calculation |

---

## 🔒 Security & Best Practices

- Passwords hashed with **bcrypt** (`password_hash` / `password_verify`).
- Server-side OTP validation (never exposed to browser state).
- Prepared statements (PDO) against SQL injection.
- User-isolated `localStorage` keys for custom saved places.

---

## 📜 License

Academic project created for campus ride sharing.
