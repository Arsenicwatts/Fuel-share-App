import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendVerificationEmail } from './mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());



// Email OTP Verification Endpoint
app.post('/api/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ status: "error", message: "Missing email or OTP payload." });
  }

  try {
    await sendVerificationEmail(email, otp);
    res.json({ status: "success", message: "OTP Email dispatched." });
  } catch (e) {
    console.error("Nodemailer Transaction Error:", e);
    res.status(500).json({ status: "error", message: "Failed to connect to SMTP server." });
  }
});

// API Endpoint to bridge the Frontend to the Python Intelligence Engine
app.post('/api/calculate', (req, res) => {
  const { distance, mileage, model, capacity } = req.body;

  // Auto-resolve path to the python script
  const scriptPath = path.join(__dirname, '..', 'backend', 'scripts', 'fuel_engine.py');

  // Call Python directly
  const safeModel = model ? model.replace(/"/g, '\\"') : "Unknown";
  const cmd = `python "${scriptPath}" --distance ${distance} --mileage ${mileage} --model "${safeModel}" --capacity ${capacity}`;

  console.log(`🚀 Executing Fuel Engine: ${cmd}`);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Python Error:", stderr || error.message);
      return res.status(500).json({ status: "error", message: stderr || error.message });
    }
    try {
      // Find JSON start bracket specifically (ignores standard system stdout warnings)
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
