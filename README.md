# FuelShare

A campus-exclusive, peer-to-peer ride-sharing web application. FuelShare matches vehicle owners with empty seats to students heading in the same direction, splitting the exact fuel cost automatically.

## Problem

- Commercial ride apps use surge pricing — too expensive for daily student commutes
- Splitting fuel costs manually is awkward and imprecise
- Public carpooling apps expose students to unverified strangers

## How It Works

1. **Sign up** with your university email (OTP verified)
2. **Post a ride** — enter route, vehicle details, departure time. The system calculates the exact cost per seat using: `(Distance ÷ Mileage) × Fuel Price ÷ Capacity`
3. **Request a seat** — browse available rides, request to join, chat with the driver once accepted

The driver makes zero profit. Every passenger pays their mathematically fair share.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS v4 |
| Backend API | PHP (PDO/MySQL) on Apache |
| Mail / OTP | Node.js + Express + Nodemailer |
| Pricing Engine | Python 3 (BeautifulSoup web scraping) |
| Database | MySQL (normalized, 3NF) |

## Architecture

```
Browser (localhost:3000)
  ├── React SPA (Vite dev server)
  │
  ├── PHP Backend (localhost:80/fuelshare-backend)
  │   └── MySQL (localhost:3306)
  │
  └── Node.js Server (localhost:5000)
      ├── POST /api/send-otp     → Sends OTP email via Gmail SMTP
      ├── POST /api/verify-otp   → Validates OTP server-side
      └── POST /api/calculate    → Bridges to Python fuel engine
```

## Setup

### Prerequisites

- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL)
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3](https://www.python.org/) (optional, for the pricing engine)

### 1. Clone and install

```bash
git clone https://github.com/your-username/Fuel-share-App.git
cd Fuel-share-App/frontend
npm install
```

### 2. Database

Start MySQL from XAMPP, then import the schema:

```bash
# Via command line
mysql -u root < database/schema.sql

# Or via phpMyAdmin: Import → select database/schema.sql
```

### 3. PHP Backend

Make the backend accessible to Apache:

```bash
# Windows (run as admin)
mklink /J "C:\xampp\htdocs\fuelshare-backend" "path\to\Fuel-share-App\backend"
```

### 4. Environment

Create `frontend/.env`:

```env
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 5. Run

Start Apache and MySQL from XAMPP Control Panel, then:

```bash
cd frontend
npm start
```

This launches both the Vite dev server (port 3000) and the Node mail server (port 5000) concurrently.

Open **http://localhost:3000**.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `?action=signup` | Create account (bcrypt hashed) |
| POST | `?action=login` | Authenticate user |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `?action=get_rides` | List all open rides with requests & chat |
| POST | `?action=create_ride` | Publish a new ride |
| POST | `?action=delete_ride` | Soft-delete a ride |

### Seat Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `?action=request_seat` | Request a seat on a ride |
| POST | `?action=cancel_request` | Cancel a seat request |
| POST | `?action=respond_request` | Accept or decline a request |

### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `?action=send_message` | Send a chat message |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `?action=update_profile` | Update name, phone, bio |
| POST | `?action=delete_account` | Permanently delete account (cascades) |
| GET | `?action=my_bookings` | Get user's rides (driver + passenger) |
| GET | `?action=user_vehicles` | Get user's last registered vehicle |

### Node.js Server (port 5000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send-otp` | Generate and email OTP |
| POST | `/api/verify-otp` | Validate submitted OTP |
| POST | `/api/calculate` | Run Python pricing engine |

## Database Schema

5 tables: `users`, `vehicles`, `rides`, `ride_requests`, `messages`. All foreign keys use `ON DELETE CASCADE`. A MySQL Event Scheduler auto-cleans completed/deleted rides after 10 minutes.

## Security

- Passwords hashed with **bcrypt** (`password_hash` / `password_verify`)
- OTP generated and verified **server-side** (never exposed to browser)
- SMTP credentials stored in `.env` (excluded from Git)
- Prepared statements (PDO) for all database queries

## License

Academic project. Not licensed for commercial use.
