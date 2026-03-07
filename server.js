import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '100mb' })); // Allow large JSON uploads

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist'))); // Vite projects usually use 'dist'

// API Endpoint to save database to local storage (Development only)
app.post('/api/admin/save-database', async (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!filename || !data) {
      return res.status(400).json({ error: 'Missing filename or data' });
    }

    const dataPath = path.join(__dirname, 'public', 'data', filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(dataPath), { recursive: true });

    // Save file
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

    console.log(`✅ Successfully saved ${filename} to local storage.`);
    res.json({ message: `Successfully saved ${filename}` });
  } catch (error) {
    console.error('Error saving database:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});