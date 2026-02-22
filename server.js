import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export for Vercel (Optional, but often needed with @vercel/node)
export default app;