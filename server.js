import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 🛡️ IMPORT 5-LAYER PROCESSING FEE GUARD
import { protectAgainstProcessingFee } from './src/utils/processingFeeGuard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ INTERNAL SECURITY CONFIGURATION
// This data is only accessible on the server and is NEVER sent to the browser.
const SECURE_CONFIG = {
  ADMIN_ID: 'admin',
  ADMIN_PASSWORD: 'admin123',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzgAGkw2nw1MdYob_-liwla8M79HQVnqgZKhxFJ_unSsFo0q2aM2cWlwlKTeZpCi2K0og/exec'
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Import bank configurations
import { allBankConfigs } from './src/banks/index.js';
import { calculateServerLoanEligibility } from './server/loanEngine.js';

// ... (calculateEMI, multipliers, etc. are now handled by loanEngine and calculators)

// API Routes
app.get('/api/banks', (req, res) => {
  const bankList = allBankConfigs.map(bank => ({
    id: bank.id,
    name: bank.name
  }));
  res.json(bankList);
});

app.post('/api/loan-eligibility', async (req, res) => {
  try {
    const userData = req.body;
    console.log('🏛️  Server: Starting exhaustive loan calculation for:', userData.companyName);

    // Call the exhaustive backend engine
    const results = await calculateServerLoanEligibility(userData);

    // 🛡️ APPLY 5-LAYER PROTECTION AGAINST PROCESSING FEES
    const protectedResults = protectAgainstProcessingFee(results, 'server-api');

    res.json(protectedResults);
  } catch (error) {
    console.error('❌ Server Calculation Error:', error);
    res.status(500).json({ error: 'Failed to calculate eligibility' });
  }
});

// 🛡️ SECURE ADMIN LOGIN ENDPOINT
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === SECURE_CONFIG.ADMIN_ID && password === SECURE_CONFIG.ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Authentication successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// 🛡️ SECURE LEAD PROXY ENDPOINT
// This prevents the Google Sheets URL from being exposed in the browser
app.post('/api/leads/save', async (req, res) => {
  try {
    const response = await fetch(SECURE_CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(req.body),
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ success: false, error: 'Failed to reach storage' });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});