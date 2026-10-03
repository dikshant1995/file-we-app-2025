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
  'axis_fin': [],
  'axis': [],
  'axis-bank': []
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
 * Resolve bank alias to canonical database key
 */
export const resolveBankDbKey = (bankName) => {
  if (!bankName) return 'universal';
  const clean = String(bankName).toLowerCase().replace(/[-_ ]/g, '');
  if (clean.includes('axis')) return 'axis_fin';
  if (clean.includes('indusind')) return 'indusind';
  if (clean.includes('kotak')) return 'kotak';
  if (clean.includes('tata')) return 'tata';
  if (clean.includes('poonawala')) return 'poonawala';
  if (clean.includes('idfc')) return 'idfc';
  if (clean.includes('hdfc')) return 'hdfc';
  if (clean.includes('icici')) return 'icici';
  if (clean.includes('chola')) return 'chola';
  return bankName;
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
  console.log('📡 Initializing Universal Database (Parallel Race Mode)...');

  // Helper for Local Fetch
  const loadLocal = async () => {
    const data = await fetchWithRetry('/data/universal_companies.json');
    if (universalCompanies.length === 0) { // Only use if cloud hasn't finished
      universalCompanies = data;
      dbHealth.universal.status = 'ok';
      dbHealth.universal.count = data.length;
      console.log(`✅ LOCAL LOADED: ${data.length} companies ready.`);
    }
    return data;
  };

  // Helper for Cloud Fetch with Timeout
  const loadCloud = async () => {
    try {
      const docRef = doc(db, 'company_databases', 'universal');
      // Set a 5-second timeout for Cloud
      const cloudPromise = getDoc(docRef);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Cloud Timeout')), 5000));
      
      const docSnap = await Promise.race([cloudPromise, timeoutPromise]);

      if (docSnap.exists()) {
        const cloudData = docSnap.data().data;
        universalCompanies = cloudData;
        dbHealth.universal.status = 'ok';
        dbHealth.universal.count = cloudData.length;
        console.log('✅ CLOUD LOADED: Universal Database synced.');
        return cloudData;
      }
    } catch (err) {
      console.warn('⚠️ Cloud Race Lost or Unavailable:', err.message);
    }
  };

  // Start both, return as soon as one finishes (preferring local for speed in dev)
  return Promise.race([loadLocal(), loadCloud()]);
};

/**
 * Load bank-specific company database
 */
