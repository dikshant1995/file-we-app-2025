import { db } from '../config/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

// Health tracking for production stability
export const dbHealth = {
  universal: { status: 'idle', count: 0, error: null },
  banks: {
    'kotak': { status: 'idle', count: 0 },
    'tata': { status: 'idle', count: 0 },
    'poonawala': { status: 'idle', count: 0 },
    'idfc': { status: 'idle', count: 0 },
    'hdfc': { status: 'idle', count: 0 },
    'icici': { status: 'idle', count: 0 },
    'chola': { status: 'idle', count: 0 },
    'indusind': { status: 'idle', count: 0 },
    'axis_fin': { status: 'idle', count: 0 }
  }
};

/**
 * Enhanced fetch with automatic retries
 */
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 500) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️ Retrying fetch for ${url} (${retries} left)...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
};

/**
 * Load universal company list for autocomplete
 */
export const loadUniversalCompanies = async () => {
  dbHealth.universal.status = 'loading';
  console.log('📡 Attempting to load Universal Database (Cloud/Local)...');

  try {
    // 1. Try Firestore first (Production Truth)
    const docRef = doc(db, 'company_databases', 'universal');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      universalCompanies = docSnap.data().data;
      dbHealth.universal.status = 'ok';
      dbHealth.universal.count = universalCompanies.length;
      console.log('✅ CLOUD SUCCESS: Universal Database loaded from Firestore.');
      return universalCompanies;
    }

    // 2. Fallback to local JSON
    const data = await fetchWithRetry('./data/universal_companies.json');
    universalCompanies = data;
    dbHealth.universal.status = 'ok';
    dbHealth.universal.count = data.length;
    console.log('✅ LOCAL SUCCESS: Universal Database loaded from JSON.');
    return universalCompanies;
  } catch (error) {
    dbHealth.universal.status = 'failed';
    dbHealth.universal.error = error.message;
    console.error('❌ CRITICAL ERROR: Could not load Universal Database:', error);
    return [];
  }
};

/**
 * Load bank-specific company database
 */
const loadBankDatabase = async (bankName) => {
  dbHealth.banks[bankName].status = 'loading';
  try {
    // 1. Try Firestore first
    const docRef = doc(db, 'company_databases', bankName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      bankDatabases[bankName] = docSnap.data().data;
      dbHealth.banks[bankName].status = 'ok';
      dbHealth.banks[bankName].count = bankDatabases[bankName].length;
      console.log(`✅ CLOUD SUCCESS: ${bankName} database loaded from Firestore.`);
      return bankDatabases[bankName];
    }

    // 2. Fallback to local JSON
    const data = await fetchWithRetry(`./data/${bankName}_companies.json`);
    bankDatabases[bankName] = data;
    dbHealth.banks[bankName].status = 'ok';
    dbHealth.banks[bankName].count = data.length;
    console.log(`✅ LOCAL SUCCESS: ${bankName} database loaded from JSON.`);
    return data;
  } catch (error) {
    dbHealth.banks[bankName].status = 'failed';
    console.error(`❌ Error loading ${bankName} database:`, error.message);
    return [];
  }
};

/**
 * Initialize all bank databases safely
 */
export const initializeBankDatabases = async () => {
  const bankNames = Object.keys(dbHealth.banks);
  await Promise.all(bankNames.map(name => loadBankDatabase(name)));
  console.log('🏁 Health Check:', dbHealth);
};

/**
 * Get company suggestions for autocomplete
 */
export const getCompanySuggestions = (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  const search = searchTerm.toLowerCase();

  if (!universalCompanies || universalCompanies.length === 0) {
    console.warn('⚠️ ENGINE IDLE: Universal Database not ready.');
    return [];
  }

  return universalCompanies
    .filter(company =>
      company?.companyName &&
      company.companyName.toLowerCase().includes(search)
    )
    .slice(0, 50)
    .map(c => c.companyName)
    .sort();
};

/**
 * Standardized mapping
 */
const mapCategoryToConfigKey = (standardizedCategory) => {
  const mapping = {
    'SCATA': 'SUPER-A',
    'CATGA': 'A',
    'CATGB': 'B',
    'CATGC': 'C',
    'CATGD': 'D',
    'GOVT': 'GOVT'
  };
  return mapping[standardizedCategory] || 'B';
};

