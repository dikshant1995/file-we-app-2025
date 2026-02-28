import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// 🛡️ IMPORT 5-LAYER PROCESSING FEE GUARD
import { protectAgainstProcessingFee } from './src/utils/processingFeeGuard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Check for build output
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.warn('WARNING: "dist" directory not found. Please run "npm run build" to generate production assets.');
}

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// 📂 PERSISTENT BANK CONFIGURATIONS
const CONFIG_FILE = path.join(process.cwd(), 'data', 'bank_configs.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Initial load of configs
let activeBankConfigs = {};
if (fs.existsSync(CONFIG_FILE)) {
  try {
    activeBankConfigs = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    console.log('✅ Bank configurations loaded from disk');
  } catch (err) {
    console.error('❌ Error parsing config file:', err);
  }
}

// Import bank configurations (as fallbacks/defaults)
import { allBankConfigs } from './src/banks/index.js';

// 🧠 IMPORT SECURE CALCULATION ENGINE
import { performLoanCalculation } from './backend/calculationController.js';

// 📂 PERSISTENT LEADS
const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

// Initial load of leads
let allLeads = [];
if (fs.existsSync(LEADS_FILE)) {
  try {
    allLeads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    console.log(`✅ ${allLeads.length} Leads loaded from disk`);
  } catch (err) {
    console.error('❌ Error parsing leads file:', err);
  }
}

// API Routes
app.get('/api/banks', (req, res) => {
  const bankList = allBankConfigs.map(bank => ({
    id: bank.id,
    name: bank.name
  }));
  res.json(bankList);
});

// 🛡️ API: Get All Bank Configurations
app.get('/api/bank-configs', (req, res) => {
  res.json(activeBankConfigs);
});

// 🛡️ API: Save Bank Configuration
app.post('/api/bank-configs', (req, res) => {
  const { bankName, sectionName, config, locationKey } = req.body;

  if (!bankName || !sectionName || !config) {
    return res.status(400).json({ error: 'Missing required configuration fields' });
  }

  // Initialize bank if not exists
  if (!activeBankConfigs[bankName]) {
    activeBankConfigs[bankName] = {};
  }

  if (locationKey) {
    // Handle Location Overrides
    if (!activeBankConfigs[bankName].locationOverrides) {
      activeBankConfigs[bankName].locationOverrides = {};
    }
    if (!activeBankConfigs[bankName].locationOverrides[sectionName]) {
      activeBankConfigs[bankName].locationOverrides[sectionName] = {};
    }
    activeBankConfigs[bankName].locationOverrides[sectionName][locationKey] = config;
  } else {
    // Handle Global Config
    activeBankConfigs[bankName][sectionName] = config;
  }

  // Save to disk (Skip if on Vercel's read-only filesystem)
  if (process.env.VERCEL) {
    console.log('☁️ Vercel Environment Detected: Skipping disk write.');
    return res.json({ success: true, warning: 'Changes are session-only in preview' });
  }

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(activeBankConfigs, null, 2));
    console.log(`💾 Saved ${sectionName} for ${bankName} to disk`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error saving config to disk:', err);
    res.status(500).json({ error: 'Failed to save configuration to disk' });
  }
});

// 🛡️ API: Leads Management
app.get('/api/leads', (req, res) => {
  res.json(allLeads);
});

app.post('/api/leads', (req, res) => {
  const lead = req.body;

  if (!lead.name || !lead.mobile) {
    return res.status(400).json({ error: 'Lead must have name and mobile' });
  }

  // Add metadata
  const newLead = {
    ...lead,
    id: lead.id || Date.now(),
    serverTimestamp: new Date().toISOString()
  };

  allLeads.unshift(newLead);

  // Keep only last 1000 leads to avoid file bloat
  if (allLeads.length > 1000) {
    allLeads = allLeads.slice(0, 1000);
  }

  try {
    // Skip disk write if on Vercel
    if (!process.env.VERCEL) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(allLeads, null, 2));
    } else {
      console.log('☁️ Vercel Lead Capture: Skipping disk write.');
    }
    res.json({ success: true, lead: newLead });
  } catch (err) {
    console.error('❌ Error saving lead to disk:', err);
    res.status(500).json({ error: 'Failed to save lead to disk' });
  }
});

app.get('/api/companies/categories', (req, res) => {
  // This would typically come from a database
  res.json({
    "A": ["Google", "Microsoft", "Apple", "Amazon"],
    "B": ["Infosys", "TCS", "Wipro", "HCL"],
    "C": ["Local IT Firm", "Regional Bank", "Small Manufacturing"]
  });
});

app.post('/api/loan-eligibility', async (req, res) => {
  const userData = req.body;

  try {
    // 🛡️ Redirect to Secure Engine
    const results = await performLoanCalculation(userData);
    res.json(results);
  } catch (error) {
    console.error('🚨 Secure Engine Error:', error);
    res.status(500).json({ error: 'Internal calculation error' });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});