export const loadBankDatabase = async (bankName) => {
  const targetKey = resolveBankDbKey(bankName);

  if (!dbHealth.banks[targetKey]) {
    dbHealth.banks[targetKey] = { status: 'idle', count: 0 };
  }

  // If already loaded in memory with records, return immediately
  if (bankDatabases[targetKey] && bankDatabases[targetKey].length > 0) {
    if (targetKey !== bankName) {
      bankDatabases[bankName] = bankDatabases[targetKey];
    }
    return bankDatabases[targetKey];
  }

  dbHealth.banks[targetKey].status = 'loading';

  // 1. Load bank-specific master JSON first (Contains full 40,000 to 182,000 companies)
  try {
    const data = await fetchWithRetry(`/data/${targetKey}_companies.json`);
    if (data && Array.isArray(data) && data.length > 0) {
      bankDatabases[targetKey] = data;
      bankDatabases[bankName] = data;
      if (targetKey === 'axis_fin') {
        bankDatabases['axis'] = data;
        bankDatabases['axis-bank'] = data;
      }
      dbHealth.banks[targetKey].status = 'ok';
      dbHealth.banks[targetKey].count = data.length;
      console.log(`✅ MASTER JSON SUCCESS: ${targetKey} database loaded (${data.length.toLocaleString('en-IN')} companies).`);
      return data;
    }
  } catch (localErr) {
    console.warn(`Local JSON not found for ${targetKey} (${localErr.message}). Attempting universal baseline...`);
  }

  // 2. Fallback to Universal Database for banks without a dedicated file (Bandhan, Shri Ram, Piramal)
  try {
    const universalData = await fetchWithRetry('/data/universal_companies.json');
    if (universalData && Array.isArray(universalData) && universalData.length > 0) {
      const mapped = universalData.map((c, idx) => ({
        companyName: c.companyName || c.name || `Company ${idx + 1}`,
        category: 'CATGB' // Standard Tier B default
      }));
      bankDatabases[targetKey] = mapped;
      bankDatabases[bankName] = mapped;
      dbHealth.banks[targetKey].status = 'ok';
      dbHealth.banks[targetKey].count = mapped.length;
      console.log(`✅ UNIVERSAL BASELINE SUCCESS: ${targetKey} loaded with ${mapped.length.toLocaleString('en-IN')} companies.`);
      return mapped;
    }
  } catch (uErr) {
    console.warn(`Universal fallback failed for ${targetKey}: ${uErr.message}`);
  }

  // 3. Optional Firestore check for custom admin patches
  try {
    const docRef = doc(db, 'company_databases', targetKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cloudData = docSnap.data().data || [];
      bankDatabases[targetKey] = cloudData;
      bankDatabases[bankName] = cloudData;
      dbHealth.banks[targetKey].status = 'ok';
      dbHealth.banks[targetKey].count = cloudData.length;
      return cloudData;
    }
  } catch (cloudErr) {
    console.warn(`Firestore check skipped for ${targetKey}`);
  }

  return bankDatabases[targetKey] || [];
};

export const getLoadedBankDatabase = (bankName) => {
  const targetKey = resolveBankDbKey(bankName);
  return bankDatabases[targetKey] || bankDatabases[bankName] || [];
};

export const setBankDatabaseInMemory = (bankName, data) => {
  const targetKey = resolveBankDbKey(bankName);
  bankDatabases[targetKey] = data;
  bankDatabases[bankName] = data;
  if (!dbHealth.banks[targetKey]) {
    dbHealth.banks[targetKey] = { status: 'ok', count: data.length };
  } else {
    dbHealth.banks[targetKey].status = 'ok';
    dbHealth.banks[targetKey].count = data.length;
  }
};

/**
 * Initialize all bank databases safely
 */
export const initializeBankDatabases = async () => {
  const bankNames = Object.keys(dbHealth.banks);
  await Promise.all(bankNames.map(name => loadBankDatabase(name)));
  // Ensure aliases are synchronized
  if (bankDatabases['axis_fin'] && bankDatabases['axis_fin'].length > 0) {
    bankDatabases['axis'] = bankDatabases['axis_fin'];
    bankDatabases['axis-bank'] = bankDatabases['axis_fin'];
  }
  console.log('🏁 Health Check:', dbHealth);
};

/**
 * Get company suggestions for autocomplete
 */
