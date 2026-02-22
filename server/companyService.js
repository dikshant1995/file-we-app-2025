import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the data directory (relative to this file in /server/companyService.js)
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

const bankDatabases = {
    'kotak': null,
    'tata': null,
    'poonawala': null,
    'idfc': null,
    'hdfc': null,
    'icici': null,
    'chola': null,
    'indusind': null,
    'axis_fin': null
};

/**
 * Load bank-specific company database from filesystem
 */
const loadBankDatabase = async (bankName) => {
    if (bankDatabases[bankName]) return bankDatabases[bankName];

    try {
        const filePath = path.join(DATA_DIR, `${bankName}_companies.json`);
        const data = await fs.readFile(filePath, 'utf8');
        bankDatabases[bankName] = JSON.parse(data);
        console.log(`✅ Server: Loaded ${bankName} database (${bankDatabases[bankName].length} records)`);
        return bankDatabases[bankName];
    } catch (error) {
        console.error(`❌ Server Error: Failed to load ${bankName} database:`, error.message);
        return [];
    }
};

/**
 * Map standardized category codes to bank-specific config keys
 */
const mapCategoryToConfigKey = (standardizedCategory) => {
    const mapping = {
        'SCATA': 'SUPER-A',
        'CATGA': 'A',
        'CATGB': 'B',
        'CATGC': 'C',
        'CATGD': 'D',
        'GOVT': 'GOVT',
        'UNLISTED': 'UNLISTED'
    };

    return mapping[standardizedCategory] || standardizedCategory;
};

/**
 * Query specific bank's database for company category
 */
export const getCompanyCategoryForBank = async (companyName, bankName) => {
    if (!companyName) return 'UNLISTED';

    const normalizedBank = bankName.toLowerCase().replace('-', '_');
    const normalizedCompany = companyName.trim().toUpperCase();

    const bankDb = await loadBankDatabase(normalizedBank);

    const match = bankDb.find(
        company => company.companyName.trim().toUpperCase() === normalizedCompany
    );

    if (match) {
        const configKey = mapCategoryToConfigKey(match.category);
        return configKey;
    }

    return 'UNLISTED';
};
