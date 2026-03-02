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
 * Returns the section config with location-based overrides with a fallback chain
 */
export const getBankConfig = (bankName, sectionName, locationContext = {}) => {
    // Always reload for freshness in dev/small scale
    loadConfigs();

    const bankConfig = serverBankConfigs[bankName] || {};

    // --- FALLBACK CHAIN ---

    // 1. Check for Overrides (City > State)
    const overrides = bankConfig.locationOverrides?.[sectionName] || {};

    // Check City Override (e.g., Jaipur)
    if (locationContext.city && overrides[locationContext.city]) {
        return overrides[locationContext.city];
    }

    // Check State Override (e.g., Rajasthan)
    if (locationContext.state && overrides[locationContext.state]) {
        return overrides[locationContext.state];
    }

    // 2. Check Global Admin Config (National Default in Dashboard)
    if (bankConfig[sectionName]) {
        return bankConfig[sectionName];
    }

    // 3. Ultimate Safety Net: Hardcoded Defaults
    return null;
};

/**
 * Dynamic Interest Rate Matrix Resolver
 * Parses the rate based on loan amount slabs and category
 */
export const getDynamicInterestRate = (bankName, category, loanAmount, locationContext = {}, fallbackRate = 11.0) => {
    const rateConfig = getBankConfig(bankName, 'interestRates', locationContext);

    if (!rateConfig || !rateConfig.categorySlabRates || !rateConfig.categorySlabRates[category]) {
        return fallbackRate;
    }

    const slabs = rateConfig.categorySlabRates[category];

    // Iterate through slabs to find match
    for (const slabLabel in slabs) {
        // Handle range format: ₹100000-500000
        const rangeMatch = slabLabel.match(/₹(\d+)-(\d+)/);
        if (rangeMatch) {
            const min = parseInt(rangeMatch[1]);
            const max = parseInt(rangeMatch[2]);
            if (loanAmount >= min && loanAmount <= max) {
                return slabs[slabLabel];
            }
        }

        // Handle single value or plus format: ₹3000001+
        const plusMatch = slabLabel.match(/₹(\d+)\+/);
        if (plusMatch) {
            const min = parseInt(plusMatch[1]);
            if (loanAmount >= min) {
                return slabs[slabLabel];
            }
        }
    }

    return fallbackRate;
};