export const getCompanySuggestions = (searchTerm) => {
  if (!searchTerm || searchTerm.length < 3) return [];
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
const mapCategoryToConfigKey = (rawCat) => {
  if (!rawCat) return 'B';
  const c = String(rawCat).toUpperCase().trim();

  // 1. Caution / Negative / Delisted / DNS
  if (c.includes('CAUTION') || c.includes('NEGATIVE') || c.includes('NOT TO BE') || c === 'DNS' || c === 'DELIST') {
    return 'Caution';
  }

  // 2. Government & Public Sector
  if (c.includes('GOVT') || c.includes('GOVERNMENT') || c.startsWith('CATG') || c === 'POL' || c === 'DEF' || c === 'STF' || c === 'PMF') {
    return 'GOVT';
  }

  // 3. Super A / AA / A+ / ACE PLUS / Elite / Superprime / Tata Group
  if (c.includes('SUPER') || c.includes('AA') || c === 'A+' || c === 'ACE PLUS' || c === 'ELITE' || c === 'SUPERPRIME' || c === 'SCATA' || c.includes('TATA GROUP')) {
    return 'Super A';
  }

  // 4. Category A / ACE
  if (c === 'A' || c === 'CAT A' || c === 'CSC A' || c === 'CATEGORY A' || c === 'ACE' || c === 'CAT SA') {
    return 'A';
  }

  // 5. Category B / Preferred
  if (c === 'B' || c === 'CAT B' || c === 'CSC B' || c === 'CAT B' || c === 'CATEGORY B' || c === 'PREFERRED' || c === 'CATGB') {
    return 'B';
  }

  // 6. Category C / Open Market / Silver
  if (c === 'C' || c === 'CAT C' || c === 'CSC C' || c === 'CATEGORY C' || c === 'CAT C1000' || c === 'OPEN MARKET' || c === 'SILVER') {
    return 'C';
  }

  // 7. Category D / Unlisted / E / F / H / J
  if (c === 'D' || c === 'CAT D' || c === 'CSC D' || c === 'CATEGORY D' || c === 'CATDU' || c === 'E' || c === 'F' || c === 'H' || c === 'J' || c.startsWith('CAT ') || c.startsWith('CSC ')) {
    return 'D';
  }

  return 'B'; // Default fallback
};

/**
 * Query bank's database with a safety fallback
 */
export const getCompanyCategoryForBank = (companyName, bankName, fallbackCategory = 'B') => {
  if (!companyName) return fallbackCategory;

  const targetKey = resolveBankDbKey(bankName);
  const normalizedCompany = companyName.trim().toUpperCase();
  const bankDb = bankDatabases[targetKey] || bankDatabases[bankName] || [];

  // Safety: If database failed to load or is empty, use the user selected fallback
  if (bankDb.length === 0) {
    console.warn(`🛡️ Fallback: ${bankName} (${targetKey}) database empty. Using user selection: ${fallbackCategory}`);
    return fallbackCategory;
  }

  // 1. Exact match
  let match = bankDb.find(
    company => company?.companyName && company.companyName.trim().toUpperCase() === normalizedCompany
  );

  // 2. Cleaned suffix match (stripping PVT, LTD, PRIVATE, LIMITED, and special characters)
  if (!match) {
    const cleanSearch = normalizedCompany.replace(/\b(PVT|LTD|PRIVATE|LIMITED)\b/g, '').replace(/[^A-Z0-9]/g, ' ').trim();
    if (cleanSearch) {
      match = bankDb.find(company => {
        if (!company?.companyName) return false;
        const cClean = company.companyName.trim().toUpperCase().replace(/\b(PVT|LTD|PRIVATE|LIMITED)\b/g, '').replace(/[^A-Z0-9]/g, ' ').trim();
        return cClean === cleanSearch;
      });
    }
  }

  // 3. Prefix match if at least 4 characters
  if (!match) {
    const cleanSearch = normalizedCompany.replace(/\b(PVT|LTD|PRIVATE|LIMITED)\b/g, '').replace(/[^A-Z0-9]/g, ' ').trim();
    if (cleanSearch && cleanSearch.length >= 4) {
      match = bankDb.find(company => {
        if (!company?.companyName) return false;
        const cClean = company.companyName.trim().toUpperCase().replace(/\b(PVT|LTD|PRIVATE|LIMITED)\b/g, '').replace(/[^A-Z0-9]/g, ' ').trim();
        return cClean.startsWith(cleanSearch) || cleanSearch.startsWith(cClean);
      });
    }
  }

  if (match) {
    const configKey = mapCategoryToConfigKey(match.category);
    console.log(`✅ ${bankName} (${targetKey}): ${companyName} → ${match.category} (${configKey})`);
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
    'axis_fin': getCompanyCategoryForBank(companyName, 'axis_fin', globalFallback),
    'axis-bank': getCompanyCategoryForBank(companyName, 'axis-bank', globalFallback)
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
