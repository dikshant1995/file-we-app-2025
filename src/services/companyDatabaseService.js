// Company Database Service - Query bank-specific company databases

let universalCompanies = [];
const bankDatabases = {
  'kotak': [],
  'tata': [],
  'poonawala': [],
  'idfc': [],
  'hdfc': [],
  'icici': [],
  'chola': [],
  'indusind': [],
  'axis_fin': []
};

/**
 * Load universal company list for autocomplete
 */
export const loadUniversalCompanies = async () => {
  console.log('📡 Attempting to load Universal Database...');
  try {
    const response = await fetch('/data/universal_companies.json');
    if (response.ok) {
      universalCompanies = await response.json();
      console.log('✅ SUCCESS: Universal Database loaded into memory.', universalCompanies.length, 'records found.');
      return universalCompanies;
    } else {
      console.error('❌ FAILED: Universal Database request failed. Status:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ CRITICAL ERROR: Could not establish connection to Universal Database:', error);
  }
  return [];
};

/**
 * Load bank-specific company database
 */
const loadBankDatabase = async (bankName) => {
  try {
    const response = await fetch(`/data/${bankName}_companies.json`);
    if (response.ok) {
      bankDatabases[bankName] = await response.json();
      console.log(`✅ Loaded ${bankName} database:`, bankDatabases[bankName].length, 'companies');
      return bankDatabases[bankName];
    }
  } catch (error) {
    console.error(`Error loading ${bankName} database:`, error);
  }
  return [];
};

/**
 * Initialize all bank databases - REDUCED: Now only logs readiness.
 * Databases are loaded 'Lazily' when needed.
 */
export const initializeBankDatabases = async () => {
  console.log('✅ Lazy Engine Ready: Bank databases will load on-demand.');
};

/**
 * Get company suggestions for autocomplete
 */
export const getCompanySuggestions = (searchTerm) => {
  if (!searchTerm || searchTerm.length < 1) return [];

  const search = searchTerm.toLowerCase();

  // Guard: Only search if at least 2 characters are entered (Speed Optimization)
  if (search.length < 2) return [];

  // Guard: Ensure database is ready
  if (!universalCompanies || universalCompanies.length === 0) {
    console.warn('⚠️ ENGINE IDLE: Universal Database is not yet connected or empty.');
    return [];
  }

  return universalCompanies
    .filter(company =>
      company?.companyName &&
      company.companyName.toLowerCase().includes(search)
    )
    .slice(0, 50) // Reduced to 50 for faster rendering
    .map(c => c.companyName)
    .sort();
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
  const normalizedCompany = companyName.trim().toUpperCase();

  // LAZY LOADING: If bank database is empty, load it now
  if (!bankDatabases[bankName] || bankDatabases[bankName].length === 0) {
    console.log(`📡 LAZY LOAD: Fetching ${bankName} database for ${companyName}...`);
    await loadBankDatabase(bankName);
  }

  const bankDb = bankDatabases[bankName] || [];

  const match = bankDb.find(
    company => company.companyName.trim().toUpperCase() === normalizedCompany
  );

  if (match) {
    const configKey = mapCategoryToConfigKey(match.category);
    console.log(`✅ ${bankName}: ${companyName} → ${match.category} (mapped to '${configKey}')`);
    return configKey;
  }

  console.log(`⚠️ ${bankName}: ${companyName} → UNLISTED (not found)`);
  return 'UNLISTED';
};

/**
 * Get company category for all banks
 */
export const getCompanyCategoriesForAllBanks = async (companyName) => {
  const results = await Promise.all([
    getCompanyCategoryForBank(companyName, 'kotak'),
    getCompanyCategoryForBank(companyName, 'tata'),
    getCompanyCategoryForBank(companyName, 'poonawala'),
    getCompanyCategoryForBank(companyName, 'idfc'),
    getCompanyCategoryForBank(companyName, 'hdfc'),
    getCompanyCategoryForBank(companyName, 'icici'),
    getCompanyCategoryForBank(companyName, 'chola'),
    getCompanyCategoryForBank(companyName, 'indusind'),
    getCompanyCategoryForBank(companyName, 'axis_fin')
  ]);

  return {
    kotak: results[0],
    tata: results[1],
    poonawala: results[2],
    idfc: results[3],
    hdfc: results[4],
    icici: results[5],
    chola: results[6],
    indusind: results[7],
    'axis_fin': results[8]
  };
};
