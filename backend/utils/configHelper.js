// Backend Configuration Helper
// This shim mimics the frontend service but works on the server
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '..', '..', 'data', 'bank_configs.json');

let serverBankConfigs = {};

// Load configs from disk once
const loadConfigs = () => {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            serverBankConfigs = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (err) {
            console.error('❌ Error reading bank_configs.json:', err);
        }
    }
};

/**
 * Mirror of the frontend getBankConfig service
 * Returns the section config with location-based overrides
 */
export const getBankConfig = (bankName, sectionName, locationContext = {}) => {
    // Always reload for freshness in dev/small scale (can be optimized later)
    loadConfigs();

    const bankConfig = serverBankConfigs[bankName] || {};

    // 1. Check for Overrides (City > State)
    const overrides = bankConfig.locationOverrides?.[sectionName] || {};

    // Check City Override
    if (locationContext.city && overrides[locationContext.city]) {
        return overrides[locationContext.city];
    }

    // Check State Override
    if (locationContext.state && overrides[locationContext.state]) {
        return overrides[locationContext.state];
    }

    // 2. Return Global Config
    if (bankConfig[sectionName]) {
        return bankConfig[sectionName];
    }

    return null;
};