/**
 * Query bank's database with a safety fallback
 */
export const getCompanyCategoryForBank = (companyName, bankName, fallbackCategory = 'B') => {
  if (!companyName) return fallbackCategory;

  const normalizedCompany = companyName.trim().toUpperCase();
  const bankDb = bankDatabases[bankName] || [];

  // Safety: If database failed to load or is empty, use the user selected fallback
  if (bankDb.length === 0) {
    console.warn(`🛡️ Fallback: ${bankName} database empty. Using user selection: ${fallbackCategory}`);
    return fallbackCategory;
  }

  const match = bankDb.find(
    company => company.companyName.trim().toUpperCase() === normalizedCompany
  );

  if (match) {
    const configKey = mapCategoryToConfigKey(match.category);
    console.log(`✅ ${bankName}: ${companyName} → ${match.category}`);
    return configKey;
  }

  // Not found in bank DB? Don't just return UNLISTED, return the fallback provided by the calculator
  console.log(`⚠️ ${bankName}: ${companyName} NOT in database. Using fallback: ${fallbackCategory}`);
  return fallbackCategory;
};

/**
 * Get categories for all banks with a global fallback
 */
export const getCompanyCategoriesForAllBanks = (companyName, globalFallback = 'B') => {
  return {
    kotak: getCompanyCategoryForBank(companyName, 'kotak', globalFallback),
    tata: getCompanyCategoryForBank(companyName, 'tata', globalFallback),
    poonawala: getCompanyCategoryForBank(companyName, 'poonawala', globalFallback),
    idfc: getCompanyCategoryForBank(companyName, 'idfc', globalFallback),
    hdfc: getCompanyCategoryForBank(companyName, 'hdfc', globalFallback),
    icici: getCompanyCategoryForBank(companyName, 'icici', globalFallback),
    chola: getCompanyCategoryForBank(companyName, 'chola', globalFallback),
    indusind: getCompanyCategoryForBank(companyName, 'indusind', globalFallback),
    'axis_fin': getCompanyCategoryForBank(companyName, 'axis_fin', globalFallback)
  };
};

/**
 * Save bank database to Firestore (Admin only)
 */
export const saveBankDatabaseToCloud = async (bankId, data) => {
  try {
    const docRef = doc(db, 'company_databases', bankId);
    await setDoc(docRef, {
      data,
      updatedAt: new Date().toISOString(),
      count: data.length
    });
    console.log(`✅ ${bankId} database synced to Cloud successfully.`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to sync ${bankId} to Cloud:`, error);
    throw error;
  }
};
/**
 * Safely sync new companies to the Universal Database (for autocomplete)
 */
export const syncToUniversalDatabase = async (newCompanies) => {
  try {
    // 1. Load current universal list
    const docRef = doc(db, 'company_databases', 'universal');
    const docSnap = await getDoc(docRef);

    let currentUniversal = [];
    if (docSnap.exists()) {
      currentUniversal = docSnap.data().data || [];
    }

    // 2. Identify brand new companies (not already in universal)
    const existingNames = new Set(currentUniversal.map(c => c.companyName.toUpperCase()));
    const brandNewEntries = [];

    newCompanies.forEach(company => {
      const name = company.companyName.toUpperCase();
      if (!existingNames.has(name)) {
        brandNewEntries.push({
          companyName: name,
          // Since it's universal, we don't store a specific category 
          // because it varies by bank
        });
        existingNames.add(name);
      }
    });

    if (brandNewEntries.length === 0) {
      console.log('ℹ️ No new companies to add to Universal Database.');
      return;
    }

    // 3. Merge and Save
    const updatedUniversal = [...currentUniversal, ...brandNewEntries];
    await setDoc(docRef, {
      data: updatedUniversal,
      updatedAt: new Date().toISOString(),
      count: updatedUniversal.length
    });

    // Update local memory
    universalCompanies = updatedUniversal;

    console.log(`✅ AUTO-SYNC: Added ${brandNewEntries.length} new companies to Universal Database.`);
    return brandNewEntries.length;
  } catch (error) {
    console.error('❌ Failed to sync to Universal Database:', error);
    // Don't throw, we don't want to break the bank-specific upload if sync fails
  }
};
