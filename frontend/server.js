import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { sendVerificationEmail } from './mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ======================== SERVER-SIDE OTP STORE ========================
// In-memory OTP map: { email -> { otp, expiresAt } }
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) otpStore.delete(email);
  }
}, 5 * 60 * 1000);

// ======================== SEND OTP ========================
// Generates OTP server-side, stores it, and emails it to the user
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", message: "Missing email payload." });
  }

  // Generate secure 6-digit OTP on the server
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store with expiry
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS
  });

  try {
    await sendVerificationEmail(email, otp);
    res.json({ status: "success", message: "OTP Email dispatched." });
  } catch (e) {
    console.error("Nodemailer Transaction Error:", e);
    otpStore.delete(email); // Clean up on failure
    res.status(500).json({ status: "error", message: "Failed to connect to SMTP server." });
  }
});

// ======================== VERIFY OTP ========================
// Validates the user-submitted OTP against the server-stored one
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ status: "error", message: "Missing email or OTP." });
  }

  const stored = otpStore.get(email);

  if (!stored) {
    return res.status(400).json({ status: "error", message: "No OTP was requested for this email. Please request a new code." });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ status: "error", message: "OTP has expired. Please request a new code." });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ status: "error", message: "Invalid verification code. Please check your email and try again." });
  }

  // OTP is valid — consume it (one-time use)
  otpStore.delete(email);
  res.json({ status: "success", message: "OTP verified successfully." });
});

// In-memory cache for live fuel prices { city -> { price, timestamp } }
const fuelPriceCache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ======================== LIVE FUEL PRICE API ========================
app.get('/api/fuel-price', (req, res) => {
  const location = req.query.location || req.query.city || 'vadodara';

  const scriptPath = path.join(__dirname, '..', 'backend', 'scripts', 'fuel_engine.py');
  const safeLoc = location.replace(/"/g, '\\"');
  const cmd = `python "${scriptPath}" --location "${safeLoc}" --distance 10 --capacity 4`;

  exec(cmd, (error, stdout) => {
    if (error || !stdout) {
      return res.json({ status: "fallback", city: "Vadodara", price: 94.28, source: "State Benchmark" });
    }
    try {
      const jsonStr = stdout.substring(stdout.indexOf('{'));
      const data = JSON.parse(jsonStr);
      const price = data.live_fuel_price || 94.28;
      const city = data.city || "Vadodara";
      const source = data.source || "DriveSpark Live";
      res.json({ status: "success", city, price, source });
    } catch (e) {
      res.json({ status: "fallback", city: "Vadodara", price: 94.28, source: "State Benchmark" });
    }
  });
});

// ======================== PYTHON ENGINE BRIDGE ========================
// API Endpoint to bridge the Frontend to the Python Intelligence Engine
app.post('/api/calculate', (req, res) => {
  const { distance = 10, mileage = 0, model = '', capacity = 4, city = 'vadodara' } = req.body;

  const scriptPath = path.join(__dirname, '..', 'backend', 'scripts', 'fuel_engine.py');
  const safeModel = model ? model.replace(/"/g, '\\"') : "Unknown";
  const safeCity = city ? city.replace(/"/g, '\\"') : "vadodara";

  const cmd = `python "${scriptPath}" --distance ${distance} --mileage ${mileage} --model "${safeModel}" --capacity ${capacity} --city "${safeCity}"`;

  console.log(`🚀 Executing Fuel Engine: ${cmd}`);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Python Error:", stderr || error.message);
      return res.status(500).json({ status: "error", message: stderr || error.message });
    }
    try {
      const jsonStr = stdout.substring(stdout.indexOf('{'));
      const data = JSON.parse(jsonStr);
      console.log("✅ Engine Result:", data);
      res.json(data);
    } catch (e) {
      console.error("Failed to parse output:", stdout);
      res.status(500).json({ status: "error", message: "Failed to parse API" });
    }
  });
});

app.listen(5000, () => {
  console.log('✅ FuelShare Intelligence Engine (Node Wrapper) running on port 5000');
});
